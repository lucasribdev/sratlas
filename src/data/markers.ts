import markersJson from './markers.json'
import type { MapMarker } from '@/domain/marker'

export const markers: MapMarker[] = markersJson

export const markersById: ReadonlyMap<string, MapMarker> = new Map(
  markers.map((marker) => [marker.id, marker]),
)
