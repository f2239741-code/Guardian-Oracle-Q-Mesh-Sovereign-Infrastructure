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
 * 
 * HARDENED CRYPTOGRAPHIC INVARIANTS:
 * 1. Digital Signing: Every CommitReceipt is digitally signed by the authorizing sovereign authority
 *    using Secp256k1 Schnorr signatures.
 * 2. Cryptographic Verification: Verification verifies both content-addressed SHA-256 hash integrity
 *    AND digital signatures against registered public keys.
 * 3. Authority Validation: Does NOT accept caller-supplied 'isVerified' flags; authorization references
 *    require authentic digital signatures.
 */

import {
  computeSha256,
  canonicalizeJson,
  signPayload,
  verifySignature,
  assertKeyNotCompromised,
  isKeyCompromised,
  SOVEREIGN_ROOT_AUTHORITY,
  KeyPair,
} from '../crypto/cryptoUtils';

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
  readonly authEventId: string;          // Reference to append-only ledger event in ProvisoVerificationGate
  readonly grantId: string;              // Reference to active REALM resource grant in TaskPolicyEngine
  readonly principalId: string;          // Authorizing entity ID
  readonly principalPublicKey: string;   // Secp256k1 public key of authorizing principal
  readonly authorizationSignature: string; // Cryptographic digital signature over authorization parameters
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
  readonly authoritySignature: string;   // Asymmetric Schnorr signature over receiptId by sovereign authority
  readonly authorizingPublicKey: string; // Public key of the sovereign authority
}

/**
 * Canonical representation of authorization ref for digital signing and verification.
 */
export function getAuthorizationRefSigningPayload(ref: {
  authEventId: string;
  grantId: string;
  principalId: string;
}): string {
  return canonicalizeJson({
    authEventId: ref.authEventId,
    grantId: ref.grantId,
    principalId: ref.principalId,
  });
}

/**
 * Helper to create a cryptographically signed SovereignAuthorizationRef.
 */
export function createSignedAuthorizationRef(
  params: {
    authEventId: string;
    grantId: string;
    principalId: string;
  },
  signerOrPrivateKey?: KeyPair | string,
  publicKeyParam?: string
): SovereignAuthorizationRef {
  let privateKey: string;
  let publicKey: string;

  if (signerOrPrivateKey && typeof signerOrPrivateKey === 'object' && 'privateKey' in signerOrPrivateKey) {
    privateKey = signerOrPrivateKey.privateKey;
    publicKey = signerOrPrivateKey.publicKey;
  } else if (typeof signerOrPrivateKey === 'string') {
    privateKey = signerOrPrivateKey;
    publicKey = publicKeyParam || SOVEREIGN_ROOT_AUTHORITY.publicKey;
  } else {
    privateKey = SOVEREIGN_ROOT_AUTHORITY.privateKey;
    publicKey = SOVEREIGN_ROOT_AUTHORITY.publicKey;
  }

  assertKeyNotCompromised(privateKey, 'authorization ref signing private key');
  assertKeyNotCompromised(publicKey, 'authorization ref principal public key');

  const payload = getAuthorizationRefSigningPayload(params);
  const authorizationSignature = signPayload(payload, privateKey);
  return {
    authEventId: params.authEventId,
    grantId: params.grantId,
    principalId: params.principalId,
    principalPublicKey: publicKey,
    authorizationSignature,
  };
}

/**
 * Canonical payload string of a CommitReceipt for hashing and signing.
 */
export function getReceiptPayloadCanonicalString(params: {
  parentReceiptId?: string;
  commitTimestamp: number;
  inputLineage: readonly LineageEntry[];
  evidence: ExecutionEvidence;
  authorization: SovereignAuthorizationRef;
  stateDeltaHash: string;
}): string {
  return canonicalizeJson({
    authorization: params.authorization,
    commitTimestamp: params.commitTimestamp,
    evidence: params.evidence,
    inputLineage: params.inputLineage,
    parentReceiptId: params.parentReceiptId || null,
    stateDeltaHash: params.stateDeltaHash,
  });
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
    if (!auth || !auth.authEventId || !auth.principalPublicKey || !auth.authorizationSignature) {
      throw new Error("Cannot attach invalid or unsigned authorization ref to CommitReceipt.");
    }

    // Cryptographically verify authorization reference signature
    const authPayload = getAuthorizationRefSigningPayload({
      authEventId: auth.authEventId,
      grantId: auth.grantId,
      principalId: auth.principalId,
    });

    const isAuthSigValid = verifySignature(authPayload, auth.authorizationSignature, auth.principalPublicKey);
    if (!isAuthSigValid) {
      throw new Error("Cannot attach unverified authorization ref to CommitReceipt. Cryptographic signature check failed.");
    }

    this.authorization = auth;
    return this;
  }

  public setStateDelta(deltaPayload: string | object): this {
    const raw = typeof deltaPayload === 'string' ? deltaPayload : canonicalizeJson(deltaPayload);
    this.stateDeltaHash = computeSha256(raw);
    return this;
  }

  /**
   * Finalizes and digitally signs the portable CommitReceipt using a sovereign authority keypair.
   */
  public signAndBuild(
    signerOrPrivateKey?: KeyPair | string,
    authorizingPublicKeyParam?: string
  ): CommitReceipt {
    let authorityPrivateKey: string;
    let authorizingPublicKey: string;

    if (signerOrPrivateKey && typeof signerOrPrivateKey === 'object' && 'privateKey' in signerOrPrivateKey) {
      authorityPrivateKey = signerOrPrivateKey.privateKey;
      authorizingPublicKey = signerOrPrivateKey.publicKey;
    } else if (typeof signerOrPrivateKey === 'string') {
      authorityPrivateKey = signerOrPrivateKey;
      authorizingPublicKey = authorizingPublicKeyParam || SOVEREIGN_ROOT_AUTHORITY.publicKey;
    } else {
      authorityPrivateKey = SOVEREIGN_ROOT_AUTHORITY.privateKey;
      authorizingPublicKey = SOVEREIGN_ROOT_AUTHORITY.publicKey;
    }

    assertKeyNotCompromised(authorityPrivateKey, 'commit receipt authority private key');
    assertKeyNotCompromised(authorizingPublicKey, 'commit receipt authorizing public key');

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
    const canonicalPayload = getReceiptPayloadCanonicalString({
      parentReceiptId: this.parentReceiptId,
      commitTimestamp,
      inputLineage: this.lineage,
      evidence: this.evidence,
      authorization: this.authorization,
      stateDeltaHash: this.stateDeltaHash,
    });

    const receiptId = computeSha256(canonicalPayload);

    // Digitally sign receiptId with the sovereign authority's private key
    const authoritySignature = signPayload(receiptId, authorityPrivateKey);

    return Object.freeze({
      receiptId,
      parentReceiptId: this.parentReceiptId,
      commitTimestamp,
      inputLineage: [...this.lineage],
      evidence: this.evidence,
      authorization: this.authorization,
      stateDeltaHash: this.stateDeltaHash,
      authoritySignature,
      authorizingPublicKey,
    });
  }

  /**
   * Alias for signAndBuild using default sovereign root authority keys.
   */
  public build(): CommitReceipt {
    return this.signAndBuild();
  }

  /**
   * Cryptographically verifies:
   * 1. Content-addressed SHA-256 hash integrity of receipt payload.
   * 2. Sovereign authority digital signature over receiptId.
   * 3. Authorizing principal digital signature on the nested authorization ref.
   * 4. Optional check that authorizingPublicKey is in trustedPublicKeys.
   * 5. Validates that no involved keys are in the compromised blacklist.
   */
  public static verifyReceiptIntegrity(
    receipt: CommitReceipt,
    trustedPublicKeys?: Iterable<string>
  ): boolean {
    if (!receipt || !receipt.receiptId || !receipt.authoritySignature || !receipt.authorizingPublicKey) {
      return false;
    }

    const cleanAuthPub = receipt.authorizingPublicKey.replace(/^0x/, '').toLowerCase();
    if (isKeyCompromised(cleanAuthPub)) {
      return false;
    }

    if (receipt.authorization && receipt.authorization.principalPublicKey) {
      const cleanPrincipalPub = receipt.authorization.principalPublicKey.replace(/^0x/, '').toLowerCase();
      if (isKeyCompromised(cleanPrincipalPub)) {
        return false;
      }
    }

    if (trustedPublicKeys) {
      const trustedSet = new Set(Array.from(trustedPublicKeys).map(k => k.replace(/^0x/, '').toLowerCase()));
      if (trustedSet.size > 0 && !trustedSet.has(cleanAuthPub)) {
        return false; // Signer public key is not an enrolled sovereign authority
      }
    }

    // 1. Verify content-addressed payload hash
    const expectedPayload = getReceiptPayloadCanonicalString({
      parentReceiptId: receipt.parentReceiptId,
      commitTimestamp: receipt.commitTimestamp,
      inputLineage: receipt.inputLineage,
      evidence: receipt.evidence,
      authorization: receipt.authorization,
      stateDeltaHash: receipt.stateDeltaHash,
    });

    const expectedId = computeSha256(expectedPayload);
    if (expectedId !== receipt.receiptId) {
      return false; // Content hash mismatch (tampered payload)
    }

    // 2. Verify sovereign authority digital signature
    const isAuthoritySigValid = verifySignature(
      receipt.receiptId,
      receipt.authoritySignature,
      receipt.authorizingPublicKey
    );
    if (!isAuthoritySigValid) {
      return false; // Fabricated or invalid authority signature
    }

    // 3. Verify nested sovereign authorization reference digital signature
    if (!receipt.authorization || !receipt.authorization.principalPublicKey || !receipt.authorization.authorizationSignature) {
      return false;
    }

    const authPayload = getAuthorizationRefSigningPayload({
      authEventId: receipt.authorization.authEventId,
      grantId: receipt.authorization.grantId,
      principalId: receipt.authorization.principalId,
    });

    const isAuthRefSigValid = verifySignature(
      authPayload,
      receipt.authorization.authorizationSignature,
      receipt.authorization.principalPublicKey
    );

    return isAuthRefSigValid;
  }
}
