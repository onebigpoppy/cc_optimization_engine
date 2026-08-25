/**
 * SecureStorage — authenticated-encrypted persistence over localStorage.
 *
 * - Payloads are encrypted with AES-256-GCM (Web Crypto).
 * - Keys are derived with PBKDF2 (120k iterations, SHA-256) from a per-record
 *   random salt plus an app secret.
 * - AES-GCM provides both confidentiality AND integrity (auth tag), so any
 *   tampering is detected and the record is discarded.
 *
 * NOTE (production): the app secret below is a demo placeholder. In a real
 * deployment the key material should come from a user secret or a
 * hardware-backed keychain. Regardless, NO PAN/CVV/expiry is ever stored —
 * the wallet only holds semantic card ids, so even a plaintext fallback leaks
 * nothing sensitive.
 */

const APP_SECRET = 'cc-optimizer-engine.v1.demo-key-material'
const PBKDF2_ITERATIONS = 120_000

interface StorageRecord {
  v: 1
  salt: string
  iv: string
  data: string
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(APP_SECRET),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export class SecureStorage {
  constructor(private readonly namespace: string) {}

  /** True when the Web Crypto API is available (secure context). */
  get isSecure(): boolean {
    return (
      typeof globalThis.crypto !== 'undefined' &&
      typeof globalThis.crypto.subtle !== 'undefined'
    )
  }

  private fullKey(key: string): string {
    return `${this.namespace}.${key}`
  }

  async save<T>(key: string, value: T): Promise<void> {
    const payload = JSON.stringify(value)

    if (!this.isSecure) {
      // Fallback: sanitized plain storage (no sensitive fields exist by design).
      localStorage.setItem(this.fullKey(key), payload)
      return
    }

    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const cryptoKey = await deriveKey(salt)
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encoder.encode(payload)
    )

    const record: StorageRecord = {
      v: 1,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      data: bytesToBase64(new Uint8Array(ciphertext))
    }
    localStorage.setItem(this.fullKey(key), JSON.stringify(record))
  }

  async load<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(this.fullKey(key))
    if (!raw) return null

    try {
      if (!this.isSecure) return JSON.parse(raw) as T

      const record = JSON.parse(raw) as StorageRecord
      if (record.v !== 1) throw new Error('Unsupported storage version')

      const salt = base64ToBytes(record.salt)
      const iv = base64ToBytes(record.iv)
      const data = base64ToBytes(record.data)

      const cryptoKey = await deriveKey(salt)
      const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data)
      return JSON.parse(decoder.decode(plaintext)) as T
    } catch {
      // Tampered / corrupt record → discard.
      localStorage.removeItem(this.fullKey(key))
      return null
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.fullKey(key))
  }
}

/** Shared storage instance for the app. */
export const secureStorage = new SecureStorage('cc.optimizer')
