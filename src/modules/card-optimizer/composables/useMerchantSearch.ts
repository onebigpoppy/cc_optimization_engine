import { computed, ref, watch } from 'vue'
import { useRulesStore } from '@/stores/rules'
import { searchMerchants } from '@/core/domain/services/merchantMatcher'
import { sanitizeSearchQuery } from '@/core/security/sanitize'
import type { Merchant } from '@/core/domain/models/merchant'
import type { SpendCategory } from '@/core/domain/models/categories'

// Module-scoped shared state → every consumer shares one search session.
const query = ref('')
const selectedMerchant = ref<Merchant | null>(null)
const selectedCategory = ref<SpendCategory | null>(null)

// Real-time matching: auto-select the best match while the user types.
watch(query, (raw) => {
  const sanitized = sanitizeSearchQuery(raw)
  if (!sanitized) {
    selectedMerchant.value = null
    return
  }

  // A typed search supersedes any category chip selection.
  selectedCategory.value = null

  const rules = useRulesStore()
  const matches = searchMerchants(sanitized, rules.merchants)
  selectedMerchant.value = matches[0]?.merchant ?? null
})

export function useMerchantSearch() {
  const rules = useRulesStore()

  const sanitizedQuery = computed(() => sanitizeSearchQuery(query.value))
  const results = computed(() => searchMerchants(sanitizedQuery.value, rules.merchants))
  const hasQuery = computed(() => sanitizedQuery.value.length > 0)

  /** Virtual "category" merchants (e.g. `cat_dining`) for the 6 spend categories. */
  const categoryMerchants = computed<Merchant[]>(() =>
    rules.merchants.filter((merchant) => merchant.id.startsWith('cat_'))
  )

  /** The effective target used by the recommendation engine. */
  const target = computed<Merchant | null>(() => {
    if (selectedCategory.value) {
      return (
        categoryMerchants.value.find((m) => m.id === `cat_${selectedCategory.value}`) ?? null
      )
    }
    return selectedMerchant.value
  })

  function selectMerchant(merchant: Merchant): void {
    selectedCategory.value = null
    selectedMerchant.value = merchant
  }

  function selectCategory(category: SpendCategory): void {
    query.value = ''
    selectedMerchant.value = null
    selectedCategory.value = category
  }

  function clear(): void {
    query.value = ''
    selectedMerchant.value = null
    selectedCategory.value = null
  }

  return {
    query,
    selectedMerchant,
    selectedCategory,
    sanitizedQuery,
    results,
    hasQuery,
    categoryMerchants,
    target,
    selectMerchant,
    selectCategory,
    clear
  }
}
