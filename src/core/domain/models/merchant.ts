import { z } from 'zod'

/**
 * A merchant that can be matched against the wallet.
 * Aliases power fuzzy, bilingual (CJK / Latin) search.
 */
export const MerchantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  aliases: z.array(z.string().min(1)).default([]),
  categories: z.array(z.string().min(1)).min(1),
  promo: z.string().max(120).optional()
})

export type Merchant = z.infer<typeof MerchantSchema>

/** Re-usable runtime validator for untrusted merchant payloads. */
export const MerchantArraySchema = z.array(MerchantSchema)
