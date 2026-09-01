import { useEffect, useRef } from "react";
import { divIcon, type Marker as LeafletMarker } from "leaflet";
import { Marker, Popup, Tooltip } from "react-leaflet";
import type { GameMap } from "@/domain/map";
import type { MapMarker } from "@/domain/marker";
import { percentageToLeafletLatLng } from "@/lib/coordinates";
import { markerVisualStyle } from "@/lib/marker-style";
import { cn } from "@/lib/utils";
import { MarkerPopup } from "./MarkerPopup";

type MapMarkersProps = {
  map: GameMap;
  markers: MapMarker[];
  onMarkerSelect: (markerId: MapMarker["id"]) => void;
  selectedMarkerId?: MapMarker["id"];
};

type MapMarkerItemProps = {
  map: GameMap;
  marker: MapMarker;
  onMarkerSelect: (markerId: MapMarker["id"]) => void;
  selectedMarkerId?: MapMarker["id"];
};

const markerIconsByKey = new Map<string, ReturnType<typeof divIcon>>();

function markerIcon(style: ReturnType<typeof markerVisualStyle>) {
  const iconKey = `${style.color}:${style.className ?? "plain"}`;
  const cachedIcon = markerIconsByKey.get(iconKey);

  if (cachedIcon) {
    return cachedIcon;
  }

  const icon = divIcon({
    className: cn("map-marker", style.className),
    html: `<span class="map-marker__pin" style="--marker-color: ${style.color}"></span>`,
    iconAnchor: [13, 13],
    iconSize: [26, 26],
    popupAnchor: [0, -12],
  });

  markerIconsByKey.set(iconKey, icon);

  return icon;
}

function MapMarkerItem({
  map,
  marker,
  onMarkerSelect,
  selectedMarkerId,
}: MapMarkerItemProps) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const position = percentageToLeafletLatLng(marker, map);
  const isSelected = marker.id === selectedMarkerId;
  const visualStyle = markerVisualStyle(marker, { selected: isSelected });

  useEffect(() => {
    if (!isSelected) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      markerRef.current?.openPopup();
    }, 550);

    return () => window.clearTimeout(timeoutId);
  }, [isSelected]);

  return (
    <Marker
      icon={markerIcon(visualStyle)}
      ref={markerRef}
      eventHandlers={{ click: () => onMarkerSelect(marker.id) }}
      position={position}
      title={marker.name}
    >
      <Tooltip
        className="map-marker-tooltip"
        direction="top"
        offset={[0, -14]}
        opacity={1}
      >
        {marker.name}
      </Tooltip>
      <Popup
        className="map-popup"
        autoPanPaddingBottomRight={[16, 16]}
        autoPanPaddingTopLeft={[16, 120]}
        maxHeight={360}
        maxWidth={300}
      >
        <MarkerPopup marker={marker} />
      </Popup>
    </Marker>
  );
}

export function MapMarkers({
  map,
  markers,
  onMarkerSelect,
  selectedMarkerId,
}: MapMarkersProps) {
  const mapMarkers = markers.filter((marker) => marker.mapId === map.id);

  return mapMarkers.map((marker) => (
    <MapMarkerItem
      key={marker.id}
      map={map}
      marker={marker}
      onMarkerSelect={onMarkerSelect}
      selectedMarkerId={selectedMarkerId}
    />
  ));
}
