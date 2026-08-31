import { describe, expect, it } from 'vitest'
import type { MapMarker } from '@/domain/marker'
import {
  buildSearchIndex,
  getSearchSuggestions,
  moveAutocompleteIndex,
  searchEntryTypeLabels,
} from '@/lib/search-index'
import { resolveSearchEntrySelection } from '@/lib/search-selection'

const testMarkers: MapMarker[] = [
  {
    id: 'metal-camp',
    name: 'Metal Camp',
    mapId: 'world',
    x: 10,
    y: 20,
    area: 'Outskirts',
    zoneType: 'Surface zone',
    monsters: [
      {
        name: 'Metal Golem',
        wikiSlug: 'Metal_Golem',
        drops: [
          {
            name: 'Hopper Leg',
            wikiSlug: 'Hopper_Leg',
            image: 'Hopper_Leg.png/16px-Hopper_Leg.png',
          },
          { name: 'Stone' },
        ],
      },
      {
        name: 'Ore Imp',
        drops: [{ name: 'Stone' }, { name: 'Life Essence' }],
      },
    ],
    resources: [
      {
        type: 'Mining',
        items: [{ name: 'Metal Essence' }, { name: 'Stone' }],
      },
    ],
    interactables: [{ name: 'Blacksmith' }],
  },
  {
    id: 'fire-pond',
    name: 'Fire Pond',
    mapId: 'world',
    x: 30,
    y: 40,
    area: 'Ashen Hollow',
    zoneType: 'Lake',
    monsters: [
      {
        name: 'Ember Wolf',
        drops: [{ name: 'Life Essence' }],
      },
    ],
    resources: [
      {
        type: 'Fishing',
        items: [{ name: 'Fire Fish' }],
      },
    ],
  },
]

function findEntry(label: string, type: ReturnType<typeof buildSearchIndex>[number]['type']) {
  const entry = buildSearchIndex(testMarkers).find(
    (searchEntry) => searchEntry.label === label && searchEntry.type === type,
  )

  if (!entry) {
    throw new Error(`Missing ${type} entry for ${label}`)
  }

  return entry
}

describe('search index', () => {
  it('builds labeled entries from marker data', () => {
    const entries = buildSearchIndex(testMarkers)

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Metal Camp', type: 'marker' }),
        expect.objectContaining({ label: 'Outskirts', type: 'area' }),
        expect.objectContaining({ label: 'Metal Golem', type: 'monster' }),
        expect.objectContaining({ label: 'Hopper Leg', type: 'drop' }),
        expect.objectContaining({ label: 'Metal Essence', type: 'essence' }),
        expect.objectContaining({ label: 'Stone', type: 'item' }),
        expect.objectContaining({ label: 'Mining', type: 'resource' }),
        expect.objectContaining({ label: 'Blacksmith', type: 'interactable' }),
      ]),
    )
  })

  it('matches case-insensitively', () => {
    const suggestions = getSearchSuggestions(buildSearchIndex(testMarkers), 'metal golem')

    expect(suggestions[0]).toEqual(expect.objectContaining({ label: 'Metal Golem' }))
  })

  it('indexes monster drops as distinct drop entries', () => {
    const entry = findEntry('Hopper Leg', 'drop')

    expect(entry).toEqual(
      expect.objectContaining({
        label: 'Hopper Leg',
        type: 'drop',
        image: 'Hopper_Leg.png/16px-Hopper_Leg.png',
        wikiSlug: 'Hopper_Leg',
      }),
    )
  })

  it('indexes monster drops without optional metadata', () => {
    const entry = findEntry('Stone', 'drop')

    expect(entry).toEqual(
      expect.objectContaining({
        label: 'Stone',
        type: 'drop',
        markerIds: ['metal-camp'],
      }),
    )
    expect(entry.image).toBeUndefined()
    expect(entry.wikiSlug).toBeUndefined()
  })

  it('merges duplicate monster drops across markers and aggregates marker ids', () => {
    const entry = findEntry('Life Essence', 'drop')

    expect(entry.markerIds).toEqual(['metal-camp', 'fire-pond'])
  })

  it('does not duplicate marker ids for repeated drops in one marker', () => {
    const entry = findEntry('Stone', 'drop')

    expect(entry.markerIds).toEqual(['metal-camp'])
  })

  it('matches monster drops with existing normalization rules', () => {
    const suggestions = getSearchSuggestions(buildSearchIndex(testMarkers), '  HOPPER   LEG  ')

    expect(suggestions[0]).toEqual(
      expect.objectContaining({ label: 'Hopper Leg', type: 'drop' }),
    )
  })

  it('prefers prefix matches before partial matches', () => {
    const suggestions = getSearchSuggestions(buildSearchIndex(testMarkers), 'fish')

    expect(suggestions.map((suggestion) => suggestion.label)).toEqual([
      'Fishing',
      'Fire Fish',
    ])
  })

  it('allows partial matches', () => {
    const suggestions = getSearchSuggestions(buildSearchIndex(testMarkers), 'smith')

    expect(suggestions[0]).toEqual(expect.objectContaining({ label: 'Blacksmith' }))
  })

  it('exposes search result type labels', () => {
    expect(searchEntryTypeLabels.monster).toBe('Monster')
    expect(searchEntryTypeLabels.drop).toBe('Drop')
    expect(searchEntryTypeLabels.essence).toBe('Essence')
  })

  it('keeps existing monster indexing unchanged', () => {
    const entry = findEntry('Metal Golem', 'monster')

    expect(entry).toEqual(
      expect.objectContaining({
        label: 'Metal Golem',
        type: 'monster',
        markerIds: ['metal-camp'],
      }),
    )
  })

  it('keeps existing resource item indexing unchanged', () => {
    const entry = findEntry('Stone', 'item')

    expect(entry).toEqual(
      expect.objectContaining({
        label: 'Stone',
        type: 'item',
        markerIds: ['metal-camp'],
      }),
    )
  })

  it('keeps resource items and monster drops with the same name distinguishable', () => {
    const entries = buildSearchIndex(testMarkers).filter((entry) => entry.label === 'Stone')

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Stone', type: 'item' }),
        expect.objectContaining({ label: 'Stone', type: 'drop' }),
      ]),
    )
  })

  it('returns no suggestions for empty results', () => {
    expect(getSearchSuggestions(buildSearchIndex(testMarkers), 'missing')).toEqual([])
  })

  it('moves the active autocomplete index with keyboard-style wrapping', () => {
    expect(moveAutocompleteIndex(-1, 3, 1)).toBe(0)
    expect(moveAutocompleteIndex(0, 3, -1)).toBe(2)
    expect(moveAutocompleteIndex(2, 3, 1)).toBe(0)
    expect(moveAutocompleteIndex(0, 0, 1)).toBe(-1)
  })
})

describe('search selection', () => {
  it('selects a marker and keeps its marker id', () => {
    const markerEntry = findEntry('Metal Camp', 'marker')
    const selection = resolveSearchEntrySelection(markerEntry)

    expect(selection.searchQuery).toBe('Metal Camp')
    expect(selection.selectedMarkerId).toBe('metal-camp')
    expect(selection.filter).toBeUndefined()
  })

  it('selects a monster without changing selected areas', () => {
    const monsterEntry = findEntry('Metal Golem', 'monster')
    const selection = resolveSearchEntrySelection(monsterEntry)

    expect(selection.searchQuery).toBe('Metal Golem')
    expect(selection.selectedMarkerId).toBeUndefined()
    expect(selection.filter).toBeUndefined()
    expect(selection).not.toHaveProperty('selectedAreas')
  })

  it('selects a resource item without changing selected areas', () => {
    const itemEntry = findEntry('Stone', 'item')
    const selection = resolveSearchEntrySelection(itemEntry)

    expect(selection.searchQuery).toBe('Stone')
    expect(selection.selectedMarkerId).toBeUndefined()
    expect(selection.filter).toBeUndefined()
    expect(selection).not.toHaveProperty('selectedAreas')
  })

  it('selects an essence without changing selected areas', () => {
    const essenceEntry = findEntry('Metal Essence', 'essence')
    const selection = resolveSearchEntrySelection(essenceEntry)

    expect(selection.searchQuery).toBe('Metal Essence')
    expect(selection.selectedMarkerId).toBeUndefined()
    expect(selection.filter).toBeUndefined()
    expect(selection).not.toHaveProperty('selectedAreas')
  })

  it('selects a resource by using it as the search query', () => {
    const resourceEntry = findEntry('Mining', 'resource')
    const selection = resolveSearchEntrySelection(resourceEntry)

    expect(selection.searchQuery).toBe('Mining')
    expect(selection.selectedMarkerId).toBeUndefined()
    expect(selection.filter).toBeUndefined()
  })

  it('selects an area by using it as the search query', () => {
    const areaEntry = findEntry('Outskirts', 'area')
    const selection = resolveSearchEntrySelection(areaEntry)

    expect(selection.searchQuery).toBe('Outskirts')
    expect(selection.selectedMarkerId).toBeUndefined()
    expect(selection.filter).toBeUndefined()
  })

  it('selects an interactable by using it as the search query', () => {
    const interactableEntry = findEntry('Blacksmith', 'interactable')
    const selection = resolveSearchEntrySelection(interactableEntry)

    expect(selection.searchQuery).toBe('Blacksmith')
    expect(selection.selectedMarkerId).toBeUndefined()
    expect(selection.filter).toBeUndefined()
  })

  it('selects a drop as a structured monster-drop filter intent', () => {
    const dropEntry = findEntry('Hopper Leg', 'drop')
    const selection = resolveSearchEntrySelection(dropEntry)

    expect(selection.searchQuery).toBe('Hopper Leg')
    expect(selection.filter).toEqual({
      type: 'monster-drop',
      value: 'Hopper Leg',
    })
  })

  it('uses the canonical drop label as the structured filter value', () => {
    const dropEntry = {
      ...findEntry('Hopper Leg', 'drop'),
      label: 'Canonical Hopper Leg',
      markerIds: ['metal-camp', 'fire-pond'],
    }
    const selection = resolveSearchEntrySelection(dropEntry)

    expect(selection.filter).toEqual({
      type: 'monster-drop',
      value: 'Canonical Hopper Leg',
    })
  })

  it('does not select an arbitrary marker when selecting a drop', () => {
    const dropEntry = findEntry('Life Essence', 'drop')
    const selection = resolveSearchEntrySelection(dropEntry)

    expect(dropEntry.markerIds).toEqual(['metal-camp', 'fire-pond'])
    expect(selection.selectedMarkerId).toBeUndefined()
    expect(selection.filter).toEqual({
      type: 'monster-drop',
      value: 'Life Essence',
    })
  })

  it('keeps free-text search outside structured selection handling', () => {
    const suggestions = getSearchSuggestions(buildSearchIndex(testMarkers), 'hopper leg')

    expect(suggestions[0]).toEqual(
      expect.objectContaining({ label: 'Hopper Leg', type: 'drop' }),
    )
  })

  it.each([
    ['Outskirts', 'area'],
    ['Metal Golem', 'monster'],
    ['Stone', 'item'],
    ['Metal Essence', 'essence'],
    ['Mining', 'resource'],
    ['Blacksmith', 'interactable'],
  ] as const)('selects a %s %s suggestion as a search query', (label, type) => {
    const entry = findEntry(label, type)
    const selection = resolveSearchEntrySelection(entry)

    expect(selection.searchQuery).toBe(label)
    expect(selection.selectedMarkerId).toBeUndefined()
    expect(selection.filter).toBeUndefined()
  })

  it.each([
    ['Metal Camp', 'marker'],
    ['Outskirts', 'area'],
    ['Metal Golem', 'monster'],
    ['Stone', 'item'],
    ['Metal Essence', 'essence'],
    ['Mining', 'resource'],
    ['Blacksmith', 'interactable'],
  ] as const)('does not create a monster-drop filter for %s %s selections', (label, type) => {
    const entry = findEntry(label, type)
    const selection = resolveSearchEntrySelection(entry)

    expect(selection.filter).toBeUndefined()
  })
})
