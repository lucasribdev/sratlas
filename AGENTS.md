# AGENTS.md

Guidance for working on this project.

## Language Policy

English is the canonical language for project documentation, source-code
identifiers, comments, tests, UI copy, error messages, issues, pull requests,
and new commit messages.

Official Soul's Remnant names, wiki slugs, image paths, URLs, and other
canonical game data must retain their official spelling. Do not translate or
normalize those values merely to satisfy the project language policy.

Future UI localization must use a dedicated localization structure. Do not mix
translated strings directly into components.

Do not rewrite existing Git history merely to translate old commit messages.

## Product

This project is the interactive map for Soul's Remnant. The first version must
be simple, useful, and quick to launch.

Always prioritize:

1. finding information quickly;
2. a navigable, responsive map;
3. data that is easy to maintain;
4. a small scope;
5. an architecture that can evolve later.

Avoid adding a backend, login, an admin panel, automatic wiki synchronization,
or collaborative systems before the MVP is functional.

## Stack

Expected stack for the MVP:

- Vite
- React
- TypeScript
- Leaflet
- React Leaflet
- static JSON data

Do not introduce large libraries without a clear need. Start with a simple
search; use Fuse.js only if basic search proves insufficient.

## Recommended Structure

When implementation begins, prefer a structure similar to:

```text
src/
  components/
    map/
    search/
    filters/
    layout/
  data/
    maps.json
    markers.json
  domain/
    marker.ts
    map.ts
  lib/
    coordinates.ts
    marker-search.ts
```

Use `public/` for large map images:

```text
public/
  maps/
    world-map.jpg
```

## Product Rules

- Users must be able to find NPCs, enemies, areas, and resources with only a
  few clicks.
- Search and filters must work together.
- Clicking a search result must center the map on the marker.
- Every marker must have a name, a map, and coordinates.
- Wiki links are optional, but must be supported from the beginning.
- Do not create public contribution features before a moderation or editorial
  workflow exists.

## Data Rules

- `src/data/markers.json` is the runtime source of truth for map data.
- `src/data/maps.json` is only an import/base-image metadata helper; do not treat
  it as a runtime source of entities or markers.
- Marker coordinates must be percentages from `0` to `100`.
- The coordinate origin is the top-left corner of the map.
- `x = 0` is the left edge; `x = 100` is the right edge.
- `y = 0` is the top edge; `y = 100` is the bottom edge.
- Markers represent positions on the map.
- Entities represent things in the game, such as NPCs, monsters, items, quests,
  and resources.
- In the MVP, markers contain rich data directly, including `wikiSlug`,
  `interactables[]`, `monsters[]`, and `resources[].items[]`.
- Do not revert to older formats in which `monsters` or `resources[].items`
  were arrays of strings.
- After the MVP, separate entities to avoid duplication only when there is a
  real need.

## UX

- Desktop: a sidebar with search, filters, and results; the map occupies the
  remaining space.
- Mobile: the map is the main screen; search is at the top; filters are in a
  drawer; details appear in a bottom sheet or simple popup.
- Avoid explanatory screens. The map must be the first experience.
- Use clear visual styling derived from actual marker data, such as warp points,
  resources, and monsters.
- Do not overload the map with permanently visible text.

## Quality

Before considering a change complete:

- run `pnpm build`;
- run `pnpm lint`;
- manually test the primary flow;
- check both desktop and mobile;
- confirm that new data can be added without changing code.

If a command fails because a dependency is missing, report that clearly instead
of masking the problem.

## Out of Scope for the MVP

Do not implement these features in the MVP:

- login;
- user accounts;
- a complete admin panel;
- comments;
- favorites;
- automatic routes;
- complex drops;
- automatic wiki synchronization;
- revision history;
- role-based permissions.

These items should be introduced only when there is enough data and real usage
of the map.
