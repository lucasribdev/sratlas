import type { MapMarker, MarkerDropItem } from '@/domain/marker'
import { normalizeSearchText } from '@/lib/search-index'

export function markerMonsterDrops(marker: MapMarker): MarkerDropItem[] {
  return (marker.monsters ?? []).flatMap((monster) => monster.drops ?? [])
}

export function markerHasMonsterDrop(marker: MapMarker, itemName?: string) {
  const normalizedItemName = normalizeSearchText(itemName ?? '')

  if (!normalizedItemName) {
    return true
  }

  return markerMonsterDrops(marker).some(
    (drop) => normalizeSearchText(drop.name) === normalizedItemName,
  )
}
