// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameMap } from "@/domain/map";
import { MapSelector } from "./MapSelector";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const testMaps: GameMap[] = [
  {
    id: "forest",
    name: "Ancient Forest",
    imageUrl: "/maps/forest.webp",
    width: 1200,
    height: 900,
  },
  {
    id: "depths",
    name: "Crystal Depths",
    imageUrl: "/maps/depths.webp",
    width: 800,
    height: 800,
  },
  {
    id: "sky",
    name: "Sky Realm",
    imageUrl: "/maps/sky.webp",
    width: 1600,
    height: 1000,
  },
];

describe("MapSelector", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("renders every supplied map and selects the active map", () => {
    act(() => {
      root.render(
        <MapSelector
          activeMapId="depths"
          maps={testMaps}
          onMapChange={() => undefined}
        />,
      );
    });

    const select = container.querySelector("select");
    const options = [...(select?.options ?? [])];

    expect(select?.value).toBe("depths");
    expect(options.map((option) => option.value)).toEqual(
      testMaps.map((map) => map.id),
    );
    expect(options.map((option) => option.textContent)).toEqual(
      testMaps.map((map) => map.name),
    );
  });

  it("has an accessible name and emits changes through native select semantics", () => {
    const onMapChange = vi.fn();

    act(() => {
      root.render(
        <MapSelector
          activeMapId="forest"
          maps={testMaps}
          onMapChange={onMapChange}
        />,
      );
    });

    const select = container.querySelector("select");

    expect(select).toBeInstanceOf(HTMLSelectElement);
    expect(select?.labels[0]?.textContent).toContain("Map");

    act(() => {
      if (!select) {
        throw new Error("Expected the map selector to render a select element.");
      }

      select.value = "sky";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(onMapChange).toHaveBeenCalledWith("sky");
  });
});
