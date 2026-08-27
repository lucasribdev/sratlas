import { CRS } from 'leaflet'
import { ImageOverlay, MapContainer } from 'react-leaflet'
import { maps } from '../../data/maps'
import type { MarkerCategory } from '../../domain/category'
import { mapBoundsFromDimensions } from '../../lib/coordinates'
import { MapMarkers } from './MapMarkers'

const initialMap = maps[0]
const imageBounds = mapBoundsFromDimensions(initialMap)
const minZoom = -2
const maxZoom = 2

type MapPlaceholderProps = {
  selectedCategoryIds: ReadonlySet<MarkerCategory['id']>
}

export function MapPlaceholder({ selectedCategoryIds }: MapPlaceholderProps) {
  return (
    <div className="map-placeholder" aria-label={initialMap.name}>
      <MapContainer
        bounds={imageBounds}
        boundsOptions={{ padding: [16, 16] }}
        className="map-view"
        crs={CRS.Simple}
        maxBounds={imageBounds}
        maxBoundsViscosity={0.9}
        maxZoom={maxZoom}
        minZoom={minZoom}
        scrollWheelZoom
        zoomDelta={0.5}
        zoomSnap={0.25}
      >
        <ImageOverlay bounds={imageBounds} url={initialMap.imageUrl} />
        <MapMarkers map={initialMap} selectedCategoryIds={selectedCategoryIds} />
      </MapContainer>
    </div>
  )
}
