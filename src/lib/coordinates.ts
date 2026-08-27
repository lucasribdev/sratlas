import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet'

export type MapDimensions = {
  width: number
  height: number
}

export type PercentageCoordinates = {
  x: number
  y: number
}

function validatePercentage(value: number, axis: keyof PercentageCoordinates) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`Coordinate ${axis} must be a number from 0 to 100.`)
  }
}

export function percentageToLeafletLatLng(
  coordinates: PercentageCoordinates,
  map: MapDimensions,
): LatLngExpression {
  validatePercentage(coordinates.x, 'x')
  validatePercentage(coordinates.y, 'y')

  return [(coordinates.y / 100) * map.height, (coordinates.x / 100) * map.width]
}

export function mapBoundsFromDimensions(map: MapDimensions): LatLngBoundsExpression {
  return [
    [0, 0],
    [map.height, map.width],
  ]
}
