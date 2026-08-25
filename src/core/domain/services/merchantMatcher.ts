import type { Merchant } from '@/core/domain/models/merchant'

export interface MerchantMatch {
  merchant: Merchant
  score: number
}

/** Lowercase, NFKC-normalize and strip whitespace/punctuation. */
export function normalizeMerchantText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\s'’".,-]/g, '')
}

/**
 * Fuzzy, bilingual merchant search.
 * Scoring: 0 exact · 1 prefix · 2+ substring (earlier index wins).
 */
export function searchMerchants(query: string, merchants: Merchant[], limit = 8): MerchantMatch[] {
  const q = normalizeMerchantText(query)
  if (!q) return []

  const matches: MerchantMatch[] = []

  for (const merchant of merchants) {
    const fields = [merchant.name, ...merchant.aliases]
    let bestScore = Number.POSITIVE_INFINITY

    for (const field of fields) {
      const normalized = normalizeMerchantText(field)
      if (!normalized) continue

      if (normalized === q) {
        bestScore = Math.min(bestScore, 0)
      } else if (normalized.startsWith(q)) {
        bestScore = Math.min(bestScore, 1)
      } else if (normalized.includes(q)) {
        bestScore = Math.min(bestScore, 2 + normalized.indexOf(q))
      }
    }

    if (bestScore !== Number.POSITIVE_INFINITY) {
      matches.push({ merchant, score: bestScore })
    }
  }

  return matches.sort((a, b) => a.score - b.score).slice(0, limit)
}

export function findMerchantById(id: string, merchants: Merchant[]): Merchant | undefined {
  return merchants.find((m) => m.id === id)
}
