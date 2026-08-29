import type { GameMap } from './map'

export type PercentageCoordinate = number

export type MarkerMonster = {
  name: string
  wikiUrl?: string
  imageUrl?: string
}

export type MarkerResourceItem = {
  name: string
  wikiUrl?: string
  imageUrl?: string
  chancePercent?: number
}

export type MarkerResourceGroup = {
  type: string
  items: MarkerResourceItem[]
}

export type MarkerInteractable = {
  name: string
  wikiUrl?: string
  imageUrl?: string
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
  monsters?: MarkerMonster[]
  resources?: MarkerResourceGroup[]
  warpPoint?: boolean
  wikiUrl?: string
  interactables?: MarkerInteractable[]
  tags?: string[]
}
