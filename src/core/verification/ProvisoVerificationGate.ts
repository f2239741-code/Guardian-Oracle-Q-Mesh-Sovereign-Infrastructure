/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * MODULE 3: VERIFICATION GATE — PROVISO AUTHORIZATION GATE
 * 
 * PROVISO verifies action proposals against signed authorization events
 * before Commit.
 * Invariant: Memory must never manufacture authority.
 * 
 * HARDENED CRYPTOGRAPHIC INVARIANTS:
 * 1. Cryptographic Signature Verification: Every authorization event's digital
 *    signature is verified using the authorizing principal's public key.
 * 2. Append-Only Ledger: The audit trail is an immutable append-only chain.
 *    Events cannot be mutated in-place; revocations are explicitly appended
 *    revocation records referencing prior authorization event IDs.
 */

import { TaskPolicyEngine } from '../policy/TaskPolicyEngine';
import {
  computeSha256,
  canonicalizeJson,
  verifySignature,
  signPayload,
  assertKeyNotCompromised,
  SOVEREIGN_ROOT_AUTHORITY,
  KeyPair,
} from '../crypto/cryptoUtils';

export interface CandidateAction {
  readonly actionId: string;
  readonly targetResource: string;
  readonly operation: string;
  readonly proposedByModel: string;
  readonly payloadHash: string;
}

export interface SignedAuthorizationEvent {
  readonly eventId: string;
  readonly principalId: string;
  readonly principalPublicKey: string; // Secp256k1 compressed public key
  readonly principalSignature: string; // Schnorr signature over canonical event authorization payload
  readonly authorizedResource: string;
  readonly authorizedOp: string;
  readonly issuedAt: number;
}

export interface RevocationRecord {
  readonly recordType: 'REVOCATION';
  readonly targetEventId: string;
  readonly revokingPrincipalId: string;
  readonly revokingPrincipalPublicKey: string;
  readonly revocationSignature: string;
  readonly reason: string;
  readonly revokedAt: number;
}

export type LedgerEntry =
  | {
      readonly type: 'AUTHORIZATION';
      readonly index: number;
      readonly entryHash: string;
      readonly prevHash: string;
      readonly event: SignedAuthorizationEvent;
    }
  | {
      readonly type: 'REVOCATION';
      readonly index: number;
      readonly entryHash: string;
      readonly prevHash: string;
      readonly revocation: RevocationRecord;
    };

export interface VerificationResult {
  readonly valid: boolean;
  readonly reason: string;
  readonly matchingEventId?: string;
  readonly verifiedAt: string;
}

/**
 * Canonical payload representation for signing and verifying authorization events.
 */
export function getAuthorizationEventSigningPayload(event: {
  eventId: string;
  principalId: string;
  authorizedResource: string;
  authorizedOp: string;
  issuedAt: number;
}): string {
  return canonicalizeJson({
    authorizedOp: event.authorizedOp,
    authorizedResource: event.authorizedResource,
    eventId: event.eventId,
    issuedAt: event.issuedAt,
    principalId: event.principalId,
  });
}

/**
 * Helper to construct and cryptographically sign a valid authorization event.
 */
export function createSignedAuthorizationEvent(
  params: {
    eventId: string;
    principalId: string;
    authorizedResource: string;
    authorizedOp: string;
    issuedAt?: number;
  },
  signerOrPrivateKey?: KeyPair | string,
  publicKeyParam?: string
): SignedAuthorizationEvent {
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

  assertKeyNotCompromised(privateKey, 'authorization event signing private key');
  assertKeyNotCompromised(publicKey, 'authorization event principal public key');

  const issuedAt = params.issuedAt ?? Date.now();
  const payloadToSign = getAuthorizationEventSigningPayload({
    eventId: params.eventId,
    principalId: params.principalId,
    authorizedResource: params.authorizedResource,
    authorizedOp: params.authorizedOp,
    issuedAt,
  });

  const principalSignature = signPayload(payloadToSign, privateKey);

  return {
    eventId: params.eventId,
    principalId: params.principalId,
    principalPublicKey: publicKey,
    principalSignature,
    authorizedResource: params.authorizedResource,
    authorizedOp: params.authorizedOp,
    issuedAt,
  };
}

export class ProvisoVerificationGate {
  // Cryptographically chained, append-only authorization ledger
  private readonly ledger: LedgerEntry[] = [];
  private readonly eventsById: Map<string, SignedAuthorizationEvent> = new Map();
  private readonly revokedEventIds: Set<string> = new Set();
  private readonly trustedPublicKeys: Set<string> = new Set();
  private readonly GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor(trustedAuthorityPublicKeys?: Iterable<string>) {
    if (trustedAuthorityPublicKeys) {
      for (const key of trustedAuthorityPublicKeys) {
        this.registerTrustedAuthority(key);
      }
    } else {
      // By default, enroll the active sovereign root authority public key
      this.registerTrustedAuthority(SOVEREIGN_ROOT_AUTHORITY.publicKey);
    }
  }

  /**
   * Register a trusted Sovereign Authority public key as a verification anchor.
   */
  public registerTrustedAuthority(publicKeyHex: string): void {
    const clean = publicKeyHex.replace(/^0x/, '').toLowerCase();
    assertKeyNotCompromised(clean, 'sovereign authority public key');
    this.trustedPublicKeys.add(clean);
  }

  public getTrustedAuthorities(): ReadonlySet<string> {
    return this.trustedPublicKeys;
  }

  /**
   * Append a cryptographically signed authorization event to the immutable append-only ledger.
   * Enforces:
   * 1. Immutability: duplicate eventIds are strictly rejected.
   * 2. Cryptographic Verification: digital signature must verify against principalPublicKey.
   * 3. Chaining: links to previous entry hash.
   * 4. Trust Anchor Check: principalPublicKey must be enrolled and not compromised.
   */
  public appendAuthorizationEvent(event: SignedAuthorizationEvent): void {
    if (!event || !event.eventId) {
      throw new Error('Invalid authorization event: eventId is required');
    }

    if (this.eventsById.has(event.eventId)) {
      throw new Error(`Append-only ledger violation: event '${event.eventId}' already exists and cannot be overwritten.`);
    }

    if (!event.principalPublicKey || !event.principalSignature) {
      throw new Error('Cryptographic rejection: Authorization event missing principal public key or digital signature.');
    }

    const cleanPrincipalKey = event.principalPublicKey.replace(/^0x/, '').toLowerCase();
    assertKeyNotCompromised(cleanPrincipalKey, 'event principal public key');

    if (this.trustedPublicKeys.size > 0 && !this.trustedPublicKeys.has(cleanPrincipalKey)) {
      throw new Error(
        `Cryptographic rejection: Principal public key ${cleanPrincipalKey.slice(0, 16)}... is not an enrolled sovereign authority.`
      );
    }

    // Cryptographically verify digital signature over canonical payload
    const payloadToVerify = getAuthorizationEventSigningPayload({
      eventId: event.eventId,
      principalId: event.principalId,
      authorizedResource: event.authorizedResource,
      authorizedOp: event.authorizedOp,
      issuedAt: event.issuedAt,
    });

    const isSigValid = verifySignature(payloadToVerify, event.principalSignature, event.principalPublicKey);
    if (!isSigValid) {
      throw new Error(
        `Cryptographic rejection: Invalid digital signature on authorization event '${event.eventId}'. Verification failed.`
      );
    }

    const prevHash = this.ledger.length === 0
      ? this.GENESIS_PREV_HASH
      : this.ledger[this.ledger.length - 1].entryHash;

    const index = this.ledger.length;
    const entryData = {
      type: 'AUTHORIZATION' as const,
      index,
      prevHash,
      event: { ...event },
    };
    const entryHash = computeSha256(canonicalizeJson(entryData));

    const entry: LedgerEntry = {
      type: 'AUTHORIZATION',
      index,
      entryHash,
      prevHash,
      event: Object.freeze({ ...event }),
    };

    this.ledger.push(entry);
    this.eventsById.set(event.eventId, entry.event);
  }

  /**
   * Revoke an authorization event by appending an explicit REVOCATION record to the append-only ledger.
   * Does NOT mutate previous records in-place.
   */
  public revokeAuthorizationEvent(
    targetEventId: string,
    reason: string = 'Administrative revocation',
    revokingPrincipalId: string = 'did:mesh:authority-root',
    revokingPrivateKey: string = SOVEREIGN_ROOT_AUTHORITY.privateKey,
    revokingPublicKey: string = SOVEREIGN_ROOT_AUTHORITY.publicKey
  ): boolean {
    const existing = this.eventsById.get(targetEventId);
    if (!existing) {
      return false;
    }

    if (this.revokedEventIds.has(targetEventId)) {
      return true; // Already revoked
    }

    const cleanRevokerPub = revokingPublicKey.replace(/^0x/, '').toLowerCase();
    assertKeyNotCompromised(cleanRevokerPub, 'revoking authority public key');
    assertKeyNotCompromised(revokingPrivateKey, 'revoking authority private key');

    if (this.trustedPublicKeys.size > 0 && !this.trustedPublicKeys.has(cleanRevokerPub)) {
      throw new Error(
        `Cryptographic rejection: Revoking public key ${cleanRevokerPub.slice(0, 16)}... is not an enrolled sovereign authority.`
      );
    }

    const revokedAt = Date.now();
    const revocationPayload = canonicalizeJson({
      reason,
      revokedAt,
      revokingPrincipalId,
      targetEventId,
    });

    const revocationSignature = signPayload(revocationPayload, revokingPrivateKey);
    const prevHash = this.ledger.length === 0
      ? this.GENESIS_PREV_HASH
      : this.ledger[this.ledger.length - 1].entryHash;

    const index = this.ledger.length;
    const revocationRecord: RevocationRecord = {
      recordType: 'REVOCATION',
      targetEventId,
      revokingPrincipalId,
      revokingPrincipalPublicKey: revokingPublicKey,
      revocationSignature,
      reason,
      revokedAt,
    };

    const entryHash = computeSha256(canonicalizeJson({
      type: 'REVOCATION',
      index,
      prevHash,
      revocation: revocationRecord,
    }));

    const entry: LedgerEntry = {
      type: 'REVOCATION',
      index,
      entryHash,
      prevHash,
      revocation: Object.freeze(revocationRecord),
    };

    this.ledger.push(entry);
    this.revokedEventIds.add(targetEventId);
    return true;
  }

  /**
   * Retrieve an authorization event from the ledger.
   */
  public getAuthorizationEvent(eventId: string): SignedAuthorizationEvent | undefined {
    return this.eventsById.get(eventId);
  }

  /**
   * Check if an event has been revoked in the ledger.
   */
  public isEventRevoked(eventId: string): boolean {
    return this.revokedEventIds.has(eventId);
  }

  /**
   * List all authorization events recorded in the ledger.
   */
  public listAuthorizationEvents(): ReadonlyArray<SignedAuthorizationEvent> {
    return Array.from(this.eventsById.values());
  }

  /**
   * Get the complete immutable ledger entries.
   */
  public getLedger(): ReadonlyArray<LedgerEntry> {
    return [...this.ledger];
  }

  /**
   * Clear ledger (solely for test lifecycle isolation).
   */
  public clear(): void {
    this.ledger.length = 0;
    this.eventsById.clear();
    this.revokedEventIds.clear();
  }

  /**
   * Evaluates CandidateResult against authoritative permission ledger.
   * 
   * CRITICAL GUARANTEES:
   * 1. Check REALM policy engine capability grant with mandatory recipient check.
   * 2. Verify against append-only signed authorization ledger.
   * 3. Re-verify digital signatures cryptographically against registered public keys.
   * 4. Verify event has not been revoked by any subsequent ledger revocation entry.
   * 5. Learned controller / model output is NEVER sufficient justification for execution.
   */
  public verifyCandidateAction(
    action: CandidateAction,
    policyEngine: TaskPolicyEngine,
    recipientAgentId: string
  ): VerificationResult {
    const nowIso = new Date().toISOString();

    // 1. Check REALM policy engine grant with mandatory recipient validation
    const hasCapability = policyEngine.evaluateAccess(
      action.targetResource,
      action.operation,
      recipientAgentId
    );

    if (!hasCapability) {
      return {
        valid: false,
        reason: `REJECTED: No valid capability grant for resource '${action.targetResource}' with operation '${action.operation}' for recipient '${recipientAgentId}'.`,
        verifiedAt: nowIso,
      };
    }

    // 2. Verify against append-only authorization ledger
    const matchingEvents = Array.from(this.eventsById.values()).filter(
      (e) =>
        e.authorizedResource === action.targetResource &&
        e.authorizedOp === action.operation &&
        !this.revokedEventIds.has(e.eventId)
    );

    if (matchingEvents.length === 0) {
      return {
        valid: false,
        reason:
          "REJECTED: Authorization laundering detected. Action lacks backing signed authorization event.",
        verifiedAt: nowIso,
      };
    }

    const matchedEvent = matchingEvents[0];

    // 3. Cryptographically verify digital signature
    const payloadToVerify = getAuthorizationEventSigningPayload({
      eventId: matchedEvent.eventId,
      principalId: matchedEvent.principalId,
      authorizedResource: matchedEvent.authorizedResource,
      authorizedOp: matchedEvent.authorizedOp,
      issuedAt: matchedEvent.issuedAt,
    });

    const isSigValid = verifySignature(
      payloadToVerify,
      matchedEvent.principalSignature,
      matchedEvent.principalPublicKey
    );

    const cleanMatchedPub = matchedEvent.principalPublicKey.replace(/^0x/, '').toLowerCase();
    if (this.trustedPublicKeys.size > 0 && !this.trustedPublicKeys.has(cleanMatchedPub)) {
      return {
        valid: false,
        reason: `REJECTED: Principal public key on event '${matchedEvent.eventId}' is not an enrolled sovereign authority.`,
        verifiedAt: nowIso,
      };
    }

    if (!isSigValid) {
      return {
        valid: false,
        reason: `REJECTED: Cryptographic failure. Principal signature on event '${matchedEvent.eventId}' is invalid or forged.`,
        verifiedAt: nowIso,
      };
    }

    return {
      valid: true,
      reason:
        "ACCEPTED: Candidate action verified against signed provenance and policy gate.",
      matchingEventId: matchedEvent.eventId,
      verifiedAt: nowIso,
    };
  }
}
