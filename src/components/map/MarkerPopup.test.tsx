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
    if (match.index < start) continue

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

function getElementsByAttribute(
  markup: string,
  tag: string,
  attribute: string,
  value: string,
) {
  const openingTagPattern = new RegExp(
    `<${tag}\\b[^>]*\\b${escapeRegExp(attribute)}="${escapeRegExp(value)}"[^>]*>`,
    'g',
  )

  return Array.from(markup.matchAll(openingTagPattern), (match) => ({
    markup: extractElementAt(markup, tag, match.index),
    start: match.index,
  }))
}

function getElementByAttribute(
  markup: string,
  tag: string,
  attribute: string,
  value: string,
) {
  const element = getElementsByAttribute(markup, tag, attribute, value)[0]

  if (!element) {
    throw new Error(`Missing <${tag}> with ${attribute}="${value}"`)
  }

  return element
}

function getContainingElementByAttribute(
  markup: string,
  tag: string,
  attribute: string,
  value: string,
  position: number,
) {
  const element = getElementsByAttribute(markup, tag, attribute, value)
    .filter((candidate) => candidate.start < position)
    .reverse()
    .find((candidate) => candidate.start + candidate.markup.length > position)

  if (!element) {
    throw new Error(
      `Missing containing <${tag}> with ${attribute}="${value}"`,
    )
  }

  return element.markup
}

function countOpeningTags(markup: string, tag: string) {
  return markup.match(new RegExp(`<${tag}\\b`, 'g'))?.length ?? 0
}

function expectLink(markup: string, label: string, href: string) {
  expect(markup).toMatch(
    new RegExp(
      `<a\\b[^>]*href="${escapeRegExp(href)}"[^>]*>${escapeRegExp(label)}</a>`,
    ),
  )
}

function getAttribute(markup: string, attribute: string) {
  const value = new RegExp(`\\b${escapeRegExp(attribute)}="([^"]+)"`).exec(
    markup,
  )?.[1]

  if (!value) throw new Error(`Missing ${attribute} attribute`)

  return value
}

describe('MarkerPopup', () => {
  it('renders a monster with drops as a collapsed, labelled accordion control', () => {
    const monsterImage = 'Slime.png/24px-Slime.png'
    const markup = renderMarker({
      ...baseMarker,
      monsters: [
        {
          name: 'Slime',
          wikiSlug: 'Slime',
          image: monsterImage,
          drops: [
            { name: 'Dull Life Essence', dropRate: 1.25 },
            { name: 'Slime Gel', dropRate: 12 },
          ],
        },
      ],
    })
    const trigger = getElementByAttribute(
      markup,
      'button',
      'aria-label',
      'Toggle 2 drops from Slime',
    ).markup
    const panelId = getAttribute(trigger, 'aria-controls')
    const triggerId = getAttribute(trigger, 'id')
    const panel = getElementByAttribute(markup, 'div', 'id', panelId).markup

    expect(trigger).toContain('2 drops')
    expect(trigger).toContain('aria-expanded="false"')
    expect(trigger).not.toContain('<a')
    expect(panel).toContain('hidden=""')
    expect(panel).toContain('role="region"')
    expect(panel).toContain(`aria-labelledby="${triggerId}"`)
    expectLink(markup, 'Slime', getWikiUrl('Slime'))
    expect(markup).toContain(
      `src="${getWikiThumbnailUrl(monsterImage)}"`,
    )
  })

  it('keeps exact drop details beneath the correct owning monster', () => {
    const dropImage = 'Dull_Life_Essence.png/16px-Dull_Life_Essence.png'
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
              image: dropImage,
            },
          ],
        },
        {
          name: 'Cave Bat',
          drops: [{ name: 'Bat Wing', dropRate: 27.75 }],
        },
      ],
    })
    const slimeDrops = getElementByAttribute(
      markup,
      'ul',
      'aria-label',
      'Drops from Slime',
    )
    const batDrops = getElementByAttribute(
      markup,
      'ul',
      'aria-label',
      'Drops from Cave Bat',
    )
    const slimeGroup = getContainingElementByAttribute(
      markup,
      'div',
      'data-slot',
      'accordion-item',
      slimeDrops.start,
    )
    const batGroup = getContainingElementByAttribute(
      markup,
      'div',
      'data-slot',
      'accordion-item',
      batDrops.start,
    )

    expect(slimeGroup).toContain('Dull Life Essence')
    expect(slimeGroup).toContain('1.25%')
    expect(slimeGroup).not.toContain('Bat Wing')
    expect(batGroup).toContain('Bat Wing')
    expect(batGroup).toContain('27.75%')
    expect(batGroup).not.toContain('Dull Life Essence')
    expectLink(
      slimeDrops.markup,
      'Dull Life Essence',
      getWikiUrl('Dull_Life_Essence'),
    )
    expect(slimeDrops.markup).toContain(
      `src="${getWikiThumbnailUrl(dropImage)}"`,
    )
    expect(slimeDrops.markup).toContain('referrerPolicy="no-referrer"')
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
    const dropList = getElementByAttribute(
      markup,
      'ul',
      'aria-label',
      'Drops from Slime',
    ).markup

    expect(dropList).not.toContain('<img')
    expect(dropList).toContain('Dull Life Essence')
    expect(dropList).toContain('1.25%')
    expectLink(dropList, 'Dull Life Essence', getWikiUrl('Dull_Life_Essence'))
  })

  it('keeps a monster without drops compact and gives it no accordion control', () => {
    const monsterImage = 'Cave_Bat.png/24px-Cave_Bat.png'
    const markup = renderMarker({
      ...baseMarker,
      monsters: [
        {
          name: 'Cave Bat',
          wikiSlug: 'Cave_Bat',
          image: monsterImage,
        },
      ],
    })
    const monstersSection = getElementByAttribute(
      markup,
      'section',
      'aria-label',
      'Monsters',
    ).markup

    expectLink(monstersSection, 'Cave Bat', getWikiUrl('Cave_Bat'))
    expect(monstersSection).toContain(
      `src="${getWikiThumbnailUrl(monsterImage)}"`,
    )
    expect(countOpeningTags(monstersSection, 'button')).toBe(0)
    expect(monstersSection).not.toContain('Drops from Cave Bat')
  })

  it('renders monsters with and without drops together', () => {
    const markup = renderMarker({
      ...baseMarker,
      monsters: [
        {
          name: 'Slime',
          drops: [{ name: 'Dull Life Essence', dropRate: 1.25 }],
        },
        { name: 'Cave Bat', image: '' },
      ],
    })
    const monstersSection = getElementByAttribute(
      markup,
      'section',
      'aria-label',
      'Monsters',
    ).markup

    expect(monstersSection).toContain('Slime')
    expect(monstersSection).toContain('Cave Bat')
    expect(countOpeningTags(monstersSection, 'button')).toBe(1)
    expect(monstersSection).toContain('Drops from Slime')
    expect(monstersSection).not.toContain('Drops from Cave Bat')
    expect(countOpeningTags(monstersSection, 'img')).toBe(0)
  })

  it('gives multiple monsters independent labelled controls and panels', () => {
    const markup = renderMarker({
      ...baseMarker,
      monsters: [
        {
          name: 'Slime',
          drops: [{ name: 'Slime Gel', dropRate: 12 }],
        },
        {
          name: 'Cave Bat',
          drops: [
            { name: 'Bat Wing', dropRate: 27.75 },
            { name: 'Sharp Fang', dropRate: 4 },
          ],
        },
      ],
    })
    const slimeTrigger = getElementByAttribute(
      markup,
      'button',
      'aria-label',
      'Toggle 1 drop from Slime',
    ).markup
    const batTrigger = getElementByAttribute(
      markup,
      'button',
      'aria-label',
      'Toggle 2 drops from Cave Bat',
    ).markup
    const slimePanelId = getAttribute(slimeTrigger, 'aria-controls')
    const batPanelId = getAttribute(batTrigger, 'aria-controls')

    expect(slimePanelId).not.toBe(batPanelId)
    expect(slimeTrigger).toContain('aria-expanded="false"')
    expect(batTrigger).toContain('aria-expanded="false"')
    expect(
      getElementByAttribute(markup, 'div', 'id', slimePanelId).markup,
    ).toContain('Drops from Slime')
    expect(
      getElementByAttribute(markup, 'div', 'id', batPanelId).markup,
    ).toContain('Drops from Cave Bat')
  })

  it('omits the Monsters section when the marker has no monsters', () => {
    const markup = renderMarker(baseMarker)

    expect(markup).not.toContain('aria-label="Monsters"')
    expect(markup).not.toContain('>Monsters<')
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
    const resourcesSection = getElementByAttribute(
      markup,
      'section',
      'aria-label',
      'Resources',
    ).markup

    expect(resourcesSection).toContain('Stone')
    expect(resourcesSection).toContain('65.2%')
  })

  it('preserves marker, resource item, and interactable wiki links', () => {
    const markup = renderMarker({
      ...baseMarker,
      wikiSlug: 'Slime_Hollow',
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
    expectLink(markup, 'Stone', getWikiUrl('Stone'))
    expectLink(markup, 'Quest Master', getWikiUrl('Quest_Master'))
  })
})
