import type { GameMap } from '@/domain/map'
import type { MapMarker } from '@/domain/marker'

export type MapNavigationState = {
  activeMapId: GameMap['id']
  selectedMarkerId?: MapMarker['id']
  requestId: number
}

type MapNavigationAction =
  | { type: 'selectMap'; mapId: GameMap['id'] }
  | { type: 'selectMarker'; marker: MapMarker }
  | { type: 'clearSelection' }

export function createMapNavigation(maps: readonly GameMap[]): MapNavigationState {
  const firstMap = maps[0]
  if (!firstMap) throw new Error('At least one map configuration is required.')
  return { activeMapId: firstMap.id, requestId: 0 }
}

export function mapNavigationReducer(
  state: MapNavigationState,
  action: MapNavigationAction,
): MapNavigationState {
  switch (action.type) {
    case 'selectMap':
      return action.mapId === state.activeMapId
        ? state
        : { ...state, activeMapId: action.mapId, selectedMarkerId: undefined }
    case 'selectMarker':
      return {
        activeMapId: action.marker.mapId,
        selectedMarkerId: action.marker.id,
        requestId: state.requestId + 1,
      }
    case 'clearSelection':
      return { ...state, selectedMarkerId: undefined }
  }
}
