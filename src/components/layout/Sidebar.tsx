import type { MapMarker } from '../../domain/marker'
import type { QuickFilterId } from '../../lib/marker-filters'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { cn } from '../../lib/utils'

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
      className={cn(
        'z-[1] flex w-[360px] min-w-80 flex-col gap-5 border-r border-border bg-background p-6 shadow-[8px_0_24px_rgb(30_41_59_/_0.08)]',
        'max-[760px]:fixed max-[760px]:inset-y-0 max-[760px]:left-0 max-[760px]:z-[1100] max-[760px]:w-[min(360px,calc(100vw-48px))] max-[760px]:max-h-svh max-[760px]:overflow-auto max-[760px]:transition-transform max-[760px]:duration-150',
        isMobileOpen
          ? 'max-[760px]:translate-x-0'
          : 'max-[760px]:-translate-x-[calc(100%+16px)]',
      )}
      aria-label="Busca, filtros e resultados"
    >
      <header className="grid gap-1.5 max-[760px]:grid-cols-[minmax(0,1fr)_auto] max-[760px]:items-start">
        <div className="grid gap-1">
          <p className="text-xs font-bold tracking-normal text-primary uppercase">Soul's Remnant</p>
          <h1 className="text-2xl leading-tight font-bold text-foreground">Mapa Interativo</h1>
        </div>
        <Button
          className="hidden max-[760px]:inline-flex"
          type="button"
          variant="outline"
          size="sm"
          onClick={onCloseMobileFilters}
          aria-label="Fechar filtros"
        >
          Fechar
        </Button>
      </header>

      <label className="grid gap-2 text-sm font-semibold text-foreground">
        <span>Busca</span>
        <Input
          className="h-10 bg-card"
          type="search"
          placeholder="Buscar NPC, area ou recurso"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
        />
      </label>

      <Separator />

      <section className="grid gap-4" aria-labelledby="filters-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="filters-title" className="text-sm leading-tight font-bold text-foreground">
            Filtros
          </h2>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onSelectAllAreas}>
              Todas areas
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
              Limpar
            </Button>
          </div>
        </div>

        <div className="grid gap-2.5" aria-label="Areas e regioes">
          <h3 className="text-xs font-bold tracking-normal text-muted-foreground uppercase">Areas</h3>
          <div className="grid gap-2">
            {areaOptions.map((area) => (
              <label
                className="group/field flex items-center gap-2.5 text-sm text-foreground"
                key={area}
              >
                <Checkbox
                  checked={selectedAreas.has(area)}
                  onCheckedChange={() => onToggleArea(area)}
                />
                <span>{area}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-2.5" aria-label="Filtros rapidos">
          <h3 className="text-xs font-bold tracking-normal text-muted-foreground uppercase">Rapidos</h3>
          <div className="grid gap-2">
            {quickFilters.map((filter) => (
              <label
                className="group/field flex items-center gap-2.5 text-sm text-foreground"
                key={filter.id}
              >
                <Checkbox
                  checked={selectedQuickFilters.has(filter.id)}
                  onCheckedChange={() => onToggleQuickFilter(filter.id)}
                />
                <span>{filter.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      <section className="grid min-h-0 gap-3" aria-labelledby="results-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="results-title" className="text-sm leading-tight font-bold text-foreground">
            Resultados
          </h2>
          <Badge variant="secondary" className="min-w-7 justify-center rounded-full">
            {markers.length}
          </Badge>
        </div>

        {markers.length > 0 ? (
          <ScrollArea className="max-h-[280px] overflow-hidden rounded-lg">
            <ol className="grid gap-2 p-0">
              {markers.map((marker) => {
                const details = [marker.area, marker.zoneType, marker.level ? `Level ${marker.level}` : undefined]
                  .filter(Boolean)
                  .join(' · ')

                return (
                  <li
                    className="overflow-hidden rounded-lg border border-border bg-card"
                    key={marker.id}
                  >
                    <button
                      className="grid w-full gap-1 px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      type="button"
                      onClick={() => onMarkerSelect(marker.id)}
                    >
                      <strong className="text-sm leading-tight font-semibold text-card-foreground">
                        {marker.name}
                      </strong>
                      {details ? (
                        <span className="text-xs leading-snug text-muted-foreground">{details}</span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ol>
          </ScrollArea>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
            Nenhum marcador encontrado para a busca e filtros atuais.
          </div>
        )}
      </section>
    </aside>
  )
}
