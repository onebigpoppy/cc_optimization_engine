/**
 * @deprecated Card data now lives in `src/core/domain/data/cards.json` and is
 * loaded + Zod-validated by `src/core/domain/services/dataProvider.ts`.
 * Kept as a re-export shim for backwards compatibility.
 */
export { cards, getCardById } from './dataProvider'
