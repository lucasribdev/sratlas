import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkerPopup } from '@/components/map/MarkerPopup'
import type { MapMarker } from '@/domain/marker'
import { getWikiThumbnailUrl, getWikiUrl } from '@/lib/external-urls'

const baseMarker: MapMarker = {
  id: 'slime-hollow',
  name: 'Slime Hollow',
  mapId: 'world',
  x: 50,
  y: 50,
}

function renderMarker(marker: MapMarker) {
  return renderToStaticMarkup(<MarkerPopup marker={marker} />)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractElementAt(markup: string, tag: string, start: number) {
  const tagPattern = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, 'g')
  tagPattern.lastIndex = start
  let depth = 0

  for (const match of markup.matchAll(tagPattern)) {
    if (match.index < start) {
      continue
    }

    if (match[0].startsWith(`</${tag}`)) {
      depth -= 1

      if (depth === 0) {
        return markup.slice(start, match.index + match[0].length)
      }
    } else {
      depth += 1
    }
  }

  throw new Error(`Missing closing </${tag}> tag`)
}

function getElementByAttribute(
  markup: string,
  tag: string,
  attribute: string,
  value: string,
) {
  const openingTagPattern = new RegExp(
    `<${tag}\\b[^>]*\\b${escapeRegExp(attribute)}="${escapeRegExp(value)}"[^>]*>`,
  )
  const match = openingTagPattern.exec(markup)

  if (!match) {
    throw new Error(`Missing <${tag}> with ${attribute}="${value}"`)
  }

  return {
    markup: extractElementAt(markup, tag, match.index),
    start: match.index,
  }
}

function getContainingElement(markup: string, tag: string, position: number) {
  const tagPattern = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, 'g')
  const openElements: number[] = []

  for (const match of markup.matchAll(tagPattern)) {
    if (match.index >= position) {
      break
    }

    if (match[0].startsWith(`</${tag}`)) {
      openElements.pop()
    } else {
      openElements.push(match.index)
    }
  }

  const start = openElements.at(-1)

  if (start === undefined) {
    throw new Error(`Missing containing <${tag}> element`)
  }

  return extractElementAt(markup, tag, start)
}

function countOpeningTags(markup: string, tag: string) {
  return markup.match(new RegExp(`<${tag}\\b`, 'g'))?.length ?? 0
}

function expectLink(markup: string, label: string, href: string) {
  expect(markup).toMatch(
    new RegExp(`<a\\b[^>]*href="${escapeRegExp(href)}"[^>]*>${escapeRegExp(label)}</a>`),
  )
}

describe('MarkerPopup', () => {
  it('nests a linked, imaged drop after its owning monster with its exact rate', () => {
    const dropImage = 'Dull_Life_Essence.png/16px-Dull_Life_Essence.png'
    const markup = renderMarker({
      ...baseMarker,
      monsters: [
        {
          name: 'Slime',
          wikiSlug: 'Slime',
          drops: [
            {
              name: 'Dull Life Essence',
              dropRate: 1.25,
              wikiSlug: 'Dull_Life_Essence',
              image: dropImage,
            },
          ],
        },
      ],
    })
    const dropList = getElementByAttribute(markup, 'ul', 'aria-label', 'Drops from Slime')
    const slimeGroup = getContainingElement(markup, 'li', dropList.start)

    expect(slimeGroup).toContain('Slime')
    expect(slimeGroup).toContain(dropList.markup)
    expect(slimeGroup.indexOf('Slime')).toBeLessThan(slimeGroup.indexOf('Dull Life Essence'))
    expect(dropList.markup).toContain('Dull Life Essence')
    expect(dropList.markup).toMatch(/>1\.25%<\/span>/)
    expectLink(dropList.markup, 'Dull Life Essence', getWikiUrl('Dull_Life_Essence'))
    expect(dropList.markup).toContain(`src="${getWikiThumbnailUrl(dropImage)}"`)
    expect(dropList.markup).toContain('referrerPolicy="no-referrer"')
    expect(countOpeningTags(dropList.markup, 'img')).toBe(1)
  })

  it.each([
    ['an absent image property', undefined],
    ['an empty image', ''],
  ])('renders a drop with %s without a thumbnail', (_description, image) => {
    const markup = renderMarker({
      ...baseMarker,
      monsters: [
        {
          name: 'Slime',
          drops: [
            {
              name: 'Dull Life Essence',
              dropRate: 1.25,
              wikiSlug: 'Dull_Life_Essence',
              ...(image === undefined ? {} : { image }),
            },
          ],
        },
      ],
    })
    const dropList = getElementByAttribute(markup, 'ul', 'aria-label', 'Drops from Slime').markup

    expect(dropList).not.toContain('<img')
    expect(dropList).toContain('Dull Life Essence')
    expectLink(dropList, 'Dull Life Essence', getWikiUrl('Dull_Life_Essence'))
    expect(dropList).toMatch(/>1\.25%<\/span>/)
  })

  it('keeps the simple Monsters list when a monster has no drops property', () => {
    const markup = renderMarker({
      ...baseMarker,
      monsters: [{ name: 'Slime', wikiSlug: 'Slime' }],
    })
    const monstersSection = getElementByAttribute(markup, 'section', 'aria-label', 'Monsters')
      .markup

    expect(monstersSection).toContain('Slime')
    expectLink(monstersSection, 'Slime', getWikiUrl('Slime'))
    expect(countOpeningTags(monstersSection, 'ul')).toBe(1)
    expect(countOpeningTags(monstersSection, 'li')).toBe(1)
    expect(monstersSection).not.toContain('Drops from')
  })

  it('omits the Monsters section when the marker has no monsters', () => {
    const markup = renderMarker(baseMarker)

    expect(markup).not.toContain('aria-label="Monsters"')
    expect(markup).not.toContain('>Monsters<')
  })

  it('renders monsters with and without drops together without changing drop ownership', () => {
    const markup = renderMarker({
      ...baseMarker,
      monsters: [
        {
          name: 'Slime',
          drops: [{ name: 'Dull Life Essence', dropRate: 1.25 }],
        },
        { name: 'Cave Bat' },
      ],
    })
    const monstersSection = getElementByAttribute(markup, 'section', 'aria-label', 'Monsters')
      .markup
    const dropList = getElementByAttribute(markup, 'ul', 'aria-label', 'Drops from Slime')
    const slimeGroup = getContainingElement(markup, 'li', dropList.start)
    const caveBatPosition = markup.indexOf('Cave Bat')
    const caveBatGroup = getContainingElement(markup, 'li', caveBatPosition)

    expect(monstersSection).toContain('Slime')
    expect(monstersSection).toContain('Cave Bat')
    expect(slimeGroup).toContain('Dull Life Essence')
    expect(slimeGroup).not.toContain('Cave Bat')
    expect(caveBatGroup).toContain('Cave Bat')
    expect(caveBatGroup).not.toContain('Dull Life Essence')
    expect(markup).not.toContain('Drops from Cave Bat')
  })

  it('continues to render resource percentages from chancePercent', () => {
    const markup = renderMarker({
      ...baseMarker,
      resources: [
        {
          type: 'Mining',
          items: [{ name: 'Stone', chancePercent: 65.2 }],
        },
      ],
    })
    const resourcesSection = getElementByAttribute(markup, 'section', 'aria-label', 'Resources')
      .markup

    expect(resourcesSection).toContain('Stone')
    expect(resourcesSection).toContain('65.2%')
  })

  it('preserves marker, monster, resource item, and interactable wiki links', () => {
    const markup = renderMarker({
      ...baseMarker,
      wikiSlug: 'Slime_Hollow',
      monsters: [
        {
          name: 'Slime',
          wikiSlug: 'Slime',
          image: 'Slime.png/16px-Slime.png',
        },
      ],
      resources: [
        {
          type: 'Mining',
          items: [
            {
              name: 'Stone',
              wikiSlug: 'Stone',
              image: 'Stone.png/16px-Stone.png',
            },
          ],
        },
      ],
      interactables: [
        {
          name: 'Quest Master',
          wikiSlug: 'Quest_Master',
          image: 'Quest_Master.png/16px-Quest_Master.png',
        },
      ],
    })

    expectLink(markup, 'Open wiki page', getWikiUrl('Slime_Hollow'))
    expectLink(markup, 'Slime', getWikiUrl('Slime'))
    expectLink(markup, 'Stone', getWikiUrl('Stone'))
    expectLink(markup, 'Quest Master', getWikiUrl('Quest_Master'))
    expect(markup.match(/referrerPolicy="no-referrer"/g)).toHaveLength(3)
  })
})
