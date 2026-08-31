import type { MapMarker } from '@/domain/marker'
import { areas } from '@/data/areas'
import { markerMatchesSearch } from '@/lib/marker-search'
import { markerHasMonsterDrop } from '@/lib/monster-drops'
import type { SearchSelectionFilter } from '@/lib/search-selection'

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

export function markerMatchesSelectedAreas(
  marker: MapMarker,
  selectedAreas: ReadonlySet<string>,
) {
  return marker.area ? selectedAreas.has(marker.area) : false
}

export function markerMatchesStructuredFilter(
  marker: MapMarker,
  filter?: SearchSelectionFilter,
) {
  if (!filter) {
    return true
  }

  switch (filter.type) {
    case 'monster-drop':
      return markerHasMonsterDrop(marker, filter.value)
  }
}

export function filterMarkers(
  markers: MapMarker[],
  filters: {
    searchQuery: string
    selectedAreas: ReadonlySet<string>
    searchFilter?: SearchSelectionFilter
  },
) {
  return markers.filter(
    (marker) =>
      markerMatchesSearch(marker, filters.searchQuery) &&
      markerMatchesSelectedAreas(marker, filters.selectedAreas) &&
      markerMatchesStructuredFilter(marker, filters.searchFilter),
  )
}
