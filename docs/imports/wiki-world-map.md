# Supplied World Map Import

The supplied DataMaps snapshot is archived without modification in
`data/imports/wiki-world-map.json`. It contains 105 markers: 83 Surface locations
and 22 Caves locations. The source includes names, region colors, zone types,
levels, monsters, gathering resources, file references, warp points, search
keywords, and pixel coordinates. Original settings, backgrounds, overlays,
group styles, IDs, and wikitext remain available in the snapshot.

The offline importer maps the descriptions into the existing rich marker
format. The 83 existing Surface records retain their IDs, coordinates, area
assignments, wiki links, NPCs, monster drops, resource chances, and other local
metadata. Region color customizations are preserved. Missing regions are added
for Cave, Deep Cave, Hall of Might, and Frost cave.

Existing metadata for the same named monster can be reused for Caves. Resource
items reuse known names, images, and wiki links, but do not copy gathering
chances from another location. File references without known runtime thumbnail
paths remain in the import report; no image URL, wiki slug, drop rate, or NPC is
invented. Tree annotations and all original image filenames are also retained
in that report. `maps.json` continues to configure only the two base images.

## Coordinate Review

The source explicitly uses `xy` order with a top-left origin. Both backgrounds
span `[0, 0]` to `[1076, 1056]`. New Caves positions are converted as:

```text
x = sourcePixelX / 1076 * 100
y = sourcePixelY / 1056 * 100
```

These are source-derived positions, not manually verified placements on the
project's Caves image. A numerical conversion does not establish that the
source image and the local image have identical alignment. Review the locations
before treating them as confirmed. You may only need to adjust misaligned ones.

1. Open Caves and search for each location in
   `docs/imports/caves-coordinate-review.csv`.
2. Select the concrete Caves result and compare its position with the image.
3. If needed, update only that marker's `x` and `y` in
   `src/data/markers.json`. Keep values between 0 and 100, measured from the
   top-left of the local Caves image. Do not change its ID or move it to Surface.
4. Mark the checklist row's `reviewed` column as `true` after checking it.
   The CSV is a review aid, not a runtime data source: editing its coordinates
   alone does not move a marker.
5. Run `pnpm test`, `pnpm build`, and `pnpm lint`.

`data/imports/wiki-world-map-import.json` links each source ID to its runtime
ID and records original pixels, converted percentages, retained coordinates,
source/current areas, source images, and annotations. Shared names such as
Spawn resolve by map and name during import; marker IDs remain globally unique.

## Reproducing the Offline Import

```bash
node scripts/import-datamap.mjs data/imports/wiki-world-map.json
```

The command reads local files only. It preserves coordinates of existing
markers, so rerunning it cannot overwrite manual Caves corrections. It adds
missing source occurrences and missing rich entries, and rejects ambiguous
matches or unrecognized description lines rather than silently dropping them.
The report and CSV are regenerated; save any completed review checklist before
rerunning. Repeated imports do not create duplicate runtime markers.

This is a local snapshot import, not automatic wiki synchronization. No backend,
editor, or new public contribution flow is introduced.
