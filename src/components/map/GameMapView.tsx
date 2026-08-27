import { useEffect } from 'react'
import { CRS } from 'leaflet'
import { ImageOverlay, MapContainer, useMap } from 'react-leaflet'
import { maps } from '../../data/maps'
import type { MapMarker } from '../../domain/marker'
import { mapBoundsFromDimensions, percentageToLeafletLatLng } from '../../lib/coordinates'
import { MapMarkers } from './MapMarkers'

const initialMap = maps[0]
const imageBounds = mapBoundsFromDimensions(initialMap)
const minZoom = -2
const maxZoom = 2
const selectedMarkerZoom = 1.5

type GameMapViewProps = {
  markers: MapMarker[]
  onMarkerSelect: (markerId: MapMarker['id']) => void
  selectedMarkerId?: MapMarker['id']
}

type SelectedMarkerControllerProps = {
  markers: MapMarker[]
  selectedMarkerId?: MapMarker['id']
}

function SelectedMarkerController({ markers, selectedMarkerId }: SelectedMarkerControllerProps) {
  const map = useMap()

  useEffect(() => {
    const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId)

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
  }, [map, markers, selectedMarkerId])

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
        maxBounds={imageBounds}
        maxBoundsViscosity={0.9}
        maxZoom={maxZoom}
        minZoom={minZoom}
        scrollWheelZoom
        zoomDelta={0.5}
        zoomSnap={0.25}
      >
        <ImageOverlay bounds={imageBounds} url={initialMap.imageUrl} />
        <SelectedMarkerController markers={markers} selectedMarkerId={selectedMarkerId} />
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
