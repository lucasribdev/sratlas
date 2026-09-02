// @vitest-environment happy-dom

import type { ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameMap } from "@/domain/map";
import type { MapMarker } from "@/domain/marker";
import { maps } from "@/data/maps";
import { markers } from "@/data/markers";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const leafletMap = vi.hoisted(() => ({
  flyTo: vi.fn(),
  getZoom: vi.fn(() => 0),
}));

vi.mock("react-leaflet", () => ({
  ImageOverlay: ({ url }: { url: string }) => <img alt="" src={url} />,
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="leaflet-map">{children}</div>
  ),
  useMap: () => leafletMap,
}));

vi.mock("@/components/map/MapMarkers", () => ({
  MapMarkers: ({ markers }: { markers: MapMarker[] }) => (
    <div data-marker-count={markers.length} />
  ),
}));

import { GameMapView } from "./GameMapView";

const testMap: GameMap = {
  id: "test-map",
  name: "Test Map",
  imageUrl: "/maps/test.webp",
  width: 1000,
  height: 800,
};

const testMarker: MapMarker = {
  id: "test-marker",
  mapId: testMap.id,
  name: "Test Marker",
  x: 50,
  y: 50,
};

describe("GameMapView marker availability", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    leafletMap.flyTo.mockClear();
    leafletMap.getZoom.mockClear();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("keeps the map image visible and shows a contextual empty state", () => {
    act(() => {
      root.render(
        <GameMapView
          activeMap={testMap}
          hasAvailableMarkers={false}
          markers={[]}
          onMarkerSelect={() => undefined}
        />,
      );
    });

    expect(container.querySelector('img[src="/maps/test.webp"]')).not.toBeNull();
    expect(container.querySelector('[role="status"]')?.textContent).toBe(
      "No markers are available for this map yet.",
    );
  });

  it("does not show the empty state when the map has marker data", () => {
    act(() => {
      root.render(
        <GameMapView
          activeMap={testMap}
          hasAvailableMarkers
          markers={[testMarker]}
          onMarkerSelect={() => undefined}
        />,
      );
    });

    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it("does not focus a selected marker from a different map", () => {
    const cavesMap = maps.find((map) => map.id === "caves");
    const surfaceMarker = markers.find((marker) => marker.mapId === "surface");

    if (!cavesMap || !surfaceMarker) {
      throw new Error("Expected the configured Caves map and a Surface marker.");
    }

    act(() => {
      root.render(
        <GameMapView
          activeMap={cavesMap}
          hasAvailableMarkers={false}
          markers={[]}
          onMarkerSelect={() => undefined}
          selectedMarkerId={surfaceMarker.id}
        />,
      );
    });

    expect(leafletMap.flyTo).not.toHaveBeenCalled();
  });

  it("allows the destination map to focus its selected marker", () => {
    const surfaceMap = maps.find((map) => map.id === "surface");
    const surfaceMarker = markers.find((marker) => marker.mapId === "surface");

    if (!surfaceMap || !surfaceMarker) {
      throw new Error("Expected the configured Surface map and marker.");
    }

    act(() => {
      root.render(
        <GameMapView
          activeMap={surfaceMap}
          hasAvailableMarkers
          markers={[surfaceMarker]}
          onMarkerSelect={() => undefined}
          selectedMarkerId={surfaceMarker.id}
        />,
      );
    });

    expect(leafletMap.flyTo).toHaveBeenCalledOnce();
  });
});
