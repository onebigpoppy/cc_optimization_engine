import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { WalletSchema, type Wallet, type WalletCard } from '@/core/domain/models/wallet'
import type { Card } from '@/core/domain/models/card'
import { secureStorage } from '@/core/security/secureStorage'
import { assertNoSensitiveData, safeParse } from '@/core/security/validation'
import { sanitizeText } from '@/core/security/sanitize'
import { generateUUID } from '@/core/security/uuid'
import { useRulesStore } from '@/stores/rules'

const STORAGE_KEY = 'wallet.v1'

function buildDefaultWallet(): WalletCard[] {
  const addedAt = new Date().toISOString()
  return ['card_hsbc_red', 'card_dbs_compass', 'card_hsb_mmpower'].map((cardId) => ({
    instanceId: generateUUID(),
    cardId,
    addedAt
  }))
}

/**
 * User wallet — zero-knowledge by construction.
 * Holds only instance UUIDs + card definition ids. Persisted through
 * authenticated encryption; hydrated through Zod validation.
 */
export const useWalletStore = defineStore('wallet', () => {
  const cards = ref<WalletCard[]>([])
  const hydrated = ref(false)

  const walletCards = computed(() => {
    const rules = useRulesStore()
    return cards.value
      .map((walletCard) => ({
        walletCard,
        definition: rules.getCard(walletCard.cardId)
      }))
      .filter(
        (entry): entry is { walletCard: WalletCard; definition: Card } =>
          entry.definition !== undefined
      )
  })

  const cardIds = computed(() => new Set(cards.value.map((c) => c.cardId)))

  /** Drop wallet entries whose card definition no longer exists in the catalog. */
  function pruneInvalidCards(list: WalletCard[]): WalletCard[] {
    const rules = useRulesStore()
    return list.filter((card) => rules.getCard(card.cardId) !== undefined)
  }

  async function load(): Promise<void> {
    const stored = await secureStorage.load<unknown>(STORAGE_KEY)

    if (stored) {
      const parsed = safeParse(WalletSchema, stored)
      if (parsed.success) {
        cards.value = pruneInvalidCards(parsed.data.cards)
        hydrated.value = true
        return
      }
    }

    // First run / invalid payload → seed a sane default wallet.
    cards.value = buildDefaultWallet()
    await persist()
    hydrated.value = true
  }

  async function persist(): Promise<void> {
    const wallet: Wallet = { version: 1, cards: cards.value }
    const parsed = safeParse(WalletSchema, wallet)
    if (!parsed.success) {
      console.warn('[wallet] refusing to persist invalid state', parsed.error)
      return
    }
    assertNoSensitiveData(parsed.data)
    await secureStorage.save(STORAGE_KEY, parsed.data)
  }

  function addCard(cardId: string, nickname?: string): void {
    const rules = useRulesStore()
    if (!rules.getCard(cardId)) return
    if (cards.value.some((c) => c.cardId === cardId)) return

    const safeNickname = nickname ? sanitizeText(nickname).slice(0, 40) || undefined : undefined

    cards.value.push({
      instanceId: generateUUID(),
      cardId,
      nickname: safeNickname,
      addedAt: new Date().toISOString()
    })
    void persist()
  }

  function removeCard(instanceId: string): void {
    cards.value = cards.value.filter((c) => c.instanceId !== instanceId)
    void persist()
  }

  function isInWallet(cardId: string): boolean {
    return cardIds.value.has(cardId)
  }

  return {
    cards,
    hydrated,
    walletCards,
    load,
    persist,
    addCard,
    removeCard,
    isInWallet
  }
})
