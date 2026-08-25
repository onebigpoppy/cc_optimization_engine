import { z } from 'zod'

export const REWARD_TYPES = ['cashback', 'miles'] as const
export type RewardType = (typeof REWARD_TYPES)[number]

export const CARD_NETWORKS = ['visa', 'mastercard', 'amex', 'unionpay', 'jcb'] as const
export type CardNetwork = (typeof CARD_NETWORKS)[number]

/**
 * A per-merchant promotional override.
 * rate: for `cashback` → percentage points (e.g. 10 = 10%).
 *       for `miles`    → HKD spent per mile (e.g. 2 = HK$2/Mile).
 */
export const MerchantOverrideSchema = z.object({
  merchantId: z.string().min(1),
  type: z.enum(REWARD_TYPES),
  rate: z.number().positive(),
  note: z.string().max(200).optional()
})

/** A category multiplier (e.g. Supermarket, Dining, Overseas, Online). */
export const CategoryRateSchema = z.object({
  category: z.string().min(1),
  type: z.enum(REWARD_TYPES),
  rate: z.number().positive(),
  note: z.string().max(200).optional()
})

/**
 * Card definition.
 *
 * ZERO-KNOWLEDGE: there is intentionally NO PAN, CVV, expiry, cardholder
 * name or any other sensitive field. Cards are referenced by a semantic id
 * (e.g. `card_hsbc_vs`) — never by a real card number.
 */
export const CardSchema = z.object({
  id: z.string().regex(/^card_[a-z0-9_]+$/),
  name: z.string().min(1),
  issuer: z.string().min(1),
  network: z.enum(CARD_NETWORKS),
  baseType: z.enum(REWARD_TYPES),
  baseRate: z.number().positive(),
  categoryRates: z.array(CategoryRateSchema).default([]),
  merchantOverrides: z.array(MerchantOverrideSchema).default([]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  imageUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional()
})

export type MerchantOverride = z.infer<typeof MerchantOverrideSchema>
export type CategoryRate = z.infer<typeof CategoryRateSchema>
export type Card = z.infer<typeof CardSchema>

export const CardCatalogSchema = z.array(CardSchema)
