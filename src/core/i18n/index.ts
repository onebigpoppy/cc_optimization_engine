import { computed, ref } from 'vue'
import { messages, type Locale, type Messages } from './messages'
import { categoryLabel, categoryLabelZh } from '@/core/domain/models/categories'

const LOCALE_KEY = 'cc.locale'
const DEFAULT_LOCALE: Locale = 'zh-Hant'

function readStoredLocale(): Locale {
  try {
    const value = localStorage.getItem(LOCALE_KEY)
    return value === 'en' || value === 'zh-Hant' ? value : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

/** Module-scoped locale → every component shares one language session. */
const locale = ref<Locale>(readStoredLocale())

type DotPath<T> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${K}.${DotPath<T[K]>}`
    : K
}[keyof T & string]

export type MessageKey = DotPath<Messages>

function getValue(obj: unknown, path: string): string | undefined {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj) as string | undefined
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in params ? String(params[key]) : `{${key}}`
  )
}

export function useI18n() {
  const isZh = computed(() => locale.value === 'zh-Hant')

  function t(key: MessageKey, params?: Record<string, string | number>): string {
    const template = getValue(messages[locale.value], key) ?? key
    return interpolate(template, params)
  }

  function categoryName(category: string): string {
    return locale.value === 'zh-Hant' ? categoryLabelZh(category) : categoryLabel(category)
  }

  function setLocale(next: Locale): void {
    locale.value = next
    try {
      localStorage.setItem(LOCALE_KEY, next)
    } catch {
      /* storage unavailable — in-memory only */
    }
  }

  return { locale, isZh, t, categoryName, setLocale }
}
