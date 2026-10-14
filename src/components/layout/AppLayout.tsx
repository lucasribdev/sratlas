import { useMemo, useReducer, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { maps } from "@/data/maps";
import { createMapNavigation, mapNavigationReducer } from "@/application/map-navigation";
import { MapSelector } from "@/components/maps/MapSelector";
import { markers } from "@/data/markers";
import type { MapMarker } from "@/domain/marker";
import { markerAreaOptions } from "@/lib/marker-filters";
import { markerMatchesSearch } from "@/lib/marker-search";
import { buildSearchIndex, getSearchSuggestions, type SearchEntry } from "@/lib/search-index";
import { resolveSearchEntrySelection } from "@/lib/search-selection";
import { GameMapView } from "@/components/map/GameMapView";
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

export function AppLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(
    () => new Set(areaOptions),
  );
  const [navigation, dispatchNavigation] = useReducer(
    mapNavigationReducer,
    maps,
    createMapNavigation,
  );
  const { activeMapId, selectedMarkerId, requestId } = navigation;
  const activeMap = maps.find((map) => map.id === activeMapId)!;
  const selectedMarker = markers.find(
    (marker) => marker.id === selectedMarkerId,
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const searchSuggestions = useMemo(
    () => getSearchSuggestions(searchIndex, searchQuery),
    [searchQuery],
  );

  const filteredMarkers = markers.filter(
    (marker) =>
      markerMatchesSearch(marker, searchQuery) &&
      (marker.area ? selectedAreas.has(marker.area) : false),
  );

  const renderedMarkers = filteredMarkers.filter(
    (marker) => marker.mapId === activeMapId,
  );

  function changeMap(mapId: string) {
    if (maps.some((map) => map.id === mapId)) {
      dispatchNavigation({ type: "selectMap", mapId });
    }
  }

  function changeSearchQuery(query: string) {
    setSearchQuery(query);
    dispatchNavigation({ type: "clearSelection" });
  }

  function toggleArea(area: string) {
    dispatchNavigation({ type: "clearSelection" });
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
    dispatchNavigation({ type: "clearSelection" });
    setSelectedAreas(new Set(areaOptions));
  }

  function clearAreas() {
    dispatchNavigation({ type: "clearSelection" });
    setSelectedAreas(new Set());
  }

  function selectMarker(markerId: MapMarker["id"]) {
    const marker = markers.find((candidate) => candidate.id === markerId);
    if (!marker) return;
    dispatchNavigation({ type: "selectMarker", marker });
    setIsMobileFiltersOpen(false);
  }

  function selectSearchEntry(entry: SearchEntry) {
    const selection = resolveSearchEntrySelection(entry, filteredMarkers);

    setSearchQuery(selection.searchQuery);

    if (selection.selectedMarkerId) {
      selectMarker(selection.selectedMarkerId);
    } else {
      dispatchNavigation({ type: "clearSelection" });
      setIsMobileFiltersOpen(false);
    }
  }

  return (
    <main className="flex h-svh min-h-svh overflow-hidden bg-muted">
      <div className="hidden min-h-0 min-[761px]:flex">
        <Sidebar
          mapSelector={
            <MapSelector maps={maps} activeMapId={activeMapId} onMapChange={changeMap} />
          }
          areaOptions={areaOptions}
          onClearAreas={clearAreas}
          onMarkerSelect={selectMarker}
          onSearchQueryChange={changeSearchQuery}
          onSearchSuggestionSelect={selectSearchEntry}
          onSelectAllAreas={selectAllAreas}
          onToggleArea={toggleArea}
          markers={filteredMarkers}
          searchQuery={searchQuery}
          searchSuggestions={searchSuggestions}
          selectedAreas={selectedAreas}
        />
      </div>

      <section
        className="relative flex min-h-0 min-w-0 flex-1"
        aria-label="Main map area"
      >
        <div
          className="absolute top-3 right-3 left-3 z-[500] grid grid-cols-[minmax(0,1fr)_auto] gap-2 min-[761px]:hidden"
          aria-label="Compact controls"
        >
          <div className="col-span-2 rounded-md bg-card p-2 shadow-lg shadow-slate-950/15">
            <MapSelector
              maps={maps}
              activeMapId={activeMapId}
              onMapChange={changeMap}
            />
          </div>
          <SearchAutocomplete
            className="gap-0"
            inputClassName="h-11 !border-border !bg-card text-card-foreground shadow-lg shadow-slate-950/15 placeholder:text-muted-foreground dark:!border-border dark:!bg-card"
            label="Search the map"
            labelClassName="sr-only"
            onQueryChange={changeSearchQuery}
            onSelect={selectSearchEntry}
            placeholder="Search NPC, resource, monster or area"
            query={searchQuery}
            suggestions={searchSuggestions}
          />
          <Sheet
            open={isMobileFiltersOpen}
            onOpenChange={setIsMobileFiltersOpen}
          >
            <SheetTrigger
              render={
                <Button
                  className="h-11 !border-border !bg-card text-card-foreground shadow-lg shadow-slate-950/15 hover:!bg-muted dark:!border-border dark:!bg-card dark:hover:!bg-muted"
                  type="button"
                  variant="outline"
                />
              }
            >
              <SlidersHorizontal aria-hidden="true" />
              Filters
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
                onSearchQueryChange={changeSearchQuery}
                onSearchSuggestionSelect={selectSearchEntry}
                onSelectAllAreas={selectAllAreas}
                onToggleArea={toggleArea}
                markers={filteredMarkers}
                searchQuery={searchQuery}
                searchSuggestions={searchSuggestions}
                selectedAreas={selectedAreas}
              />
            </SheetContent>
          </Sheet>
        </div>

        <GameMapView
          map={activeMap}
          markers={renderedMarkers}
          onMarkerSelect={selectMarker}
          selectedMarker={selectedMarker}
          navigationRequestId={requestId}
        />
      </section>
    </main>
  );
}
