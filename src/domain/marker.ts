import type { GameMap } from './map'

export type PercentageCoordinate = number

export type MarkerResourceGroup = {
  type: string
  items: string[]
}

export type MapMarker = {
  id: string
  name: string
  mapId: GameMap['id']
  x: PercentageCoordinate
  y: PercentageCoordinate
  area?: string
  zoneType?: string
  level?: string
  monsters?: string[]
  resources?: MarkerResourceGroup[]
  warpPoint?: boolean
  description?: string
  wikiUrl?: string
  tags?: string[]
}
