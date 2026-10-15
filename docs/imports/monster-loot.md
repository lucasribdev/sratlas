# Confirmed Monster Loot Update

The 2026-10-14 local update adds confirmed loot for 26 previously missing
monster names, across 49 occurrences in `src/data/markers.json`. There are 315
monster/drop pairs before repetition across locations. The loot update preserves existing drops, monster
metadata, markers, and coordinates.

`data/imports/monster-loot-2026-10-14.json` records the source item names,
original chance strings, and source URLs for every imported entry. It is an
audit snapshot, not an additional runtime source of truth or a synchronization
service. The UI continues to read only the rich marker data.

## Sources and Completeness

Twenty monsters have populated tables in the official wiki's
[monster data module](https://soulsremnant.wiki.gg/wiki/Module:Data/Monsters).
Their recorded tables were imported in full.

Six monsters use partial evidence from other official wiki pages:

- Angeling: Bamboo Hat in its page's notes, and Nurturing Gem in the item's table.
- Big Slime: Nurturing Gem in the item's table.
- Desert Bandit: Soul Crystal documented in the Grinding guide.
- Elemental: items and recipes in the page's explicit Drops section.
- Rocky: equipment pages identify it in their Dropped By tables.
- Shadow Sprite: items and recipes in the page's explicit Drops section.

These partial records are not a claim that the monsters drop only those items.
The 17 unconfirmed names still have no newly recorded loot; absent wiki data
must not be interpreted as proof of no drops in the game.

## Rate and Display Rules

- Exact percentages become numeric `dropRate` values between 0 and 100.
- Missing chances and literal `<0.00%` values become `null`, displayed as
  **Unknown**. They must not become `0` or a guessed percentage. The source
  strings remain in the audit snapshot. There are 153 such monster/drop pairs.
- Recipe labels append `(recipe)` to the recorded base item name, distinguishing
  the recipe drop from the crafted item. Their wiki links use the verified base
  item page; this does not introduce separate recipe entities.
- Elemental's Red Upgrade Gem variants retain `(+3 INT)` and `(+3 SPR)` labels,
  each with its separately recorded 0.2% chance.
- New item links use page titles verified through the public MediaWiki API.
  Missing item pages have no new wiki link. Item image metadata is reused only
  when already recorded; no new thumbnail path is guessed.

Snowball's direct wiki URL currently opens an item page, and Rocky has no page
at the generated monster URL. Their existing monster metadata is preserved;
loot evidence comes from the data module and equipment pages respectively.

## Verification

Run `pnpm test`, `pnpm build`, and `pnpm lint`. The existing integrity tests
validate rich monster drops and numeric/null rates. The browser check in
`scripts/check-multi-map.mjs` additionally searches for a newly recorded Cosmowl
drop from Surface, navigates to its Caves marker, expands its drop list, and
checks both numeric and Unknown chances in desktop and mobile layouts.

## Monster Images and Links

A subsequent asset check fills previously absent metadata for 19 Caves monster
names across 33 occurrences. All 19 official source image files have verified
24-pixel thumbnail URLs from the public wiki API. Runtime `image` values store
only the path after `/images/thumb/`, without the API's cache query string.
Eighteen monster names also have verified article links. Fallentree has an
existing image file but no article at its generated monster title, so its image
is filled and its optional wiki link remains absent.

`data/imports/monster-assets-2026-10-14.json` records the verified file pages and
runtime metadata. Drops, marker coordinates, and existing metadata are
preserved. Browser checks verify that Cosmowl's icon loads and its name links
to its official article in desktop and mobile layouts.
