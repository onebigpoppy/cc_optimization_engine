/**
 * Client-side memory sanitation.
 *
 * JavaScript strings are immutable and cannot be reliably zeroized; the
 * strongest guarantee therefore comes from NEVER collecting PAN/CVV/expiry.
 * These helpers scrub transient buffers (Uint8Array) and best-effort clear
 * plain-object records before they are dropped.
 */

export function wipeUint8Array(buffer: Uint8Array | null | undefined): void {
  if (!buffer) return
  buffer.fill(0)
}

export function scrubRecord(record: Record<string, unknown>): void {
  for (const key of Object.keys(record)) {
    const value = record[key]
    if (typeof value === 'string') {
      record[key] = ''
    } else if (typeof value === 'number') {
      record[key] = 0
    } else if (value instanceof Uint8Array) {
      wipeUint8Array(value)
    } else if (Array.isArray(value)) {
      value.length = 0
    } else if (value && typeof value === 'object') {
      scrubRecord(value as Record<string, unknown>)
    }
  }
}
