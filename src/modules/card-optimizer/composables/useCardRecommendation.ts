import { computed, type Ref } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { useRulesStore } from '@/stores/rules'
import { rankCardsForMerchant } from '@/core/domain/services/recommendationEngine'
import type { Merchant } from '@/core/domain/models/merchant'
import type { Card } from '@/core/domain/models/card'

export function useCardRecommendation(merchant: Ref<Merchant | null>) {
  const wallet = useWalletStore()
  const rules = useRulesStore()

  const recommendations = computed(() => {
    const target = merchant.value
    if (!target) return []

    const definitions = wallet.cards
      .map((walletCard) => rules.getCard(walletCard.cardId))
      .filter((card): card is Card => card !== undefined)

    return rankCardsForMerchant(target, definitions)
  })

  const best = computed(() => recommendations.value[0] ?? null)
  const hasRecommendations = computed(() => recommendations.value.length > 0)

  return { recommendations, best, hasRecommendations }
}
