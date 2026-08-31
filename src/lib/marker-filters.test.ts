import { describe, expect, it } from 'vitest'
import type { MapMarker } from '@/domain/marker'
import {
  filterMarkers,
  markerMatchesSelectedAreas,
  markerMatchesStructuredFilter,
} from '@/lib/marker-filters'
import type { SearchEntry } from '@/lib/search-index'
import { resolveSearchEntrySelection, type SearchSelectionFilter } from '@/lib/search-selection'

const markers: MapMarker[] = [
  {
    id: 'spawn-hoppers',
    name: 'Spawn Hoppers',
    mapId: 'world',
    x: 10,
    y: 10,
    area: 'Spawn Grounds',
    zoneType: 'Field',
    monsters: [
      {
        name: 'Hopper',
        drops: [{ name: 'Hopper Leg' }, { name: 'Hopper Chitin' }],
      },
    ],
  },
  {
    id: 'spawn-crabs',
    name: 'Spawn Crabs',
    mapId: 'world',
    x: 20,
    y: 20,
    area: 'Spawn Grounds',
    zoneType: 'Shore',
    monsters: [{ name: 'Crab', drops: [{ name: 'Crab Claw' }] }],
  },
  {
    id: 'outskirts-hoppers',
    name: 'Outskirts Hoppers',
    mapId: 'world',
    x: 30,
    y: 30,
    area: 'Outskirts',
    zoneType: 'Field',
    monsters: [{ name: 'Hopper', drops: [{ name: 'Hopper Leg' }] }],
  },
  {
    id: 'quiet-field',
    name: 'Quiet Field',
    mapId: 'world',
    x: 40,
    y: 40,
    area: 'Spawn Grounds',
    zoneType: 'Field',
  },
  {
    id: 'dry-cave',
    name: 'Dry Cave',
    mapId: 'world',
    x: 50,
    y: 50,
    area: 'Spawn Grounds',
    zoneType: 'Cave',
    monsters: [{ name: 'Hopper' }],
  },
]

function marker(id: MapMarker['id']) {
  const foundMarker = markers.find((candidate) => candidate.id === id)

  if (!foundMarker) {
    throw new Error(`Missing marker ${id}`)
  }

  return foundMarker
}

function dropEntry(label: string): SearchEntry {
  return {
    id: `drop:${label}`,
    label,
    type: 'drop',
    keywords: [],
    markerIds: [],
    targetId: label,
  }
}

function markerEntry(label: string): SearchEntry {
  return {
    id: `marker:${label}`,
    label,
    type: 'marker',
    keywords: [],
    markerIds: ['spawn-hoppers'],
    targetId: 'spawn-hoppers',
  }
}

describe('marker filters', () => {
  it('lets markers pass the structured filter stage when no structured filter exists', () => {
    expect(markerMatchesStructuredFilter(marker('quiet-field'))).toBe(true)
  })

  it('matches a marker containing the selected monster drop', () => {
    expect(
      markerMatchesStructuredFilter(marker('spawn-hoppers'), {
        type: 'monster-drop',
        value: 'Hopper Leg',
      }),
    ).toBe(true)
  })

  it('does not match a marker without the selected monster drop', () => {
    expect(
      markerMatchesStructuredFilter(marker('spawn-crabs'), {
        type: 'monster-drop',
        value: 'Hopper Leg',
      }),
    ).toBe(false)
  })

  it('does not match a marker with no monsters against a selected monster drop', () => {
    expect(
      markerMatchesStructuredFilter(marker('quiet-field'), {
        type: 'monster-drop',
        value: 'Hopper Leg',
      }),
    ).toBe(false)
  })

  it('does not match a monster with no drops against a selected monster drop', () => {
    expect(
      markerMatchesStructuredFilter(marker('dry-cave'), {
        type: 'monster-drop',
        value: 'Hopper Leg',
      }),
    ).toBe(false)
  })

  it('respects normalized exact drop matching through the monster-drop helper', () => {
    expect(
      markerMatchesStructuredFilter(marker('spawn-hoppers'), {
        type: 'monster-drop',
        value: '  hopper   leg  ',
      }),
    ).toBe(true)
    expect(
      markerMatchesStructuredFilter(marker('spawn-hoppers'), {
        type: 'monster-drop',
        value: 'Hopper',
      }),
    ).toBe(false)
  })

  it('activates the structured filter when selecting a drop', () => {
    expect(resolveSearchEntrySelection(dropEntry('Hopper Leg')).filter).toEqual({
      type: 'monster-drop',
      value: 'Hopper Leg',
    })
  })

  it('replaces Drop A with Drop B when the latest selection filter is stored', () => {
    let searchFilter: SearchSelectionFilter | undefined

    searchFilter = resolveSearchEntrySelection(dropEntry('Hopper Leg')).filter
    expect(searchFilter).toEqual({
      type: 'monster-drop',
      value: 'Hopper Leg',
    })

    searchFilter = resolveSearchEntrySelection(dropEntry('Crab Claw')).filter

    expect(searchFilter).toEqual({
      type: 'monster-drop',
      value: 'Crab Claw',
    })
  })

  it('composes area and drop filters with AND semantics', () => {
    const filteredMarkers = filterMarkers(markers, {
      searchQuery: '',
      selectedAreas: new Set(['Spawn Grounds']),
      searchFilter: { type: 'monster-drop', value: 'Hopper Leg' },
    })

    expect(filteredMarkers.map((filteredMarker) => filteredMarker.id)).toEqual(['spawn-hoppers'])
  })

  it('composes text search and drop filters with AND semantics when both are active', () => {
    const filteredMarkers = filterMarkers(markers, {
      searchQuery: 'outskirts',
      selectedAreas: new Set(['Spawn Grounds', 'Outskirts']),
      searchFilter: { type: 'monster-drop', value: 'Hopper Leg' },
    })

    expect(filteredMarkers.map((filteredMarker) => filteredMarker.id)).toEqual([
      'outskirts-hoppers',
    ])
  })

  it('keeps existing area-only filtering semantics unchanged', () => {
    const filteredMarkers = filterMarkers(markers, {
      searchQuery: '',
      selectedAreas: new Set(['Spawn Grounds']),
    })

    expect(filteredMarkers.map((filteredMarker) => filteredMarker.id)).toEqual([
      'spawn-hoppers',
      'spawn-crabs',
      'quiet-field',
      'dry-cave',
    ])
  })

  it('keeps existing text-search-only filtering semantics unchanged', () => {
    const filteredMarkers = filterMarkers(markers, {
      searchQuery: 'field',
      selectedAreas: new Set(['Spawn Grounds', 'Outskirts']),
    })

    expect(filteredMarkers.map((filteredMarker) => filteredMarker.id)).toEqual([
      'spawn-hoppers',
      'outskirts-hoppers',
      'quiet-field',
    ])
  })

  it('does not turn free typing into a structured monster-drop filter', () => {
    const filteredMarkers = filterMarkers(markers, {
      searchQuery: 'hopper leg',
      selectedAreas: new Set(['Spawn Grounds', 'Outskirts']),
    })

    expect(filteredMarkers).toEqual([])
  })

  it('keeps non-drop autocomplete selections outside structured drop filtering', () => {
    const selection = resolveSearchEntrySelection(markerEntry('Spawn Hoppers'))

    expect(selection.searchQuery).toBe('Spawn Hoppers')
    expect(selection.selectedMarkerId).toBe('spawn-hoppers')
    expect(selection.filter).toBeUndefined()
  })

  it('uses one filtered marker collection with the drop constraint applied', () => {
    const filteredMarkers = filterMarkers(markers, {
      searchQuery: '',
      selectedAreas: new Set(['Spawn Grounds', 'Outskirts']),
      searchFilter: { type: 'monster-drop', value: 'Hopper Leg' },
    })

    expect(filteredMarkers.map((filteredMarker) => filteredMarker.id)).toEqual([
      'spawn-hoppers',
      'outskirts-hoppers',
    ])
  })

  it('keeps selected-area matching false for markers without an area', () => {
    expect(
      markerMatchesSelectedAreas(
        {
          id: 'unplaced',
          name: 'Unplaced',
          mapId: 'world',
          x: 0,
          y: 0,
        },
        new Set(['Spawn Grounds']),
      ),
    ).toBe(false)
  })
})
