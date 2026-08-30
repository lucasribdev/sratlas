import type { GameMap } from './map'
import type { Monster } from './monster'

export type PercentageCoordinate = number

export type MarkerResourceItem = {
  name: string
  wikiSlug?: string
  image?: string
  chancePercent?: number
}

export type MarkerResourceGroup = {
  type: string
  items: MarkerResourceItem[]
}

export type MarkerInteractable = {
  name: string
  wikiSlug?: string
  image?: string
}

export type MarkerMonsterReference = Monster['id']

export type RawMapMarker = Omit<MapMarker, 'monsters'> & {
  monsters?: MarkerMonsterReference[]
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
  monsters?: Monster[]
  resources?: MarkerResourceGroup[]
  warpPoint?: boolean
  wikiSlug?: string
  interactables?: MarkerInteractable[]
  tags?: string[]
}
