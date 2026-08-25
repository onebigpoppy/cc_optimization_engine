export type Locale = 'en' | 'zh-Hant'

export interface Messages {
  app: { name: string; tagline: string }
  header: { zeroKnowledge: string }
  hero: { badge: string; titleA: string; titleB: string; subtitle: string }
  search: { placeholder: string; clear: string }
  results: {
    bestFor: string
    noCards: string
    emptyTitle: string
    emptyDesc: string
    sourceNote: string
  }
  wallet: {
    title: string
    cards: string
    cashback: string
    miles: string
    add: string
    available: string
    empty: string
    remove: string
  }
  security: { title: string; desc: string }
  footer: { disclaimer: string }
  card: {
    topPick: string
    merchantPromo: string
    multiplier: string
    value: string
    effectiveYield: string
    cashback: string
    perMile: string
  }
}

export const messages: Record<Locale, Messages> = {
  en: {
    app: { name: 'Card Optimizer', tagline: 'Smart Reward Engine · HK' },
    header: { zeroKnowledge: 'Zero-knowledge' },
    hero: {
      badge: '6 categories · real HK card data',
      titleA: 'Which card earns',
      titleB: ' you the most?',
      subtitle:
        'Pick a spending category or search a merchant, and instantly compare every card in your wallet by normalized reward value.'
    },
    search: {
      placeholder: "Search a merchant — ParknShop · Amazon · Maxim's · Cathay",
      clear: 'Clear search'
    },
    results: {
      bestFor: 'Best cards for',
      noCards: 'No cards in your wallet yet. Add a card from the panel to start comparing.',
      emptyTitle: 'Ready when you are',
      emptyDesc: 'Pick a category or search a merchant to see instant, ranked recommendations.',
      sourceNote: 'Rates are sourced from hkcashrebate.com (illustrative only, subject to change).'
    },
    wallet: {
      title: 'Your wallet',
      cards: '{n} cards',
      cashback: 'Cashback card',
      miles: 'Miles card',
      add: 'Add a card',
      available: '{n} available',
      empty: 'Wallet is empty.',
      remove: 'Remove card'
    },
    security: {
      title: 'Zero-knowledge by design.',
      desc: 'No card numbers, CVV or expiry are ever collected. Your wallet stores only card definitions, encrypted at rest.'
    },
    footer: {
      disclaimer: 'Sample data is illustrative only and does not constitute financial advice.'
    },
    card: {
      topPick: 'Top pick',
      merchantPromo: 'Merchant promo',
      multiplier: '{cat} multiplier',
      value: '{n}% value',
      effectiveYield: '≈ {n}% effective yield',
      cashback: 'CashBack',
      perMile: 'Mile'
    }
  },
  'zh-Hant': {
    app: { name: '信用卡優化器', tagline: '智能回贈引擎 · 香港' },
    header: { zeroKnowledge: '零知識' },
    hero: {
      badge: '6 大類別 · 真實香港信用卡數據',
      titleA: '哪張信用卡',
      titleB: '回贈最多？',
      subtitle: '選擇消費類別或搜尋商戶，即時比較銀包內每張信用卡的標準化回贈價值。'
    },
    search: {
      placeholder: '搜尋商戶',
      clear: '清除搜尋'
    },
    results: {
      bestFor: '最佳信用卡',
      noCards: '銀包暫時沒有信用卡。請從右方面板加入信用卡以開始比較。',
      emptyTitle: '準備就緒',
      emptyDesc: '選擇類別或搜尋商戶，即可查看即時排名推薦。',
      sourceNote: '回贈率資料來自 hkcashrebate.com（僅供參考，隨時變動）。'
    },
    wallet: {
      title: '我的銀包',
      cards: '{n} 張卡',
      cashback: '現金回贈卡',
      miles: '里數卡',
      add: '加入信用卡',
      available: '尚有 {n} 張',
      empty: '銀包是空的。',
      remove: '移除信用卡'
    },
    security: {
      title: '零知識設計。',
      desc: '絕不收集信用卡號碼、CVV 或有效期。銀包只儲存卡定義，並於靜態時加密。'
    },
    footer: {
      disclaimer: '示例數據僅供參考，不構成任何財務建議。'
    },
    card: {
      topPick: '首選',
      merchantPromo: '商戶優惠',
      multiplier: '{cat} 加成',
      value: '{n}% 價值',
      effectiveYield: '≈ {n}% 有效回報',
      cashback: '現金回贈',
      perMile: '里'
    }
  }
}
