import type { MapMarker } from '@/domain/marker'
import type { GameMap } from '@/domain/map'
import { areas } from '@/data/areas'
import { markerMatchesSearch } from '@/lib/marker-search'

export function markerAreaOptions(markers: MapMarker[]) {
  const markerAreas = new Set(
    markers.map((marker) => marker.area?.trim()).filter((area): area is string => Boolean(area)),
  )
  const orderedAreas = areas.map((area) => area.name).filter((area) => markerAreas.delete(area))
  const unmatchedAreas = [...markerAreas].sort((firstArea, secondArea) =>
    firstArea.localeCompare(secondArea),
  )

  return [...orderedAreas, ...unmatchedAreas]
}

export function markerMatchesAreas(
  marker: MapMarker,
  selectedAreas: ReadonlySet<string>,
) {
  return marker.area ? selectedAreas.has(marker.area) : false
}

export function filterMatchingMarkers(
  markers: readonly MapMarker[],
  registeredMaps: readonly GameMap[],
  searchQuery: string,
  selectedAreas: ReadonlySet<string>,
) {
  const registeredMapIds = new Set(registeredMaps.map((map) => map.id))

  return markers.filter(
    (marker) =>
      registeredMapIds.has(marker.mapId) &&
      markerMatchesSearch(marker, searchQuery) &&
      markerMatchesAreas(marker, selectedAreas),
  )
}

export function filterMarkersForMap(
  markers: readonly MapMarker[],
  activeMapId: GameMap['id'],
) {
  return markers.filter((marker) => marker.mapId === activeMapId)
}

export function scopeSearchResults(
  matchingMarkers: readonly MapMarker[],
  activeMapId: GameMap['id'],
  searchQuery: string,
) {
  return searchQuery.trim()
    ? [...matchingMarkers]
    : filterMarkersForMap(matchingMarkers, activeMapId)
}
