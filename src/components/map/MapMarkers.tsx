import { useEffect, useRef } from 'react'
import { divIcon, type Marker as LeafletMarker } from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import type { GameMap } from '../../domain/map'
import type { MapMarker } from '../../domain/marker'
import { percentageToLeafletLatLng } from '../../lib/coordinates'
import { cn } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'

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

const markerIconsByKey = new Map<string, ReturnType<typeof divIcon>>()

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

function markerIcon(color: string, isSelected: boolean) {
  const iconKey = `${color}:${isSelected ? 'selected' : 'idle'}`
  const cachedIcon = markerIconsByKey.get(iconKey)

  if (cachedIcon) {
    return cachedIcon
  }

  const icon = divIcon({
    className: cn('map-marker', isSelected && 'map-marker--selected'),
    html: `<span class="map-marker__pin" style="--marker-color: ${color}"></span>`,
    iconAnchor: [11, 11],
    iconSize: [22, 22],
    popupAnchor: [0, -12],
  })

  markerIconsByKey.set(iconKey, icon)

  return icon
}

function MarkerPopup({ marker }: MarkerPopupProps) {
  const monsters = marker.monsters?.filter(Boolean) ?? []
  const resourceGroups =
    marker.resources?.filter((resource) => resource.items.some(Boolean)) ?? []
  const metadataBadges = [
    marker.warpPoint ? 'Warp point' : undefined,
    marker.area,
    marker.zoneType,
    marker.level ? `Level ${marker.level}` : undefined,
  ].filter(Boolean)

  return (
    <article className="grid max-w-[260px] min-w-[190px] gap-3 text-popover-foreground">
      <div className="grid gap-2">
        <h2 className="text-base leading-tight font-bold text-foreground">{marker.name}</h2>
        {metadataBadges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {metadataBadges.map((badge) => (
              <Badge
                className={cn(
                  'rounded-full px-2 py-0.5 text-[0.6875rem] leading-4 font-semibold',
                  badge === 'Warp point' && 'border-cyan-200 bg-cyan-50 text-cyan-800',
                )}
                key={badge}
                variant={badge === 'Warp point' ? 'outline' : 'secondary'}
              >
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {marker.description ? (
        <p className="text-sm leading-snug text-muted-foreground">{marker.description}</p>
      ) : null}

      {monsters.length > 0 ? (
        <>
          <Separator />
          <section className="grid gap-1.5" aria-label="Monsters">
            <h3 className="text-[0.6875rem] leading-none font-bold tracking-normal text-muted-foreground uppercase">
              Monsters
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {monsters.map((monster) => (
                <li key={monster}>
                  <Badge
                    className="rounded-sm px-1.5 py-0 text-[0.75rem] leading-5 font-medium"
                    variant="secondary"
                  >
                    {monster}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {resourceGroups.length > 0 ? (
        <>
          <Separator />
          <section className="grid gap-1.5" aria-label="Resources">
            <h3 className="text-[0.6875rem] leading-none font-bold tracking-normal text-muted-foreground uppercase">
              Resources
            </h3>
            <div className="grid gap-1.5">
              {resourceGroups.map((resource) => (
                <p className="text-xs leading-snug text-muted-foreground" key={resource.type}>
                  <strong className="font-semibold text-foreground">{resource.type}</strong>
                  <span>{`: ${resource.items.filter(Boolean).join(', ')}`}</span>
                </p>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {marker.wikiUrl ? (
        <>
          <Separator />
          <a
            className="w-fit text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            href={marker.wikiUrl}
          >
            Open wiki page
          </a>
        </>
      ) : null}
    </article>
  )
}

function MapMarkerItem({ map, marker, onMarkerSelect, selectedMarkerId }: MapMarkerItemProps) {
  const markerRef = useRef<LeafletMarker | null>(null)
  const color = markerColor(marker)
  const position = percentageToLeafletLatLng(marker, map)
  const isSelected = marker.id === selectedMarkerId

  useEffect(() => {
    if (!isSelected) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      markerRef.current?.openPopup()
    }, 550)

    return () => window.clearTimeout(timeoutId)
  }, [isSelected])

  return (
    <Marker
      icon={markerIcon(color, isSelected)}
      ref={markerRef}
      eventHandlers={{ click: () => onMarkerSelect(marker.id) }}
      position={position}
      title={marker.name}
    >
      <Popup autoPanPaddingBottomRight={[16, 16]} autoPanPaddingTopLeft={[16, 72]}>
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
