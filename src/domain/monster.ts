export type MonsterElement = string

export type MonsterDropType = 'item' | 'essence'

export type MonsterDrop = {
  id: string
  name: string
  type?: MonsterDropType
}

export type Monster = {
  id: string
  name: string
  level?: number
  elements: MonsterElement[]
  drops: MonsterDrop[]
  wikiSlug?: string
  image?: string
}
