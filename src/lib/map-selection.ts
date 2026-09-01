import type { GameMap } from '@/domain/map'
import type { MapMarker } from '@/domain/marker'

export const defaultMapId: GameMap['id'] = 'surface'

export function resolveActiveMap(
  configuredMaps: readonly GameMap[],
  requestedMapId: GameMap['id'] = defaultMapId,
): GameMap {
  const activeMap =
    configuredMaps.find((map) => map.id === requestedMapId) ??
    configuredMaps.find((map) => map.id === defaultMapId) ??
    configuredMaps[0]

  if (!activeMap) {
    throw new Error('No map metadata is configured in maps.json.')
  }

  return activeMap
}

export function findSelectedMarkerForMap(
  configuredMarkers: readonly MapMarker[],
  selectedMarkerId: MapMarker['id'] | undefined,
  activeMapId: GameMap['id'],
): MapMarker | undefined {
  return configuredMarkers.find(
    (marker) => marker.id === selectedMarkerId && marker.mapId === activeMapId,
  )
}
