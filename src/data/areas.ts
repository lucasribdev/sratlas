import areasJson from './areas.json'
import type { Area } from '@/domain/area'
import type { MapMarker } from '@/domain/marker'

export const fallbackAreaColor = '#64748b'

export const areas: Area[] = areasJson

const areasByName = new Map(areas.map((area) => [normalizeAreaName(area.name), area]))

function normalizeAreaName(areaName: string) {
  return areaName.trim().toLocaleLowerCase()
}

export function areaColorForMarker(marker: Pick<MapMarker, 'area'>) {
  if (!marker.area) {
    return fallbackAreaColor
  }

  return areasByName.get(normalizeAreaName(marker.area))?.color ?? fallbackAreaColor
}

