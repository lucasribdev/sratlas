import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { maps } from "@/data/maps";
import { markers } from "@/data/markers";
import type { GameMap } from "@/domain/map";
import type { MapMarker } from "@/domain/marker";
import { defaultMapId, resolveActiveMap } from "@/lib/map-selection";
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
  const [activeMapId] = useState<GameMap["id"]>(defaultMapId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(
    () => new Set(areaOptions),
  );
  const [selectedMarkerId, setSelectedMarkerId] = useState<MapMarker["id"]>();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const activeMap = resolveActiveMap(maps, activeMapId);

  const searchSuggestions = useMemo(
    () => getSearchSuggestions(searchIndex, searchQuery),
    [searchQuery],
  );

  const filteredMarkers = markers.filter(
    (marker) =>
      markerMatchesSearch(marker, searchQuery) &&
      (marker.area ? selectedAreas.has(marker.area) : false),
  );

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
    setSelectedMarkerId(markerId);
    setIsMobileFiltersOpen(false);
  }

  function selectSearchEntry(entry: SearchEntry) {
    const selection = resolveSearchEntrySelection(entry, filteredMarkers);

    setSearchQuery(selection.searchQuery);

    if (selection.selectedMarkerId) {
      selectMarker(selection.selectedMarkerId);
    } else {
      setSelectedMarkerId(undefined);
      setIsMobileFiltersOpen(false);
    }
  }

  return (
    <main className="flex h-svh min-h-svh overflow-hidden bg-muted">
      <div className="hidden min-h-0 min-[761px]:flex">
        <Sidebar
          areaOptions={areaOptions}
          onClearAreas={clearAreas}
          onMarkerSelect={selectMarker}
          onSearchQueryChange={setSearchQuery}
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
                onSearchQueryChange={setSearchQuery}
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
          activeMap={activeMap}
          markers={filteredMarkers}
          onMarkerSelect={selectMarker}
          selectedMarkerId={selectedMarkerId}
        />
      </section>
    </main>
  );
}
