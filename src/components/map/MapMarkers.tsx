import { divIcon } from 'leaflet'
import type { CSSProperties } from 'react'
import { Marker, Popup } from 'react-leaflet'
import { categories } from '../../data/categories'
import { markers } from '../../data/markers'
import type { MarkerCategory } from '../../domain/category'
import type { GameMap } from '../../domain/map'
import type { MapMarker } from '../../domain/marker'
import { percentageToLeafletLatLng } from '../../lib/coordinates'

type MapMarkersProps = {
  map: GameMap
  selectedCategoryIds: ReadonlySet<MarkerCategory['id']>
}

type MarkerPopupProps = {
  marker: MapMarker
  category?: MarkerCategory
  color: string
}

const categoriesById = new Map(categories.map((category) => [category.id, category]))
const markerIconsByColor = new Map<string, ReturnType<typeof divIcon>>()
const hexColorPattern = /^#[\da-f]{3}(?:[\da-f]{3})?$/i

function categoryColor(color: string | undefined) {
  return color && hexColorPattern.test(color) ? color : '#475569'
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

function MarkerPopup({ marker, category, color }: MarkerPopupProps) {
  return (
    <article className="marker-popup">
      <div className="marker-popup__heading">
        <h2>{marker.name}</h2>
        {category ? (
          <span style={{ '--marker-color': color } as CSSProperties}>{category.label}</span>
        ) : null}
      </div>

      {marker.area ? <p>{marker.area}</p> : null}
      {marker.description ? <p>{marker.description}</p> : null}
      {marker.wikiUrl ? <a href={marker.wikiUrl}>Wiki</a> : null}
    </article>
  )
}

export function MapMarkers({ map, selectedCategoryIds }: MapMarkersProps) {
  const mapMarkers = markers.filter(
    (marker) => marker.mapId === map.id && selectedCategoryIds.has(marker.category),
  )

  return mapMarkers.map((marker) => {
    const category = categoriesById.get(marker.category)
    const color = categoryColor(category?.color)
    const position = percentageToLeafletLatLng(marker, map)

    return (
      <Marker
        icon={markerIcon(color)}
        key={marker.id}
        position={position}
        title={marker.name}
      >
        <Popup>
          <MarkerPopup category={category} color={color} marker={marker} />
        </Popup>
      </Marker>
    )
  })
}
