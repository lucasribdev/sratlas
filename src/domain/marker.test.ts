import { describe, expect, it } from 'vitest'
import type { MapMarker, MarkerDropItem, MarkerMonster } from './marker'

describe('marker domain model', () => {
  it('accepts monsters without drops', () => {
    const monster: MarkerMonster = {
      name: 'Hopper',
      wikiSlug: 'Hopper',
      image: 'Hopper.png/16px-Hopper.png',
    }

    expect(monster.drops).toBeUndefined()
  })

  it('accepts monsters with optional drop fields', () => {
    const drops: MarkerDropItem[] = [
      { name: 'Hopper Leg' },
      {
        name: 'Rare Hopper Leg',
        wikiSlug: 'Rare_Hopper_Leg',
        image: 'Rare_Hopper_Leg.png/16px-Rare_Hopper_Leg.png',
        chancePercent: 12.5,
      },
    ]

    const marker: MapMarker = {
      id: 'drop-fixture',
      name: 'Drop Fixture',
      mapId: 'world',
      x: 50,
      y: 50,
      monsters: [
        {
          name: 'Hopper',
          drops,
        },
      ],
    }

    expect(marker.monsters?.[0]?.drops).toEqual(drops)
  })
})
