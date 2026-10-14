import { describe, expect, it } from 'vitest'
import fixture from '@/test/fixtures/multi-map.json'
import { buildSearchIndex, getSearchSuggestions } from '@/lib/search-index'
import { resolveSearchEntrySelection } from '@/lib/search-selection'
import { markerMatchesAreas } from '@/lib/marker-filters'
import { markerMatchesSearch } from '@/lib/marker-search'
import { createMapNavigation, mapNavigationReducer, resolveMarkerNavigation } from './map-navigation'

const { maps, markers } = fixture
const index = buildSearchIndex(markers)
const mapsById = new Map(maps.map((map) => [map.id, map]))
const markersById = new Map(markers.map((marker) => [marker.id, marker]))

function results(query = '', areas: ReadonlySet<string> | null = null) {
  return markers.filter((marker) => markerMatchesSearch(marker, query) && markerMatchesAreas(marker, areas))
}

describe('global multi-map flow', () => {
  it('preserves global query/filter results while projecting only markers owned by the active map', () => {
    const global = results('Fixture Camp', new Set(['Outskirts']))
    let state = createMapNavigation(maps)
    for (const map of maps) {
      state = mapNavigationReducer(state, { type: 'selectMap', mapId: map.id })
      expect(results('Fixture Camp', new Set(['Outskirts']))).toEqual(global)
      expect(global.filter((marker) => marker.mapId === state.activeMapId).map((marker) => marker.id))
        .toEqual(map.id === 'fixture-empty' ? [] : [`fixture-${map.id}-camp`])
    }
  })

  it('resolves a unique foreign suggestion and repeats navigation using its global ID', () => {
    const entry = getSearchSuggestions(index, 'Fixture Target').find((entry) => entry.type === 'marker')!
    const selection = resolveSearchEntrySelection(entry, results())
    const target = resolveMarkerNavigation(selection.selectedMarkerId!, markersById, mapsById, () => true)!
    let state = createMapNavigation(maps)
    state = mapNavigationReducer(state, { type: 'selectMarker', marker: target })
    expect(state.activeMapId).toBe('caves')
    expect(state.selectedMarkerId).toBe('fixture-caves-target')
    expect(mapNavigationReducer(state, { type: 'selectMarker', marker: target }).requestId).toBe(2)
  })

  it('does not choose an arbitrary occurrence of a shared name, even when filters allow only one', () => {
    const entry = getSearchSuggestions(index, 'Fixture Camp').find((entry) => entry.type === 'marker')!
    expect(entry.markerIds).toHaveLength(2)
    expect(resolveSearchEntrySelection(entry, results()).selectedMarkerId).toBeUndefined()
    expect(resolveSearchEntrySelection(entry, [markers[0]]).selectedMarkerId).toBeUndefined()
    for (const marker of markers.slice(0, 2)) {
      expect(resolveMarkerNavigation(marker.id, markersById, mapsById, () => true)).toBe(marker)
    }
  })

  it('searches nested rich data across maps and intersects area filters', () => {
    for (const query of ['Fixture Monster', 'Fixture Drop', 'Fixture Ore', 'Fixture NPC']) {
      expect(results(query).map((marker) => marker.id)).toEqual(['fixture-caves-target'])
      expect(results(query, new Set())).toEqual([])
    }
  })

  it('shows markers without areas when unrestricted, including a dataset with no areas', () => {
    const marker = markers.find((marker) => !marker.area)!
    expect(markerMatchesAreas(marker, null)).toBe(true)
    expect(markerMatchesAreas(marker, new Set())).toBe(false)
    expect(markerMatchesAreas(marker, new Set(['Outskirts']))).toBe(false)
    expect(results()).toContain(marker)
    expect(results('', new Set())).toEqual([])
  })

  it('navigates a populated third map using only added configuration and marker data', () => {
    const thirdMarker = { id: 'fixture-third-target', name: 'Third Target', mapId: maps[2].id, x: 40, y: 60 }
    const expandedMarkers = new Map([...markersById, [thirdMarker.id, thirdMarker]])
    const target = resolveMarkerNavigation(thirdMarker.id, expandedMarkers, mapsById, () => true)!
    const state = mapNavigationReducer(createMapNavigation(maps), { type: 'selectMarker', marker: target })
    expect(state.activeMapId).toBe(maps[2].id)
    expect(state.selectedMarkerId).toBe(thirdMarker.id)
  })
})
