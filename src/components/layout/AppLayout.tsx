import { useState } from 'react'
import { markers } from '../../data/markers'
import type { MapMarker } from '../../domain/marker'
import {
  markerAreaOptions,
  markerMatchesQuickFilter,
  quickFilters,
  type QuickFilterId,
} from '../../lib/marker-filters'
import { markerMatchesSearch } from '../../lib/marker-search'
import { MapPlaceholder } from '../map/MapPlaceholder'
import { Sidebar } from './Sidebar'

const areaOptions = markerAreaOptions(markers)

export function AppLayout() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(() => new Set())
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<Set<QuickFilterId>>(
    () => new Set(),
  )
  const [selectedMarkerId, setSelectedMarkerId] = useState<MapMarker['id']>()
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const filteredMarkers = markers.filter(
    (marker) =>
      markerMatchesSearch(marker, searchQuery) &&
      (selectedAreas.size === 0 || (marker.area ? selectedAreas.has(marker.area) : false)) &&
      Array.from(selectedQuickFilters).every((filterId) =>
        markerMatchesQuickFilter(marker, filterId),
      ),
  )

  function toggleArea(area: string) {
    setSelectedAreas((currentAreas) => {
      const nextAreas = new Set(currentAreas)

      if (nextAreas.has(area)) {
        nextAreas.delete(area)
      } else {
        nextAreas.add(area)
      }

      return nextAreas
    })
  }

  function toggleQuickFilter(filterId: QuickFilterId) {
    setSelectedQuickFilters((currentFilterIds) => {
      const nextFilterIds = new Set(currentFilterIds)

      if (nextFilterIds.has(filterId)) {
        nextFilterIds.delete(filterId)
      } else {
        nextFilterIds.add(filterId)
      }

      return nextFilterIds
    })
  }

  function selectAllAreas() {
    setSelectedAreas(new Set(areaOptions))
  }

  function clearFilters() {
    setSelectedAreas(new Set())
    setSelectedQuickFilters(new Set())
  }

  function selectMarker(markerId: MapMarker['id']) {
    setSelectedMarkerId(markerId)
    setIsMobileFiltersOpen(false)
  }

  return (
    <main className="app-shell">
      <Sidebar
        areaOptions={areaOptions}
        isMobileOpen={isMobileFiltersOpen}
        onClearFilters={clearFilters}
        onCloseMobileFilters={() => setIsMobileFiltersOpen(false)}
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

      <section className="map-panel" aria-label="Area principal do mapa">
        <div className="mobile-toolbar" aria-label="Controles compactos">
          <label className="search-control search-control--compact">
            <span className="visually-hidden">Buscar no mapa</span>
            <input
              type="search"
              placeholder="Buscar NPC, area ou recurso"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          <button
            className="toolbar-button"
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            Filtros
          </button>
        </div>

        <MapPlaceholder
          markers={filteredMarkers}
          onMarkerSelect={selectMarker}
          selectedMarkerId={selectedMarkerId}
        />
      </section>
    </main>
  )
}
