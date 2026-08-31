import { describe, expect, it } from 'vitest'
import type { MapMarker } from '@/domain/marker'
import { filterMarkers } from '@/lib/marker-filters'
import type { SearchEntry, SearchEntryType } from '@/lib/search-index'
import {
  resolveSearchEntrySelection,
  resolveSearchQueryChange,
  type SearchSelectionFilter,
} from '@/lib/search-selection'

function searchEntry(
  label: string,
  type: SearchEntryType,
  options: Partial<SearchEntry> = {},
): SearchEntry {
  return {
    id: `${type}:${label}`,
    label,
    type,
    keywords: [],
    markerIds: [],
    targetId: label,
    ...options,
  }
}

const dropEntry = (label: string) => searchEntry(label, 'drop')

const markers: MapMarker[] = [
  {
    id: 'spawn-hoppers',
    name: 'Spawn Hoppers',
    mapId: 'world',
    x: 10,
    y: 10,
    area: 'Spawn Grounds',
    monsters: [{ name: 'Hopper', drops: [{ name: 'Hopper Leg' }] }],
  },
  {
    id: 'outskirts-hoppers',
    name: 'Outskirts Hoppers',
    mapId: 'world',
    x: 20,
    y: 20,
    area: 'Outskirts',
    monsters: [{ name: 'Hopper', drops: [{ name: 'Hopper Leg' }] }],
  },
  {
    id: 'wolf-den',
    name: 'Wolf Den',
    mapId: 'world',
    x: 30,
    y: 30,
    area: 'Outskirts',
    monsters: [{ name: 'Wolf', drops: [{ name: 'Wolf Pelt' }] }],
  },
  {
    id: 'essence-spring',
    name: 'Essence Spring',
    mapId: 'world',
    x: 40,
    y: 40,
    area: 'Spawn Grounds',
    resources: [{ type: 'Herbalism', items: [{ name: 'Life Essence' }] }],
  },
]

describe('search selection lifecycle', () => {
  it('selecting a drop activates a monster-drop filter', () => {
    expect(resolveSearchEntrySelection(dropEntry('Hopper Leg'))).toEqual({
      searchQuery: '',
      filter: { type: 'monster-drop', value: 'Hopper Leg' },
    })
  })

  it('selecting Drop B replaces Drop A', () => {
    const firstSearchFilter: SearchSelectionFilter | undefined =
      resolveSearchEntrySelection(dropEntry('Hopper Leg')).filter
    const replacedSearchFilter = resolveSearchEntrySelection(dropEntry('Life Essence')).filter

    expect(firstSearchFilter).toEqual({ type: 'monster-drop', value: 'Hopper Leg' })
    expect(replacedSearchFilter).toEqual({ type: 'monster-drop', value: 'Life Essence' })
  })

  it('manual typing after selecting a drop clears the drop filter', () => {
    const selectedDrop = resolveSearchEntrySelection(dropEntry('Hopper Leg'))
    const typedQuery = resolveSearchQueryChange('wolf')

    expect(selectedDrop.filter).toEqual({ type: 'monster-drop', value: 'Hopper Leg' })
    expect(typedQuery).toEqual({ searchQuery: 'wolf', filter: undefined })
  })

  it('manual editing an existing query after selecting a drop clears the drop filter', () => {
    const editedQuery = resolveSearchQueryChange('wolf den')

    expect(editedQuery.searchQuery).toBe('wolf den')
    expect(editedQuery.filter).toBeUndefined()
  })

  it('clearing the search input cannot leave a stale hidden drop filter', () => {
    expect(resolveSearchQueryChange('')).toEqual({ searchQuery: '', filter: undefined })
  })

  it.each([
    ['Spawn Hoppers', 'marker'],
    ['Wolf', 'monster'],
    ['Life Essence', 'item'],
    ['Life Essence', 'essence'],
    ['Herbalism', 'resource'],
    ['Spawn Grounds', 'area'],
    ['Quest Board', 'interactable'],
  ] as const)('selecting a non-drop %s %s result clears the previous drop filter', (label, type) => {
    const selection = resolveSearchEntrySelection(
      searchEntry(label, type, type === 'marker' ? { targetId: 'spawn-hoppers' } : {}),
    )

    expect(selection.filter).toBeUndefined()
  })

  it('selecting a marker after a drop preserves marker-selection behavior', () => {
    const selection = resolveSearchEntrySelection(
      searchEntry('Spawn Hoppers', 'marker', { targetId: 'spawn-hoppers' }),
    )

    expect(selection.searchQuery).toBe('Spawn Hoppers')
    expect(selection.selectedMarkerId).toBe('spawn-hoppers')
    expect(selection.filter).toBeUndefined()
  })

  it.each([
    ['Wolf', 'monster'],
    ['Life Essence', 'item'],
    ['Life Essence', 'essence'],
  ] as const)('selecting a %s %s after a drop preserves existing behavior', (label, type) => {
    const selection = resolveSearchEntrySelection(searchEntry(label, type))

    expect(selection.searchQuery).toBe(label)
    expect(selection.selectedMarkerId).toBeUndefined()
    expect(selection.filter).toBeUndefined()
  })

  it('area changes remain independent from monster-drop search selection', () => {
    const selectedAreas = new Set(['Spawn Grounds'])
    const filter = resolveSearchEntrySelection(dropEntry('Hopper Leg')).filter
    selectedAreas.add('Outskirts')

    const filteredMarkers = filterMarkers(markers, {
      searchQuery: '',
      selectedAreas,
      searchFilter: filter,
    })

    expect(filteredMarkers.map((marker) => marker.id)).toEqual([
      'spawn-hoppers',
      'outskirts-hoppers',
    ])
    expect(filter).toEqual({ type: 'monster-drop', value: 'Hopper Leg' })
  })

  it('selecting a drop does not mutate selected areas', () => {
    const selectedAreas = new Set(['Spawn Grounds'])

    resolveSearchEntrySelection(dropEntry('Hopper Leg'))

    expect([...selectedAreas]).toEqual(['Spawn Grounds'])
  })

  it('programmatic selection state does not use the free-text query transition', () => {
    const selection = resolveSearchEntrySelection(dropEntry('Hopper Leg'))

    expect(selection.searchQuery).toBe('')
    expect(selection.filter).toEqual({ type: 'monster-drop', value: 'Hopper Leg' })
  })

  it('free-text typing still behaves as normal text search', () => {
    const transition = resolveSearchQueryChange('wolf')
    const filteredMarkers = filterMarkers(markers, {
      searchQuery: transition.searchQuery,
      selectedAreas: new Set(['Spawn Grounds', 'Outskirts']),
      searchFilter: transition.filter,
    })

    expect(filteredMarkers.map((marker) => marker.id)).toEqual(['wolf-den'])
  })

  it('the structured filter remains the source of truth for drop filtering', () => {
    const filteredMarkers = filterMarkers(markers, {
      searchQuery: '',
      selectedAreas: new Set(['Spawn Grounds', 'Outskirts']),
      searchFilter: { type: 'monster-drop', value: 'Hopper Leg' },
    })

    expect(filteredMarkers.map((marker) => marker.id)).toEqual([
      'spawn-hoppers',
      'outskirts-hoppers',
    ])
  })

  it('typing a drop name without a structured filter does not activate drop filtering', () => {
    const transition = resolveSearchQueryChange('Hopper Leg')
    const filteredMarkers = filterMarkers(markers, {
      searchQuery: transition.searchQuery,
      selectedAreas: new Set(['Spawn Grounds', 'Outskirts']),
      searchFilter: transition.filter,
    })

    expect(filteredMarkers).toEqual([])
  })

  it('only supports one monster-drop filter at a time', () => {
    const firstSelection = resolveSearchEntrySelection(dropEntry('Hopper Leg'))
    const secondSelection = resolveSearchEntrySelection(dropEntry('Wolf Pelt'))

    expect(firstSelection.filter).toEqual({ type: 'monster-drop', value: 'Hopper Leg' })
    expect(secondSelection.filter).toEqual({ type: 'monster-drop', value: 'Wolf Pelt' })
    expect(Array.isArray(secondSelection.filter)).toBe(false)
  })
})
