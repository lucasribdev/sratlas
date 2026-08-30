import type { MapMarker } from '@/domain/marker'
import { areas } from '@/data/areas'

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
