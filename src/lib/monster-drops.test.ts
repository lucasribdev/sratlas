import { describe, expect, it } from 'vitest'
import type { MapMarker } from '@/domain/marker'
import { markerHasMonsterDrop, markerMonsterDrops } from '@/lib/monster-drops'

const baseMarker: MapMarker = {
  id: 'drop-marker',
  name: 'Drop Marker',
  mapId: 'world',
  x: 50,
  y: 50,
}

describe('monster drop helpers', () => {
  it('returns an empty list when a marker has no monsters', () => {
    expect(markerMonsterDrops(baseMarker)).toEqual([])
  })

  it('returns an empty list when monsters have no drops', () => {
    const marker: MapMarker = {
      ...baseMarker,
      monsters: [{ name: 'Hopper' }, { name: 'Jel', drops: [] }],
    }

    expect(markerMonsterDrops(marker)).toEqual([])
  })

  it('returns drops from one monster', () => {
    const drops = [{ name: 'Hopper Leg' }, { name: 'Hopper Wing' }]
    const marker: MapMarker = {
      ...baseMarker,
      monsters: [{ name: 'Hopper', drops }],
    }

    expect(markerMonsterDrops(marker)).toEqual(drops)
  })

  it('flattens drops from multiple monsters', () => {
    const marker: MapMarker = {
      ...baseMarker,
      monsters: [
        { name: 'Hopper', drops: [{ name: 'Hopper Leg' }] },
        { name: 'Jel' },
        { name: 'Pin Pin', drops: [{ name: 'Pin Feather' }, { name: 'Pin Beak' }] },
      ],
    }

    expect(markerMonsterDrops(marker)).toEqual([
      { name: 'Hopper Leg' },
      { name: 'Pin Feather' },
      { name: 'Pin Beak' },
    ])
  })

  it('preserves all drop data', () => {
    const drop = {
      name: 'Hopper Leg',
      wikiSlug: 'Hopper_Leg',
      image: 'Hopper_Leg.png/16px-Hopper_Leg.png',
      chancePercent: 12.5,
    }
    const marker: MapMarker = {
      ...baseMarker,
      monsters: [{ name: 'Hopper', drops: [drop] }],
    }

    expect(markerMonsterDrops(marker)).toEqual([drop])
    expect(markerMonsterDrops(marker)[0]).toBe(drop)
  })

  it('returns true for an exact matching drop', () => {
    const marker: MapMarker = {
      ...baseMarker,
      monsters: [{ name: 'Hopper', drops: [{ name: 'Hopper Leg' }] }],
    }

    expect(markerHasMonsterDrop(marker, 'Hopper Leg')).toBe(true)
  })

  it('matches drop names case-insensitively with existing normalization', () => {
    const marker: MapMarker = {
      ...baseMarker,
      monsters: [{ name: 'Hopper', drops: [{ name: 'Hopper Leg' }] }],
    }

    expect(markerHasMonsterDrop(marker, '  hopper   leg  ')).toBe(true)
  })

  it('respects accents and punctuation from existing normalization', () => {
    const marker: MapMarker = {
      ...baseMarker,
      monsters: [{ name: 'Cave Bat', drops: [{ name: "Bat's Élan" }] }],
    }

    expect(markerHasMonsterDrop(marker, "bat's élan")).toBe(true)
    expect(markerHasMonsterDrop(marker, 'bats elan')).toBe(false)
    expect(markerHasMonsterDrop(marker, "bat's elan")).toBe(false)
  })

  it('does not count partial names as exact matches', () => {
    const marker: MapMarker = {
      ...baseMarker,
      monsters: [
        {
          name: 'Greater Hopper',
          drops: [{ name: 'Greater Hopper Leg' }, { name: 'Hopper Leg Fragment' }],
        },
      ],
    }

    expect(markerHasMonsterDrop(marker, 'Hopper Leg')).toBe(false)
  })

  it('returns false for an unknown item', () => {
    const marker: MapMarker = {
      ...baseMarker,
      monsters: [{ name: 'Hopper', drops: [{ name: 'Hopper Leg' }] }],
    }

    expect(markerHasMonsterDrop(marker, 'Missing Item')).toBe(false)
  })

  it('returns false for markers without monster drops when an item is requested', () => {
    expect(markerHasMonsterDrop(baseMarker, 'Hopper Leg')).toBe(false)
    expect(markerHasMonsterDrop({ ...baseMarker, monsters: [{ name: 'Hopper' }] }, 'Hopper Leg')).toBe(
      false,
    )
  })

  it('returns true for empty or undefined item names to support filter composition', () => {
    expect(markerHasMonsterDrop(baseMarker)).toBe(true)
    expect(markerHasMonsterDrop(baseMarker, '')).toBe(true)
    expect(markerHasMonsterDrop(baseMarker, '   ')).toBe(true)
  })

  it('does not mutate marker data', () => {
    const marker: MapMarker = {
      ...baseMarker,
      monsters: [
        {
          name: 'Hopper',
          drops: [
            {
              name: 'Hopper Leg',
              wikiSlug: 'Hopper_Leg',
              image: 'Hopper_Leg.png/16px-Hopper_Leg.png',
              chancePercent: 12.5,
            },
          ],
        },
      ],
    }
    const snapshot = structuredClone(marker)

    markerMonsterDrops(marker)
    markerHasMonsterDrop(marker, 'Hopper Leg')

    expect(marker).toEqual(snapshot)
  })
})
