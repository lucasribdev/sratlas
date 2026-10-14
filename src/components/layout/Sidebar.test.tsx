import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { GameMap } from '@/domain/map'
import { Sidebar } from './Sidebar'

describe('global results', () => {
  it('identifies the owning map for each occurrence of a repeated marker name', () => {
    const maps: GameMap[] = [
      { id: 'surface', name: 'Surface', width: 100, height: 100, imageUrl: '/surface.webp' },
      { id: 'caves', name: 'Caves', width: 200, height: 300, imageUrl: '/caves.webp' },
    ]
    const markup = renderToStaticMarkup(
      <Sidebar
        mapsById={new Map(maps.map((map) => [map.id, map]))}
        markers={maps.map((map) => ({ id: `${map.id}-camp`, name: 'Camp', mapId: map.id, x: 50, y: 50 }))}
        areaOptions={[]}
        selectedAreas={new Set()}
        searchQuery="Camp"
        searchSuggestions={[]}
        onClearAreas={vi.fn()}
        onMarkerSelect={vi.fn()}
        onSearchQueryChange={vi.fn()}
        onSearchSuggestionSelect={vi.fn()}
        onSelectAllAreas={vi.fn()}
        onToggleArea={vi.fn()}
      />,
    )
    const results = markup.match(/<ol\b[\s\S]*?<\/ol>/)?.[0]
    expect(results).toContain('Surface')
    expect(results).toContain('Caves')
    expect(results?.match(/>Camp</g)).toHaveLength(2)
  })
})
