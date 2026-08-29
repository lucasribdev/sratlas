import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { markers } from "@/data/markers";
import type { MapMarker } from "@/domain/marker";
import {
  markerAreaOptions,
  markerMatchesQuickFilter,
  quickFilters,
  type QuickFilterId,
} from "@/lib/marker-filters";
import { markerMatchesSearch } from "@/lib/marker-search";
import { GameMapView } from "@/components/map/GameMapView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

const areaOptions = markerAreaOptions(markers);

export function AppLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(
    () => new Set(areaOptions),
  );
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<
    Set<QuickFilterId>
  >(() => new Set());
  const [selectedMarkerId, setSelectedMarkerId] = useState<MapMarker["id"]>();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const filteredMarkers = markers.filter(
    (marker) =>
      markerMatchesSearch(marker, searchQuery) &&
      (marker.area ? selectedAreas.has(marker.area) : false) &&
      Array.from(selectedQuickFilters).every((filterId) =>
        markerMatchesQuickFilter(marker, filterId),
      ),
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

  function toggleQuickFilter(filterId: QuickFilterId) {
    setSelectedQuickFilters((currentFilterIds) => {
      const nextFilterIds = new Set(currentFilterIds);

      if (nextFilterIds.has(filterId)) {
        nextFilterIds.delete(filterId);
      } else {
        nextFilterIds.add(filterId);
      }

      return nextFilterIds;
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

  return (
    <main className="flex h-svh min-h-svh overflow-hidden bg-muted">
      <div className="hidden min-h-0 min-[761px]:flex">
        <Sidebar
          areaOptions={areaOptions}
          onClearAreas={clearAreas}
          onMarkerSelect={selectMarker}
          onSearchQueryChange={setSearchQuery}
          onSelectAllAreas={selectAllAreas}
          onToggleArea={toggleArea}
          onToggleQuickFilter={toggleQuickFilter}
          quickFilters={quickFilters}
          markers={filteredMarkers}
          searchQuery={searchQuery}
          selectedAreas={selectedAreas}
          selectedQuickFilters={selectedQuickFilters}
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
          <label className="grid min-w-0">
            <span className="sr-only">Search the map</span>
            <Input
              className="h-11 bg-background shadow-lg shadow-slate-950/15"
              type="search"
              placeholder="Search area, resource or monster"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          <Sheet
            open={isMobileFiltersOpen}
            onOpenChange={setIsMobileFiltersOpen}
          >
            <SheetTrigger
              render={
                <Button
                  className="h-11 shadow-lg shadow-slate-950/15"
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
                onSelectAllAreas={selectAllAreas}
                onToggleArea={toggleArea}
                onToggleQuickFilter={toggleQuickFilter}
                quickFilters={quickFilters}
                markers={filteredMarkers}
                searchQuery={searchQuery}
                selectedAreas={selectedAreas}
                selectedQuickFilters={selectedQuickFilters}
              />
            </SheetContent>
          </Sheet>
        </div>

        <GameMapView
          markers={filteredMarkers}
          onMarkerSelect={selectMarker}
          selectedMarkerId={selectedMarkerId}
        />
      </section>
    </main>
  );
}
