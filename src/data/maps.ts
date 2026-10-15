import mapsJson from './maps.json'
import type { GameMap } from '@/domain/map'

export const maps: GameMap[] = mapsJson

export const mapsById: ReadonlyMap<string, GameMap> = new Map(
  maps.map((map) => [map.id, map]),
)
