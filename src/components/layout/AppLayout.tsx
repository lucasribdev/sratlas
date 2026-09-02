import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { maps } from "@/data/maps";
import { markers } from "@/data/markers";
import type { GameMap } from "@/domain/map";
import type { MapMarker } from "@/domain/marker";
import { defaultMapId, resolveActiveMap } from "@/lib/map-selection";
import {
  filterMarkersForMap,
  filterMatchingMarkers,
  markerAreaOptions,
  scopeSearchResults,
} from "@/lib/marker-filters";
import { buildSearchIndex, getSearchSuggestions, type SearchEntry } from "@/lib/search-index";
import {
  resolveMarkerNavigation,
  resolveSearchEntrySelection,
  type MarkerNavigation,
} from "@/lib/search-selection";
import { GameMapView } from "@/components/map/GameMapView";
import { MapSelector } from "@/components/map/MapSelector";
import { Button } from "@/components/ui/button";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

const areaOptions = markerAreaOptions(markers);
const searchIndex = buildSearchIndex(markers);

type MapSelectionState = {
  activeMapId: GameMap["id"];
  selectedMarkerId?: MapMarker["id"];
};

export function AppLayout() {
  const [mapSelection, setMapSelection] = useState<MapSelectionState>({
    activeMapId: defaultMapId,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(
    () => new Set(areaOptions),
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const activeMap = resolveActiveMap(maps, mapSelection.activeMapId);

  const searchSuggestions = useMemo(
    () => getSearchSuggestions(searchIndex, searchQuery),
    [searchQuery],
  );

  const matchingMarkers = filterMatchingMarkers(
    markers,
    maps,
    searchQuery,
    selectedAreas,
  );
  const visibleMarkers = filterMarkersForMap(matchingMarkers, activeMap.id);
  const resultMarkers = scopeSearchResults(
    matchingMarkers,
    activeMap.id,
    searchQuery,
  );
  const activeMapMarkers = filterMarkersForMap(markers, activeMap.id);

  function toggleArea(area: string) {
    setSelectedAreas((currentAreas) => {
      const nextAreas = new Set(currentAreas);

      if (nextAreas.has(area)) {
        nextAreas.delete(area);
      } else {
        nextAreas.add(area);
      }

      return nextAreas;
    });
  }

  function selectAllAreas() {
    setSelectedAreas(new Set(areaOptions));
  }

  function clearAreas() {
    setSelectedAreas(new Set());
  }

  function selectMarker(markerId: MapMarker["id"]) {
    const navigation = resolveMarkerNavigation(
      markerId,
      markers,
      maps,
      selectedAreas,
    );

    if (!navigation) {
      return;
    }

    navigateToMarker(navigation);
  }

  function navigateToMarker(navigation: MarkerNavigation) {
    setMapSelection(navigation);
    setIsMobileFiltersOpen(false);
  }

  function changeMap(mapId: GameMap["id"]) {
    setMapSelection((currentSelection) =>
      mapId === currentSelection.activeMapId
        ? currentSelection
        : { activeMapId: mapId },
    );
  }

  function selectSearchEntry(entry: SearchEntry) {
    const selection = resolveSearchEntrySelection(
      entry,
      markers,
      maps,
      selectedAreas,
    );

    setSearchQuery(selection.searchQuery);

    if (selection.navigation) {
      navigateToMarker(selection.navigation);
    } else {
      setMapSelection((currentSelection) => ({
        activeMapId: currentSelection.activeMapId,
      }));
      setIsMobileFiltersOpen(false);
    }
  }

  return (
    <main className="flex h-svh min-h-svh overflow-hidden bg-muted">
      <div className="hidden min-h-0 min-[761px]:flex">
        <Sidebar
          areaOptions={areaOptions}
          mapSelector={
            <MapSelector
              activeMapId={activeMap.id}
              maps={maps}
              onMapChange={changeMap}
            />
          }
          onClearAreas={clearAreas}
          onMarkerSelect={selectMarker}
          onSearchQueryChange={setSearchQuery}
          onSearchSuggestionSelect={selectSearchEntry}
          onSelectAllAreas={selectAllAreas}
          onToggleArea={toggleArea}
          markers={resultMarkers}
          maps={maps}
          searchQuery={searchQuery}
          searchSuggestions={searchSuggestions}
          selectedAreas={selectedAreas}
          showMapContext={Boolean(searchQuery.trim())}
        />
      </div>

      <section
        className="relative flex min-h-0 min-w-0 flex-1"
        aria-label="Main map area"
      >
        <div
          className="absolute top-3 right-3 left-3 z-[500] grid grid-cols-[minmax(0,1fr)_6.75rem_auto] gap-2 min-[761px]:hidden"
          aria-label="Compact controls"
        >
          <SearchAutocomplete
            className="gap-0"
            inputClassName="h-11 !border-border !bg-card text-card-foreground shadow-lg shadow-slate-950/15 placeholder:text-muted-foreground dark:!border-border dark:!bg-card"
            label="Search the map"
            labelClassName="sr-only"
            onQueryChange={setSearchQuery}
            onSelect={selectSearchEntry}
            placeholder="Search NPC, resource, monster or area"
            query={searchQuery}
            suggestions={searchSuggestions}
          />
          <MapSelector
            activeMapId={activeMap.id}
            className="gap-0"
            labelClassName="sr-only"
            maps={maps}
            onMapChange={changeMap}
            selectClassName="h-11 border-border bg-card shadow-lg shadow-slate-950/15"
          />
          <Sheet
            open={isMobileFiltersOpen}
            onOpenChange={setIsMobileFiltersOpen}
          >
            <SheetTrigger
              render={
                <Button
                  aria-label="Filters"
                  className="size-11 !border-border !bg-card text-card-foreground shadow-lg shadow-slate-950/15 hover:!bg-muted dark:!border-border dark:!bg-card dark:hover:!bg-muted"
                  type="button"
                  variant="outline"
                />
              }
            >
              <SlidersHorizontal aria-hidden="true" />
            </SheetTrigger>
            <SheetContent
              className="w-[min(390px,calc(100vw-32px))] max-w-none gap-0 p-0 data-[side=left]:w-[min(390px,calc(100vw-32px))]"
              side="left"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Search, filters, and results</SheetTitle>
              </SheetHeader>
              <Sidebar
                areaOptions={areaOptions}
                onClearAreas={clearAreas}
                onMarkerSelect={selectMarker}
                onSearchQueryChange={setSearchQuery}
                onSearchSuggestionSelect={selectSearchEntry}
                onSelectAllAreas={selectAllAreas}
                onToggleArea={toggleArea}
                markers={resultMarkers}
                maps={maps}
                searchQuery={searchQuery}
                searchSuggestions={searchSuggestions}
                selectedAreas={selectedAreas}
                showMapContext={Boolean(searchQuery.trim())}
              />
            </SheetContent>
          </Sheet>
        </div>

        <GameMapView
          activeMap={activeMap}
          hasAvailableMarkers={activeMapMarkers.length > 0}
          markers={visibleMarkers}
          onMarkerSelect={selectMarker}
          selectedMarkerId={mapSelection.selectedMarkerId}
        />
      </section>
    </main>
  );
}
