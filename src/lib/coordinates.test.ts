import { describe, expect, it } from 'vitest'
import { mapBoundsFromDimensions, percentageToLeafletLatLng } from './coordinates'

describe('map coordinate adaptation', () => {
  it.each([
    { width: 800, height: 600 },
    { width: 1200, height: 400 },
  ])('uses the received map dimensions: $width × $height', (map) => {
    expect(mapBoundsFromDimensions(map)).toEqual([[0, 0], [map.height, map.width]])
    expect(percentageToLeafletLatLng({ x: 0, y: 0 }, map)).toEqual([map.height, 0])
    expect(percentageToLeafletLatLng({ x: 100, y: 100 }, map)).toEqual([0, map.width])
    expect(percentageToLeafletLatLng({ x: 25, y: 75 }, map)).toEqual([map.height * 0.25, map.width * 0.25])
  })
})
