import type { MapMarker } from '@/domain/marker'
import { getMarkerSearchFields } from '@/lib/marker-search-fields'

export const searchEntryTypes = [
  'marker',
  'area',
  'monster',
  'item',
  'essence',
  'resource',
  'interactable',
] as const

export type SearchEntryType = (typeof searchEntryTypes)[number]

export type SearchEntry = {
  id: string
  label: string
  type: SearchEntryType
  keywords: string[]
  markerIds: MapMarker['id'][]
  targetId: string
}

export const searchEntryTypeLabels: Record<SearchEntryType, string> = {
  marker: 'Marker',
  area: 'Area',
  monster: 'Monster',
  item: 'Item',
  essence: 'Essence',
  resource: 'Resource',
  interactable: 'Interactable',
}

export function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

function entryKey(type: SearchEntryType, label: string) {
  return `${type}:${normalizeSearchText(label)}`
}

function classifyItem(name: string): Extract<SearchEntryType, 'item' | 'essence'> {
  return normalizeSearchText(name).includes('essence') ? 'essence' : 'item'
}

function addEntry(
  entries: Map<string, SearchEntry>,
  input: {
    label?: string
    type: SearchEntryType
    marker: MapMarker
    keywords?: Array<string | undefined>
    targetId?: string
  },
) {
  const label = input.label?.trim()

  if (!label) {
    return
  }

  const key = entryKey(input.type, label)
  const existingEntry = entries.get(key)
  const keywords = [...(input.keywords ?? []), input.marker.area, input.marker.zoneType].filter(
    (keyword): keyword is string => Boolean(keyword?.trim()),
  )

  if (existingEntry) {
    existingEntry.markerIds.push(input.marker.id)
    existingEntry.keywords.push(...keywords)
    return
  }

  entries.set(key, {
    id: key,
    label,
    type: input.type,
    keywords,
    markerIds: [input.marker.id],
    targetId: input.targetId ?? label,
  })
}

export function buildSearchIndex(markers: MapMarker[]) {
  const entries = new Map<string, SearchEntry>()

  for (const marker of markers) {
    for (const field of getMarkerSearchFields(marker)) {
      if (!field.entry) {
        continue
      }

      addEntry(entries, {
        label: field.value,
        type:
          field.entry.type === 'item'
            ? classifyItem(field.value ?? '')
            : field.entry.type,
        marker,
        keywords: field.entry.keywords,
        targetId: field.entry.targetId,
      })
    }
  }

  return Array.from(entries.values()).map((entry) => ({
    ...entry,
    keywords: Array.from(new Set(entry.keywords)),
    markerIds: Array.from(new Set(entry.markerIds)),
  }))
}

export function getSearchSuggestions(
  entries: SearchEntry[],
  query: string,
  options: { limit?: number } = {},
) {
  const normalizedQuery = normalizeSearchText(query)
  const limit = options.limit ?? 8

  if (!normalizedQuery) {
    return []
  }

  return entries
    .map((entry) => {
      const normalizedLabel = normalizeSearchText(entry.label)
      const secondaryValues = [searchEntryTypeLabels[entry.type], ...entry.keywords].map(
        normalizeSearchText,
      )
      let rank = -1

      if (normalizedLabel === normalizedQuery) {
        rank = 0
      } else if (normalizedLabel.startsWith(normalizedQuery)) {
        rank = 1
      } else if (secondaryValues.some((value) => value.startsWith(normalizedQuery))) {
        rank = 2
      } else if (normalizedLabel.includes(normalizedQuery)) {
        rank = 3
      } else if (secondaryValues.some((value) => value.includes(normalizedQuery))) {
        rank = 4
      }

      if (rank < 0) {
        return undefined
      }

      return {
        entry,
        rank,
      }
    })
    .filter((result): result is { entry: SearchEntry; rank: number } => Boolean(result))
    .sort((firstResult, secondResult) => {
      if (firstResult.rank !== secondResult.rank) {
        return firstResult.rank - secondResult.rank
      }

      return firstResult.entry.label.localeCompare(secondResult.entry.label)
    })
    .slice(0, limit)
    .map((result) => result.entry)
}

export function moveAutocompleteIndex(currentIndex: number, itemCount: number, direction: 1 | -1) {
  if (itemCount <= 0) {
    return -1
  }

  if (currentIndex < 0) {
    return direction === 1 ? 0 : itemCount - 1
  }

  return (currentIndex + direction + itemCount) % itemCount
}
