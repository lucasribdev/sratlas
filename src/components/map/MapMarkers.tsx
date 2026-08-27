import { useEffect, useRef } from 'react'
import { divIcon, type Marker as LeafletMarker } from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import type { GameMap } from '../../domain/map'
import type { MapMarker } from '../../domain/marker'
import { percentageToLeafletLatLng } from '../../lib/coordinates'

type MapMarkersProps = {
  map: GameMap
  markers: MapMarker[]
  onMarkerSelect: (markerId: MapMarker['id']) => void
  selectedMarkerId?: MapMarker['id']
}

type MarkerPopupProps = {
  marker: MapMarker
}

type MapMarkerItemProps = {
  map: GameMap
  marker: MapMarker
  onMarkerSelect: (markerId: MapMarker['id']) => void
  selectedMarkerId?: MapMarker['id']
}

const markerIconsByColor = new Map<string, ReturnType<typeof divIcon>>()

function markerColor(marker: MapMarker) {
  const hasResources = marker.resources?.some((resource) => resource.items.some(Boolean))
  const hasMonsters = marker.monsters?.some(Boolean)

  if (marker.warpPoint) {
    return '#0891b2'
  }

  if (hasResources) {
    return '#2f7f68'
  }

  if (hasMonsters) {
    return '#dc2626'
  }

  return '#475569'
}

function markerIcon(color: string) {
  const cachedIcon = markerIconsByColor.get(color)

  if (cachedIcon) {
    return cachedIcon
  }

  const icon = divIcon({
    className: 'map-marker',
    html: `<span class="map-marker__pin" style="--marker-color: ${color}"></span>`,
    iconAnchor: [10, 10],
    iconSize: [20, 20],
    popupAnchor: [0, -10],
  })

  markerIconsByColor.set(color, icon)

  return icon
}

function markerZoneLine(marker: MapMarker) {
  if (marker.zoneType && marker.level) {
    return `${marker.zoneType} • Level ${marker.level}`
  }

  if (marker.zoneType) {
    return marker.zoneType
  }

  if (marker.level) {
    return `Level ${marker.level}`
  }

  return undefined
}

function MarkerPopup({ marker }: MarkerPopupProps) {
  const zoneLine = markerZoneLine(marker)
  const monsters = marker.monsters?.filter(Boolean) ?? []
  const resourceGroups =
    marker.resources?.filter((resource) => resource.items.some(Boolean)) ?? []

  return (
    <article className="marker-popup">
      <div className="marker-popup__heading">
        <h2>{marker.name}</h2>
      </div>

      <dl className="marker-popup__details">
        {marker.area ? (
          <div>
            <dt>Area</dt>
            <dd>{marker.area}</dd>
          </div>
        ) : null}

        {zoneLine ? (
          <div>
            <dt>Zone</dt>
            <dd>{zoneLine}</dd>
          </div>
        ) : null}
      </dl>

      {marker.description ? <p className="marker-popup__description">{marker.description}</p> : null}

      {monsters.length > 0 ? (
        <section className="marker-popup__section" aria-label="Monsters">
          <h3>Monsters</h3>
          <ul>
            {monsters.map((monster) => (
              <li key={monster}>{monster}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {resourceGroups.length > 0 ? (
        <section className="marker-popup__section" aria-label="Resources">
          <h3>Resources</h3>
          <div className="marker-popup__resources">
            {resourceGroups.map((resource) => (
              <div key={resource.type}>
                <strong>{resource.type}</strong>
                <span>{resource.items.filter(Boolean).join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {marker.warpPoint ? <p className="marker-popup__warp">Warp point</p> : null}
      {marker.wikiUrl ? <a href={marker.wikiUrl}>Wiki</a> : null}
    </article>
  )
}

function MapMarkerItem({ map, marker, onMarkerSelect, selectedMarkerId }: MapMarkerItemProps) {
  const markerRef = useRef<LeafletMarker | null>(null)
  const color = markerColor(marker)
  const position = percentageToLeafletLatLng(marker, map)

  useEffect(() => {
    if (marker.id !== selectedMarkerId) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      markerRef.current?.openPopup()
    }, 550)

    return () => window.clearTimeout(timeoutId)
  }, [marker.id, selectedMarkerId])

  return (
    <Marker
      icon={markerIcon(color)}
      ref={markerRef}
      eventHandlers={{ click: () => onMarkerSelect(marker.id) }}
      position={position}
      title={marker.name}
    >
      <Popup>
        <MarkerPopup marker={marker} />
      </Popup>
    </Marker>
  )
}

export function MapMarkers({ map, markers, onMarkerSelect, selectedMarkerId }: MapMarkersProps) {
  const mapMarkers = markers.filter((marker) => marker.mapId === map.id)

  return mapMarkers.map((marker) => (
    <MapMarkerItem
      key={marker.id}
      map={map}
      marker={marker}
      onMarkerSelect={onMarkerSelect}
      selectedMarkerId={selectedMarkerId}
    />
  ))
}
