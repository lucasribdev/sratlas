import { describe, expect, it, vi } from 'vitest'
import type { Map as LeafletMap } from 'leaflet'
import { focusMarker } from './focus-marker'

function adapter(ready = true) {
  let onReady: (() => void) | undefined
  const map = {
    whenReady: vi.fn((callback: () => void) => {
      onReady = callback
      if (ready) callback()
      return map as unknown as LeafletMap
    }),
    off: vi.fn(),
    stop: vi.fn(),
    getZoom: () => 0,
    setView: vi.fn(),
  }
  const marker = { openPopup: vi.fn(), closePopup: vi.fn() }
  return { map, marker, ready: () => onReady?.() }
}

describe('mounted marker navigation', () => {
  const target = { x: 25, y: 75 }
  const dimensions = { width: 1200, height: 400 }

  it('waits for map readiness, centers with destination dimensions, then opens the popup', () => {
    const view = adapter(false)
    focusMarker(view.map, view.marker, target, dimensions)
    expect(view.map.setView).not.toHaveBeenCalled()
    expect(view.marker.openPopup).not.toHaveBeenCalled()
    view.ready()
    expect(view.map.setView).toHaveBeenCalledWith([100, 300], 1.5, { animate: false })
    expect(view.map.setView.mock.invocationCallOrder[0]).toBeLessThan(view.marker.openPopup.mock.invocationCallOrder[0])
  })

  it('recenters and reopens when the same marker receives another request', () => {
    const view = adapter()
    const cancel = focusMarker(view.map, view.marker, target, dimensions)
    cancel()
    focusMarker(view.map, view.marker, target, dimensions)
    expect(view.map.setView).toHaveBeenCalledTimes(2)
    expect(view.marker.openPopup).toHaveBeenCalledTimes(2)
    expect(view.marker.closePopup).toHaveBeenCalledOnce()
  })

  it('cancels pending readiness on selection changes or unmount', () => {
    const view = adapter(false)
    const cancel = focusMarker(view.map, view.marker, target, dimensions)
    cancel()
    view.ready()
    expect(view.map.off).toHaveBeenCalledWith('load', expect.any(Function))
    expect(view.marker.openPopup).not.toHaveBeenCalled()
    expect(view.map.setView).not.toHaveBeenCalled()
  })

  it('ignores late readiness from a previous map after a new target is mounted', () => {
    const previous = adapter(false)
    const destination = adapter(false)
    const cancel = focusMarker(previous.map, previous.marker, target, { width: 800, height: 600 })
    cancel()
    focusMarker(destination.map, destination.marker, target, dimensions)
    destination.ready()
    previous.ready()
    expect(previous.map.setView).not.toHaveBeenCalled()
    expect(previous.marker.openPopup).not.toHaveBeenCalled()
    expect(destination.map.setView).toHaveBeenCalledWith([100, 300], 1.5, { animate: false })
    expect(destination.marker.openPopup).toHaveBeenCalledOnce()
  })

  it('cleans up after MapContainer has removed the map without touching its viewport', () => {
    const view = adapter()
    const cancel = focusMarker(view.map, view.marker, target, dimensions)
    // React Leaflet removes the parent map before child effect cleanup runs.
    view.map.stop.mockImplementation(() => {
      throw new TypeError("Cannot read properties of undefined (reading '_leaflet_pos')")
    })
    expect(cancel).not.toThrow()
    expect(view.map.stop).toHaveBeenCalledOnce()
    expect(view.map.setView).toHaveBeenCalledOnce()
    expect(view.marker.closePopup).toHaveBeenCalledOnce()
    expect(view.map.off).toHaveBeenCalledWith('load', expect.any(Function))
  })
})
