import { describe, expect, it } from 'vitest'
import areasJson from './areas.json'
import mapsJson from './maps.json'
import markersJson from './markers.json'

type JsonRecord = Record<string, unknown>

type RuntimeData = {
  markers: unknown
  maps: unknown
  areas: unknown
}

function assertArray(value: unknown, label: string): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`)
  }
}

function assertRecord(value: unknown, label: string): asserts value is JsonRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
}

function assertNonEmptyString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} must be a non-empty string`)
  }
}

function assertFiniteNumber(value: unknown, label: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`)
  }
}

function assertOptionalString(record: JsonRecord, field: string, label: string) {
  if (record[field] !== undefined) {
    assertNonEmptyString(record[field], `${label}.${field}`)
  }
}

function assertUnique(values: string[], label: string) {
  const seen = new Set<string>()

  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label} "${value}"`)
    }

    seen.add(value)
  }
}

function assertNormalizedCoordinate(value: unknown, label: string) {
  assertFiniteNumber(value, label)

  if (value < 0 || value > 100) {
    throw new Error(`${label} must be between 0 and 100; received ${value}`)
  }
}

function assertRichNamedObjects(value: unknown, label: string): asserts value is JsonRecord[] {
  assertArray(value, label)

  value.forEach((entry, index) => {
    const entryLabel = `${label}[${index}]`
    assertRecord(entry, entryLabel)
    assertNonEmptyString(entry.name, `${entryLabel}.name`)
    assertOptionalString(entry, 'wikiSlug', entryLabel)
    assertOptionalString(entry, 'image', entryLabel)
  })
}

function assertOptionalMonsterDropImage(record: JsonRecord, label: string) {
  const image = record.image

  if (image === undefined || image === '') {
    return
  }

  assertNonEmptyString(image, `${label}.image`)
}

function validateMonsterDrops(value: unknown, monsterLabel: string) {
  const label = `${monsterLabel}.drops`
  assertArray(value, label)

  value.forEach((entry, dropIndex) => {
    const dropLabel = `${label}[${dropIndex}]`
    assertRecord(entry, dropLabel)
    assertNonEmptyString(entry.name, `${dropLabel}.name`)
    assertFiniteNumber(entry.dropRate, `${dropLabel}.dropRate`)

    if (entry.dropRate < 0 || entry.dropRate > 100) {
      throw new Error(`${dropLabel}.dropRate must be between 0 and 100; received ${entry.dropRate}`)
    }

    assertOptionalString(entry, 'wikiSlug', dropLabel)
    assertOptionalMonsterDropImage(entry, dropLabel)
  })
}

function validateMonsters(value: unknown, markerLabel: string) {
  const label = `${markerLabel}.monsters`
  assertArray(value, label)

  value.forEach((entry, monsterIndex) => {
    const monsterLabel = `${label}[${monsterIndex}]`
    assertRecord(entry, monsterLabel)
    assertNonEmptyString(entry.name, `${monsterLabel}.name`)
    assertOptionalString(entry, 'wikiSlug', monsterLabel)
    assertOptionalString(entry, 'image', monsterLabel)

    if (entry.drops !== undefined) {
      validateMonsterDrops(entry.drops, monsterLabel)
    }
  })
}

function validateMaps(value: unknown) {
  assertArray(value, 'maps.json')
  const mapIds: string[] = []

  value.forEach((entry, index) => {
    const label = `maps.json[${index}]`
    assertRecord(entry, label)
    assertNonEmptyString(entry.id, `${label}.id`)
    assertNonEmptyString(entry.name, `${label}.name`)
    assertNonEmptyString(entry.imageUrl, `${label}.imageUrl`)
    assertFiniteNumber(entry.width, `${label}.width`)
    assertFiniteNumber(entry.height, `${label}.height`)

    if (entry.width <= 0 || entry.height <= 0) {
      throw new Error(`${label} dimensions must be greater than zero`)
    }

    mapIds.push(entry.id)
  })

  assertUnique(mapIds, 'map id')
  return new Set(mapIds)
}

function validateAreas(value: unknown) {
  assertArray(value, 'areas.json')
  const areaNames: string[] = []

  value.forEach((entry, index) => {
    const label = `areas.json[${index}]`
    assertRecord(entry, label)
    assertNonEmptyString(entry.name, `${label}.name`)
    assertNonEmptyString(entry.color, `${label}.color`)

    if (!/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(entry.color)) {
      throw new Error(`${label}.color must be a hexadecimal color; received "${entry.color}"`)
    }

    areaNames.push(entry.name)
  })

  assertUnique(areaNames, 'area name')
  return new Set(areaNames)
}

function validateResources(value: unknown, markerLabel: string) {
  const label = `${markerLabel}.resources`
  assertArray(value, label)

  value.forEach((entry, resourceIndex) => {
    const resourceLabel = `${label}[${resourceIndex}]`
    assertRecord(entry, resourceLabel)
    assertNonEmptyString(entry.type, `${resourceLabel}.type`)
    const items = entry.items
    assertRichNamedObjects(items, `${resourceLabel}.items`)

    for (const [itemIndex, item] of items.entries()) {
      assertRecord(item, `${resourceLabel}.items[${itemIndex}]`)

      if (item.chancePercent !== undefined) {
        assertFiniteNumber(item.chancePercent, `${resourceLabel}.items[${itemIndex}].chancePercent`)
      }
    }
  })
}

function validateMarkers(value: unknown, mapIds: Set<string>, areaNames: Set<string>) {
  assertArray(value, 'markers.json')
  const markerIds: string[] = []

  value.forEach((entry, index) => {
    const label = `markers.json[${index}]`
    assertRecord(entry, label)
    assertNonEmptyString(entry.id, `${label}.id`)
    const markerLabel = `marker "${entry.id}"`
    assertNonEmptyString(entry.name, `${markerLabel}.name`)
    assertNonEmptyString(entry.mapId, `${markerLabel}.mapId`)
    assertNormalizedCoordinate(entry.x, `${markerLabel}.x`)
    assertNormalizedCoordinate(entry.y, `${markerLabel}.y`)

    if (!mapIds.has(entry.mapId)) {
      throw new Error(`${markerLabel}.mapId references missing map "${entry.mapId}"`)
    }

    if (entry.area !== undefined) {
      assertNonEmptyString(entry.area, `${markerLabel}.area`)

      if (!areaNames.has(entry.area)) {
        throw new Error(`${markerLabel}.area references missing area "${entry.area}"`)
      }
    }

    assertOptionalString(entry, 'zoneType', markerLabel)
    assertOptionalString(entry, 'level', markerLabel)
    assertOptionalString(entry, 'wikiSlug', markerLabel)

    if (entry.warpPoint !== undefined && typeof entry.warpPoint !== 'boolean') {
      throw new Error(`${markerLabel}.warpPoint must be a boolean`)
    }

    if (entry.tags !== undefined) {
      assertArray(entry.tags, `${markerLabel}.tags`)
      entry.tags.forEach((tag, tagIndex) =>
        assertNonEmptyString(tag, `${markerLabel}.tags[${tagIndex}]`),
      )
    }

    if (entry.monsters !== undefined) {
      validateMonsters(entry.monsters, markerLabel)
    }

    if (entry.interactables !== undefined) {
      assertRichNamedObjects(entry.interactables, `${markerLabel}.interactables`)
    }

    if (entry.resources !== undefined) {
      validateResources(entry.resources, markerLabel)
    }

    markerIds.push(entry.id)
  })

  assertUnique(markerIds, 'marker id')
}

function validateRuntimeData(data: RuntimeData) {
  const mapIds = validateMaps(data.maps)
  const areaNames = validateAreas(data.areas)
  validateMarkers(data.markers, mapIds, areaNames)
}

const validData: RuntimeData = {
  maps: [
    {
      id: 'world',
      name: 'World Map',
      imageUrl: '/maps/world.webp',
      width: 100,
      height: 100,
    },
  ],
  areas: [{ name: 'Outskirts', color: '#a7ff9f' }],
  markers: [
    {
      id: 'outskirts',
      name: 'Outskirts',
      mapId: 'world',
      x: 50,
      y: 50,
      area: 'Outskirts',
      monsters: [{ name: 'Hopper' }],
      interactables: [{ name: 'Quest Master' }],
      resources: [{ type: 'Mining', items: [{ name: 'Stone' }] }],
    },
  ],
}

function cloneValidData() {
  return structuredClone(validData) as {
    maps: JsonRecord[]
    areas: JsonRecord[]
    markers: JsonRecord[]
  }
}

function firstMonster(data: ReturnType<typeof cloneValidData>) {
  return (data.markers[0].monsters as JsonRecord[])[0]
}

describe('runtime JSON data integrity', () => {
  it('validates the actual markers, maps, and areas datasets', () => {
    expect(() =>
      validateRuntimeData({
        markers: markersJson,
        maps: mapsJson,
        areas: areasJson,
      }),
    ).not.toThrow()
  })

  it('rejects duplicate marker ids', () => {
    const data = cloneValidData()
    data.markers.push({ ...data.markers[0] })

    expect(() => validateRuntimeData(data)).toThrow('Duplicate marker id "outskirts"')
  })

  it.each([
    ['x', -0.1],
    ['y', 100.1],
  ])('rejects a %s coordinate outside the normalized range', (coordinate, value) => {
    const data = cloneValidData()
    data.markers[0][coordinate] = value

    expect(() => validateRuntimeData(data)).toThrow(
      `marker "outskirts".${coordinate} must be between 0 and 100; received ${value}`,
    )
  })

  it('rejects a marker that references a missing map', () => {
    const data = cloneValidData()
    data.markers[0].mapId = 'missing-map'

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".mapId references missing map "missing-map"',
    )
  })

  it('rejects a marker that references a missing area', () => {
    const data = cloneValidData()
    data.markers[0].area = 'Missing Area'

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".area references missing area "Missing Area"',
    )
  })

  it.each([
    ['monsters', 'Hopper', 'marker "outskirts".monsters[0]'],
    ['interactables', 'Quest Master', 'marker "outskirts".interactables[0]'],
  ])('rejects legacy strings in %s', (field, legacyEntry, expectedLabel) => {
    const data = cloneValidData()
    data.markers[0][field] = [legacyEntry]

    expect(() => validateRuntimeData(data)).toThrow(`${expectedLabel} must be an object`)
  })

  it('rejects legacy strings in resources[].items', () => {
    const data = cloneValidData()
    data.markers[0].resources = [{ type: 'Mining', items: ['Stone'] }]

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".resources[0].items[0] must be an object',
    )
  })

  it('accepts a monster without drops', () => {
    const data = cloneValidData()

    expect(() => validateRuntimeData(data)).not.toThrow()
  })

  it('accepts a complete monster drop', () => {
    const data = cloneValidData()
    firstMonster(data).drops = [
      {
        name: 'Dull Life Essence',
        dropRate: 1.25,
        wikiSlug: 'Dull_Life_Essence',
        image: '/some/path.webp',
      },
    ]

    expect(() => validateRuntimeData(data)).not.toThrow()
  })

  it('accepts a monster drop without optional image and wikiSlug fields', () => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ name: 'Dull Life Essence', dropRate: 1.25 }]

    expect(() => validateRuntimeData(data)).not.toThrow()
  })

  it('accepts an exact empty monster drop image', () => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ name: 'Dull Life Essence', dropRate: 1.25, image: '' }]

    expect(() => validateRuntimeData(data)).not.toThrow()
  })

  it.each(['', '   '])('rejects the monster drop name %j', (name) => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ name, dropRate: 1.25 }]

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".monsters[0].drops[0].name must be a non-empty string',
    )
  })

  it.each([
    ['a string', '1.25'],
    ['null', null],
    ['a boolean', false],
    ['an object', {}],
  ])('rejects %s as a monster drop rate', (_description, dropRate) => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ name: 'Dull Life Essence', dropRate }]

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".monsters[0].drops[0].dropRate must be a finite number',
    )
  })

  it('rejects a monster drop without a dropRate', () => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ name: 'Dull Life Essence' }]

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".monsters[0].drops[0].dropRate must be a finite number',
    )
  })

  it.each([NaN, Infinity, -Infinity])('rejects the non-finite monster drop rate %s', (dropRate) => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ name: 'Dull Life Essence', dropRate }]

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".monsters[0].drops[0].dropRate must be a finite number',
    )
  })

  it.each([-0.01, 100.01])('rejects the out-of-range monster drop rate %s', (dropRate) => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ name: 'Dull Life Essence', dropRate }]

    expect(() => validateRuntimeData(data)).toThrow(
      `marker "outskirts".monsters[0].drops[0].dropRate must be between 0 and 100; received ${dropRate}`,
    )
  })

  it.each([0, 100])('accepts the boundary monster drop rate %s', (dropRate) => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ name: 'Dull Life Essence', dropRate }]

    expect(() => validateRuntimeData(data)).not.toThrow()
  })

  it('rejects non-array monster drops', () => {
    const data = cloneValidData()
    firstMonster(data).drops = {}

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".monsters[0].drops must be an array',
    )
  })

  it.each([
    ['a string', 'Dull Life Essence'],
    ['null', null],
    ['an array', []],
  ])('rejects %s as a monster drop entry', (_description, drop) => {
    const data = cloneValidData()
    firstMonster(data).drops = [drop]

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".monsters[0].drops[0] must be an object',
    )
  })

  it('rejects an obsolete item-only monster drop', () => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ item: 'Dull Life Essence', dropRate: 1.25 }]

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".monsters[0].drops[0].name must be a non-empty string',
    )
  })

  it.each(['', '   ', 123, null])('rejects the monster drop wikiSlug %j', (wikiSlug) => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ name: 'Dull Life Essence', dropRate: 1.25, wikiSlug }]

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".monsters[0].drops[0].wikiSlug must be a non-empty string',
    )
  })

  it('rejects a whitespace-only monster drop image', () => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ name: 'Dull Life Essence', dropRate: 1.25, image: '   ' }]

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".monsters[0].drops[0].image must be a non-empty string',
    )
  })

  it.each([123, null, false, {}])('rejects the non-string monster drop image %j', (image) => {
    const data = cloneValidData()
    firstMonster(data).drops = [{ name: 'Dull Life Essence', dropRate: 1.25, image }]

    expect(() => validateRuntimeData(data)).toThrow(
      'marker "outskirts".monsters[0].drops[0].image must be a non-empty string',
    )
  })
})
