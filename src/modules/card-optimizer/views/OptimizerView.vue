<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ShieldCheck, CreditCard, Plus, Trash2, Wallet, Sparkles, Info } from '@lucide/vue'
import MerchantSearch from '../components/MerchantSearch.vue'
import CardRecommendationCard from '../components/CardRecommendationCard.vue'
import { BaseCard, BaseBadge } from '@/components/ui'
import { useMerchantSearch } from '../composables/useMerchantSearch'
import { useCardRecommendation } from '../composables/useCardRecommendation'
import { useWalletStore } from '@/stores/wallet'
import { useRulesStore } from '@/stores/rules'
import { SPEND_CATEGORIES } from '@/core/domain/models/categories'
import { useI18n } from '@/core/i18n'

const { target, selectedCategory, selectCategory } = useMerchantSearch()
const { recommendations, hasRecommendations } = useCardRecommendation(target)
const { t, isZh, categoryName, setLocale } = useI18n()

const wallet = useWalletStore()
const rules = useRulesStore()

onMounted(() => {
  void wallet.load()
})

const availableCards = computed(() => rules.cards.filter((card) => !wallet.isInWallet(card.id)))

/** Localized target label — category targets use their category name, merchants keep theirs. */
const targetLabel = computed(() => {
  const current = target.value
  if (!current) return ''
  if (current.id.startsWith('cat_')) return categoryName(current.categories[0] ?? '')
  return current.name
})

function addCard(cardId: string): void {
  wallet.addCard(cardId)
}

function removeCard(instanceId: string): void {
  wallet.removeCard(instanceId)
}
</script>

<template>
  <div class="min-h-screen overflow-x-clip">
    <header class="sticky top-0 z-30 border-b border-line/60 bg-white/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
            <CreditCard class="h-5 w-5" />
          </div>
          <div>
            <h1 class="font-display text-lg font-semibold tracking-tight text-ink">
              {{ t('app.name') }}
            </h1>
            <p class="hidden text-xs text-ink-muted sm:block">{{ t('app.tagline') }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Language toggle -->
          <div class="flex items-center rounded-full bg-surface p-0.5">
            <button
              type="button"
              class="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
              :class="isZh ? 'bg-white text-ink shadow-soft' : 'text-ink-muted hover:text-ink'"
              @click="setLocale('zh-Hant')"
            >
              繁
            </button>
            <button
              type="button"
              class="rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
              :class="!isZh ? 'bg-white text-ink shadow-soft' : 'text-ink-muted hover:text-ink'"
              @click="setLocale('en')"
            >
              EN
            </button>
          </div>

          <BaseBadge variant="success">
            <ShieldCheck class="h-3.5 w-3.5" />
            {{ t('header.zeroKnowledge') }}
          </BaseBadge>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <!-- Search hero -->
      <section class="mx-auto max-w-3xl text-center">
        <div
          class="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1 text-xs font-medium text-ink-muted"
        >
          <Sparkles class="h-3.5 w-3.5 text-accent" />
          {{ t('hero.badge') }}
        </div>

        <h2
          class="font-display mt-4 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl"
        >
          {{ t('hero.titleA') }}<span class="text-accent">{{ t('hero.titleB') }}</span>
        </h2>

        <p class="mx-auto mt-4 max-w-xl text-sm text-ink-muted sm:text-base">
          {{ t('hero.subtitle') }}
        </p>

        <!-- 6 reference categories -->
        <div class="mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-2">
          <button
            v-for="category in SPEND_CATEGORIES"
            :key="category"
            type="button"
            class="rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5 sm:py-2.5"
            :class="
              selectedCategory === category
                ? 'bg-accent text-white hover:bg-accent-hover'
                : 'bg-surface text-ink hover:bg-line/50'
            "
            @click="selectCategory(category)"
          >
            {{ categoryName(category) }}
          </button>
        </div>

        <div class="mx-auto mt-6 max-w-2xl text-left">
          <MerchantSearch />
        </div>
      </section>

      <!-- Results -->
      <section class="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="min-w-0">
          <template v-if="target">
            <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 class="font-display text-xl font-bold tracking-tight text-ink">
                {{ t('results.bestFor') }}
                <span class="text-accent">{{ targetLabel }}</span>
              </h3>
              <div class="flex flex-wrap gap-1.5">
                <BaseBadge
                  v-for="category in target.categories"
                  :key="category"
                  variant="outline"
                >
                  {{ categoryName(category) }}
                </BaseBadge>
              </div>
            </div>

            <div v-if="hasRecommendations" class="space-y-4">
              <CardRecommendationCard
                v-for="(rec, index) in recommendations"
                :key="rec.card.id"
                :recommendation="rec"
                :rank="index + 1"
                :is-best="index === 0"
              />
              <p class="pt-1 text-center text-xs text-ink-muted">
                {{ t('results.sourceNote') }}
              </p>
            </div>

            <BaseCard v-else>
              <div class="flex items-start gap-3 text-sm text-ink-muted">
                <Info class="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" />
                <span>{{ t('results.noCards') }}</span>
              </div>
            </BaseCard>
          </template>

          <div
            v-else
            class="flex flex-col items-center rounded-3xl border border-dashed border-line bg-surface/50 px-8 py-16 text-center"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white">
              <Sparkles class="h-6 w-6" />
            </div>
            <p class="mt-4 font-display text-lg font-semibold text-ink">
              {{ t('results.emptyTitle') }}
            </p>
            <p class="mt-1 max-w-sm text-sm text-ink-muted">{{ t('results.emptyDesc') }}</p>
          </div>
        </div>

        <!-- Wallet sidebar -->
        <aside class="min-w-0">
          <div class="rounded-3xl bg-surface/60 p-5">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="font-display flex items-center gap-2 text-base font-semibold text-ink">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
                  <Wallet class="h-4 w-4" />
                </span>
                {{ t('wallet.title') }}
              </h3>
              <span class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink-muted">
                {{ t('wallet.cards', { n: wallet.walletCards.length }) }}
              </span>
            </div>

            <ul class="space-y-2">
              <li
                v-for="entry in wallet.walletCards"
                :key="entry.walletCard.instanceId"
                class="flex items-center gap-3 rounded-xl border border-line/60 bg-white p-2.5 transition hover:border-line"
              >
                <div
                  class="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-line/70"
                >
                  <span
                    class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ink-subtle"
                  >
                    {{ entry.definition.issuer.slice(0, 2).toUpperCase() }}
                  </span>
                  <img
                    v-if="entry.definition.imageUrl"
                    :src="entry.definition.imageUrl"
                    :alt="entry.definition.name"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    class="absolute inset-0 h-full w-full object-contain p-1"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-ink">{{ entry.definition.name }}</p>
                  <p class="text-[11px] text-ink-muted">
                    {{ entry.definition.baseType === 'cashback' ? t('wallet.cashback') : t('wallet.miles') }}
                  </p>
                </div>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-ink-subtle transition hover:bg-surface hover:text-ink"
                  :aria-label="t('wallet.remove')"
                  @click="removeCard(entry.walletCard.instanceId)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </li>

              <li
                v-if="wallet.walletCards.length === 0"
                class="py-6 text-center text-sm text-ink-muted"
              >
                {{ t('wallet.empty') }}
              </li>
            </ul>

            <div v-if="availableCards.length > 0" class="mt-5 border-t border-line/60 pt-4">
              <p
                class="mb-2 flex items-center justify-between text-xs font-semibold text-ink-muted"
              >
                {{ t('wallet.add') }}
                <span class="font-medium">{{ t('wallet.available', { n: availableCards.length }) }}</span>
              </p>
              <ul class="scrollbar-thin max-h-64 space-y-1.5 overflow-y-auto pr-1">
                <li v-for="card in availableCards" :key="card.id">
                  <button
                    type="button"
                    class="group flex w-full items-center gap-2.5 rounded-xl border border-line/60 bg-white px-2.5 py-2 text-left transition hover:border-accent/40 hover:bg-accent-soft/40"
                    @click="addCard(card.id)"
                  >
                    <div
                      class="relative h-8 w-14 shrink-0 overflow-hidden rounded-md bg-surface ring-1 ring-line/70"
                    >
                      <span
                        class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ink-subtle"
                      >
                        {{ card.issuer.slice(0, 2).toUpperCase() }}
                      </span>
                      <img
                        v-if="card.imageUrl"
                        :src="card.imageUrl"
                        :alt="card.name"
                        loading="lazy"
                        referrerpolicy="no-referrer"
                        class="absolute inset-0 h-full w-full object-contain p-0.5"
                        @error="($event.target as HTMLImageElement).style.display = 'none'"
                      />
                    </div>
                    <span class="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {{ card.name }}
                    </span>
                    <Plus
                      class="h-4 w-4 shrink-0 text-ink-subtle transition group-hover:text-accent"
                    />
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div
            class="mt-4 flex items-start gap-2.5 rounded-2xl bg-surface/60 p-4 text-xs text-ink-muted"
          >
            <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p>
              <strong class="text-ink">{{ t('security.title') }}</strong> {{ t('security.desc') }}
            </p>
          </div>
        </aside>
      </section>
    </main>

    <footer class="mt-12 border-t border-line/60 bg-surface/50">
      <div class="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-ink-muted sm:px-6">
        {{ t('footer.disclaimer') }}
      </div>
    </footer>
  </div>
</template>
