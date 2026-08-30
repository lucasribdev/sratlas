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
    monsters: [{ name: 'Metal Golem' }],
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
    expect(searchEntryTypeLabels.essence).toBe('Essence')
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
  })

  it('selects a monster without changing selected areas', () => {
    const monsterEntry = findEntry('Metal Golem', 'monster')
    const selection = resolveSearchEntrySelection(monsterEntry)

    expect(selection.searchQuery).toBe('Metal Golem')
    expect(selection).not.toHaveProperty('selectedAreas')
  })

  it('selects an item or essence without changing selected areas', () => {
    const essenceEntry = findEntry('Metal Essence', 'essence')
    const selection = resolveSearchEntrySelection(essenceEntry)

    expect(selection.searchQuery).toBe('Metal Essence')
    expect(selection).not.toHaveProperty('selectedAreas')
  })

  it('selects a resource by using it as the search query', () => {
    const resourceEntry = findEntry('Mining', 'resource')
    const selection = resolveSearchEntrySelection(resourceEntry)

    expect(selection.searchQuery).toBe('Mining')
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
  })
})
