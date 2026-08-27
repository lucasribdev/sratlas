import categoriesJson from './categories.json'
import type { MarkerCategory } from '../domain/category'

export const categories = categoriesJson satisfies MarkerCategory[]

