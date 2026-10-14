import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { importDataMap, parseDescription } from './import-datamap.mjs'

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'))
const [source, markers, areas, maps] = await Promise.all(['../data/imports/wiki-world-map.json', '../src/data/markers.json', '../src/data/areas.json', '../src/data/maps.json'].map(readJson))

describe('offline DataMaps import', () => {
  it('parses all source markers without dropping unsupported description lines', () => {
    const result = importDataMap(source, [], [], maps)
    expect(result.markers).toHaveLength(105)
    expect(result.markers.filter((marker) => marker.mapId === 'surface')).toHaveLength(83)
    expect(result.markers.filter((marker) => marker.mapId === 'caves')).toHaveLength(22)
    expect(new Set(result.markers.map((marker) => marker.id)).size).toBe(105)
    const spawn = result.markers.find((marker) => marker.mapId === 'caves' && marker.name === 'Spawn')
    expect(spawn).toMatchObject({ area: 'Spawn', level: '0', warpPoint: true, monsters: [] })
    expect(spawn.resources[0].items.map((item) => item.name)).toEqual(['Clam', 'Shrimp', 'Trout'])
    const cave = result.markers.find((marker) => marker.name === 'Cave 1')
    expect(cave.x).toBeCloseTo(529 / 1076 * 100, 5)
    expect(cave.y).toBeCloseTo(228 / 1056 * 100, 5)
  })

  it('preserves hand-edited coordinates, IDs, areas, NPCs, drops, and local colors on rerun', () => {
    const result = importDataMap(source, markers, areas, maps)
    expect(result.markers).toEqual(markers)
    expect(result.areas).toEqual(areas)
    const edited = structuredClone(markers)
    const cave = edited.find((marker) => marker.mapId === 'caves' && marker.name === 'Cave 1')
    cave.x = 12.34
    cave.y = 56.78
    expect(importDataMap(source, edited, areas, maps).markers.find((marker) => marker.id === cave.id))
      .toMatchObject({ x: 12.34, y: 56.78 })
  })

  it('does not mix repeated marker names across maps or copy item chances to new locations', () => {
    const surface = markers.filter((marker) => marker.mapId === 'surface')
    const result = importDataMap(source, surface, areas, maps)
    const spawn = result.markers.filter((marker) => marker.name === 'Spawn')
    expect(spawn).toHaveLength(2)
    expect(spawn[0].id).not.toBe(spawn[1].id)
    expect(spawn.find((marker) => marker.mapId === 'caves').resources[0].items[0]).not.toHaveProperty('chancePercent')
    for (const marker of surface) expect(result.markers.find((current) => current.id === marker.id)).toEqual(marker)
  })

  it('preserves source image references and tree annotations in the import report', () => {
    const result = importDataMap(source, [], [], maps)
    const report = result.report.markers.find((marker) => marker.name === 'Outskirts west')
    expect(report.notes).toContainEqual({ section: 'resources', name: 'Wood', note: 'trees' })
    expect(report.sourceImages).toContainEqual({ section: 'resources', name: 'Wood', file: 'Wood.png' })
  })

  it('fails on unknown wikitext rather than silently losing information', () => {
    expect(() => parseDescription("'''Caves zone''' '''Level 1'''\nUnsupported annotation")).toThrow('Unsupported source description')
  })

  it('rejects unsupported coordinate order and out-of-bounds positions', () => {
    const invalid = structuredClone(source)
    invalid.crs.order = 'yx'
    expect(() => importDataMap(invalid, [], [], maps)).toThrow('xy coordinate order')
    invalid.crs.order = 'xy'
    invalid.markers['region-21'][0].x = -1
    expect(() => importDataMap(invalid, [], [], maps)).toThrow('outside image bounds')
  })

  it('rejects ambiguous existing occurrences in one map', () => {
    const duplicate = { ...markers[0], id: 'duplicate-spawn' }
    expect(() => importDataMap(source, [...markers, duplicate], areas, maps)).toThrow('Ambiguous existing marker')
  })
})
