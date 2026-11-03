/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * SECURE DETERMINISTIC CRYPTOGRAPHY ENGINE
 * 
 * Universal, zero-external-dependency cryptographic primitives:
 * - Deterministic JSON canonicalization (RFC 8785 subset)
 * - Universal SHA-256 (Node.js & browser compliant)
 * - Secp256k1 Elliptic Curve Schnorr Asymmetric Digital Signatures
 */

// ============================================================================
// 1. Universal SHA-256 Implementation
// ============================================================================

export function computeSha256(data: string): string {
  function rotateRight(n: number, x: number): number {
    return (x >>> n) | (x << (32 - n));
  }
  function choice(x: number, y: number, z: number): number {
    return (x & y) ^ (~x & z);
  }
  function majority(x: number, y: number, z: number): number {
    return (x & y) ^ (x & z) ^ (y & z);
  }
  function sigma0(x: number): number {
    return rotateRight(2, x) ^ rotateRight(13, x) ^ rotateRight(22, x);
  }
  function sigma1(x: number): number {
    return rotateRight(6, x) ^ rotateRight(11, x) ^ rotateRight(25, x);
  }
  function gamma0(x: number): number {
    return rotateRight(7, x) ^ rotateRight(18, x) ^ (x >>> 3);
  }
  function gamma1(x: number): number {
    return rotateRight(17, x) ^ rotateRight(19, x) ^ (x >>> 10);
  }

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const utf8: number[] = [];
  for (let i = 0; i < data.length; i++) {
    let charcode = data.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (data.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    }
  }

  const bitLength = utf8.length * 8;
  utf8.push(0x80);
  while ((utf8.length % 64) !== 56) {
    utf8.push(0);
  }
  for (let i = 7; i >= 0; i--) {
    utf8.push((bitLength >>> (i * 8)) & 0xff);
  }

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const w = new Array(64);
  for (let i = 0; i < utf8.length; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = (utf8[i + j * 4] << 24) | (utf8[i + j * 4 + 1] << 16) | (utf8[i + j * 4 + 2] << 8) | utf8[i + j * 4 + 3];
    }
    for (let j = 16; j < 64; j++) {
      w[j] = (gamma1(w[j - 2]) + w[j - 7] + gamma0(w[j - 15]) + w[j - 16]) | 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let j = 0; j < 64; j++) {
      const t1 = (h + sigma1(e) + choice(e, f, g) + K[j] + w[j]) | 0;
      const t2 = (sigma0(a) + majority(a, b, c)) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const hexParts = [h0, h1, h2, h3, h4, h5, h6, h7].map((num) => (num >>> 0).toString(16).padStart(8, '0'));
  return hexParts.join('');
}

// ============================================================================
// 2. Deterministic Canonical JSON Serializer
// ============================================================================

export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map((item) => canonicalizeJson(item)).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map((key) => {
    const val = (obj as Record<string, unknown>)[key];
    return JSON.stringify(key) + ':' + canonicalizeJson(val);
  });
  return '{' + pairs.join(',') + '}';
}

// ============================================================================
// 3. Secp256k1 Elliptic Curve & Schnorr Digital Signature Engine
// ============================================================================

const CURVE_P = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2Fn;
const CURVE_N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n;
const CURVE_GX = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n;
const CURVE_GY = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8n;

interface CurvePoint {
  readonly x: bigint;
  readonly y: bigint;
  readonly isInfinity?: boolean;
}

const POINT_INFINITY: CurvePoint = { x: 0n, y: 0n, isInfinity: true };
const BASE_G: CurvePoint = { x: CURVE_GX, y: CURVE_GY };

function mod(n: bigint, m: bigint): bigint {
  const result = n % m;
  return result >= 0n ? result : result + m;
}

function modInverse(a: bigint, m: bigint): bigint {
  let [old_r, r] = [mod(a, m), m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const quotient = old_r / r;
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }
  return mod(old_s, m);
}

function pointAdd(p1: CurvePoint, p2: CurvePoint): CurvePoint {
  if (p1.isInfinity) return p2;
  if (p2.isInfinity) return p1;

  if (p1.x === p2.x) {
    if (mod(p1.y + p2.y, CURVE_P) === 0n) {
      return POINT_INFINITY;
    }
    // Point doubling: lambda = (3 * x1^2) / (2 * y1)
    const num = mod(3n * p1.x * p1.x, CURVE_P);
    const den = modInverse(2n * p1.y, CURVE_P);
    const lambda = mod(num * den, CURVE_P);
    const x3 = mod(lambda * lambda - 2n * p1.x, CURVE_P);
    const y3 = mod(lambda * (p1.x - x3) - p1.y, CURVE_P);
    return { x: x3, y: y3 };
  }

  // Point addition: lambda = (y2 - y1) / (x2 - x1)
  const num = mod(p2.y - p1.y, CURVE_P);
  const den = modInverse(p2.x - p1.x, CURVE_P);
  const lambda = mod(num * den, CURVE_P);
  const x3 = mod(lambda * lambda - p1.x - p2.x, CURVE_P);
  const y3 = mod(lambda * (p1.x - x3) - p1.y, CURVE_P);
  return { x: x3, y: y3 };
}

function pointMultiply(k: bigint, point: CurvePoint): CurvePoint {
  let scalar = mod(k, CURVE_N);
  if (scalar === 0n || point.isInfinity) return POINT_INFINITY;

  let result: CurvePoint = POINT_INFINITY;
  let addend: CurvePoint = point;

  while (scalar > 0n) {
    if ((scalar & 1n) === 1n) {
      result = pointAdd(result, addend);
    }
    addend = pointAdd(addend, addend);
    scalar >>= 1n;
  }

  return result;
}

export interface KeyPair {
  readonly privateKey: string; // 64-hex private scalar
  readonly publicKey: string;  // 66-hex compressed public key (02/03 + x)
}

/**
 * Derives the compressed public key from a private key.
 */
export function getPublicKeyFromPrivate(privateKeyHex: string): string {
  const cleanPriv = privateKeyHex.replace(/^0x/, '');
  const privScalar = mod(BigInt('0x' + cleanPriv), CURVE_N);
  if (privScalar === 0n) {
    throw new Error('Invalid private key scalar: cannot be zero');
  }
  const pubPoint = pointMultiply(privScalar, BASE_G);
  const prefix = (pubPoint.y % 2n === 0n) ? '02' : '03';
  return prefix + pubPoint.x.toString(16).padStart(64, '0');
}

/**
 * Generate a deterministically reproducible or entropy-seeded Secp256k1 key pair.
 */
export function generateKeyPair(seedText?: string): KeyPair {
  const seed = seedText || `seed_${Date.now()}_${Math.random()}`;
  const privHash = computeSha256(seed);
  const privScalar = mod(BigInt('0x' + privHash), CURVE_N - 2n) + 1n;
  const privateKey = privScalar.toString(16).padStart(64, '0');
  const publicKey = getPublicKeyFromPrivate(privateKey);
  return { privateKey, publicKey };
}

/**
 * Decompresses a 66-character compressed public key into a curve point (x, y).
 */
function decompressPublicKey(publicKeyHex: string): CurvePoint {
  const clean = publicKeyHex.replace(/^0x/, '');
  if (clean.length !== 66) {
    throw new Error(`Invalid compressed public key length: expected 66 chars, got ${clean.length}`);
  }
  const prefix = clean.slice(0, 2);
  const x = BigInt('0x' + clean.slice(2));
  if (x >= CURVE_P) {
    throw new Error('Public key x coordinate out of range');
  }

  // y^2 = x^3 + 7 mod P
  const ySq = mod(x * x * x + 7n, CURVE_P);
  // Secp256k1 P = 3 mod 4, so modular sqrt is y = ySq^((P+1)/4) mod P
  const exp = (CURVE_P + 1n) / 4n;

  // Modular exponentiation
  let base = ySq;
  let power = exp;
  let y = 1n;
  while (power > 0n) {
    if ((power & 1n) === 1n) {
      y = mod(y * base, CURVE_P);
    }
    base = mod(base * base, CURVE_P);
    power >>= 1n;
  }

  // Verify sqrt
  if (mod(y * y, CURVE_P) !== ySq) {
    throw new Error('Point does not lie on secp256k1 curve');
  }

  const isEven = y % 2n === 0n;
  if ((prefix === '02' && !isEven) || (prefix === '03' && isEven)) {
    y = CURVE_P - y;
  }

  return { x, y };
}

/**
 * Cryptographically sign a message or arbitrary object using Secp256k1 Schnorr signature.
 * Returns signature formatted as: `sig:schnorr:<Rx_64hex>:<s_64hex>`
 */
export function signPayload(payload: string | object, privateKeyHex: string): string {
  const cleanPriv = privateKeyHex.replace(/^0x/, '');
  const d = mod(BigInt('0x' + cleanPriv), CURVE_N);
  if (d === 0n) {
    throw new Error('Invalid private key for signing');
  }

  const messageStr = typeof payload === 'string' ? payload : canonicalizeJson(payload);
  const msgHash = computeSha256(messageStr);
  const pubKey = getPublicKeyFromPrivate(cleanPriv);

  // RFC 6979 style deterministic nonce generation
  const kHash = computeSha256(cleanPriv + ':' + msgHash + ':' + pubKey);
  const k = mod(BigInt('0x' + kHash), CURVE_N - 2n) + 1n;

  const R = pointMultiply(k, BASE_G);
  const rxHex = R.x.toString(16).padStart(64, '0');

  // Challenge e = SHA256(Rx || PubKey || MsgHash) mod N
  const eHash = computeSha256(rxHex + pubKey + msgHash);
  const e = mod(BigInt('0x' + eHash), CURVE_N);

  // s = (k + e * d) mod N
  const s = mod(k + e * d, CURVE_N);
  const sHex = s.toString(16).padStart(64, '0');

  return `sig:schnorr:${rxHex}:${sHex}`;
}

/**
 * Cryptographically verifies a Secp256k1 Schnorr signature against a public key.
 */
export function verifySignature(payload: string | object, signature: string, publicKeyHex: string): boolean {
  try {
    if (!signature || typeof signature !== 'string') return false;
    const parts = signature.split(':');
    if (parts.length !== 4 || parts[0] !== 'sig' || parts[1] !== 'schnorr') {
      return false;
    }

    const rxHex = parts[2];
    const sHex = parts[3];
    if (rxHex.length !== 64 || sHex.length !== 64) {
      return false;
    }

    const expectedRx = BigInt('0x' + rxHex);
    const s = BigInt('0x' + sHex);
    if (s <= 0n || s >= CURVE_N) {
      return false;
    }

    const messageStr = typeof payload === 'string' ? payload : canonicalizeJson(payload);
    const msgHash = computeSha256(messageStr);
    const cleanPub = publicKeyHex.replace(/^0x/, '');
    const pubPoint = decompressPublicKey(cleanPub);

    // e = SHA256(Rx || PubKey || MsgHash) mod N
    const eHash = computeSha256(rxHex + cleanPub + msgHash);
    const e = mod(BigInt('0x' + eHash), CURVE_N);

    // Verify: s * G - e * Q == R  ==>  s * G + (N - e) * Q == R
    const sG = pointMultiply(s, BASE_G);
    const negE = mod(CURVE_N - e, CURVE_N);
    const negEQ = pointMultiply(negE, pubPoint);
    const calculatedR = pointAdd(sG, negEQ);

    if (calculatedR.isInfinity) {
      return false;
    }

    return calculatedR.x === expectedRx;
  } catch {
    return false;
  }
}

// ============================================================================
// 4. Default Sovereign Key Infrastructure (Anchors for Q-Mesh Subsystems)
// ============================================================================

// Sovereign Root Authority KeyPair (PROVISO & CommitReceipt Root)
export const SOVEREIGN_ROOT_AUTHORITY = generateKeyPair('guardian_oracle_sovereign_root_master_seed_2026');

// Cascadia Mesh Root Certificate Authority (CA Admission Root)
export const CASCADIA_ROOT_CA = generateKeyPair('cascadia_mesh_root_certificate_authority_seed_2026');

// Standard Node Operator KeyPair for certified nodes
export const OPERATOR_NODE_ALPHA = generateKeyPair('operator_node_alpha_mesh_certified_seed_2026');
