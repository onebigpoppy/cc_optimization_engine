export const SPEND_CATEGORIES = [
  'online',
  'supermarket',
  'drive',
  'dining',
  'utility-bill',
  'overseas'
] as const

export type SpendCategory = (typeof SPEND_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<SpendCategory, string> = {
  online: 'Online',
  supermarket: 'Supermarket',
  drive: 'Driving',
  dining: 'Dining',
  'utility-bill': 'Utilities',
  overseas: 'Overseas'
}

export const CATEGORY_LABELS_ZH: Record<SpendCategory, string> = {
  online: '網上簽賬',
  supermarket: '超市',
  drive: '揸車',
  dining: '餐飲食肆',
  'utility-bill': '繳費',
  overseas: '海外簽賬'
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category as SpendCategory] ?? category
}

export function categoryLabelZh(category: string): string {
  return CATEGORY_LABELS_ZH[category as SpendCategory] ?? category
}
