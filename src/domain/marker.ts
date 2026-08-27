import type { MarkerCategory } from './category'
import type { GameMap } from './map'

export type PercentageCoordinate = number

export type MapMarker = {
  id: string
  name: string
  category: MarkerCategory['id']
  mapId: GameMap['id']
  x: PercentageCoordinate
  y: PercentageCoordinate
  area?: string
  description?: string
  wikiUrl?: string
  tags?: string[]
}
