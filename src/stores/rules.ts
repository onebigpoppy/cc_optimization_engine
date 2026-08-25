import { defineStore } from 'pinia'
import type { Card } from '@/core/domain/models/card'
import type { Merchant } from '@/core/domain/models/merchant'
import { cards, merchants } from '@/core/domain/services/dataProvider'

/**
 * Read-only reference data: available card definitions and the merchant
 * catalog. Backed by the shared reactive refs in `dataProvider` so a runtime
 * refresh (hydrateData) is picked up everywhere automatically.
 */
export const useRulesStore = defineStore('rules', () => {
  function getCard(id: string): Card | undefined {
    return cards.value.find((card) => card.id === id)
  }

  function getMerchant(id: string): Merchant | undefined {
    return merchants.value.find((merchant) => merchant.id === id)
  }

  return { cards, merchants, getCard, getMerchant }
})
