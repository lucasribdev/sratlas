// Offline import of the supplied DataMaps snapshot. No wiki requests are made.
import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const clone = (value) => structuredClone(value)
const plain = (value) => value.replace(/<[^>]*>/g, '').replace(/'''/g, '').trim()

export function parseDescription(description) {
  const zoneType = description.match(/^'''([^']+ zone)'''/)?.[1]
  const level = description.match(/'''Level ([^']+)'''/)?.[1]
  if (!zoneType || !level) throw Error('Missing zone type or level in source description')
  const result = { zoneType, level, monsters: [], resources: [], notes: [], images: [] }
  let section
  let resource
  for (const line of description.split('\n').slice(1)) {
    const text = plain(line)
    if (!text || text === '----' || text === '* None') continue
    if (text === 'Monsters:') { section = 'monsters'; continue }
    if (text === 'Resources:') { section = 'resources'; continue }
    if (text === 'Warp point: Yes') { result.warpPoint = true; continue }
    if (text === 'Warp point: No') { result.warpPoint = false; continue }
    if (['Mining', 'Fishing', 'Herbalism'].includes(text) && section === 'resources') {
      resource = { type: text, items: [] }
      result.resources.push(resource)
      continue
    }
    const item = line.match(/^\* \[\[File:([^|\]]+)(?:\|[^\]]*)?\]\]\s*(.+)$/)
    if (!item) throw Error(`Unsupported source description line: ${line}`)
    const label = item[2].trim()
    const name = label.replace(/ \(trees\)$/, '')
    if (label !== name) result.notes.push({ section, name, note: 'trees' })
    result.images.push({ section, name, file: item[1] })
    if (section === 'monsters') result.monsters.push({ name })
    else if (section === 'resources' && resource) resource.items.push({ name })
    else throw Error(`Source entry has no owning section: ${line}`)
  }
  return result
}

function mergeNamed(existing = [], incoming = []) {
  const result = clone(existing)
  for (const entry of incoming) {
    if (!result.some((current) => current.name === entry.name)) result.push(clone(entry))
  }
  return result
}

export function importDataMap(source, existingMarkers, existingAreas, maps) {
  if (source.crs.order !== 'xy') throw Error('Only explicit xy coordinate order is supported')
  const markers = clone(existingMarkers)
  const areas = clone(existingAreas)
  const report = { markers: [], areaColorDifferences: [] }
  const knownMonsters = new Map()
  const knownItems = new Map()
  for (const marker of existingMarkers) {
    for (const monster of marker.monsters ?? []) knownMonsters.set(monster.name, monster)
    for (const group of marker.resources ?? []) {
      for (const item of group.items) {
        const { name, wikiSlug, image } = item
        knownItems.set(name, { name, ...(wikiSlug ? { wikiSlug } : {}), ...(image ? { image } : {}) })
      }
    }
  }
  for (const [groupId, entries] of Object.entries(source.markers)) {
    const group = source.groups[groupId]
    if (!group) throw Error(`Missing group ${groupId}`)
    const area = areas.find((area) => area.name === group.name)
    if (!area) areas.push({ name: group.name, color: group.fillColor })
    else if (area.color.toLowerCase() !== group.fillColor.toLowerCase()) {
      report.areaColorDifferences.push({ area: group.name, retained: area.color, source: group.fillColor })
    }
    for (const entry of entries) {
      const parsed = parseDescription(entry.description)
      const background = source.backgrounds.find((background) => `${background.name} zone` === parsed.zoneType)
      const map = maps.find((map) => map.id === background?.associatedLayer)
      if (!background || !map) throw Error(`Missing configured map for ${parsed.zoneType}`)
      const [[left, top], [right, bottom]] = background.at
      if (!(right > left && bottom > top)) throw Error('Invalid source image bounds')
      const x = (entry.x - left) / (right - left) * 100
      const y = (entry.y - top) / (bottom - top) * 100
      if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) {
        throw Error(`Source coordinate outside image bounds: ${entry.id}`)
      }
      const matches = markers.filter((marker) => marker.mapId === map.id && marker.name === entry.name)
      if (matches.length > 1) throw Error(`Ambiguous existing marker: ${map.id}/${entry.name}`)
      const existing = matches[0]
      const marker = existing ?? { id: entry.id, name: entry.name, mapId: map.id, x: Number(x.toFixed(6)), y: Number(y.toFixed(6)) }
      if (!existing && markers.some((current) => current.id === marker.id)) throw Error(`Duplicate marker ID: ${marker.id}`)
      marker.area ??= group.name
      marker.zoneType = parsed.zoneType
      marker.level = parsed.level
      marker.monsters = mergeNamed(marker.monsters, parsed.monsters.map((monster) => knownMonsters.get(monster.name) ?? monster))
      marker.resources ??= []
      for (const incoming of parsed.resources) {
        let resource = marker.resources.find((resource) => resource.type === incoming.type)
        if (!resource) { resource = { type: incoming.type, items: [] }; marker.resources.push(resource) }
        resource.items = mergeNamed(resource.items, incoming.items.map((item) => knownItems.get(item.name) ?? item))
      }
      if (parsed.warpPoint !== undefined) marker.warpPoint = parsed.warpPoint
      const structuredNames = new Set([marker.name, marker.area, ...marker.monsters.map((monster) => monster.name), ...marker.resources.flatMap((group) => group.items.map((item) => item.name))])
      const aliases = (entry.searchKeywords ?? []).map(([label]) => label).filter((label) => !structuredNames.has(label))
      if (aliases.length) marker.tags = [...new Set([...(marker.tags ?? []), ...aliases])]
      if (!existing) markers.push(marker)
      report.markers.push({ sourceId: entry.id, markerId: marker.id, mapId: map.id, name: marker.name, groupId, sourceArea: group.name, area: marker.area, sourcePixelX: entry.x, sourcePixelY: entry.y, sourcePercentageX: Number(x.toFixed(6)), sourcePercentageY: Number(y.toFixed(6)), x: marker.x, y: marker.y, coordinateStatus: existing ? 'preserved-existing' : 'needs-image-review', notes: parsed.notes, sourceImages: parsed.images })
    }
  }
  return { markers, areas, report }
}

async function main() {
  const sourcePath = process.argv[2] ?? 'data/imports/wiki-world-map.json'
  const [source, markers, areas, maps] = await Promise.all([sourcePath, 'src/data/markers.json', 'src/data/areas.json', 'src/data/maps.json'].map(async (path) => JSON.parse(await readFile(path, 'utf8'))))
  const result = importDataMap(source, markers, areas, maps)
  const markerJson = JSON.stringify(result.markers, null, 2).replace(
    /"tags": \[\n([\s\S]*?)\n    \]/g,
    (_match, items) => `"tags": [${JSON.parse(`[${items}]`).map((tag) => JSON.stringify(tag)).join(', ')}]`,
  )
  await writeFile('src/data/markers.json', `${markerJson}\n`)
  await writeFile('src/data/areas.json', `${JSON.stringify(result.areas, null, 2)}\n`)
  await writeFile('data/imports/wiki-world-map-import.json', `${JSON.stringify(result.report, null, 2)}\n`)
  const csv = (value) => `"${String(value).replaceAll('"', '""')}"`
  const rows = result.report.markers.filter((marker) => marker.mapId === 'caves')
  const fields = ['markerId', 'name', 'sourcePixelX', 'sourcePixelY', 'x', 'y', 'coordinateStatus']
  await writeFile('docs/imports/caves-coordinate-review.csv', `${fields.join(',')},reviewed\n${rows.map((row) => `${fields.map((field) => csv(row[field])).join(',')},false`).join('\n')}\n`)
  console.log(`Imported ${result.report.markers.length} source markers; runtime has ${result.markers.length} markers. Review ${rows.length} Caves positions.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
