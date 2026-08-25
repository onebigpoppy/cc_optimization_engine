# Credit Card Smart Optimizer Engine

Production-grade Vue 3 + TypeScript demo of a **zero-knowledge** credit-card
reward optimizer. Pick one of 6 spending categories (or search a merchant) and
instantly rank every card in your wallet by normalized reward value.

The 6 categories mirror the reference site
[hkcashrebate.com](https://hkcashrebate.com):

| Category | Reference page |
|---|---|
| `online` 網上簽賬 | https://hkcashrebate.com/online |
| `supermarket` 超市 | https://hkcashrebate.com/supermarket |
| `drive` 揸車 | https://hkcashrebate.com/drive |
| `dining` 餐飲食肆 | https://hkcashrebate.com/dining |
| `utility-bill` 繳費 | https://hkcashrebate.com/utility-bill |
| `overseas` 海外簽賬 | https://hkcashrebate.com/overseas |

## Stack

- Vue 3 (`<script setup lang="ts">`)
- Pinia (wallet + rules stores)
- Zod (runtime schema validation of all state)
- DOMPurify (XSS sanitization)
- Web Crypto (AES-256-GCM encrypted LocalStorage)
- Tailwind CSS + `@lucide/vue`

## Getting started

```bash
npm install
npm run dev
```

Type-check / build / refresh data:

```bash
npm run typecheck
npm run build
npm run crawl      # refresh cards.json from hkcashrebate.com
```

## Data source & crawl pipeline

Card & merchant data live in committed JSON snapshots under
`src/core/domain/data/`, loaded and Zod-validated by
`src/core/domain/services/dataProvider.ts`:

- `cards.json` — card definitions (rates, issuer, network, **card image URL**).
- `merchants.json` — concrete merchants (百佳/惠康/Amazon/美心皇宮…) + 6 virtual
  "category" merchants (`cat_*`) that power the category chips.

> 滙豐 EveryMile「指定商戶」2.5% 商戶名單以 HSBC 官方 PDF 為準：
> https://www.hsbc.com.hk/content/dam/hsbc/hk/tc/docs/credit-cards/everymile/everymile-everyday-spend.pdf

The browser **cannot** fetch hkcashrebate.com directly (CORS), so the app ships
a bundled snapshot and, at runtime, tries to refresh from the same-origin
`/data/*.json` (Zod-validated, with the bundled snapshot as fallback).

`scripts/crawl-hkcashrebate.mjs` (run via `npm run crawl`) fetches the 6 category
pages, parses the comparison tables, and refreshes each card's `categoryRates`.
Card images are hot-linked from hkcashrebate.com via each card's `imageUrl`.
The GitHub Actions workflow `.github/workflows/crawl.yml` runs it daily.

## Deploy to GitHub Pages

The repo includes two workflows:

- `.github/workflows/deploy.yml` — builds and publishes to GitHub Pages on every
  push to `main`. Vite copies `cards.json`/`merchants.json` into `dist/data/`
  and uses `BASE_PATH=/<repo>/` so assets resolve on a project site.
- `.github/workflows/crawl.yml` — daily cron that runs the crawler, commits the
  updated `cards.json`, and (via the push) triggers a redeploy.

Publishing steps:

1. Push this folder to a GitHub repo.
2. In the repo → **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The first `deploy.yml` run publishes the site at
   `https://<user>.github.io/<repo>/`.

The app fetches `/data/cards.json` at runtime, so each daily crawl automatically
updates the live site without any manual redeploy.

## Architecture

```
src/
├── components/ui/          # Atomic design-system components
├── core/
│   ├── domain/
│   │   ├── data/           # Committed JSON snapshots (cards, merchants)
│   │   ├── models/         # Zod schemas + TypeScript types
│   │   └── services/       # recommendationEngine, merchantMatcher, dataProvider
│   └── security/           # Sanitizers, SecureStorage, validation, memory sanitation
├── modules/card-optimizer/
│   ├── components/         # MerchantSearch, CardRecommendationCard
│   ├── composables/        # useMerchantSearch, useCardRecommendation
│   └── views/              # OptimizerView
├── stores/                 # Pinia: wallet, rules
└── types/                  # Shared TS definitions
scripts/
└── crawl-hkcashrebate.mjs  # Node crawler → refresh cards.json
```

## Security model

- **Zero-knowledge**: no PAN / CVV / expiry fields exist anywhere in the codebase.
  Wallet entries are `{ instanceId: UUID, cardId }` only.
- **XSS**: search input is sanitized with a strict allowlist; rendering is text
  interpolation only (no `v-html`).
- **State validation**: every persisted/restored payload passes a Zod schema;
  forbidden sensitive keys are rejected by `assertNoSensitiveData`.
- **Encryption at rest**: wallet is AES-256-GCM encrypted (PBKDF2 key derivation)
  before writing to LocalStorage.
- **Memory sanitation**: transient byte buffers are wiped after use.

## Reward math

- CashBack: `Value % = CashBack %`
- Miles: `Value % = (flight value per mile / HKD per mile) × 100`
  with the default assumption **1 mile ≈ HK$0.10** (so HK$4/mile → 2.50%).

> Sample card/merchant data is illustrative only, sourced from
> hkcashrebate.com, and does not constitute financial advice.
