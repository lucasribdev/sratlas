// @vitest-environment happy-dom

import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const testData = vi.hoisted(() => ({
  maps: [
    {
      id: 'surface',
      name: 'Upper World',
      imageUrl: '/maps/upper.webp',
      width: 1000,
      height: 800,
    },
    {
      id: 'caves',
      name: 'Lower Vault',
      imageUrl: '/maps/lower.webp',
      width: 900,
      height: 700,
    },
  ],
  markers: [
    {
      id: 'surface-shrine',
      name: 'Shared Surface Shrine',
      mapId: 'surface',
      x: 20,
      y: 30,
      area: 'Spawn',
    },
    {
      id: 'surface-plaza',
      name: 'Sunlit Plaza',
      mapId: 'surface',
      x: 40,
      y: 50,
      area: 'Outskirts',
    },
    {
      id: 'cave-chamber',
      name: 'Shared Hidden Chamber',
      mapId: 'caves',
      x: 60,
      y: 70,
      area: 'Spawn',
    },
  ],
  renderedMapStates: [] as Array<{
    activeMapId: string
    selectedMarkerId?: string
  }>,
}))

vi.mock('@/data/maps', () => ({ maps: testData.maps }))
vi.mock('@/data/markers', () => ({ markers: testData.markers }))

vi.mock('@/components/map/GameMapView', () => ({
  GameMapView: ({
    activeMap,
    markers,
    selectedMarkerId,
  }: {
    activeMap: { id: string }
    markers: { id: string; mapId: string }[]
    selectedMarkerId?: string
  }) => {
    testData.renderedMapStates.push({ activeMapId: activeMap.id, selectedMarkerId })

    return (
      <output
        data-active-map-id={activeMap.id}
        data-marker-ids={markers.map((marker) => marker.id).join(',')}
        data-selected-marker-id={selectedMarkerId}
        data-testid="game-map-view"
      />
    )
  },
}))

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import { AppLayout } from './AppLayout'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

function setInputValue(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set

  valueSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('AppLayout cross-map search navigation', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    testData.renderedMapStates.length = 0
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    act(() => root.render(<AppLayout />))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  function desktopSidebar() {
    const sidebar = container.querySelector('aside')

    if (!sidebar) {
      throw new Error('Expected the desktop sidebar.')
    }

    return sidebar
  }

  function resultButtons() {
    return [
      ...desktopSidebar().querySelectorAll<HTMLButtonElement>(
        '[aria-labelledby="results-title"] button',
      ),
    ]
  }

  it('scopes empty-query results to the active map', () => {
    const resultText = resultButtons().map((button) => button.textContent)

    expect(resultText).toEqual([
      expect.stringContaining('Shared Surface Shrine'),
      expect.stringContaining('Sunlit Plaza'),
    ])
    expect(resultText.join(' ')).not.toContain('Shared Hidden Chamber')
  })

  it('shows global matches with official destination map names while searching', () => {
    const searchInput = desktopSidebar().querySelector<HTMLInputElement>(
      'input[type="search"]',
    )

    act(() => {
      if (!searchInput) {
        throw new Error('Expected the desktop search input.')
      }

      setInputValue(searchInput, 'Shared')
    })

    const resultText = resultButtons().map((button) => button.textContent ?? '')

    expect(resultText).toHaveLength(2)
    expect(resultText.find((text) => text.includes('Shared Surface Shrine'))).toContain(
      'Upper World',
    )
    expect(resultText.find((text) => text.includes('Shared Hidden Chamber'))).toContain(
      'Lower Vault',
    )
  })

  it('keeps same-map selection local and atomically targets cross-map selections', () => {
    const surfaceResult = resultButtons().find((button) =>
      button.textContent?.includes('Shared Surface Shrine'),
    )

    act(() => surfaceResult?.click())

    let mapView = container.querySelector('[data-testid="game-map-view"]')

    expect(mapView?.getAttribute('data-active-map-id')).toBe('surface')
    expect(mapView?.getAttribute('data-selected-marker-id')).toBe('surface-shrine')

    const searchInput = desktopSidebar().querySelector<HTMLInputElement>(
      'input[type="search"]',
    )

    act(() => {
      if (!searchInput) {
        throw new Error('Expected the desktop search input.')
      }

      setInputValue(searchInput, 'Shared')
    })

    const caveResult = resultButtons().find((button) =>
      button.textContent?.includes('Shared Hidden Chamber'),
    )

    act(() => caveResult?.click())

    mapView = container.querySelector('[data-testid="game-map-view"]')

    expect(mapView?.getAttribute('data-active-map-id')).toBe('caves')
    expect(mapView?.getAttribute('data-selected-marker-id')).toBe('cave-chamber')
    expect(mapView?.getAttribute('data-marker-ids')).toBe('cave-chamber')
    expect(testData.renderedMapStates).not.toContainEqual({
      activeMapId: 'surface',
      selectedMarkerId: 'cave-chamber',
    })
  })
})
