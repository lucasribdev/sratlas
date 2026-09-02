import { describe, expect, it } from 'vitest'
import type { GameMap } from '@/domain/map'
import type { MapMarker } from '@/domain/marker'
import { resolveMarkerNavigation } from '@/lib/search-selection'

const testMaps: GameMap[] = [
  { id: 'upper', name: 'Upper Realm', imageUrl: '/upper.webp', width: 100, height: 100 },
  { id: 'lower', name: 'Lower Realm', imageUrl: '/lower.webp', width: 100, height: 100 },
]

const testMarkers: MapMarker[] = [
  { id: 'upper-marker', name: 'Upper Marker', mapId: 'upper', x: 10, y: 20, area: 'North' },
  { id: 'lower-marker', name: 'Lower Marker', mapId: 'lower', x: 30, y: 40, area: 'South' },
  { id: 'orphan-marker', name: 'Orphan Marker', mapId: 'missing', x: 50, y: 60, area: 'North' },
]

describe('marker navigation resolution', () => {
  it('returns one coherent destination-map and marker selection', () => {
    expect(
      resolveMarkerNavigation(
        'lower-marker',
        testMarkers,
        testMaps,
        new Set(['North', 'South']),
      ),
    ).toEqual({ activeMapId: 'lower', selectedMarkerId: 'lower-marker' })
  })

  it('rejects a marker excluded by selected areas', () => {
    expect(
      resolveMarkerNavigation('lower-marker', testMarkers, testMaps, new Set(['North'])),
    ).toBeUndefined()
  })

  it('rejects missing markers and markers with invalid map ids', () => {
    const selectedAreas = new Set(['North', 'South'])

    expect(
      resolveMarkerNavigation('missing-marker', testMarkers, testMaps, selectedAreas),
    ).toBeUndefined()
    expect(
      resolveMarkerNavigation('orphan-marker', testMarkers, testMaps, selectedAreas),
    ).toBeUndefined()
  })
})
