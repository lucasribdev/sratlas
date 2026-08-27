import type { MarkerCategory } from '../../domain/category'

type SidebarProps = {
  categories: MarkerCategory[]
  onClearCategories: () => void
  onSelectAllCategories: () => void
  onToggleCategory: (categoryId: MarkerCategory['id']) => void
  selectedCategoryIds: ReadonlySet<MarkerCategory['id']>
}

export function Sidebar({
  categories,
  onClearCategories,
  onSelectAllCategories,
  onToggleCategory,
  selectedCategoryIds,
}: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Busca, filtros e resultados">
      <header className="sidebar-header">
        <p className="app-kicker">Soul's Remnant</p>
        <h1>Mapa Interativo</h1>
      </header>

      <label className="search-control">
        <span>Busca</span>
        <input type="search" placeholder="Buscar NPC, area ou recurso" disabled />
      </label>

      <section className="sidebar-section" aria-labelledby="filters-title">
        <div className="section-heading">
          <h2 id="filters-title">Filtros</h2>
          <div className="filter-actions">
            <button type="button" onClick={onSelectAllCategories}>
              Todas
            </button>
            <button type="button" onClick={onClearCategories}>
              Limpar
            </button>
          </div>
        </div>

        <div className="filter-list">
          {categories.map((category) => (
            <label className="filter-option" key={category.id}>
              <input
                type="checkbox"
                checked={selectedCategoryIds.has(category.id)}
                onChange={() => onToggleCategory(category.id)}
              />
              <span>{category.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="sidebar-section" aria-labelledby="results-title">
        <div className="section-heading">
          <h2 id="results-title">Resultados</h2>
          <span className="result-count">0</span>
        </div>

        <div className="empty-state">
          Os resultados aparecerao aqui quando os dados e a busca forem adicionados.
        </div>
      </section>
    </aside>
  )
}
