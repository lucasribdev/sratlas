import type { MapMarker } from '@/domain/marker'

export type MarkerSearchEntryType =
  | 'marker'
  | 'area'
  | 'monster'
  | 'item'
  | 'resource'
  | 'interactable'

export type MarkerSearchField = {
  value?: string
  entry?: {
    type: MarkerSearchEntryType
    keywords?: Array<string | undefined>
    targetId?: string
  }
}

export function getMarkerSearchFields(marker: MapMarker): MarkerSearchField[] {
  const fields: MarkerSearchField[] = [
    {
      value: marker.name,
      entry: {
        type: 'marker',
        keywords: [marker.area, marker.zoneType, ...(marker.tags ?? [])],
        targetId: marker.id,
      },
    },
    {
      value: marker.area,
      entry: {
        type: 'area',
        keywords: [marker.name, marker.zoneType],
      },
    },
    { value: marker.zoneType },
    ...(marker.tags ?? []).map((tag) => ({ value: tag })),
  ]

  for (const monster of marker.monsters ?? []) {
    fields.push({
      value: monster.name,
      entry: {
        type: 'monster',
        keywords: [marker.name, monster.wikiSlug],
      },
    })

    for (const drop of monster.drops ?? []) {
      fields.push({
        value: drop.name,
        entry: {
          type: 'item',
          keywords: [marker.name, monster.name, drop.wikiSlug],
        },
      })
    }
  }

  for (const interactable of marker.interactables ?? []) {
    fields.push({
      value: interactable.name,
      entry: {
        type: 'interactable',
        keywords: [marker.name, interactable.wikiSlug],
      },
    })
  }

  for (const resource of marker.resources ?? []) {
    fields.push({
      value: resource.type,
      entry: {
        type: 'resource',
        keywords: [marker.name],
      },
    })

    for (const item of resource.items ?? []) {
      fields.push({
        value: item.name,
        entry: {
          type: 'item',
          keywords: [marker.name, resource.type, item.wikiSlug],
        },
      })
    }
  }

  return fields
}
