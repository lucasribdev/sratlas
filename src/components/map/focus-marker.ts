import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import { percentageToLeafletLatLng, type MapDimensions, type PercentageCoordinates } from '@/lib/coordinates'

// Runs only after the target marker has mounted on its owning map. A synchronous
// viewport change also handles repeated requests and reduced/no-motion browsers.
export function focusMarker(
  map: Pick<LeafletMap, 'whenReady' | 'off' | 'stop' | 'setView' | 'getZoom'>,
  marker: Pick<LeafletMarker, 'openPopup' | 'closePopup'>,
  target: PercentageCoordinates,
  dimensions: MapDimensions,
) {
  let cancelled = false
  const focus = () => {
    if (cancelled) return
    map.stop()
    map.setView(percentageToLeafletLatLng(target, dimensions), Math.max(map.getZoom(), 1.5), { animate: false })
    marker.openPopup()
  }
  map.whenReady(focus)

  return () => {
    cancelled = true
    map.off('load', focus)
    map.stop()
    marker.closePopup()
  }
}
