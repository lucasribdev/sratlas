import { CRS } from 'leaflet'
import { ImageOverlay, MapContainer } from 'react-leaflet'
import maps from '../../data/maps.json'
import { mapBoundsFromDimensions } from '../../lib/coordinates'

type GameMap = {
  id: string
  name: string
  imageUrl: string
  width: number
  height: number
}

const initialMap = maps[0] as GameMap
const imageBounds = mapBoundsFromDimensions(initialMap)
const minZoom = -2
const maxZoom = 2

export function MapPlaceholder() {
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
      </MapContainer>
    </div>
  )
}
