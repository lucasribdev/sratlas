import { describe, expect, it } from 'vitest'
import type { GameMap } from '@/domain/map'
import type { MapMarker } from '@/domain/marker'
import {
  buildSearchIndex,
  getSearchSuggestions,
  moveAutocompleteIndex,
  searchEntryTypeLabels,
} from '@/lib/search-index'
import { getMarkerSearchFields } from '@/lib/marker-search-fields'
import { markerMatchesSearch } from '@/lib/marker-search'
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

const testMaps: GameMap[] = [
  {
    id: 'world',
    name: 'World Map',
    imageUrl: '/maps/world.webp',
    width: 1000,
    height: 1000,
  },
]

const allTestAreas = new Set(['Outskirts', 'Ashen Hollow'])

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
  it('uses the shared marker field traversal for text search and autocomplete', () => {
    const marker: MapMarker = {
      id: 'shared-fields',
      name: 'Shared Marker',
      mapId: 'world',
      x: 50,
      y: 50,
      area: 'Shared Area',
      zoneType: 'Shared Zone',
      tags: ['Shared Alias'],
      monsters: [{ name: 'Shared Monster', wikiSlug: 'Monster_Wiki_Only' }],
      interactables: [{ name: 'Shared Interactable', wikiSlug: 'Interactable_Wiki_Only' }],
      resources: [
        {
          type: 'Shared Resource',
          items: [{ name: 'Shared Item', wikiSlug: 'Item_Wiki_Only' }],
        },
      ],
    }
    const fields = getMarkerSearchFields(marker)
    const fieldValues = fields.map((field) => field.value)
    const entries = buildSearchIndex([marker])

    expect(fieldValues).toEqual([
      'Shared Marker',
      'Shared Area',
      'Shared Zone',
      'Shared Alias',
      'Shared Monster',
      'Shared Interactable',
      'Shared Resource',
      'Shared Item',
    ])
    expect(entries.map((entry) => entry.label)).toEqual([
      'Shared Marker',
      'Shared Area',
      'Shared Monster',
      'Shared Interactable',
      'Shared Resource',
      'Shared Item',
    ])

    for (const value of fieldValues) {
      expect(markerMatchesSearch(marker, value ?? '')).toBe(true)
      expect(getSearchSuggestions(entries, value ?? '')).not.toEqual([])
    }

    expect(markerMatchesSearch(marker, 'Monster_Wiki_Only')).toBe(false)
    expect(getSearchSuggestions(entries, 'Monster_Wiki_Only')).not.toEqual([])
  })

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
  it('resolves a visible marker so map navigation is allowed', () => {
    const markerEntry = findEntry('Metal Camp', 'marker')
    const selection = resolveSearchEntrySelection(
      markerEntry,
      testMarkers,
      testMaps,
      allTestAreas,
    )

    expect(selection.searchQuery).toBe('Metal Camp')
    expect(selection.navigation).toEqual({
      activeMapId: 'world',
      selectedMarkerId: 'metal-camp',
    })
  })

  it('does not resolve a marker hidden by the selected areas', () => {
    const markerEntry = findEntry('Metal Camp', 'marker')
    const selectedAreas = new Set(['Ashen Hollow'])
    const selection = resolveSearchEntrySelection(
      markerEntry,
      testMarkers,
      testMaps,
      selectedAreas,
    )

    expect(selection.searchQuery).toBe('Metal Camp')
    expect(selection.navigation).toBeUndefined()
    expect(selectedAreas).toEqual(new Set(['Ashen Hollow']))
  })

  it('selects a monster without changing selected areas', () => {
    const monsterEntry = findEntry('Metal Golem', 'monster')
    const selection = resolveSearchEntrySelection(
      monsterEntry,
      testMarkers,
      testMaps,
      allTestAreas,
    )

    expect(selection.searchQuery).toBe('Metal Golem')
    expect(selection).not.toHaveProperty('selectedAreas')
  })

  it('selects an item or essence without changing selected areas', () => {
    const essenceEntry = findEntry('Metal Essence', 'essence')
    const selection = resolveSearchEntrySelection(
      essenceEntry,
      testMarkers,
      testMaps,
      allTestAreas,
    )

    expect(selection.searchQuery).toBe('Metal Essence')
    expect(selection).not.toHaveProperty('selectedAreas')
  })

  it('selects a resource by using it as the search query', () => {
    const resourceEntry = findEntry('Mining', 'resource')
    const selection = resolveSearchEntrySelection(
      resourceEntry,
      testMarkers,
      testMaps,
      allTestAreas,
    )

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
    const selection = resolveSearchEntrySelection(
      entry,
      testMarkers,
      testMaps,
      allTestAreas,
    )

    expect(selection.searchQuery).toBe(label)
    expect(selection.navigation).toBeUndefined()
  })
})
