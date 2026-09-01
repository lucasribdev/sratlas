# Contributing

Thank you for helping improve the Soul's Remnant Interactive Map. Keep changes
focused on making information quick to find, the map easy to navigate, and the
static data easy to maintain. Preserve the small MVP scope described in
[`AGENTS.md`](./AGENTS.md).

## Language Policy

English is the canonical language for documentation, source-code identifiers,
comments, tests, UI copy, error messages, issues, pull requests, and new commit
messages.

Keep the official spelling of Soul's Remnant names and all canonical game data,
including wiki slugs, image paths, and URLs. The language policy does not call
for translating or normalizing these values. Future UI translations must live
in a dedicated localization structure; do not place multiple languages or
translated strings directly in components. Existing Git history must not be
rewritten merely to translate old commit messages.

## Local Setup

Install the project with pnpm, then start the Vite development server:

```bash
pnpm install
pnpm dev
```

Use the dependency versions recorded in `pnpm-lock.yaml`. Do not introduce a
large library unless the need is clear, and do not add a backend or other
post-MVP infrastructure to support a contribution.

## Code Contributions

1. Read [`AGENTS.md`](./AGENTS.md) and the relevant design documentation before
   changing code.
2. Keep the change narrow and preserve the existing Vite, React, TypeScript,
   Leaflet, React Leaflet, and static-JSON architecture.
3. Use English for identifiers, comments, tests, UI copy, and error messages,
   except for canonical game data that must retain its official spelling.
4. Add or update tests when behavior changes.
5. Manually verify the primary flow on desktop and mobile. Search and filters
   must continue to work together, and selecting a search result must center the
   map on its marker.
6. Run all required validation commands before opening a pull request.

For interface changes, follow the [UI guide](./docs/ui.md). For search changes,
follow the [search autocomplete documentation](./docs/search-autocomplete.md).
The [MVP plan](./docs/mvp.md) and [milestones](./docs/milestones.md) describe the
current scope and deferred features.

## Data Contributions

Data changes should normally be possible without application-code changes.
Follow the [marker contribution guide](./docs/markers-guide.md), the
[data schema](./docs/data-schema.md), and the broader
[data model](./docs/data-model.md).

The data files have distinct roles:

- `src/data/markers.json` is the runtime source of truth for marker and rich game
  data used by the map, search, filters, and details. Every marker requires
  a name, a map, and percentage coordinates from `0` to `100`, measured from the
  top-left corner. Keep `monsters`, `interactables`, and `resources[].items` as
  rich objects rather than arrays of strings.
- `src/data/areas.json` contains the visual metadata for areas referenced by
  markers, including area colors. Keep marker colors here rather than repeating
  them in each marker; an area without an entry uses the neutral fallback.
- `src/data/maps.json` contains import and base-image metadata such as the map
  ID, image path, width, and height. It is not a runtime source of entities,
  markers, monsters, resources, interactables, or popup data.

When contributing data:

1. Preserve official Soul's Remnant names, wiki slugs, image paths, URLs, and
   other canonical values exactly as officially spelled.
2. Add or update marker content in `src/data/markers.json` and ensure marker IDs
   remain unique.
3. Add area visual metadata to `src/data/areas.json` when a new area needs its
   own color.
4. Change `src/data/maps.json` only when the base map or its import metadata
   changes.
5. Confirm that each `mapId` refers to a map entry and that every coordinate is
   within `0` to `100`.
6. Verify that the new data appears in the map, search, filters, and details as
   expected without requiring code changes.

## Validation

Run every automated check:

```bash
pnpm test
pnpm lint
pnpm build
```

Also manually test the affected primary flow on desktop and mobile. If a command
cannot run because a dependency is missing, report the failure clearly rather
than hiding or bypassing it.

## Commits and Pull Requests

Write new commit messages, issue text, and pull-request titles and descriptions
in English. Do not rewrite existing Git history merely to translate older commit
messages.

Keep commits focused and describe the intent of the change. A pull request must:

- explain what changed and why;
- stay within the MVP scope;
- identify any data-schema or contributor-workflow impact;
- list the automated and manual validation performed;
- include screenshots or recordings for visible UI changes when useful;
- avoid unrelated documentation rewrites, dependency additions, and runtime
  data translations.
