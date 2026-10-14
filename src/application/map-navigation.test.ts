import { describe, expect, it } from 'vitest'
import { createMapNavigation, mapNavigationReducer, resolveMarkerNavigation } from './map-navigation'
import type { GameMap } from '@/domain/map'
import type { MapMarker } from '@/domain/marker'

const maps: GameMap[] = [
  { id: 'first', name: 'First', imageUrl: '/first.webp', width: 800, height: 600 },
  { id: 'second', name: 'Second', imageUrl: '/second.webp', width: 1200, height: 400 },
]
const marker: MapMarker = { id: 'target', name: 'Target', mapId: 'second', x: 25, y: 75 }

describe('map navigation', () => {
  const markersById = new Map([[marker.id, marker]])
  const mapsById = new Map(maps.map((map) => [map.id, map]))

  it('resolves ownership by ID and rejects unknown or filtered targets before rendering', () => {
    expect(resolveMarkerNavigation('target', markersById, mapsById, () => true)).toBe(marker)
    expect(resolveMarkerNavigation('unknown', markersById, mapsById, () => true)).toBeUndefined()
    expect(resolveMarkerNavigation('target', markersById, new Map(), () => true)).toBeUndefined()
    expect(resolveMarkerNavigation('target', markersById, mapsById, () => false)).toBeUndefined()
  })

  it('does not revive a cancelled request when the same target is selected again', () => {
    const selected = mapNavigationReducer(createMapNavigation(maps), { type: 'selectMarker', marker })
    const cleared = mapNavigationReducer(selected, { type: 'clearSelection' })
    const repeated = mapNavigationReducer(cleared, { type: 'selectMarker', marker })
    expect(cleared.selectedMarkerId).toBeUndefined()
    expect(repeated).toEqual({ activeMapId: 'second', selectedMarkerId: 'target', requestId: 2 })
  })
  it('defaults to the first configured map regardless of its ID or ordering', () => {
    expect(createMapNavigation(maps).activeMapId).toBe('first')
    expect(createMapNavigation([...maps].reverse()).activeMapId).toBe('second')
    expect(() => createMapNavigation([])).toThrow('At least one map')
  })

  it('switches to the owning map atomically when a result is selected', () => {
    const state = mapNavigationReducer(createMapNavigation(maps), { type: 'selectMarker', marker })
    expect(state).toEqual({ activeMapId: 'second', selectedMarkerId: 'target', requestId: 1 })
    expect(mapNavigationReducer(state, { type: 'selectMarker', marker }).requestId).toBe(2)
  })

  it('clears a foreign selection on manual map changes, including empty maps', () => {
    const selected = mapNavigationReducer(createMapNavigation(maps), { type: 'selectMarker', marker })
    expect(mapNavigationReducer(selected, { type: 'selectMap', mapId: 'second' })).toBe(selected)
    const changed = mapNavigationReducer(selected, { type: 'selectMap', mapId: 'first' })
    expect(changed.activeMapId).toBe('first')
    expect(changed.selectedMarkerId).toBeUndefined()
    expect(mapNavigationReducer(changed, { type: 'selectMap', mapId: 'second' }).selectedMarkerId).toBeUndefined()
  })

  it('clears selection after search/filter edits while preserving the active map', () => {
    const selected = mapNavigationReducer(createMapNavigation(maps), { type: 'selectMarker', marker })
    expect(mapNavigationReducer(selected, { type: 'clearSelection' })).toEqual({
      activeMapId: 'second', selectedMarkerId: undefined, requestId: 1,
    })
  })
})
