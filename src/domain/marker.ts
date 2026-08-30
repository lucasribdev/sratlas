import type { GameMap } from './map'

export type PercentageCoordinate = number

export type MarkerMonster = {
  name: string
  wikiSlug?: string
  image?: string
}

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
  wikiSlug?: string
  interactables?: MarkerInteractable[]
  tags?: string[]
}
