import type { MapMarker } from '@/domain/marker'

export const quickFilters = [
  { id: 'warp-point', label: 'Warp point' },
  { id: 'has-monsters', label: 'Has monsters' },
  { id: 'fishing', label: 'Fishing' },
  { id: 'mining', label: 'Mining' },
  { id: 'herbalism', label: 'Herbalism' },
] as const

export type QuickFilterId = (typeof quickFilters)[number]['id']

function markerHasResourceType(marker: MapMarker, resourceType: string) {
  return marker.resources?.some((resource) => resource.type === resourceType) ?? false
}

export function markerMatchesQuickFilter(marker: MapMarker, filterId: QuickFilterId) {
  switch (filterId) {
    case 'warp-point':
      return marker.warpPoint === true
    case 'has-monsters':
      return (marker.monsters?.length ?? 0) > 0
    case 'fishing':
      return markerHasResourceType(marker, 'Fishing')
    case 'mining':
      return markerHasResourceType(marker, 'Mining')
    case 'herbalism':
      return markerHasResourceType(marker, 'Herbalism')
  }
}

export function markerAreaOptions(markers: MapMarker[]) {
  return Array.from(
    new Set(markers.map((marker) => marker.area?.trim()).filter((area): area is string => Boolean(area))),
  ).sort((firstArea, secondArea) => firstArea.localeCompare(secondArea))
}
