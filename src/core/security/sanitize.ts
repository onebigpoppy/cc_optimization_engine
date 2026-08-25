import DOMPurify from 'dompurify'

/**
 * XSS-safe text sanitizer.
 * Strips all HTML (ALLOWED_TAGS = []) and neutralizes control characters.
 * Use for any string that may be interpolated into the DOM.
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return ''
  const cleaned = input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, 500)
  return DOMPurify.sanitize(cleaned, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

/**
 * Strict search-input sanitizer.
 * Allowlist printable text only: strips angle brackets and control chars,
 * then caps length. Returns a plain, safe string for matching.
 */
export function sanitizeSearchQuery(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 64)
}

/** Escape a value for safe use inside an HTML attribute (defense-in-depth). */
export function escapeAttribute(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })
}
