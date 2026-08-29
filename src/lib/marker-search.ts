import type { MapMarker } from '@/domain/marker'

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

function markerSearchFields(marker: MapMarker) {
  const resources = marker.resources ?? []

  return [
    marker.name,
    marker.area,
    marker.zoneType,
    ...(marker.tags ?? []),
    ...(marker.monsters ?? []).map((monster) => monster.name),
    ...resources.flatMap((resource) => [
      resource.type,
      ...resource.items.map((item) => item.name),
    ]),
  ].filter((value): value is string => Boolean(value))
}

export function markerMatchesSearch(marker: MapMarker, query: string) {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) {
    return true
  }

  return normalizeSearchText(markerSearchFields(marker).join(' ')).includes(normalizedQuery)
}
