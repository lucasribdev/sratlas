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

function MarkerPopup({ marker, category, color }: MarkerPopupProps) {
  const zoneLine = markerZoneLine(marker)
  const monsters = marker.monsters?.filter(Boolean) ?? []
  const resourceGroups =
    marker.resources?.filter((resource) => resource.items.some(Boolean)) ?? []

  return (
    <article className="marker-popup">
      <div className="marker-popup__heading">
        <h2>{marker.name}</h2>
        {category ? (
          <span
            className="marker-popup__category"
            style={{ '--marker-color': color } as CSSProperties}
          >
            {category.label}
          </span>
        ) : null}
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
