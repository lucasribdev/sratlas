import markersJson from './markers.json'
import { monsterById } from '@/data/monsters'
import type { MapMarker, RawMapMarker } from '@/domain/marker'

function resolveMarkerMonsters(marker: RawMapMarker): MapMarker {
  const monsters = (marker.monsters ?? []).map((monsterId) => {
    const monster = monsterById.get(monsterId)

    if (!monster) {
      throw new Error(`Unknown monster id "${monsterId}" in marker "${marker.id}"`)
    }

    return monster
  })

  return {
    ...marker,
    monsters,
  }
}

export const markers: MapMarker[] = (markersJson as RawMapMarker[]).map(resolveMarkerMonsters)
