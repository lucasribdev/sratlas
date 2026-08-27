import type { MapMarker } from '../../domain/marker'
import type { QuickFilterId } from '../../lib/marker-filters'

type SidebarProps = {
  areaOptions: string[]
  isMobileOpen: boolean
  markers: MapMarker[]
  onClearFilters: () => void
  onCloseMobileFilters: () => void
  onMarkerSelect: (markerId: MapMarker['id']) => void
  onSearchQueryChange: (query: string) => void
  onSelectAllAreas: () => void
  onToggleArea: (area: string) => void
  onToggleQuickFilter: (filterId: QuickFilterId) => void
  quickFilters: ReadonlyArray<{ id: QuickFilterId; label: string }>
  searchQuery: string
  selectedAreas: ReadonlySet<string>
  selectedQuickFilters: ReadonlySet<QuickFilterId>
}

export function Sidebar({
  areaOptions,
  isMobileOpen,
  markers,
  onClearFilters,
  onCloseMobileFilters,
  onMarkerSelect,
  onSearchQueryChange,
  onSelectAllAreas,
  onToggleArea,
  onToggleQuickFilter,
  quickFilters,
  searchQuery,
  selectedAreas,
  selectedQuickFilters,
}: SidebarProps) {
  return (
    <aside
      className={`sidebar${isMobileOpen ? ' sidebar--mobile-open' : ''}`}
      aria-label="Busca, filtros e resultados"
    >
      <header className="sidebar-header">
        <div>
          <p className="app-kicker">Soul's Remnant</p>
          <h1>Mapa Interativo</h1>
        </div>
        <button
          className="sidebar-close"
          type="button"
          onClick={onCloseMobileFilters}
          aria-label="Fechar filtros"
        >
          Fechar
        </button>
      </header>

      <label className="search-control">
        <span>Busca</span>
        <input
          type="search"
          placeholder="Buscar NPC, area ou recurso"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
        />
      </label>

      <section className="sidebar-section" aria-labelledby="filters-title">
        <div className="section-heading">
          <h2 id="filters-title">Filtros</h2>
          <div className="filter-actions">
            <button type="button" onClick={onSelectAllAreas}>
              Todas areas
            </button>
            <button type="button" onClick={onClearFilters}>
              Limpar
            </button>
          </div>
        </div>

        <div className="filter-group" aria-label="Areas e regioes">
          <h3>Areas</h3>
          <div className="filter-list">
            {areaOptions.map((area) => (
              <label className="filter-option" key={area}>
                <input
                  type="checkbox"
                  checked={selectedAreas.has(area)}
                  onChange={() => onToggleArea(area)}
                />
                <span>{area}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group" aria-label="Filtros rapidos">
          <h3>Rapidos</h3>
          <div className="filter-list">
            {quickFilters.map((filter) => (
              <label className="filter-option" key={filter.id}>
                <input
                  type="checkbox"
                  checked={selectedQuickFilters.has(filter.id)}
                  onChange={() => onToggleQuickFilter(filter.id)}
                />
                <span>{filter.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="sidebar-section" aria-labelledby="results-title">
        <div className="section-heading">
          <h2 id="results-title">Resultados</h2>
          <span className="result-count">{markers.length}</span>
        </div>

        {markers.length > 0 ? (
          <ol className="result-list">
            {markers.map((marker) => {
              const details = [marker.area, marker.zoneType, marker.level ? `Level ${marker.level}` : undefined]
                .filter(Boolean)
                .join(' · ')

              return (
                <li className="result-item" key={marker.id}>
                  <button type="button" onClick={() => onMarkerSelect(marker.id)}>
                    <strong>{marker.name}</strong>
                    {details ? <span>{details}</span> : null}
                  </button>
                </li>
              )
            })}
          </ol>
        ) : (
          <div className="empty-state">Nenhum marcador encontrado para a busca e filtros atuais.</div>
        )}
      </section>
    </aside>
  )
}
