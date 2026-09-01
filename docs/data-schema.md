# Data Schema

This document describes the runtime data format used by the map.

## Runtime Source of Truth

`src/data/markers.json` is the runtime source of truth for map data. The UI uses
this file to render markers, search results, filters, and popups.

`src/data/maps.json` is only an import and base-image metadata helper containing
`id`, `name`, `imageUrl`, `width`, and `height`. It must not contain entities,
monsters, resources, interactables, or popup data.

A backend, login, an admin panel, and automatic wiki synchronization remain out
of scope for the MVP.

## Marker

Fields accepted by each item in `markers.json`:

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `id` | Yes | `string` | Unique identifier in `kebab-case`. |
| `name` | Yes | `string` | Name displayed to the player. |
| `mapId` | Yes | `string` | ID of the map metadata entry, such as `world`. |
| `x` | Yes | `number` | Horizontal percentage coordinate from `0` to `100`. |
| `y` | Yes | `number` | Vertical percentage coordinate from `0` to `100`. |
| `area` | No | `string` | Area or region used for filtering and visual color. |
| `zoneType` | No | `string` | Zone type, such as `Surface zone`, `Dungeon`, or `Cave`. |
| `level` | No | `string` | Recommended level or zone level. |
| `monsters` | No | `MarkerMonster[]` | Monsters found in the zone. |
| `resources` | No | `MarkerResourceGroup[]` | Resource groups organized by gathering type. |
| `warpPoint` | No | `boolean` | Indicates a warp point. |
| `wikiSlug` | No | `string` | Slug for the marker's own wiki page. |
| `interactables` | No | `MarkerInteractable[]` | NPCs, objects, or interactive points. |
| `tags` | No | `string[]` | Additional search terms. |

## Rich Objects

`monsters`, `resources[].items`, and `interactables` use objects, not strings.

```json
{
  "name": "Hopper",
  "wikiSlug": "Hopper",
  "image": "Hopper.png/16px-Hopper.png"
}
```

```json
{
  "name": "Stone",
  "wikiSlug": "Stone",
  "image": "Stone.png/16px-Stone.png",
  "chancePercent": 65.2
}
```

```json
{
  "name": "Quest Master",
  "wikiSlug": "Quest_Master",
  "image": "Quest_Master.png/16px-Quest_Master.png"
}
```

## Resource Group

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

`wikiSlug` stores only the variable part after
`https://soulsremnant.wiki.gg/wiki/`. `image` stores only the variable part
after `https://soulsremnant.wiki.gg/images/thumb/`. The UI builds the final URLs
with centralized helpers.

`chancePercent` is optional and represents an item's percentage chance within
that resource group when the data is available.

## Basic Marker

```json
{
  "id": "spawn",
  "name": "Spawn",
  "mapId": "surface",
  "x": 50,
  "y": 53,
  "area": "Spawn",
  "zoneType": "Surface zone",
  "level": "0",
  "warpPoint": true,
  "wikiSlug": "Spawn_Grounds"
}
```

## Rich Marker

```json
{
  "id": "outskirts-south",
  "name": "Outskirts south",
  "mapId": "surface",
  "x": 48,
  "y": 57.8,
  "area": "Outskirts",
  "zoneType": "Surface zone",
  "level": "7",
  "monsters": [
    {
      "name": "Hopper",
      "wikiSlug": "Hopper",
      "image": "Hopper.png/16px-Hopper.png"
    }
  ],
  "resources": [
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
    }
  ],
  "interactables": [
    {
      "name": "Quest Master",
      "wikiSlug": "Quest_Master",
      "image": "Quest_Master.png/16px-Quest_Master.png"
    }
  ],
  "wikiSlug": "Outskirts_South",
  "tags": ["level 7"]
}
```

## Coordinates

Coordinates are percentages from `0` to `100`, with their origin at the
top-left corner of the map image.

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
