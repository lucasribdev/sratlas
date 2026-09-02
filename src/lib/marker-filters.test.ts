import { describe, expect, it } from 'vitest'
import type { GameMap } from '@/domain/map'
import type { MapMarker } from '@/domain/marker'
import {
  filterMarkersForMap,
  filterMatchingMarkers,
  scopeSearchResults,
} from '@/lib/marker-filters'

const testMaps: GameMap[] = [
  { id: 'upper', name: 'Upper Realm', imageUrl: '/upper.webp', width: 100, height: 100 },
  { id: 'lower', name: 'Lower Realm', imageUrl: '/lower.webp', width: 100, height: 100 },
]

const testMarkers: MapMarker[] = [
  { id: 'upper-shrine', name: 'Shared Shrine', mapId: 'upper', x: 10, y: 20, area: 'North' },
  { id: 'lower-shrine', name: 'Shared Shrine', mapId: 'lower', x: 30, y: 40, area: 'South' },
  { id: 'lower-grove', name: 'Hidden Grove', mapId: 'lower', x: 50, y: 60, area: 'North' },
  { id: 'orphan', name: 'Shared Orphan', mapId: 'missing', x: 70, y: 80, area: 'North' },
]

describe('cross-map marker filtering', () => {
  it('scopes empty-query results to the active map', () => {
    const matchingMarkers = filterMatchingMarkers(
      testMarkers,
      testMaps,
      '',
      new Set(['North', 'South']),
    )

    expect(scopeSearchResults(matchingMarkers, 'upper', '').map((marker) => marker.id)).toEqual([
      'upper-shrine',
    ])
  })

  it('returns global registered-map matches for a non-empty query', () => {
    const matchingMarkers = filterMatchingMarkers(
      testMarkers,
      testMaps,
      'shared',
      new Set(['North', 'South']),
    )

    expect(scopeSearchResults(matchingMarkers, 'upper', 'shared').map((marker) => marker.id)).toEqual([
      'upper-shrine',
      'lower-shrine',
    ])
  })

  it('combines search and selected areas with AND semantics', () => {
    const matchingMarkers = filterMatchingMarkers(
      testMarkers,
      testMaps,
      'shared',
      new Set(['North']),
    )

    expect(matchingMarkers.map((marker) => marker.id)).toEqual(['upper-shrine'])
  })

  it('keeps active-map rendering scoped after global matching', () => {
    const matchingMarkers = filterMatchingMarkers(
      testMarkers,
      testMaps,
      'shared',
      new Set(['North', 'South']),
    )

    expect(filterMarkersForMap(matchingMarkers, 'lower').map((marker) => marker.id)).toEqual([
      'lower-shrine',
    ])
  })
})
