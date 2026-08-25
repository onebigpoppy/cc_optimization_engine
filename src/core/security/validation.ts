import { z, type ZodType } from 'zod'

/**
 * Strict runtime validation / sanitation boundary.
 * Every state update passes through a Zod schema — anything that fails is
 * rejected rather than coerced into the store.
 */
export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export function safeParse<S extends ZodType>(schema: S, data: unknown): SafeParseResult<z.output<S>> {
  const result = schema.safeParse(data)
  if (result.success) return { success: true, data: result.data as z.output<S> }
  return {
    success: false,
    error: result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
  }
}

/** Fields that must NEVER appear in persisted state (zero-knowledge policy). */
const SENSITIVE_KEYS = new Set([
  'pan',
  'cardnumber',
  'cardno',
  'cvv',
  'cvv2',
  'cvc',
  'securitycode',
  'expiry',
  'exp',
  'expiration',
  'expirationdate'
])

/**
 * Defensive assertion that no sensitive card-holder data is being persisted.
 * Throws if any forbidden key is found anywhere in the object graph.
 */
export function assertNoSensitiveData(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) assertNoSensitiveData(item)
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const normalized = key.toLowerCase().replace(/[\s_-]/g, '')
      if (SENSITIVE_KEYS.has(normalized)) {
        throw new Error(`[zero-knowledge] sensitive field "${key}" is forbidden`)
      }
      assertNoSensitiveData(child)
    }
  }
}

/** Narrowing type guards used across the app. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
