import { CRS, type LatLngBoundsExpression } from "leaflet";
import { ImageOverlay, MapContainer } from "react-leaflet";
import type { GameMap } from "@/domain/map";
import type { MapMarker } from "@/domain/marker";
import { mapBoundsFromDimensions } from "@/lib/coordinates";
import { MapMarkers } from "./MapMarkers";

const mapPanMargin = 320;
const minZoom = -2;
const maxZoom = 2;

type GameMapViewProps = {
  map: GameMap;
  markers: MapMarker[];
  onMarkerSelect: (markerId: MapMarker["id"]) => void;
  selectedMarker?: MapMarker;
  navigationRequestId: number;
};

export function GameMapView({
  map,
  markers,
  onMarkerSelect,
  selectedMarker,
  navigationRequestId,
}: GameMapViewProps) {
  const imageBounds = mapBoundsFromDimensions(map);
  const panBounds: LatLngBoundsExpression = [
    [-mapPanMargin, -mapPanMargin],
    [map.height + mapPanMargin, map.width + mapPanMargin],
  ];

  return (
    <div className="map-placeholder relative" aria-label={map.name}>
      <MapContainer
        key={map.id}
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
        <ImageOverlay bounds={imageBounds} url={map.imageUrl} />
        <MapMarkers
          map={map}
          markers={markers}
          onMarkerSelect={onMarkerSelect}
          selectedMarkerId={selectedMarker?.id}
          navigationRequestId={navigationRequestId}
        />
      </MapContainer>
      {markers.length === 0 && (
        <p role="status" className="pointer-events-none absolute right-3 bottom-8 left-3 z-[500] mx-auto w-fit rounded-md border border-border bg-card/95 px-3 py-2 text-xs text-muted-foreground shadow-sm">
          No markers to display on this map.
        </p>
      )}
    </div>
  );
}
