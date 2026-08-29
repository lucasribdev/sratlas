import { areaColorForMarker } from '@/data/areas'
import type { MapMarker } from '@/domain/marker'

export type MarkerVisualStyle = {
  color: string
  className?: string
}

export function markerVisualStyle(
  marker: Pick<MapMarker, 'area' | 'warpPoint'>,
  options: { selected?: boolean } = {},
): MarkerVisualStyle {
  const classNames = [
    options.selected && 'map-marker--selected',
    marker.warpPoint === true && 'map-marker--warp-point',
  ].filter(Boolean)

  return {
    color: areaColorForMarker(marker),
    className: classNames.length > 0 ? classNames.join(' ') : undefined,
  }
}
