# Milestones and Issues

Initial backlog for building the Soul's Remnant interactive map MVP.

## Milestone 1: Project Foundation

Goal: prepare the application for the real map, data, and primary components.

### Issues

#### 1. Clean Up the Initial Vite Template

Remove the default Vite screen, assets, and styles.

Status: MVP

#### 2. Define the Initial Folder Structure

Create a structure for components, data, domain types, and utilities.

Status: MVP

#### 3. Install Map Dependencies

Add Leaflet and React Leaflet.

Status: MVP

#### 4. Create the Base Application Layout

Create the structure for the sidebar, map area, and initial responsive behavior.

Status: MVP

## Milestone 2: Navigable Map

Goal: display the game map image with pan and zoom.

### Issues

#### 5. Add the Initial Map Image

Add the image to `public/maps/`.

Status: MVP

#### 6. Render the Map with Leaflet

Configure Leaflet to use a static image and a simple coordinate system.

Status: MVP

#### 7. Set Bounds and Minimum and Maximum Zoom

Prevent users from getting lost outside the useful map area.

Status: MVP

#### 8. Create a Coordinate Conversion Utility

Convert percentage coordinates from the data into coordinates used by Leaflet.

Status: MVP

## Milestone 3: Data and Markers

Goal: load area, map, and marker metadata from static JSON data.

### Issues

#### 9. Create `maps.json`

Define the initial map, image, and dimensions.

Status: MVP

#### 10. Create `areas.json` and Define the Marker Styling Rule

Derive each marker's base color from the metadata for `marker.area` in
`areas.json`, with a neutral fallback. `warpPoint: true` must only add the
appropriate visual ring or border without changing the base color.

Status: MVP

#### 11. Create `markers.json`

Add the initial set of real markers or controlled placeholders.

Status: MVP

#### 12. Create TypeScript Types for the Data

Type areas, maps, and markers.

Status: MVP

#### 13. Render Markers on the Map

Display markers using the JSON data.

Status: MVP

#### 14. Create the Marker Popup

Show the name, area, structured marker data, and wiki link.

Status: MVP

## Milestone 4: Search and Filters

Goal: let players quickly find important points.

### Issues

#### 15. Create Area Filters

Allow markers to be filtered by the area or region values in the data, ordered
according to the metadata in `areas.json`.

Status: MVP

#### 16. Create Text Search

Search by name, area, zone type, tags, monsters, resources, and interactables.

Status: MVP

#### 17. Create the Results List

Show filtered markers in a sidebar list.

Status: MVP

#### 18. Center the Selected Marker

When a user clicks a result or marker, move the map to the selected point.

Status: MVP

#### 19. Handle the Empty State

Show a simple message when no marker matches the search and filters.

Status: MVP

## Milestone 5: UX and Responsiveness

Goal: make the experience usable on desktop and mobile.

### Issues

#### 20. Refine the Desktop Layout

Ensure that the sidebar is readable and the map occupies the main space.

Status: MVP

#### 21. Refine the Mobile Layout

Create a simple experience with search at the top and accessible filters.

Status: MVP

#### 22. Improve Marker Visual States

Differentiate normal, hover, and selected markers.

Status: MVP

#### 23. Improve Basic Accessibility

Provide labels, keyboard focus, and acceptable contrast.

Status: MVP

## Milestone 6: Release Preparation

Goal: validate the first version and clearly document how to maintain its data.

### Issues

#### 24. Create a Guide for Adding Markers

Document how to edit `markers.json` and calculate coordinates.

Status: MVP

#### 25. Validate the Initial Data

Check for duplicate IDs, out-of-range coordinates, and missing required fields.

Status: MVP

#### 26. Test the Primary Flow

Verify opening the map, searching, filtering, clicking a marker, and opening the
wiki.

Status: MVP

#### 27. Run Build and Lint

Ensure that `pnpm build` and `pnpm lint` pass.

Status: MVP

#### 28. Review the Final MVP Scope

Confirm that nothing outside the MVP was added, including a backend, login, an
admin panel, or automatic wiki synchronization.

Status: MVP

## Post-MVP

Items that must not be included in the first release.

### Future Issues

#### 29. Add Marker Clustering

Status: Post-MVP

#### 30. Add Fuzzy Search with Fuse.js

Status: Post-MVP

#### 31. Create Shareable URLs for the Selected Marker

Status: Post-MVP

#### 32. Create a Simple Admin Panel

Status: Post-MVP

#### 33. Create a Visual Coordinate Editor

Status: Post-MVP

#### 34. Separate Entities from Markers

Status: Post-MVP

#### 35. Add Relationships with Drops, Quests, and Items

Status: Post-MVP

#### 36. Improve Wiki Integration

Status: Post-MVP

#### 37. Add Favorites

Status: Optional

#### 38. Add Comments or Community Notes

Status: Optional

## Recommended Order

1. Project foundation
2. Navigable map
3. Data and markers
4. Search and filters
5. UX and responsiveness
6. Release preparation

## Smallest Releasable Version

To release as soon as possible, complete only:

- issues 1 through 4;
- issues 5 through 8;
- issues 9 through 14;
- issues 15, 16, 18, and 19;
- issues 20, 21, and 23;
- issues 24 through 28.

Issue 17, the results list, adds significant value but can be cut if an even
smaller release is necessary.
