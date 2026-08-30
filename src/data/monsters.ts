import monstersJson from './monsters.json'
import type { Monster } from '@/domain/monster'

export const monsters: Monster[] = monstersJson

export const monsterById = new Map(monsters.map((monster) => [monster.id, monster]))
