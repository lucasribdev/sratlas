import type { GameMap } from '@/domain/map'
import type { MapMarker } from '@/domain/marker'
import type { SearchEntry } from '@/lib/search-index'
import { markerMatchesAreas } from '@/lib/marker-filters'

export type SearchSelectionResult = {
  searchQuery: string
  navigation?: MarkerNavigation
}

export type MarkerNavigation = {
  activeMapId: GameMap['id']
  selectedMarkerId: MapMarker['id']
}

export function resolveMarkerNavigation(
  markerId: MapMarker['id'],
  configuredMarkers: readonly MapMarker[],
  configuredMaps: readonly GameMap[],
  selectedAreas: ReadonlySet<string>,
): MarkerNavigation | undefined {
  const marker = configuredMarkers.find((candidate) => candidate.id === markerId)

  if (!marker || !markerMatchesAreas(marker, selectedAreas)) {
    return undefined
  }

  const destinationMap = configuredMaps.find((map) => map.id === marker.mapId)

  if (!destinationMap) {
    return undefined
  }

  return {
    activeMapId: destinationMap.id,
    selectedMarkerId: marker.id,
  }
}

export function resolveSearchEntrySelection(
  entry: SearchEntry,
  configuredMarkers: readonly MapMarker[],
  configuredMaps: readonly GameMap[],
  selectedAreas: ReadonlySet<string>,
): SearchSelectionResult {
  const searchQuery = entry.label
  const navigation =
    entry.type === 'marker'
      ? resolveMarkerNavigation(
          entry.targetId,
          configuredMarkers,
          configuredMaps,
          selectedAreas,
        )
      : undefined

  return {
    searchQuery,
    navigation,
  }
}
