# MVP Plan

## Goal

Create a simple interactive map that lets players quickly find locations, NPCs,
monsters, bosses, resources, warp points, and points of interest in Soul's
Remnant.

The MVP must answer:

> Where can I find this?

## Primary User

Players who want to locate something in the game world without searching across
multiple pages, videos, or conversations.

## Problems Solved

- Quickly find NPCs, bosses, monsters, and resources.
- Understand where cities, areas, dungeons, and warp points are located.
- Open the related wiki page when one exists.
- Reduce dependence on external guides and scattered information.

## MVP Scope

| Feature | Status |
| --- | --- |
| Navigable map with pan and zoom | MVP |
| Map markers | MVP |
| Popup or details panel | MVP |
| Area or region filter | MVP |
| Quick filters based on area data | MVP |
| Search by name | MVP |
| Search results list | MVP |
| Wiki link | MVP |
| Static JSON data | MVP |
| Basic responsive layout | MVP |
| Marker clustering | Post-MVP |
| Backend | Post-MVP |
| Admin panel | Post-MVP |
| Login | Post-MVP |
| Collaborative editing | Post-MVP |
| Complete drop data | Post-MVP |
| Complete quest relationships | Post-MVP |
| Favorites | Optional |
| Comments | Optional |
| Automatic routes | Optional |

## Main Screen

Desktop:

```text
Search
Sidebar: area filters and results
Map: markers, zoom, and selected details
```

Mobile:

```text
Search at the top
Map as the main screen
Filters in a drawer
Marker details in a popup or bottom sheet
```

## Primary Flow

1. The user opens the map.
2. The map loads with visible markers.
3. The user filters by area or region, or searches by text.
4. The results list updates.
5. The user clicks a marker or result.
6. The map centers on the selected marker.
7. The details show the name, area, zone type, structured marker data, and wiki
   link.

## Search and Filters

MVP search:

- a single field;
- search by name;
- also search by area, zone type, tags, monsters, and resources;
- case-insensitive matching;
- clickable results;
- a simple message when there are no results.

MVP filters:

- area or region checkboxes derived from markers;
- all areas selected initially;
- an option to select all areas;
- an option to clear the area selection without changing the search query;
- filters combined with search.

Marker visual styling:

- color based on `marker.area`, resolved through `src/data/areas.json`;
- a neutral fallback when no color is registered for the area;
- `warpPoint: true` adds an extra ring or border without changing the area
  color;
- do not repeat the color in every marker.

Rule:

```text
a marker appears if its area is active
AND the search text matches its searchable fields

With no search query, all areas (selected by default) show all markers.
If no area is selected, no marker appears.
```

## Definition of Done

The MVP is complete when:

- the map opens correctly;
- pan and zoom work;
- there are enough real markers to be useful;
- filters work;
- search works;
- clicking a marker shows its details;
- clicking a result centers the map;
- wiki links work when present;
- the layout is usable on desktop and mobile;
- new markers can be added by editing JSON.

## Extremely Lean Version

The smallest possible first release includes:

- one world map;
- 30 to 50 real markers;
- the main areas;
- search by name;
- an area or region filter;
- a simple popup;
- wiki links;
- JSON data.

No backend, admin panel, or complex relationships.
