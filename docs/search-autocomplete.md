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
| Drop | `marker.monsters[].drops[].name` |
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

Entries with the same type and normalized label are merged, so a monster, drop,
or item that appears in multiple markers produces one suggestion with multiple
marker targets. Monster drops use the internal `drop` type, which stays distinct
from resource/gathering items even when the visible item name is the same.

Matching is case-insensitive. Prefix matches are ranked before partial matches.
The UI shows a limited set of suggestions for the current query.

## Selection Behavior

Selection behavior is centralized in `src/lib/search-selection.ts`.

| Selected type | Behavior |
| --- | --- |
| Marker | Sets the search query to the marker name and focuses the marker when it is visible under the current area selection. |
| Area | Sets the search query to the area name. |
| Monster | Sets the search query to the monster name. |
| Drop | Clears the free-text search query and returns a structured `monster-drop` filter intent using the canonical drop label. |
| Item or Essence | Sets the search query to the item name. |
| Resource | Sets the search query to the resource type, such as `Mining`, `Fishing`, or `Herbalism`. |
| Interactable | Sets the search query to the interactable name. |

Autocomplete selection does not change selected areas. Area checkboxes remain
under direct user control, so suggestions narrow results within the currently
selected area scope.

Selecting a `Drop` entry now filters visible markers and sidebar results through
the structured monster-to-drop relationship. For example, selecting `Hopper Leg`
with the `Drop` type shows only markers containing at least one monster whose
`drops[]` includes `Hopper Leg`. Area filters continue to compose with this
constraint, so selected areas and the selected drop use AND semantics.

Free-text input remains plain text search. Typing a drop name does not
automatically create a structured drop filter; the structured intent is created
only when the user selects a `Drop` autocomplete entry.

Drop selection intentionally leaves `searchQuery` empty so the result does not
depend on both plain text search and the structured monster-drop filter. Typing a
new free-text query or selecting a non-drop autocomplete entry clears the
temporary structured drop filter. A visible active-filter chip or richer
lifecycle UI is not implemented yet.

## Monster Drop Filter Lifecycle

The MVP supports at most one active `monster-drop` filter.

- Selecting a `Drop` autocomplete entry activates a structured `monster-drop`
  filter with the canonical drop label.
- Selecting another `Drop` entry replaces the previous drop filter.
- Manually typing or clearing a free-text search query clears the drop filter, so
  a hidden structured constraint cannot silently limit a new search.
- Selecting a non-drop autocomplete entry clears the previous drop filter and
  then applies that entry's normal behavior.
- Area filter changes do not clear the drop filter, and drop selection does not
  mutate selected areas. Area selections compose independently with drop
  filtering.

The current structured selection filter is:

```ts
type SearchSelectionFilter = {
  type: 'monster-drop'
  value: string
}
```

For drop entries, `value` is the canonical `SearchEntry.label`, not the entry's
`markerIds`. The filter represents the semantic constraint "monster drops this
item" while `markerIds` remain autocomplete metadata.

## Contributor Workflow

To make a new entity searchable, add it to the structured marker data:

- Add a location with `name`, `area`, `zoneType`, and optional `tags`.
- Add monsters to `monsters[]` as objects with `name`.
- Add monster drops to `monsters[].drops[]` as objects with `name`.
- Add resource items to `resources[].items[]` as objects with `name`.
- Add NPCs or objects to `interactables[]` as objects with `name`.
- Use `resources[].type` for resource categories such as `Fishing`, `Mining`,
  and `Herbalism`.

Do not duplicate structured names in `tags`. Tags should only contain useful
aliases or community terms that are not already present in structured fields.
