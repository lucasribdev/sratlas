import { MapPlaceholder } from '../map/MapPlaceholder'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <main className="app-shell">
      <Sidebar />

      <section className="map-panel" aria-label="Area principal do mapa">
        <div className="mobile-toolbar" aria-label="Controles compactos">
          <label className="search-control search-control--compact">
            <span className="visually-hidden">Buscar no mapa</span>
            <input type="search" placeholder="Buscar NPC, area ou recurso" disabled />
          </label>
          <button className="toolbar-button" type="button" disabled>
            Filtros
          </button>
        </div>

        <MapPlaceholder />
      </section>
    </main>
  )
}
