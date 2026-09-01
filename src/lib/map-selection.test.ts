import { describe, expect, it } from 'vitest'
import type { GameMap } from '@/domain/map'
import type { MapMarker } from '@/domain/marker'
import {
  defaultMapId,
  findSelectedMarkerForMap,
  resolveActiveMap,
} from '@/lib/map-selection'

const testMaps: GameMap[] = [
  {
    id: 'surface',
    name: 'Surface',
    imageUrl: '/maps/surface.webp',
    width: 1076,
    height: 1056,
  },
  {
    id: 'caves',
    name: 'Caves',
    imageUrl: '/maps/caves.webp',
    width: 800,
    height: 600,
  },
]

const testMarkers: MapMarker[] = [
  { id: 'surface-marker', name: 'Surface marker', mapId: 'surface', x: 25, y: 50 },
  { id: 'cave-marker', name: 'Cave marker', mapId: 'caves', x: 75, y: 20 },
]

describe('active map selection', () => {
  it('selects surface by default', () => {
    expect(defaultMapId).toBe('surface')
    expect(resolveActiveMap(testMaps).id).toBe('surface')
  })

  it('resolves a valid requested map', () => {
    expect(resolveActiveMap(testMaps, 'caves').id).toBe('caves')
  })

  it('falls back to surface for an invalid requested map', () => {
    expect(resolveActiveMap(testMaps, 'missing').id).toBe('surface')
  })

  it('falls back to the first configured map when surface is unavailable', () => {
    const mapsWithoutSurface = testMaps.filter((map) => map.id !== 'surface')

    expect(resolveActiveMap(mapsWithoutSurface, 'missing').id).toBe('caves')
  })
})

describe('selected marker map safety', () => {
  it('returns a selected marker on the active map', () => {
    expect(findSelectedMarkerForMap(testMarkers, 'surface-marker', 'surface')).toEqual(
      testMarkers[0],
    )
  })

  it('does not return a selected marker from another map', () => {
    expect(findSelectedMarkerForMap(testMarkers, 'cave-marker', 'surface')).toBeUndefined()
  })
})
