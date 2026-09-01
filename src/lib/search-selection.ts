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
    visibleMarkers.some((marker) => marker.id === entry.targetId)
  ) {
    selectedMarkerId = entry.targetId
  }

  return {
    searchQuery,
    selectedMarkerId,
  }
}
