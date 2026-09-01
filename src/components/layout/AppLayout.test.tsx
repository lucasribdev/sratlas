// @vitest-environment happy-dom

import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { markers } from "@/data/markers";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock("@/components/map/GameMapView", () => ({
  GameMapView: ({
    activeMap,
    hasAvailableMarkers,
    markers: visibleMarkers,
    selectedMarkerId,
  }: {
    activeMap: { id: string };
    hasAvailableMarkers: boolean;
    markers: { id: string }[];
    selectedMarkerId?: string;
  }) => (
    <output
      data-active-map-id={activeMap.id}
      data-has-available-markers={String(hasAvailableMarkers)}
      data-marker-count={visibleMarkers.length}
      data-selected-marker-id={selectedMarkerId}
      data-testid="game-map-view"
    />
  ),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

import { AppLayout } from "./AppLayout";

describe("AppLayout map switching", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    act(() => root.render(<AppLayout />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("renders the selector in desktop and mobile controls", () => {
    const desktopSidebar = container.querySelector("aside");
    const compactControls = container.querySelector(
      '[aria-label="Compact controls"]',
    );

    expect(desktopSidebar?.querySelector("select")?.labels[0]?.textContent).toContain(
      "Map",
    );
    expect(compactControls?.querySelector("select")?.labels[0]?.textContent).toContain(
      "Map",
    );
    expect(compactControls?.querySelector('input[type="search"]')).not.toBeNull();
    expect(compactControls?.querySelector('[aria-label="Filters"]')).not.toBeNull();
  });

  it("clears the selected marker while preserving search and area filters", () => {
    const desktopSidebar = container.querySelector("aside");
    const firstMarker = markers[0];
    const markerButton = [...(desktopSidebar?.querySelectorAll("button") ?? [])].find(
      (button) => button.textContent?.includes(firstMarker.name),
    );
    const searchInput = desktopSidebar?.querySelector<HTMLInputElement>(
      'input[type="search"]',
    );
    const areaCheckbox = desktopSidebar?.querySelector<HTMLElement>(
      '[role="checkbox"]',
    );
    const clearAreasButton = desktopSidebar?.querySelector<HTMLButtonElement>(
      '[aria-label="Clear all selected areas"]',
    );
    const mapSelector = desktopSidebar?.querySelector<HTMLSelectElement>("select");

    act(() => markerButton?.click());
    expect(
      container
        .querySelector('[data-testid="game-map-view"]')
        ?.getAttribute("data-selected-marker-id"),
    ).toBe(firstMarker.id);

    act(() => {
      if (!searchInput || !areaCheckbox || !clearAreasButton) {
        throw new Error("Expected desktop search and area controls.");
      }

      const inputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;

      inputValueSetter?.call(searchInput, "persistent query");
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      clearAreasButton.click();
    });

    expect(searchInput?.value).toBe("persistent query");
    expect(areaCheckbox?.getAttribute("aria-checked")).toBe("false");

    act(() => {
      if (!mapSelector) {
        throw new Error("Expected the desktop map selector.");
      }

      mapSelector.value = "caves";
      mapSelector.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const mapView = container.querySelector('[data-testid="game-map-view"]');

    expect(mapView?.getAttribute("data-active-map-id")).toBe("caves");
    expect(mapView?.getAttribute("data-selected-marker-id")).toBeNull();
    expect(mapView?.getAttribute("data-has-available-markers")).toBe("false");
    expect(mapView?.getAttribute("data-marker-count")).toBe("0");
    expect(searchInput?.value).toBe("persistent query");
    expect(areaCheckbox?.getAttribute("aria-checked")).toBe("false");
  });
});
