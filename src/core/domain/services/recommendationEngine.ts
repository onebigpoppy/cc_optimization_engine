import type { Card, RewardType } from '@/core/domain/models/card'
import type { Merchant } from '@/core/domain/models/merchant'

/** Default flight-value assumption: 1 mile ≈ HK$0.10. */
export const MILE_VALUE_HKD = 0.1

export interface Recommendation {
  /** The card definition that produced this recommendation. */
  card: Card
  rewardType: RewardType
  /** Native rate: % for cashback, HKD-per-mile for miles. */
  rate: number
  /** Category that triggered the multiplier, if any. */
  matchedCategory?: string
  /** True when a specific merchant promo overrides category/base rates. */
  isMerchantOverride: boolean
  /** Unified normalized value score, in percent. */
  valuePercent: number
  /** Human label, e.g. "6% CashBack" or "HK$4/Mile". */
  label: string
  /** Normalized yield, e.g. "≈ 2.50% effective yield". */
  normalizedLabel: string
  /** Optional condition note (e.g. "逢星期三，單一滿 HK$300"). */
  note?: string
}

/**
 * Normalized Value Score (%).
 *  - CashBack: Value % = CashBack % (6% → 6.00).
 *  - Miles:    Value % = (Flight Value Per Mile / HKD Spent Per Mile) * 100
 *              e.g. HK$4/Mile → 0.10 / 4 = 2.50%.
 */
function toValuePercent(type: RewardType, rate: number): number {
  if (type === 'cashback') return rate
  return (MILE_VALUE_HKD / rate) * 100
}

function formatRate(rate: number): string {
  return Number.isInteger(rate) ? String(rate) : rate.toFixed(2)
}

function formatLabel(type: RewardType, rate: number): string {
  return type === 'cashback' ? `${formatRate(rate)}% CashBack` : `HK$${formatRate(rate)}/Mile`
}

function buildRecommendation(
  card: Card,
  type: RewardType,
  rate: number,
  isMerchantOverride: boolean,
  matchedCategory?: string,
  note?: string
): Recommendation {
  const valuePercent = toValuePercent(type, rate)
  return {
    card,
    rewardType: type,
    rate,
    matchedCategory,
    isMerchantOverride,
    valuePercent,
    label: formatLabel(type, rate),
    normalizedLabel: `≈ ${valuePercent.toFixed(2)}% effective yield`,
    note
  }
}

/** Evaluate a single card against a merchant. */
export function evaluateCard(card: Card, merchant: Merchant): Recommendation {
  // 1) Specific merchant override — highest priority.
  const override = card.merchantOverrides.find((o) => o.merchantId === merchant.id)
  if (override) {
    return buildRecommendation(card, override.type, override.rate, true, undefined, override.note)
  }

  // 2) Category multiplier — best matching category wins.
  const hits = card.categoryRates.filter((r) => merchant.categories.includes(r.category))
  if (hits.length > 0) {
    const best = hits.reduce((a, b) =>
      toValuePercent(a.type, a.rate) >= toValuePercent(b.type, b.rate) ? a : b
    )
    return buildRecommendation(card, best.type, best.rate, false, best.category, best.note)
  }

  // 3) Base earn rate.
  return buildRecommendation(card, card.baseType, card.baseRate, false)
}

/** Rank all cards for a merchant, sorted by highest normalized value. */
export function rankCardsForMerchant(merchant: Merchant, cards: Card[]): Recommendation[] {
  return cards
    .map((card) => evaluateCard(card, merchant))
    .filter((r) => r.valuePercent > 0)
    .sort((a, b) => b.valuePercent - a.valuePercent)
}
