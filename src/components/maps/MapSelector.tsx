import { useId } from 'react'
import type { GameMap } from '@/domain/map'

type MapSelectorProps = {
  maps: readonly GameMap[]
  activeMapId: GameMap['id']
  onMapChange: (mapId: GameMap['id']) => void
}

export function MapSelector({ maps, activeMapId, onMapChange }: MapSelectorProps) {
  const id = useId()

  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        Map
      </label>
      <select
        id={id}
        className="h-10 w-full min-w-0 rounded-md border border-border bg-card px-3 text-sm text-card-foreground shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        value={activeMapId}
        onChange={(event) => onMapChange(event.target.value)}
      >
        {maps.map((map) => (
          <option key={map.id} value={map.id}>{map.name}</option>
        ))}
      </select>
    </div>
  )
}
