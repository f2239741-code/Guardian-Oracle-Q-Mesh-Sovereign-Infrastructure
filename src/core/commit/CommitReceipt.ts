/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * MODULE 4: COMMITRECEIPT — PORTABLE LINEAGE & VERIFICATION ENGINE (PHASE 004B)
 * 
 * This module incorporates the TRACEs research by embedding input lineage,
 * tool transformation history, and runtime execution context directly into
 * portable receipt artifacts. Crucially, it enforces the separation between
 * executor-produced evidence and sovereign authorization.
 */

/**
 * Standard SHA-256 hash helper supporting both Node.js (test runner) and browser runtime.
 */
function computeSha256(data: string): string {
  // Pure JS 32-bit SHA-256 implementation ensuring universal compatibility
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

/**
 * Source provenance entry representing an input artifact or context record consumed during execution.
 */
export interface LineageEntry {
  readonly recordId: string;
  readonly provenanceHash: string; // SHA-256 hash of the input object/document
  readonly sourceType: 'fact' | 'artifact' | 'policy' | 'episodic';
  readonly timestamp: number;
}

/**
 * Executor-produced evidence detailing the computational environment and execution traces.
 */
export interface ExecutionEvidence {
  readonly executorId: string; // Model or provider identifier (e.g., 'gemini-nano', 'local-npu')
  readonly candidateResultHash: string; // Hash of the proposed CandidateResult
  readonly toolCallsExecuted: readonly string[];
  readonly executionTimeMs: number;
  readonly environmentSignature: string; // Node runtime/version hash
}

/**
 * Sovereign authorization attestation linking back to the signed authorization event.
 */
export interface SovereignAuthorizationRef {
  readonly authEventId: string; // Reference to signed ledger event in ProvisoVerificationGate
  readonly grantId: string;     // Reference to active REALM resource grant in TaskPolicyEngine
  readonly principalId: string;  // Authorizing entity ID
  readonly isVerified: boolean;
}

/**
 * Immutable CommitReceipt schema for Phase 004B Verifiable Execution.
 */
export interface CommitReceipt {
  readonly receiptId: string;             // Content-addressed SHA-256 hash of the receipt payload
  readonly parentReceiptId?: string;       // For chained/multi-step workflow lineage
  readonly commitTimestamp: number;
  readonly inputLineage: readonly LineageEntry[];
  readonly evidence: ExecutionEvidence;
  readonly authorization: SovereignAuthorizationRef;
  readonly stateDeltaHash: string;        // SHA-256 hash of the committed state mutation
}

export class CommitReceiptBuilder {
  private lineage: LineageEntry[] = [];
  private evidence?: ExecutionEvidence;
  private authorization?: SovereignAuthorizationRef;
  private stateDeltaHash?: string;
  private parentReceiptId?: string;

  public setParentReceipt(parentReceiptId: string): this {
    this.parentReceiptId = parentReceiptId;
    return this;
  }

  public addLineageEntry(entry: LineageEntry): this {
    this.lineage.push(entry);
    return this;
  }

  public setExecutionEvidence(evidence: ExecutionEvidence): this {
    this.evidence = evidence;
    return this;
  }

  public setAuthorizationRef(auth: SovereignAuthorizationRef): this {
    if (!auth.isVerified) {
      throw new Error("Cannot attach unverified authorization ref to CommitReceipt.");
    }
    this.authorization = auth;
    return this;
  }

  public setStateDelta(deltaPayload: string | object): this {
    const raw = typeof deltaPayload === 'string' ? deltaPayload : JSON.stringify(deltaPayload);
    this.stateDeltaHash = computeSha256(raw);
    return this;
  }

  /**
   * Finalizes and signs the portable CommitReceipt using content-addressed hashing.
   */
  public build(): CommitReceipt {
    if (!this.evidence) {
      throw new Error("CommitReceipt requires valid ExecutionEvidence.");
    }
    if (!this.authorization) {
      throw new Error("CommitReceipt requires verified SovereignAuthorizationRef.");
    }
    if (!this.stateDeltaHash) {
      throw new Error("CommitReceipt requires a state delta hash.");
    }

    const commitTimestamp = Date.now();
    const payloadToHash = JSON.stringify({
      parentReceiptId: this.parentReceiptId,
      commitTimestamp,
      inputLineage: this.lineage,
      evidence: this.evidence,
      authorization: this.authorization,
      stateDeltaHash: this.stateDeltaHash,
    });

    const receiptId = computeSha256(payloadToHash);

    return Object.freeze({
      receiptId,
      parentReceiptId: this.parentReceiptId,
      commitTimestamp,
      inputLineage: [...this.lineage],
      evidence: this.evidence,
      authorization: this.authorization,
      stateDeltaHash: this.stateDeltaHash,
    });
  }

  /**
   * Cryptographically verifies that a receipt's content hash matches its receiptId.
   */
  public static verifyReceiptIntegrity(receipt: CommitReceipt): boolean {
    const payloadToHash = JSON.stringify({
      parentReceiptId: receipt.parentReceiptId,
      commitTimestamp: receipt.commitTimestamp,
      inputLineage: receipt.inputLineage,
      evidence: receipt.evidence,
      authorization: receipt.authorization,
      stateDeltaHash: receipt.stateDeltaHash,
    });

    const expectedId = computeSha256(payloadToHash);
    return expectedId === receipt.receiptId;
  }
}
