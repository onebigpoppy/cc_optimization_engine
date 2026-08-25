/**
 * Best-effort crawler for hkcashrebate.com category pages.
 *
 *   npm run crawl
 *
 * The browser cannot fetch hkcashrebate.com directly (CORS), so this Node
 * script refreshes the committed snapshot at
 * `src/core/domain/data/cards.json`, which the app bundles and Zod-validates.
 *
 * What it does:
 *   1. Fetches the 6 category pages (online / supermarket / drive / dining /
 *      utility-bill / overseas).
 *   2. Parses the comparison <table> rows → card name + top percentage.
 *   3. Updates the matching card's `categoryRates` in cards.json (by name).
 *
 * Card images are hot-linked from hkcashrebate.com and stored on each card's
 * `imageUrl` field (committed snapshot). Re-scraping images by proximity is
 * fragile, so images are curated in the snapshot and can be refreshed by
 * extending `extractImages` if needed.
 *
 * NOTE: WordPress markup changes; this regex-based parser is a starting point.
 * For production, prefer a DOM parser (e.g. cheerio) and run this on a schedule.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CARDS_PATH = path.resolve(__dirname, '../src/core/domain/data/cards.json')

const PAGES = [
  { category: 'online', url: 'https://hkcashrebate.com/online' },
  { category: 'supermarket', url: 'https://hkcashrebate.com/supermarket' },
  { category: 'drive', url: 'https://hkcashrebate.com/drive' },
  { category: 'dining', url: 'https://hkcashrebate.com/dining' },
  { category: 'utility-bill', url: 'https://hkcashrebate.com/utility-bill' },
  { category: 'overseas', url: 'https://hkcashrebate.com/overseas' }
]

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\s·•\-—_()（）/、,，.。:：*【】\[\]"]/g, '')
}

function stripTags(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Extract table rows as arrays of cell text. */
function parseRows(html) {
  const rows = []
  for (const table of html.match(/<table[\s\S]*?<\/table>/gi) ?? []) {
    for (const tr of table.match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
      const cells = []
      for (const m of tr.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)) {
        cells.push(stripTags(m[1]))
      }
      if (cells.length >= 2) rows.push(cells)
    }
  }
  return rows
}

/** Map rows → { name, rate } using the first cell as name and first % as rate. */
function extractRates(rows) {
  const found = []
  for (const cells of rows) {
    const name = normalize(cells[0])
    if (!name || name.length < 2) continue
    let rate = null
    for (let i = 1; i < cells.length && rate === null; i += 1) {
      const match = cells[i].match(/(\d+(?:\.\d+)?)\s*%/)
      if (match) rate = Number.parseFloat(match[1])
    }
    // Ignore implausible values (fees/limits tables).
    if (rate !== null && rate > 0 && rate <= 20) found.push({ name, rate })
  }
  return found
}

function matchCard(card, found) {
  const name = normalize(card.name)
  const issuer = normalize(card.issuer)
  let fallback = null
  for (const item of found) {
    if (item.name.includes(name) || name.includes(item.name)) return item
    if (issuer && item.name.includes(issuer)) fallback = fallback ?? item
  }
  return fallback
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': USER_AGENT } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

async function main() {
  const cards = JSON.parse(await readFile(CARDS_PATH, 'utf8'))
  let updates = 0

  for (const page of PAGES) {
    try {
      const html = await fetchText(page.url)
      const rates = extractRates(parseRows(html))
      console.log(`[crawl] ${page.category}: ${rates.length} rate row(s) parsed`)

      for (const card of cards) {
        const hit = matchCard(card, rates)
        if (!hit) continue
        const existing = card.categoryRates.find((r) => r.category === page.category)
        if (existing) {
          existing.rate = hit.rate
        } else {
          card.categoryRates.push({ category: page.category, type: 'cashback', rate: hit.rate })
        }
        updates += 1
      }
    } catch (error) {
      console.warn(`[crawl] skipped ${page.category}: ${error.message}`)
    }
  }

  await writeFile(CARDS_PATH, `${JSON.stringify(cards, null, 2)}\n`, 'utf8')
  console.log(`[crawl] wrote ${cards.length} card(s), ${updates} rate update(s)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
