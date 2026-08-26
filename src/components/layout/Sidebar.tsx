const categoryGroups = ['Locais', 'NPCs', 'Inimigos', 'Recursos']

export function Sidebar() {
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
          <button type="button" disabled>
            Limpar
          </button>
        </div>

        <div className="filter-list">
          {categoryGroups.map((category) => (
            <label className="filter-option" key={category}>
              <input type="checkbox" checked disabled readOnly />
              <span>{category}</span>
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
