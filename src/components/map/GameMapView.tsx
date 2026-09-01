import { useEffect } from "react";
import { CRS, type LatLngBoundsExpression } from "leaflet";
import { ImageOverlay, MapContainer, useMap } from "react-leaflet";
import { markers as allMarkers } from "@/data/markers";
import type { GameMap } from "@/domain/map";
import type { MapMarker } from "@/domain/marker";
import {
  mapBoundsFromDimensions,
  percentageToLeafletLatLng,
} from "@/lib/coordinates";
import { findSelectedMarkerForMap } from "@/lib/map-selection";
import { MapMarkers } from "./MapMarkers";

const mapPanMargin = 320;
const minZoom = -2;
const maxZoom = 2;
const selectedMarkerZoom = 1.5;

type GameMapViewProps = {
  activeMap: GameMap;
  hasAvailableMarkers: boolean;
  markers: MapMarker[];
  onMarkerSelect: (markerId: MapMarker["id"]) => void;
  selectedMarkerId?: MapMarker["id"];
};

type SelectedMarkerControllerProps = {
  activeMap: GameMap;
  selectedMarkerId?: MapMarker["id"];
};

function SelectedMarkerController({
  activeMap,
  selectedMarkerId,
}: SelectedMarkerControllerProps) {
  const map = useMap();

  useEffect(() => {
    const selectedMarker = findSelectedMarkerForMap(
      allMarkers,
      selectedMarkerId,
      activeMap.id,
    );

    if (!selectedMarker) {
      return;
    }

    map.flyTo(
      percentageToLeafletLatLng(selectedMarker, activeMap),
      Math.max(map.getZoom(), selectedMarkerZoom),
      {
        duration: 0.5,
      },
    );
  }, [activeMap, map, selectedMarkerId]);

  return null;
}

export function GameMapView({
  activeMap,
  hasAvailableMarkers,
  markers,
  onMarkerSelect,
  selectedMarkerId,
}: GameMapViewProps) {
  const imageBounds = mapBoundsFromDimensions(activeMap);
  const panBounds: LatLngBoundsExpression = [
    [-mapPanMargin, -mapPanMargin],
    [activeMap.height + mapPanMargin, activeMap.width + mapPanMargin],
  ];

  return (
    <div className="map-placeholder relative" aria-label={activeMap.name}>
      <MapContainer
        key={activeMap.id}
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
        <ImageOverlay bounds={imageBounds} url={activeMap.imageUrl} />
        <SelectedMarkerController
          activeMap={activeMap}
          selectedMarkerId={selectedMarkerId}
        />
        <MapMarkers
          map={activeMap}
          markers={markers}
          onMarkerSelect={onMarkerSelect}
          selectedMarkerId={selectedMarkerId}
        />
      </MapContainer>
      {!hasAvailableMarkers ? (
        <div
          className="pointer-events-none absolute bottom-4 left-1/2 z-[500] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-md border border-border bg-card/95 px-3 py-2 text-center text-sm text-card-foreground shadow-lg backdrop-blur-sm"
          role="status"
        >
          No markers are available for this map yet.
        </div>
      ) : null}
    </div>
  );
}
