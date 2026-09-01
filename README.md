# Soul's Remnant Interactive Map

An interactive map that helps Soul's Remnant players find locations, NPCs,
monsters, bosses, resources, warp points, and other points of interest.

The project starts as a simple MVP: a React/Vite application backed by static
JSON data. A backend, an admin panel, and deep wiki integration are deferred
until the first version is already useful.

## MVP Goal

Quickly answer the question:

> Where can I find this in the world of Soul's Remnant?

The MVP must let users:

- open the map;
- pan and zoom;
- view markers;
- filter by area or region and marker data;
- search by name, area, monsters, and resources;
- click a marker to view details;
- open the corresponding wiki page when one exists.

## Planned Stack

- Vite
- React
- TypeScript
- Leaflet
- React Leaflet
- static JSON data for the initial dataset
- optional Fuse.js for improved search

## Documentation

- [MVP Plan](./docs/mvp.md)
- [Data Model](./docs/data-model.md)
- [Data Schema](./docs/data-schema.md)
- [Marker Guide](./docs/markers-guide.md)
- [Search Autocomplete](./docs/search-autocomplete.md)
- [UI Foundation and Visual Maintenance](./docs/ui.md)
- [Milestones and Issues](./docs/milestones.md)
- [Agent Instructions](./AGENTS.md)
- [Contributing Guide](./CONTRIBUTING.md)

## Commands

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
pnpm lint
```

## Key Decisions

- Start without a backend.
- Keep login, an admin panel, and automatic wiki synchronization out of the MVP.
- Use Leaflet with an image of the game map.
- Store marker coordinates as percentages relative to the map.
- Treat `src/data/markers.json` as the runtime source of truth for map data.
- Use `src/data/maps.json` only as an import and base-image metadata helper, not
  as a runtime source of markers or entities.
- Keep data editable as static JSON at first.
- Separate markers from entities when the project grows.
