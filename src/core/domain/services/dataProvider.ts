import { ref } from 'vue'
import { CardCatalogSchema, type Card } from '@/core/domain/models/card'
import { MerchantArraySchema, type Merchant } from '@/core/domain/models/merchant'
import { safeParse } from '@/core/security/validation'
import bundledCards from '@/core/domain/data/cards.json'
import bundledMerchants from '@/core/domain/data/merchants.json'

/**
 * Runtime data provider.
 *
 * Starts from the committed JSON snapshot (bundled at build time), then tries
 * to refresh from same-origin `/data/*.json` (served by the host — e.g. GitHub
 * Pages — and updated by the scheduled crawler). Every payload is re-validated
 * against the Zod schemas; on any failure we keep the last-known-good data.
 * The browser never talks to hkcashrebate.com directly.
 */
const bundledCardsResult = safeParse(CardCatalogSchema, bundledCards)
const bundledMerchantsResult = safeParse(MerchantArraySchema, bundledMerchants)

export const cards = ref<Card[]>(bundledCardsResult.success ? bundledCardsResult.data : [])
export const merchants = ref<Merchant[]>(bundledMerchantsResult.success ? bundledMerchantsResult.data : [])

let hydrated = false

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' }, cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as unknown
  } catch {
    return null
  }
}

/** Refresh the catalog from the host-served snapshot (falls back to bundled). */
export async function hydrateData(): Promise<void> {
  if (hydrated) return
  hydrated = true

  const base = import.meta.env.BASE_URL
  const [remoteCards, remoteMerchants] = await Promise.all([
    fetchJson(`${base}data/cards.json`),
    fetchJson(`${base}data/merchants.json`)
  ])

  if (remoteCards !== null) {
    const parsed = safeParse(CardCatalogSchema, remoteCards)
    if (parsed.success) cards.value = parsed.data
  }
  if (remoteMerchants !== null) {
    const parsed = safeParse(MerchantArraySchema, remoteMerchants)
    if (parsed.success) merchants.value = parsed.data
  }
}

export function getCardById(id: string): Card | undefined {
  return cards.value.find((card) => card.id === id)
}

export function getMerchantById(id: string): Merchant | undefined {
  return merchants.value.find((merchant) => merchant.id === id)
}
