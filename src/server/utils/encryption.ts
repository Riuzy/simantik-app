import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH_BYTES = 32;
const IV_LENGTH_BYTES = 12;

/**
 * Derives a 32-byte AES key from the configured ENCRYPTION_KEY.
 * The key is provided as a hex string (64 characters) in the environment.
 * Fails fast when the key is missing so secrets are never stored in plain text.
 */
function resolveKey(): Buffer {
  const secret = config.encryptionSecret.trim();
  if (!secret) {
    throw new Error('ENCRYPTION_KEY is not configured. Refusing to run with secret-in-plain-text.');
  }
  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    return Buffer.from(secret, 'hex');
  }
  // Accept any long key by hashing it into a stable 32-byte buffer.
  const derived = Buffer.from(secret, 'utf8');
  const key = Buffer.alloc(KEY_LENGTH_BYTES);
  if (derived.length >= KEY_LENGTH_BYTES) {
    derived.copy(key, 0, 0, KEY_LENGTH_BYTES);
  } else {
    derived.copy(key);
  }
  return key;
}

function hasKey(): boolean {
  return !!config.encryptionSecret.trim();
}

/**
 * Encrypts a plain-text secret using AES-256-GCM.
 * Returns a single string in the format `<iv>:<authTag>:<ciphertext>` (all base64).
 */
export function encryptSecret(plainText: string): string {
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, resolveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

/**
 * Decrypts a value previously produced by encryptSecret.
 * Returns null when there is nothing to decrypt or no key is configured.
 */
export function decryptSecret(payload: string | null | undefined): string | null {
  if (!payload) return null;
  if (!hasKey()) return null;

  const [ivB64, tagB64, dataB64] = payload.split(':');
  if (!ivB64 || !tagB64 || !dataB64) {
    // Legacy plain-text value that was never encrypted.
    return payload;
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    resolveKey(),
    Buffer.from(ivB64, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}