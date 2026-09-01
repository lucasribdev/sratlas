import type { MapMarker } from '@/domain/marker'
import { normalizeSearchText } from '@/lib/search-index'
import { getMarkerSearchFields } from '@/lib/marker-search-fields'

function markerSearchFields(marker: MapMarker) {
  return getMarkerSearchFields(marker)
    .map((field) => field.value)
    .filter((value): value is string => Boolean(value))
}

export function markerMatchesSearch(marker: MapMarker, query: string) {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) {
    return true
  }

  return normalizeSearchText(markerSearchFields(marker).join(' ')).includes(normalizedQuery)
}
