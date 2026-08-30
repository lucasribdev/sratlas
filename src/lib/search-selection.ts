import type { MapMarker } from '@/domain/marker'
import type { SearchEntry } from '@/lib/search-index'

export type SearchSelectionResult = {
  searchQuery: string
  selectedMarkerId?: MapMarker['id']
}

export function resolveSearchEntrySelection(
  entry: SearchEntry,
): SearchSelectionResult {
  const searchQuery = entry.label
  let selectedMarkerId: MapMarker['id'] | undefined

  if (entry.type === 'marker') {
    selectedMarkerId = entry.targetId
  }

  return {
    searchQuery,
    selectedMarkerId,
  }
}
