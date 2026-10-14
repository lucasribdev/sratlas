# Multiple Maps

## Selection and Global Results

Choose **Surface** or **Caves** using the Map selector in the desktop sidebar
or above the mobile search field. Every configured map appears in this selector,
including maps with no markers. Empty maps still support pan and zoom.

Search, autocomplete, area options, and the results list cover every map.
Changing the displayed map preserves the query and area filters. Only markers
that satisfy both the query and filters and belong to the displayed map render
on the image. On mobile, open **Filters** to see area controls and global results.

Each result includes its owning map name. Selecting it switches to that map's
image, converts its percentage coordinates with the destination dimensions,
centers the marker, and opens its popup. Selecting the same result again repeats
this navigation, even after panning or closing the popup.

Names may repeat across maps. A grouped autocomplete suggestion for a repeated
marker name sets the query without choosing a location. Choose a concrete result
with its map context to navigate. Marker IDs, rather than names, identify targets.

## Filters and Selections

The initial area filter and **Select all** are unrestricted, including markers
without an optional `area`. Selecting individual area checkboxes restricts results
to those named areas. **Clear all** matches no markers, including markers without
an area. Neither action changes the query or the displayed map.

Autocomplete stays global even when filters exclude its targets. Selecting a
suggestion preserves the filters; an excluded target cannot open a popup or
switch maps. Editing search or filters clears the current selection, closes its
popup, and cancels pending focus. Manually switching maps also clears the
selection. Zoom changes are immediate so a departing map cannot leave an
animation pending. Mobile popup content scrolls within the space below the
map and search controls. There is no saved viewport: a manually selected map starts with its
configured image bounds.

## Registering a Map

1. Add the official base image under `public/maps/`.
2. Append a configuration to `src/data/maps.json` with a globally unique `id`,
   official display `name`, public `imageUrl` such as `/maps/<filename>.webp`,
   and positive `width` and `height` matching the actual image's pixel dimensions.
   The first entry determines the initial map. This file contains display metadata,
   never game entities or markers.
3. Add verified markers to `src/data/markers.json`, referencing the new `mapId`.
   Marker IDs must be globally unique across all maps; names may repeat. Use the
   existing rich object format for monsters, interactables, resources, and items.
   An empty map requires no marker entries. Shared rendering, search, filters,
   layout, and navigation need no code changes.
4. Coordinates are percentages from 0 to 100 relative to this map's image:
   `x = pixelX / width * 100`, `y = pixelY / height * 100`. The origin is the
   top-left corner. Do not reuse another map's pixel dimensions or invent official
   positions. `area` is optional; if supplied, it must reference existing area
   metadata in `src/data/areas.json` (add visual metadata when recording a new area).
5. Run `pnpm test`, `pnpm build`, and `pnpm lint`. Check the selector, image,
   pan/zoom, global results, cross-map navigation, repeated selection, and
   query/filter cancellation in desktop and mobile layouts.

See the [Marker Guide](./markers-guide.md) for rich marker fields.

## Test Fixtures and Browser Checks

`src/test/fixtures/multi-map.json` contains synthetic test-only markers, repeated
names, rectangular maps, and an empty third map. It is imported only by tests;
these locations are never part of the published dataset. Data integrity tests
reuse the existing validators for map references, globally unique IDs, coordinate
ranges, positive dimensions, and rich nested data. Focus adapter tests exercise
cancellation before Leaflet becomes ready.

For reproducible browser checks, start Vite and a separate Chromium instance:

```bash
pnpm dev --host 127.0.0.1 --port 5175
# In another terminal, use your installed Chromium executable:
chromium --headless --remote-debugging-port=9223 --user-data-dir=/tmp/srw-map-check about:blank
# In another terminal:
node scripts/check-multi-map.mjs
```

`MAP_APP_URL` and `MAP_DEBUG_URL` optionally override the local addresses. The
script first checks published map images, then intercepts data-module responses
only inside its browser session to inject fixtures. It exercises desktop and
mobile layouts, restores the published page, and saves screenshots under `/tmp/`.
It requires a running Chromium debugger and Vite server; neither is a project
runtime dependency. Mobile checks use viewport and touch emulation, not a
physical device.
