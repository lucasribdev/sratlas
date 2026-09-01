# Marker Guide

This guide explains how to add and maintain zones in
`src/data/markers.json` without changing code. The MVP uses static JSON data, so
each new marker must contain enough data for search, filters, popups, and map
positioning.

`src/data/markers.json` is the runtime source of truth for map data. The UI reads
this file to build markers, search, filters, and details. `src/data/maps.json` is
only an import and base-image metadata helper; do not put monster, resource,
interactable, or entity data in it.

For the complete field list and standalone examples of a monster, resource
item, and interactable, see the [Data Schema](./data-schema.md).

A backend, login, an admin panel, and automatic wiki synchronization remain out
of scope for the MVP.

## How to Add a New Zone

1. Open `src/data/markers.json`.
2. Copy an existing object similar to the zone you want to add.
3. Paste the new object into the top-level array.
4. Change `id`, `name`, `mapId`, `x`, and `y`.
5. Fill in the optional fields that help players find the zone.
6. Confirm that the JSON remains valid:
   - use double quotation marks;
   - separate objects and fields with commas;
   - do not leave a comma after the last item in an array or object.

The `id` must be unique within the file. Use short names in `kebab-case`, such
as `shell-beach`, `lost-peak`, or `plains-cave`.

## Required Fields

Every new marker must include:

| Field | How to fill it in |
| --- | --- |
| `id` | Unique identifier in `kebab-case`. |
| `name` | Name displayed to the player. |
| `mapId` | Map ID from `src/data/maps.json`, such as `world`. |
| `x` | Horizontal percentage coordinate from `0` to `100`. |
| `y` | Vertical percentage coordinate from `0` to `100`. |

In the MVP, a marker's visual color comes from the area registered in
`src/data/areas.json`. The marker itself continues to use only the `area` field;
do not add a color to each marker. When `warpPoint` is `true`, the UI adds an
extra ring or border without changing the area's color.

## Optional Fields

Use optional fields when they improve search, filters, or marker details:

| Field | When to use it |
| --- | --- |
| `area` | Area or region used by the primary filter, such as `Ocean` or `Plains`. |
| `zoneType` | Zone type, such as `Surface zone`, `Dungeon`, or `Cave`. |
| `level` | Recommended level or zone level. It may be `"17"` or `"12-15"`. |
| `monsters` | Rich list of monsters found in the zone. |
| `resources` | Resource groups organized by gathering type. |
| `warpPoint` | `true` when the zone has a warp point. Omit it otherwise. |
| `wikiSlug` | Optional slug for the wiki page. |
| `interactables` | Rich list of NPCs, objects, or interactive points. |
| `tags` | Additional terms that improve search. |

Important data belongs in the marker's structured fields: `area`, `zoneType`,
`level`, `monsters`, `resources`, `interactables`, `warpPoint`, `wikiSlug`, and
`tags`.

Do not use the old format in which `monsters` is an array of strings or
`resources[].items` is an array of strings. These fields now store rich objects
directly in the marker.

`wikiSlug` stores only the variable part after
`https://soulsremnant.wiki.gg/wiki/`. `image` stores only the variable part
after `https://soulsremnant.wiki.gg/images/thumb/`. The UI builds final URLs
with centralized helpers; do not repeat these prefixes in `markers.json`.

Do not separate NPCs, monsters, items, or resources into other files yet. That
is a post-MVP concern, once there is real duplication and enough data.

## Colors by Area

To define or adjust an area's color, edit `src/data/areas.json`:

```json
{
  "name": "Outskirts",
  "color": "#2f7f68"
}
```

Rules:

- `name` must match the value used in `marker.area`.
- `color` must be a hexadecimal color.
- Do not add `color`, `markerColor`, or similar fields to `markers.json`.
- Markers in areas without a registered color use a neutral fallback.
- `warpPoint: true` adds an extra ring or border to the marker.

## Resources

Fill in `resources` by grouping items by gathering type. The current data uses:

- `Fishing`
- `Mining`
- `Herbalism`

Recommended format:

```json
"resources": [
  {
    "type": "Fishing",
    "items": [
      {
        "name": "Clam",
        "wikiSlug": "Clam",
        "image": "Clam.png/16px-Clam.png",
        "chancePercent": 62.5
      },
      {
        "name": "Shrimp",
        "wikiSlug": "Shrimp",
        "image": "Shrimp.png/16px-Shrimp.png",
        "chancePercent": 21.9
      }
    ]
  },
  {
    "type": "Mining",
    "items": [
      {
        "name": "Stone",
        "wikiSlug": "Stone",
        "image": "Stone.png/16px-Stone.png",
        "chancePercent": 65.2
      }
    ]
  },
  {
    "type": "Herbalism",
    "items": [
      {
        "name": "Green Herb",
        "wikiSlug": "Green_Herb",
        "image": "Green_Herb.png/16px-Green_Herb.png",
        "chancePercent": 22.2
      }
    ]
  }
]
```

Avoid creating multiple resource groups with the same `type` within one marker.
Combine the resource items into a single group for each gathering type.

## Tags

Use `tags` only for search terms that do not already occur naturally in other
structured fields. Good uses include:

- synonyms;
- alternative terms;
- region names;
- community nicknames;
- abbreviated names;
- important terms that do not appear in `name`, `area`, `zoneType`, `monsters`,
  or `resources`.

Do not duplicate `name`, `area`, `zoneType`, `monsters`, `resources[].type`, or
`resources[].items` in `tags`: these values are already searchable. If the
marker already has `"Fishing"` in `resources[].type`, there is no need to add
`"fishing"` to `tags`.

## Coordinates

The `x` and `y` coordinates are percentages from `0` to `100`, calculated
relative to the original map image.

Origin: the top-left corner of the image.

```text
x = 0      left
x = 100    right
y = 0      top
y = 100    bottom
```

Formula for converting pixels:

```text
x = (pixelX / imageWidth) * 100
y = (pixelY / imageHeight) * 100
```

Example: if the image is `4096 x 4096` and the point is at `pixelX = 2048` and
`pixelY = 1024`:

```text
x = (2048 / 4096) * 100 = 50
y = (1024 / 4096) * 100 = 25
```

Use one or two decimal places when more precision is needed. Whole numbers are
acceptable for approximate markers.

## Approximate Coordinates in the MVP

Approximate coordinates are acceptable in the MVP when no precise measurement
is available. In that case:

- place the marker near the center of the zone;
- record the outstanding task outside `tags`, because editorial notes must not
  affect search;
- adjust it later when a better image, screenshot, or reference is available;
- do not block the addition of a useful zone solely because its coordinate is
  not perfect.

Even when approximate, `x` and `y` must remain between `0` and `100`.

## Complete Example

```json
{
  "id": "mistwood-crossing",
  "name": "Mistwood Crossing",
  "mapId": "surface",
  "x": 57.4,
  "y": 44.8,
  "area": "Mistwood",
  "zoneType": "Surface zone",
  "level": "24-28",
  "monsters": [
    {
      "name": "Mossling",
      "wikiSlug": "Mossling",
      "image": "Mossling.png/16px-Mossling.png"
    },
    {
      "name": "Elder Wisp",
      "wikiSlug": "Elder_Wisp",
      "image": "Elder_Wisp.png/16px-Elder_Wisp.png"
    }
  ],
  "resources": [
    {
      "type": "Fishing",
      "items": [
        {
          "name": "Trout",
          "wikiSlug": "Trout",
          "image": "Trout.png/16px-Trout.png",
          "chancePercent": 15.6
        }
      ]
    },
    {
      "type": "Mining",
      "items": [
        {
          "name": "Iron Ore",
          "wikiSlug": "Iron_Ore",
          "image": "Iron_Ore.png/16px-Iron_Ore.png",
          "chancePercent": 34.8
        }
      ]
    },
    {
      "type": "Herbalism",
      "items": [
        {
          "name": "Moonleaf",
          "wikiSlug": "Moonleaf",
          "image": "Moonleaf.png/16px-Moonleaf.png",
          "chancePercent": 22.2
        }
      ]
    }
  ],
  "interactables": [
    {
      "name": "Quest Master",
      "wikiSlug": "Quest_Master",
      "image": "Quest_Master.png/16px-Quest_Master.png"
    }
  ],
  "warpPoint": true,
  "wikiSlug": "Mistwood_Crossing",
  "tags": ["mist wood"]
}
```

## Manual Validation

Before opening a pull request or closing a data issue:

1. Confirm that `markers.json` remains valid JSON.
2. Confirm that the `id` is unique.
3. Confirm that `mapId` exists in `src/data/maps.json`.
4. Confirm that `x` and `y` are between `0` and `100`.
5. Confirm that `monsters`, `resources[].items`, and `interactables` use rich
   objects with `name`, not standalone strings.
6. Confirm that `resources[].type` uses `Fishing`, `Mining`, or `Herbalism` when
   describing a gathering point.
7. If the area is new, confirm that a corresponding entry exists in
   `src/data/areas.json`, or temporarily accept the neutral fallback.
8. Search for the zone name, area, monster, interactable, and primary resource.
9. Click the result and confirm that the map centers on the marker.
10. Open the popup and check the name, structured zone data, and wiki link when
    present.
11. Check at least one desktop and one mobile viewport.

## Search Autocomplete

Autocomplete suggestions are derived from structured marker data. A new marker,
monster, resource item, resource type, or interactable becomes searchable when
it is added to `src/data/markers.json` using the fields described in this guide.

See [Search Autocomplete](./search-autocomplete.md) for the indexed entity types
and selection behavior.

## Quick Checklist

- `id`, `name`, `mapId`, `x`, and `y` are filled in.
- `x` and `y` are calculated as percentages from the top-left corner.
- `area` is filled in when the zone should appear in the area or region filter.
- `resources` is grouped by `Fishing`, `Mining`, and `Herbalism`.
- `monsters`, `resources[].items`, and `interactables` use rich objects.
- The area is registered in `src/data/areas.json` when it needs its own color.
- `warpPoint` is set when the marker should display an extra ring or border.
- `resources` and `monsters` are filled in when they should affect filters.
- `tags` contains only additional search terms.
- The marker appears, and clicking it centers the map.
- New data was added only through JSON, without changing code.
