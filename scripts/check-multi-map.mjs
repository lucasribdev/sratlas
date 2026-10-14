// Run against a local Vite server and Chromium started with --remote-debugging-port.
// Fixtures replace module responses in this browser session only, never published JSON.
import { readFile, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const appUrl = process.env.MAP_APP_URL ?? 'http://127.0.0.1:5175'
const debuggerUrl = process.env.MAP_DEBUG_URL ?? 'http://127.0.0.1:9223'
const publishedMarkers = JSON.parse(await readFile(new URL('../src/data/markers.json', import.meta.url), 'utf8'))
const fixture = JSON.parse(await readFile(new URL('../src/test/fixtures/multi-map.json', import.meta.url), 'utf8'))
const tabs = await (await fetch(`${debuggerUrl}/json`)).json()
const tab = tabs.find((tab) => tab.type === 'page')
assert(tab, 'A Chromium page must be open')
const ws = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }))
let sequence = 0
const pending = new Map()
const errors = []
let useFixtures = false
let sidebar = 'aside'
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence
  pending.set(id, { resolve, reject })
  ws.send(JSON.stringify({ id, method, params }))
})
ws.addEventListener('message', async ({ data }) => {
  const message = JSON.parse(data)
  if (message.id) {
    const promise = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) promise.reject(message.error)
    else promise.resolve(message.result)
  } else if (message.method === 'Runtime.exceptionThrown') {
    errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text)
  } else if (message.method === 'Fetch.requestPaused') {
    const { requestId, request } = message.params
    const pathname = new URL(request.url).pathname
    const type = pathname === '/src/data/maps.ts' ? 'maps' : pathname === '/src/data/markers.ts' ? 'markers' : null
    if (useFixtures && type) {
      const body = `export const ${type} = ${JSON.stringify(fixture[type])}; export const ${type}ById = new Map(${type}.map(value => [value.id, value]));`
      await call('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/javascript' }], body: Buffer.from(body).toString('base64') })
    } else await call('Fetch.continueRequest', { requestId })
  }
})
const run = async (expression) => {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const check = async (expression, label) => {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await run(`Boolean(${expression})`)) { console.log(`PASS ${label}`); return }
    await wait(100)
  }
  throw Error(label)
}
const query = async (value, mobile) => {
  const selector = mobile ? '[aria-label="Compact controls"] input' : 'aside input'
  await run(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); input.focus(); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); })()`)
  await wait(100)
}
const changeMap = async (id, mobile) => {
  const selector = mobile ? '[aria-label="Compact controls"] select' : 'aside select'
  await run(`(() => { const select = document.querySelector(${JSON.stringify(selector)}); select.value = ${JSON.stringify(id)}; select.dispatchEvent(new Event('change', { bubbles: true })); })()`)
  await wait(100)
}
const openDrawer = async (mobile) => {
  if (mobile) {
    await run(`Array.from(document.querySelectorAll('[aria-label="Compact controls"] button')).find(button => button.textContent.includes('Filters')).click()`)
    await check(`!!document.querySelector('[role="dialog"] aside')`, 'mobile filter drawer opens')
  }
}
const closeDrawer = async (mobile) => {
  if (mobile) {
    await run(`document.querySelector('[role="dialog"] button[data-slot="sheet-close"]').click()`)
    await wait(300)
  }
}
const clickResult = async (name, map, mobile) => {
  await openDrawer(mobile)
  await run(`Array.from(document.querySelectorAll('${sidebar} ol button')).find(button => button.querySelector('strong').textContent === ${JSON.stringify(name)} && button.textContent.includes(${JSON.stringify(map)})).click()`)
  await wait(300)
}
const centered = `(() => { const pin = document.querySelector('.map-marker--selected')?.getBoundingClientRect(); const map = document.querySelector('.map-view')?.getBoundingClientRect(); return pin && map && Math.abs(pin.x + pin.width / 2 - map.x - map.width / 2) < 2 && Math.abs(pin.y + pin.height / 2 - map.y - map.height / 2) < 2; })()`
try {
  await call('Runtime.enable')
  await call('Page.enable')
  await call('Network.enable')
  await call('Network.setCacheDisabled', { cacheDisabled: true })
  await call('Fetch.enable', { patterns: [{ urlPattern: '*/src/data/maps.ts*' }, { urlPattern: '*/src/data/markers.ts*' }] })
  // Runtime.enable may replay exceptions from a previous debugger session.
  errors.length = 0
  for (const mobile of [false, true]) {
    const label = mobile ? 'mobile' : 'desktop'
    sidebar = mobile ? '[role="dialog"] aside' : 'aside'
    await call('Emulation.setDeviceMetricsOverride', { width: mobile ? 390 : 1440, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile })
    await call('Emulation.setTouchEmulationEnabled', { enabled: mobile })
    useFixtures = false
    await call('Page.navigate', { url: appUrl })
    await check(`!!document.querySelector('.leaflet-image-layer') && document.querySelectorAll('select option').length === 4 && document.querySelector('aside input').value === ''`, `${label}: published app loads`)
    for (const map of ['caves', 'surface']) {
      await changeMap(map, mobile)
      await check(`document.querySelector('.leaflet-image-layer')?.getAttribute('src') === '/maps/${map}.webp' && document.querySelector('.leaflet-image-layer').naturalWidth > 0`, `${label}: ${map} selector and image`)
    }
    await changeMap('caves', mobile)
    const caveNames = publishedMarkers.filter((marker) => marker.mapId === 'caves').map((marker) => marker.name)
    await check(`Array.from(document.querySelectorAll('.map-marker')).length === ${caveNames.length} && Array.from(document.querySelectorAll('.map-marker')).every(marker => ${JSON.stringify(caveNames)}.includes(marker.title))`, `${label}: published Caves renders its own markers`)
    if (caveNames.includes('Deep cave 14')) {
      await changeMap('surface', mobile)
      await query('Deep cave 14', mobile)
      await clickResult('Deep cave 14', 'Caves', mobile)
      await check(`document.querySelector('.leaflet-image-layer').getAttribute('src') === '/maps/caves.webp' && document.querySelector('.leaflet-popup')?.textContent.includes('Deep cave 14') && ${centered}`, `${label}: imported Caves location is searchable and navigable`)
      await writeFile(`/tmp/srw-caves-import-${label}.png`, Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'))
    }
    useFixtures = true
    await call('Page.reload', { ignoreCache: true })
    await check(`document.querySelectorAll('select option').length === 6`, `${label}: third map appears from configuration`)
    await check(`document.querySelectorAll('.map-marker').length === 1`, `${label}: only Surface markers render`)
    await query('Fixture Camp', mobile)
    await openDrawer(mobile)
    await check(`document.querySelectorAll('${sidebar} ol li').length === 2 && document.querySelector('${sidebar} ol').textContent.includes('Caves')`, `${label}: global repeated-name results`)
    await closeDrawer(mobile)
    await query('Fixture Camp', mobile)
    await run(`Array.from(document.querySelectorAll('[role="option"] button')).find(button => button.textContent.includes('Marker')).click()`)
    await check(`!document.querySelector('.map-marker--selected') && document.querySelector('.leaflet-image-layer').getAttribute('src') === '/maps/surface.webp'`, `${label}: ambiguous suggestion never chooses an occurrence`)
    await clickResult('Fixture Camp', 'Caves', mobile)
    await check(`document.querySelector('.leaflet-image-layer')?.getAttribute('src') === '/maps/caves.webp' && document.querySelector('.leaflet-popup')?.textContent.includes('Fixture Camp') && ${centered}`, `${label}: foreign result changes image, centers and opens correct popup`)
    await check(`document.querySelectorAll('.map-marker').length === 1`, `${label}: rendered markers respect query and owning map`)
    await run(`document.querySelector('.leaflet-popup-close-button').click()`)
    await call('Input.dispatchMouseEvent', { type: 'mousePressed', x: mobile ? 170 : 1100, y: 650, button: 'left', clickCount: 1 })
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: mobile ? 230 : 1200, y: 700, button: 'left', buttons: 1 })
    await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: mobile ? 230 : 1200, y: 700, button: 'left', clickCount: 1 })
    await wait(400)
    assert(!await run(centered), `${label}: pan must move marker before repeating navigation`)
    await clickResult('Fixture Camp', 'Caves', mobile)
    await check(`!!document.querySelector('.leaflet-popup') && ${centered}`, `${label}: repeated result recenters and reopens`)
    await query('Fixture', mobile)
    await check(`!document.querySelector('.map-marker--selected') && !document.querySelector('.leaflet-popup')`, `${label}: query edit clears selection and popup`)
    await check(`document.querySelectorAll('.map-marker').length === 3`, `${label}: different destination dimensions and unassigned marker`)
    await changeMap('fixture-empty', mobile)
    await check(`!document.querySelector('.map-marker') && document.querySelector('.map-view') && document.querySelector('.map-placeholder [role="status"]')`, `${label}: empty third map is rendered`)
    const imageWidth = await run(`document.querySelector('.leaflet-image-layer').getBoundingClientRect().width`)
    await run(`document.querySelector('.leaflet-control-zoom-in').click()`)
    await check(`document.querySelector('.leaflet-image-layer').getBoundingClientRect().width > ${imageWidth}`, `${label}: empty map zoom works`)
    await openDrawer(mobile)
    await check(`document.querySelector('${sidebar} input').value === 'Fixture' && document.querySelectorAll('${sidebar} ol li').length === 4`, `${label}: manual map changes preserve global search and filters`)
    await run(`document.querySelector('${sidebar} button[aria-label="Clear all selected areas"]').click()`)
    await check(`!document.querySelector('${sidebar} ol') && document.querySelector('${sidebar} input').value === 'Fixture'`, `${label}: clear all preserves query`)
    await closeDrawer(mobile)
    await changeMap('caves', mobile)
    await check(`!document.querySelector('.map-marker')`, `${label}: excluded markers remain hidden after map change`)
    await query('Fixture Target', mobile)
    await run(`Array.from(document.querySelectorAll('[role="option"] button')).find(button => button.textContent.includes('Marker')).click()`)
    await check(`!document.querySelector('.leaflet-popup') && !document.querySelector('.map-marker--selected')`, `${label}: excluded suggestion cannot navigate`)
    await openDrawer(mobile)
    await run(`document.querySelector('${sidebar} button[aria-label="Select all areas"]').click()`)
    await closeDrawer(mobile)
    await query('Fixture Target', mobile)
    await run(`Array.from(document.querySelectorAll('[role="option"] button')).find(button => button.textContent.includes('Marker')).click()`)
    await check(`document.querySelector('.leaflet-popup')?.textContent.includes('Fixture Target') && ${centered}`, `${label}: unique autocomplete navigation`)
    await openDrawer(mobile)
    await run(`document.querySelector('${sidebar} [role="checkbox"]').click()`)
    await check(`!document.querySelector('.leaflet-popup') && !document.querySelector('.map-marker--selected')`, `${label}: filter change cancels selection`)
    await run(`document.querySelector('${sidebar} button[aria-label="Select all areas"]').click()`)
    await closeDrawer(mobile)
    await clickResult('Fixture Target', 'Caves', mobile)
    if (mobile) {
      await check(`(() => { const popup = document.querySelector('.leaflet-popup').getBoundingClientRect(); const controls = document.querySelector('[aria-label="Compact controls"]').getBoundingClientRect(); return popup.top >= controls.bottom && popup.left >= 0 && popup.right <= innerWidth; })()`, 'mobile: popup title and close button are clear of controls')
      await run(`document.querySelector('.leaflet-popup-content').scrollTop = 999`)
      await check(`document.querySelector('.leaflet-popup-content').scrollTop > 0`, 'mobile: long popup details remain scrollable')
      await run(`document.querySelector('.leaflet-popup-content').scrollTop = 0`)
    }
    await writeFile(`/tmp/srw-multi-map-${label}.png`, Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'))
    await check('document.documentElement.scrollWidth <= innerWidth', `${label}: no horizontal overflow`)
    for (const destination of ['surface', 'fixture-empty']) {
      await changeMap(destination, mobile)
      await check(`document.querySelector('.map-placeholder')?.getAttribute('aria-label') === ${JSON.stringify(destination === 'surface' ? 'Surface' : 'Fixture Empty')} && !document.querySelector('.leaflet-popup') && !document.querySelector('.map-marker--selected')`, `${label}: switching to ${destination} with popup open clears selection safely`)
      await clickResult('Fixture Target', 'Caves', mobile)
      await check(`document.querySelector('.leaflet-popup')?.textContent.includes('Fixture Target') && ${centered}`, `${label}: navigation still works after switching away from an open popup`)
    }
    await query('Fixture Camp', mobile)
    for (const destination of ['Surface', 'Caves', 'Surface', 'Caves']) {
      await clickResult('Fixture Camp', destination, mobile)
      await check(`document.querySelector('.map-placeholder')?.getAttribute('aria-label') === ${JSON.stringify(destination)} && document.querySelector('.leaflet-popup')?.textContent.includes('Fixture Camp') && ${centered}`, `${label}: cross-map result replaces an open popup on ${destination}`)
    }

  }
  fixture.markers.push({ id: 'fixture-third-target', name: 'Fixture Third Target', mapId: 'fixture-empty', x: 40, y: 60 })
  for (const mobile of [false, true]) {
    sidebar = mobile ? '[role="dialog"] aside' : 'aside'
    await call('Emulation.setDeviceMetricsOverride', { width: mobile ? 390 : 1440, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile })
    await call('Page.reload', { ignoreCache: true })
    await check(`document.querySelector('aside input')?.value === '' && document.querySelectorAll('select option').length === 6`, 'expanded fixture loads')
    await query('Fixture Third Target', mobile)
    await clickResult('Fixture Third Target', 'Fixture Empty', mobile)
    await check(`document.querySelector('.map-placeholder').getAttribute('aria-label') === 'Fixture Empty' && document.querySelector('.leaflet-popup')?.textContent.includes('Fixture Third Target') && ${centered}`, `${mobile ? 'mobile' : 'desktop'}: added third-map marker navigates without shared code changes`)
  }
  assert.deepEqual(errors, [], 'No browser runtime exceptions')
  console.log('PASS no browser runtime exceptions')
} finally {
  await call('Fetch.disable')
  await call('Page.navigate', { url: appUrl })
  ws.close()
}
