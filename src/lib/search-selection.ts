import type { MapMarker } from '@/domain/marker'
import type { SearchEntry } from '@/lib/search-index'

export type SearchSelectionFilter =
  | {
      type: 'monster-drop'
      value: string
    }

export type SearchSelectionResult = {
  searchQuery: string
  selectedMarkerId?: MapMarker['id']
  filter?: SearchSelectionFilter
}

export function resolveSearchEntrySelection(
  entry: SearchEntry,
): SearchSelectionResult {
  const searchQuery = entry.type === 'drop' ? '' : entry.label
  let selectedMarkerId: MapMarker['id'] | undefined
  let filter: SearchSelectionFilter | undefined

  if (entry.type === 'marker') {
    selectedMarkerId = entry.targetId
  }

  if (entry.type === 'drop') {
    filter = {
      type: 'monster-drop',
      value: entry.label,
    }
  }

  return {
    searchQuery,
    selectedMarkerId,
    filter,
  }
}
