import { useState } from 'react'
import { categories } from '../../data/categories'
import type { MarkerCategory } from '../../domain/category'
import { MapPlaceholder } from '../map/MapPlaceholder'
import { Sidebar } from './Sidebar'

const allCategoryIds = categories.map((category) => category.id)

export function AppLayout() {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<MarkerCategory['id']>>(
    () => new Set(allCategoryIds),
  )

  function toggleCategory(categoryId: MarkerCategory['id']) {
    setSelectedCategoryIds((currentCategoryIds) => {
      const nextCategoryIds = new Set(currentCategoryIds)

      if (nextCategoryIds.has(categoryId)) {
        nextCategoryIds.delete(categoryId)
      } else {
        nextCategoryIds.add(categoryId)
      }

      return nextCategoryIds
    })
  }

  function selectAllCategories() {
    setSelectedCategoryIds(new Set(allCategoryIds))
  }

  function clearCategories() {
    setSelectedCategoryIds(new Set())
  }

  return (
    <main className="app-shell">
      <Sidebar
        categories={categories}
        onClearCategories={clearCategories}
        onSelectAllCategories={selectAllCategories}
        onToggleCategory={toggleCategory}
        selectedCategoryIds={selectedCategoryIds}
      />

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

        <MapPlaceholder selectedCategoryIds={selectedCategoryIds} />
      </section>
    </main>
  )
}
