import { CRS, type LatLngBoundsExpression, type LatLngExpression } from 'leaflet'
import { ImageOverlay, MapContainer } from 'react-leaflet'
import maps from '../../data/maps.json'

type GameMap = {
  id: string
  name: string
  imageUrl: string
  width: number
  height: number
}

const initialMap = maps[0] as GameMap
const imageBounds: LatLngBoundsExpression = [
  [0, 0],
  [initialMap.height, initialMap.width],
]
const mapCenter: LatLngExpression = [initialMap.height / 2, initialMap.width / 2]

export function MapPlaceholder() {
  return (
    <div className="map-placeholder" aria-label={initialMap.name}>
      <MapContainer
        center={mapCenter}
        className="map-view"
        crs={CRS.Simple}
        maxZoom={2}
        minZoom={-2}
        scrollWheelZoom
        zoom={0}
      >
        <ImageOverlay bounds={imageBounds} url={initialMap.imageUrl} />
      </MapContainer>
    </div>
  )
}
