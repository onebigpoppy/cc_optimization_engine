<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, Crown } from '@lucide/vue'
import type { Recommendation } from '@/core/domain/services/recommendationEngine'
import { BaseBadge } from '@/components/ui'
import { useI18n } from '@/core/i18n'

const props = defineProps<{
  recommendation: Recommendation
  rank: number
  isBest: boolean
}>()

const { t, categoryName } = useI18n()

// Visual bar scaled to a 10% ceiling.
const barWidth = computed(() => Math.min(100, (props.recommendation.valuePercent / 10) * 100))

const rewardLabel = computed(() => {
  const { rewardType, rate } = props.recommendation
  const formatted = Number.isInteger(rate) ? String(rate) : rate.toFixed(2)
  return rewardType === 'cashback'
    ? `${formatted}% ${t('card.cashback')}`
    : `HK$${formatted}/${t('card.perMile')}`
})

const networkLabel = computed(() => {
  const n = props.recommendation.card.network
  switch (n) {
    case 'visa':
      return 'Visa'
    case 'mastercard':
      return 'Mastercard'
    case 'amex':
      return 'Amex'
    case 'unionpay':
      return 'UnionPay'
    case 'jcb':
      return 'JCB'
    default:
      return n
  }
})
</script>

<template>
  <div
    class="animate-fade-up rounded-2xl border bg-white p-5 shadow-card transition"
    :class="isBest ? 'border-accent/40 ring-1 ring-accent/20' : 'border-line/60'"
    :style="{ animationDelay: `${(rank - 1) * 60}ms` }"
  >
    <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div class="flex min-w-0 flex-1 items-center gap-4">
        <div
          class="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-surface ring-1 ring-line/70"
        >
          <span
            class="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink-subtle"
          >
            {{ recommendation.card.issuer.slice(0, 2).toUpperCase() }}
          </span>
          <img
            v-if="recommendation.card.imageUrl"
            :src="recommendation.card.imageUrl"
            :alt="recommendation.card.name"
            loading="lazy"
            referrerpolicy="no-referrer"
            class="absolute inset-0 h-full w-full object-contain p-1"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold"
              :class="isBest ? 'bg-accent text-white' : 'bg-surface text-ink-muted'"
            >
              {{ rank }}
            </span>
            <BaseBadge v-if="isBest" variant="info">
              <Crown class="h-3 w-3" /> {{ t('card.topPick') }}
            </BaseBadge>
            <BaseBadge v-if="recommendation.isMerchantOverride" variant="warning">
              <Sparkles class="h-3 w-3" /> {{ t('card.merchantPromo') }}
            </BaseBadge>
          </div>

          <h3 class="mt-1 truncate font-display text-base font-semibold text-ink">
            {{ recommendation.card.name }}
          </h3>
          <p class="mt-0.5 text-xs text-ink-muted">
            {{ recommendation.card.issuer }} · {{ networkLabel }}
          </p>
          <p v-if="recommendation.card.note" class="mt-1 text-xs text-ink-subtle">
            <a
              v-if="recommendation.card.noteUrl"
              :href="recommendation.card.noteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-accent hover:underline"
            >
              {{ recommendation.card.note }}
            </a>
            <template v-else>{{ recommendation.card.note }}</template>
          </p>
        </div>
      </div>

      <div class="ml-auto w-full text-left sm:w-auto sm:shrink-0 sm:text-right">
        <div class="text-xl font-bold tracking-tight text-ink sm:text-2xl">{{ rewardLabel }}</div>
        <div class="mt-0.5 text-xs font-medium text-ink-muted">
          {{ t('card.value', { n: recommendation.valuePercent.toFixed(2) }) }}
        </div>
      </div>
    </div>

    <div class="mt-4">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div class="h-full rounded-full bg-accent transition-all" :style="{ width: `${barWidth}%` }" />
      </div>
      <div class="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <BaseBadge v-if="recommendation.matchedCategory" variant="outline">
          {{ t('card.multiplier', { cat: categoryName(recommendation.matchedCategory) }) }}
        </BaseBadge>
        <span class="text-ink-muted">
          {{ t('card.effectiveYield', { n: recommendation.valuePercent.toFixed(2) }) }}
        </span>
      </div>
      <p
        v-if="recommendation.note"
        class="mt-1.5 rounded-lg bg-surface px-2.5 py-1.5 text-xs text-ink-muted"
      >
        {{ recommendation.note }}
      </p>
    </div>
  </div>
</template>
