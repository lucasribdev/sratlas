import type { MapMarker } from '@/domain/marker'
import type { QuickFilterId } from '@/lib/marker-filters'
import type { SearchEntry } from '@/lib/search-index'

export type SearchSelectionResult = {
  searchQuery: string
  selectedQuickFilters: Set<QuickFilterId>
  selectedMarkerId?: MapMarker['id']
}

const resourceQuickFilters = new Map<string, QuickFilterId>([
  ['Fishing', 'fishing'],
  ['Mining', 'mining'],
  ['Herbalism', 'herbalism'],
])

export function resolveSearchEntrySelection(
  entry: SearchEntry,
): SearchSelectionResult {
  const selectedQuickFilters = new Set<QuickFilterId>()
  let searchQuery = entry.label
  let selectedMarkerId: MapMarker['id'] | undefined

  if (entry.type === 'marker') {
    selectedMarkerId = entry.targetId
  }

  if (entry.type === 'resource') {
    const quickFilterId = resourceQuickFilters.get(entry.label)

    if (quickFilterId) {
      selectedQuickFilters.add(quickFilterId)
      searchQuery = ''
    }
  }

  return {
    searchQuery,
    selectedQuickFilters,
    selectedMarkerId,
  }
}
