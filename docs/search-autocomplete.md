# Search Autocomplete

## Searchable Entities

Autocomplete suggestions are generated from `src/data/markers.json`, which is the
runtime source of truth for map data in the MVP.

The current searchable entity types are:

| Type | Source |
| --- | --- |
| Marker | `marker.name` |
| Area | `marker.area` |
| Monster | `marker.monsters[].name` |
| Item | `marker.resources[].items[].name` or `marker.monsters[].drops[].name` when the name does not contain `essence` |
| Essence | `marker.resources[].items[].name` or `marker.monsters[].drops[].name` when the name contains `essence`, case-insensitively |
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

Simple embedded monster drops use the existing Item/Essence classification;
there is no separate Drop suggestion type. A drop whose normalized name
contains `essence` is an Essence entry. Every other drop is an Item entry.

Each drop entry carries context from:

- its owning monster's name;
- its marker's name, area, and zone type;
- its own optional `wikiSlug`.

This context can match an autocomplete query. In particular, a drop's
`wikiSlug` can surface that drop suggestion, but wiki slugs are not part of the
plain marker text filter. Selecting the suggestion replaces the query with the
drop's display name, which is part of marker text search. The `wikiSlug` also
supports the drop link rendered in marker details; selecting an autocomplete
entry does not open the wiki directly.

## Drop Deduplication

Deduplication uses the entry type plus a case-insensitive, trimmed label with
repeated whitespace collapsed. The first encountered spelling becomes the
display label, while later occurrences add context and marker targets.

- If the same named item exists as a resource and a monster drop, both
  occurrences merge when they receive the same Item or Essence classification.
  Resource-type context and monster context are both retained.
- If the same drop appears on several monsters at one marker, it remains one
  suggestion. The monster names are retained as keywords, and that marker ID is
  stored only once.
- If the same drop appears across several markers, it remains one suggestion
  with each distinct marker ID and the combined marker, area, zone, monster,
  resource, and wiki context.

Matching is case-insensitive. Prefix matches are ranked before partial matches.
The UI shows a limited set of suggestions for the current query.

## Selection Behavior

Selection behavior is centralized in `src/lib/search-selection.ts`.

| Selected type | Behavior |
| --- | --- |
| Marker | Sets the search query to the marker name and focuses the marker when it is visible under the current area selection. |
| Area | Sets the search query to the area name. |
| Monster | Sets the search query to the monster name. |
| Item or Essence, including monster drops | Sets the search query to the item or drop name. |
| Resource | Sets the search query to the resource type, such as `Mining`, `Fishing`, or `Herbalism`. |
| Interactable | Sets the search query to the interactable name. |

Autocomplete selection does not change selected areas. Area checkboxes remain
under direct user control, so suggestions narrow results within the currently
selected area scope.

Selecting a drop-backed Item or Essence does not select one marker
automatically. It sets the query to the drop name, so all matching markers in
the currently selected area scope remain visible. It does not change selected
areas.

## Contributor Workflow

To make a new entity searchable, add it to the structured marker data:

- Add a location with `name`, `area`, `zoneType`, and optional `tags`.
- Add monsters to `monsters[]` as objects with `name`.
- Add drops to the owning monster's `drops[]` with `name` and `dropRate`.
- Add resource items to `resources[].items[]` as objects with `name`.
- Add NPCs or objects to `interactables[]` as objects with `name`.
- Use `resources[].type` for resource categories such as `Fishing`, `Mining`,
  and `Herbalism`.

Do not duplicate structured names in `tags`. Tags should only contain useful
aliases or community terms that are not already present in structured fields.
Monster drop names are already searchable from `monsters[].drops[].name`.
