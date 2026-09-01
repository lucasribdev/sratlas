import { useEffect } from 'react'
import { CRS, type LatLngBoundsExpression } from 'leaflet'
import { ImageOverlay, MapContainer, useMap } from 'react-leaflet'
import { markers as allMarkers } from '@/data/markers'
import { maps } from '@/data/maps'
import type { MapMarker } from '@/domain/marker'
import { mapBoundsFromDimensions, percentageToLeafletLatLng } from '@/lib/coordinates'
import { MapMarkers } from './MapMarkers'

const worldMap = maps.find((map) => map.id === 'world')

if (!worldMap) {
  throw new Error('World map metadata is missing from maps.json.')
}

const initialMap = worldMap
const imageBounds = mapBoundsFromDimensions(initialMap)
const mapPanMargin = 320
const panBounds: LatLngBoundsExpression = [
  [-mapPanMargin, -mapPanMargin],
  [initialMap.height + mapPanMargin, initialMap.width + mapPanMargin],
]
const minZoom = -2
const maxZoom = 2
const selectedMarkerZoom = 1.5

type GameMapViewProps = {
  markers: MapMarker[]
  onMarkerSelect: (markerId: MapMarker['id']) => void
  selectedMarkerId?: MapMarker['id']
}

type SelectedMarkerControllerProps = {
  selectedMarkerId?: MapMarker['id']
}

function SelectedMarkerController({ selectedMarkerId }: SelectedMarkerControllerProps) {
  const map = useMap()

  useEffect(() => {
    const selectedMarker = allMarkers.find((marker) => marker.id === selectedMarkerId)

    if (!selectedMarker) {
      return
    }

    map.flyTo(
      percentageToLeafletLatLng(selectedMarker, initialMap),
      Math.max(map.getZoom(), selectedMarkerZoom),
      {
        duration: 0.5,
      },
    )
  }, [map, selectedMarkerId])

  return null
}

export function GameMapView({ markers, onMarkerSelect, selectedMarkerId }: GameMapViewProps) {
  return (
    <div className="map-placeholder" aria-label={initialMap.name}>
      <MapContainer
        bounds={imageBounds}
        boundsOptions={{ padding: [16, 16] }}
        className="map-view"
        crs={CRS.Simple}
        maxBounds={panBounds}
        maxBoundsViscosity={0.9}
        maxZoom={maxZoom}
        minZoom={minZoom}
        scrollWheelZoom
        zoomDelta={0.5}
        zoomSnap={0.25}
      >
        <ImageOverlay bounds={imageBounds} url={initialMap.imageUrl} />
        <SelectedMarkerController selectedMarkerId={selectedMarkerId} />
        <MapMarkers
          map={initialMap}
          markers={markers}
          onMarkerSelect={onMarkerSelect}
          selectedMarkerId={selectedMarkerId}
        />
      </MapContainer>
    </div>
  )
}
