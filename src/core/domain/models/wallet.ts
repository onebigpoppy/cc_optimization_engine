import { z } from 'zod'

/**
 * A single card in the user's wallet.
 * `instanceId` is a client-generated UUID identifying this wallet entry.
 * `cardId` references a Card definition (e.g. `card_hsbc_vs`).
 * No PAN / CVV / expiry is ever stored.
 */
export const WalletCardSchema = z.object({
  instanceId: z.string().uuid(),
  cardId: z.string().regex(/^card_[a-z0-9_]+$/),
  nickname: z.string().max(40).optional(),
  addedAt: z.string().datetime()
})

export const WalletSchema = z.object({
  version: z.literal(1),
  cards: z.array(WalletCardSchema).default([])
})

export type WalletCard = z.infer<typeof WalletCardSchema>
export type Wallet = z.infer<typeof WalletSchema>
