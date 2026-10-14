import type { MapMarker } from '@/domain/marker'
import type { SearchEntry } from '@/lib/search-index'

export type SearchSelectionResult = {
  searchQuery: string
  selectedMarkerId?: MapMarker['id']
}

export function resolveSearchEntrySelection(
  entry: SearchEntry,
  visibleMarkers: readonly Pick<MapMarker, 'id'>[],
): SearchSelectionResult {
  const searchQuery = entry.label
  let selectedMarkerId: MapMarker['id'] | undefined

  if (
    entry.type === 'marker' &&
    entry.markerIds.length === 1 &&
    visibleMarkers.some((marker) => marker.id === entry.markerIds[0])
  ) {
    selectedMarkerId = entry.markerIds[0]
  }

  return {
    searchQuery,
    selectedMarkerId,
  }
}
