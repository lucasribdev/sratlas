# Data Model

## Core Principle

Keep markers and entities conceptually separate:

- **Marker**: a position on the map. In the MVP, it may also represent an area
  or map zone.
- **Entity**: something in the game, such as an NPC, monster, item, resource,
  quest, city, or dungeon.

In the MVP, a marker contains rich data directly, including zone data,
monsters, resources, interactables, and a warp point. As the project grows,
entities should be separated to avoid duplication.

Today, `src/data/markers.json` is the runtime source of truth for map data. It
contains the rich data used directly by the UI, search, filters, and popups.
`src/data/maps.json` remains an import and base-image metadata helper; do not use
it as a runtime source of entities, markers, monsters, resources, or
interactables.

## Initial Files

Recommended structure for the MVP:

```text
src/data/
  areas.json
  maps.json
  markers.json
```

## Areas

`src/data/areas.json` stores visual metadata for the areas used by markers. It
should remain simple and static in the MVP:

```json
{
  "name": "Outskirts",
  "color": "#2f7f68"
}
```

| Field | Required | Description |
| --- | --- | --- |
| `name` | Yes | Area name exactly as used in `markers.json`. |
| `color` | Yes | Hexadecimal color used by markers in that area. |

A marker's color must depend on `marker.area`. Do not repeat the color within
each marker. If the marker's area does not exist in `areas.json`, or the marker
has no `area`, the UI must use a neutral fallback.

## Maps

`src/data/maps.json` describes the base image used by Leaflet. In the MVP, it is
an import and base-image metadata helper, not the runtime source of game data.

Suggested fields:

```json
{
  "id": "world",
  "name": "World Map",
  "imageUrl": "/maps/world-map.jpg",
  "width": 4096,
  "height": 4096
}
```

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Unique map identifier. |
| `name` | Yes | Display name. |
| `imageUrl` | Yes | Public image path. |
| `width` | Yes | Original image width. |
| `height` | Yes | Original image height. |

## Markers

Recommended required and optional fields:

For step-by-step maintenance instructions, complete examples, and coordinate
rules, see the [Marker Guide](./markers-guide.md). For the field reference, see
the [Data Schema](./data-schema.md).

```json
{
  "id": "zone-ashen-hollow",
  "name": "Ashen Hollow",
  "mapId": "surface",
  "x": 58.2,
  "y": 31.7,
  "area": "Ashen Hollow",
  "zoneType": "Surface zone",
  "level": "12-15",
  "monsters": [
    {
      "name": "Ironfang",
      "wikiSlug": "Ironfang",
      "image": "Ironfang.png/16px-Ironfang.png",
      "drops": [
        {
          "name": "Ancient Fang",
          "dropRate": 5,
          "wikiSlug": "Ancient_Fang"
        }
      ]
    }
  ],
  "resources": [
    {
      "type": "Fishing",
      "items": [
        {
          "name": "Clam",
          "wikiSlug": "Clam",
          "image": "Clam.png/16px-Clam.png",
          "chancePercent": 62.5
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
  "wikiSlug": "Ashen_Hollow"
}
```

| Field | Required | Description |
| --- | --- | --- |
| `id` | Yes | Unique identifier. |
| `name` | Yes | Display name. |
| `mapId` | Yes | Map on which the marker appears. |
| `x` | Yes | Horizontal percentage coordinate. |
| `y` | Yes | Vertical percentage coordinate. |
| `area` | No | Area or region. |
| `zoneType` | No | Zone type, such as `Surface zone`. |
| `level` | No | Recommended level or zone level. |
| `monsters` | No | List of rich monster objects found in the area. |
| `resources` | No | List of resource groups by profession or gathering type. |
| `warpPoint` | No | Indicates whether the area has a warp point. |
| `wikiSlug` | No | Wiki page slug. |
| `interactables` | No | List of rich NPC, object, or interactive-point objects. |
| `tags` | No | Additional search terms that do not duplicate structured fields. |

Recommended format for `resources`:

```json
{
  "type": "Fishing",
  "items": [
    {
      "name": "Clam",
      "wikiSlug": "Clam",
      "image": "Clam.png/16px-Clam.png",
      "chancePercent": 62.5
    }
  ]
}
```

`monsters`, `resources[].items`, and `interactables` must not be arrays of
strings. Use rich objects with `name` and, when available, `wikiSlug`, `image`,
and `chancePercent` for resource items. A rich monster may also contain an
optional `drops` array.

## Simple Embedded Monster Drops

The MVP represents known monster drops as small pieces of metadata embedded at
the location where the monster is recorded:

```text
marker
  -> monsters[]
       -> drops[]
```

Each drop records its name and a percentage drop rate, or `null` when that rate
is unknown, with optional image and wiki metadata. This keeps the static JSON
easy to maintain and preserves the owning monster and marker context used by
the popup and search.

This is not a separate drop entity model. It does not introduce shared item or
drop records, a normalized drop database, or the future many-to-many
relationship between monsters and items. Duplicate embedded metadata is
acceptable in the MVP; normalization remains post-MVP work.

Use `area`, `zoneType`, `level`, `monsters`, `resources`, `interactables`,
`warpPoint`, `wikiSlug`, and `tags` to record important marker data in a
structured form. Use these fields when the marker represents a navigable area
or zone on the map, rather than only an isolated point such as an NPC, boss,
merchant, or entrance. These fields must remain in the marker's static JSON data
during the MVP so they are easy to maintain.

Do not separate monsters, resources, or entities into their own files or tables
yet. Separate entities are a post-MVP concern, once there is enough data and
real duplication to justify the change.

## Search

The initial search must remain simple and operate on static JSON data. The
searchable marker fields must include:

- `name`
- `area`
- `zoneType`
- `tags`
- `monsters`
- `monsters[].drops[].name`
- `resources`
- `interactables`

For `resources`, search must include both `type` and
`resources[].items[].name`, such as `Fishing`, `Clam`, `Shrimp`, and `Trout`.
For `monsters` and `interactables`, search must include at least `name`.
Monster drop names are read from `monsters[].drops[].name`; contributors do not
need to duplicate them in `tags`.

For autocomplete details, searchable entity types, index generation, and
selection behavior, see [Search Autocomplete](./search-autocomplete.md).

## MVP Filters

The UI's primary filter must be area or region, using the unique `area` values
present in `markers.json`.

Search covers the markers' structured fields, including warp points by name or
tag, monsters, resource types, and resource items. Do not create a separate
visual group for every monster or resource. Do not separate entities yet.

## Marker Visual Styling

In the MVP, marker color must be derived from the marker's area:

- `marker.area` points to an entry in `src/data/areas.json`;
- `areas.json` defines that area's color;
- use a neutral fallback if no color is registered for the area;
- `warpPoint: true` does not change the base color; it only adds a visual border
  or ring.

This rule avoids repeating colors in every marker and keeps the marker JSON
focused on data for the map, search, filters, and popups.

## Coordinates

Use percentage coordinates from `0` to `100`.

```text
x = 0      left
x = 100    right
y = 0      top
y = 100    bottom
```

Origin: the top-left corner of the image.

Benefits:

- works with resized images;
- supports responsive layouts;
- reduces rework if the image is replaced with a higher-resolution version;
- simplifies data import and export.

## Future Relationships

When a backend or more complex data is introduced, evolve toward:

```text
Map
  has many Markers

Marker
  belongs to Map
  may reference Entity

Entity
  can be Location, NPC, Monster, Item, Resource or Quest
```

Important relationships:

- An NPC appears at one or more markers.
- A monster appears in one or more areas.
- A monster may drop many items through a normalized many-to-many relationship.
- A merchant sells many items.
- A quest may involve NPCs, locations, monsters, and rewards.
- A resource appears at multiple gathering points.
- An item may come from drops, merchants, quests, or gathering.

## Future Tables

If a backend is added:

- `maps`
- `markers`
- `locations`
- `npcs`
- `monsters`
- `items`
- `resources`
- `quests`
- `drops`
- `spawns`
- `wiki_pages`
- `users`
- `revisions`

Do not create these tables in the MVP. The current embedded `drops` arrays do
not satisfy or replace this future relationship model. Use this list only as
architectural direction. A backend, login, an admin panel, and automatic wiki
synchronization remain out of scope for the MVP.

## Wiki Integration

For the MVP, it is enough to support:

```json
{
  "wikiSlug": "Ironfang"
}
```

Centralized helpers generate the final wiki links from the slug. Later, this
may evolve to:

```json
{
  "wikiSlug": "Ironfang",
  "wikiPageId": "123",
  "lastSyncedAt": "2026-08-26T00:00:00.000Z"
}
```

Avoid automatic synchronization until the data format is stable.
