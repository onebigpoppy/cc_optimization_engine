<script setup lang="ts">
import { ref } from 'vue'
import { Search, X, MapPin } from '@lucide/vue'
import { useMerchantSearch } from '../composables/useMerchantSearch'
import { useI18n } from '@/core/i18n'
import type { Merchant } from '@/core/domain/models/merchant'

const { query, results, selectMerchant } = useMerchantSearch()
const { t, categoryName } = useI18n()

const isOpen = ref(false)

function choose(merchant: Merchant): void {
  selectMerchant(merchant)
  query.value = merchant.name
  isOpen.value = false
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && results.value.length > 0) {
    choose(results.value[0].merchant)
  } else if (event.key === 'Escape') {
    isOpen.value = false
  }
}

function onFocus(): void {
  isOpen.value = true
}

function onBlur(): void {
  // Delay close so suggestion clicks register before blur.
  window.setTimeout(() => (isOpen.value = false), 120)
}
</script>

<template>
  <div class="relative">
    <div
      class="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 shadow-card transition-all focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20"
    >
      <Search class="h-5 w-5 shrink-0 text-ink-subtle" />
      <input
        v-model="query"
        type="search"
        inputmode="search"
        autocomplete="off"
        :placeholder="t('search.placeholder')"
        class="w-full bg-transparent text-base text-ink placeholder:text-ink-subtle focus:outline-none"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <button
        v-if="query"
        type="button"
        class="rounded-full p-1 text-ink-subtle hover:bg-surface hover:text-ink"
        :aria-label="t('search.clear')"
        @mousedown.prevent="query = ''"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <ul
        v-if="isOpen && results.length > 0"
        class="absolute z-20 mt-3 w-full overflow-hidden rounded-2xl border border-line bg-white shadow-card"
      >
        <li v-for="match in results" :key="match.merchant.id">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
            @mousedown.prevent="choose(match.merchant)"
          >
            <span class="flex items-center gap-2.5">
              <MapPin class="h-4 w-4 shrink-0 text-ink-subtle" />
              <!-- Text interpolation only — no v-html anywhere. -->
              <span class="font-medium text-ink">{{ match.merchant.name }}</span>
            </span>
            <span class="flex flex-wrap justify-end gap-1">
              <span
                v-for="category in match.merchant.categories"
                :key="category"
                class="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-muted"
              >
                {{ categoryName(category) }}
              </span>
            </span>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>
