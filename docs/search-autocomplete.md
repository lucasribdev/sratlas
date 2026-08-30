# Search Autocomplete

## Searchable Entities

Autocomplete suggestions are generated from `src/data/markers.json`, which is the
runtime source of map data for the MVP.

The current searchable entity types are:

| Type | Source |
| --- | --- |
| Marker | `marker.name` |
| Area | `marker.area` |
| Monster | `marker.monsters[].name` |
| Item | `marker.resources[].items[].name` |
| Essence | `marker.resources[].items[].name` when the item name contains `essence` |
| Resource | `marker.resources[].type` |
| Interactable | `marker.interactables[].name` |

Element suggestions are not generated yet because the current marker data model
does not contain a structured monster element field. When an element field is
added to the marker or monster schema, it should be indexed from that structured
field rather than from a hardcoded list.

## Index Generation

The autocomplete index is built in `src/lib/search-index.ts` from the existing
marker objects. It does not store a separate manual list of suggestions.

Each search entry contains:

- a display label;
- a type used for the visible type badge;
- marker ids where the entity appears;
- lightweight keywords derived from nearby marker context, such as area, zone
  type, resource type, wiki slug, and tags.

Entries with the same type and normalized label are merged, so a monster or item
that appears in multiple markers produces one suggestion with multiple marker
targets.

Matching is case-insensitive. Prefix matches are ranked before partial matches.
The UI shows a limited set of suggestions for the current query.

## Selection Behavior

Selection behavior is centralized in `src/lib/search-selection.ts`.

| Selected type | Behavior |
| --- | --- |
| Marker | Sets the search query to the marker name and focuses the marker when it is visible under the current area selection. |
| Area | Sets the search query to the area name. |
| Monster | Sets the search query to the monster name. |
| Item or Essence | Sets the search query to the item name. |
| Resource | Sets the search query to the resource type, such as `Mining`, `Fishing`, or `Herbalism`. |
| Interactable | Sets the search query to the interactable name. |

Autocomplete selection does not change selected areas. Area checkboxes remain
under direct user control, so suggestions narrow results within the currently
selected area scope.

Item and essence selections do not activate a drop filter yet because the current
filter system has no structured drop filter. When that filter exists, route the
selection through the same selection helper instead of adding parallel UI logic.

## Contributor Workflow

To make a new entity searchable, add it to the structured marker data:

- Add a location with `name`, `area`, `zoneType`, and optional `tags`.
- Add monsters to `monsters[]` as objects with `name`.
- Add resource items to `resources[].items[]` as objects with `name`.
- Add NPCs or objects to `interactables[]` as objects with `name`.
- Use `resources[].type` for resource categories such as `Fishing`, `Mining`,
  and `Herbalism`.

Do not duplicate structured names in `tags`. Tags should only contain useful
aliases or community terms that are not already present in structured fields.
