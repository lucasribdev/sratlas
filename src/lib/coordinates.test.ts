import { describe, expect, it } from 'vitest'
import { percentageToLeafletLatLng } from '@/lib/coordinates'

describe('percentageToLeafletLatLng', () => {
  it('converts normalized coordinates using the active map dimensions', () => {
    const activeMapDimensions = { width: 2000, height: 1000 }

    expect(percentageToLeafletLatLng({ x: 25, y: 40 }, activeMapDimensions)).toEqual([
      600,
      500,
    ])
  })
})
