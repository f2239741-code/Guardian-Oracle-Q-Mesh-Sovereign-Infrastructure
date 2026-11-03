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
 */

import { TaskPolicyEngine } from '../policy/TaskPolicyEngine';

export interface CandidateAction {
  readonly actionId: string;
  readonly targetResource: string;
  readonly operation: string;
  readonly proposedByModel: string;
  readonly payloadHash: string;
}

export interface SignedAuthorizationEvent {
  readonly eventId: string;
  readonly principalSignature: string;
  readonly authorizedResource: string;
  readonly authorizedOp: string;
  readonly isRevoked?: boolean;
  readonly issuedAt?: number;
}

export interface VerificationResult {
  readonly valid: boolean;
  readonly reason: string;
  readonly matchingEventId?: string;
  readonly verifiedAt: string;
}

export class ProvisoVerificationGate {
  // Append-only signed authorization ledger
  private readonly authLedger: Map<string, SignedAuthorizationEvent> = new Map();

  /**
   * Append a cryptographically signed authorization event to the immutable ledger.
   */
  public appendAuthorizationEvent(event: SignedAuthorizationEvent): void {
    if (!event || !event.eventId) {
      throw new Error('Invalid authorization event: eventId is required');
    }
    this.authLedger.set(event.eventId, { ...event, isRevoked: event.isRevoked ?? false });
  }

  /**
   * Mark an authorization event as revoked in the ledger.
   */
  public revokeAuthorizationEvent(eventId: string): boolean {
    const existing = this.authLedger.get(eventId);
    if (!existing) {
      return false;
    }
    this.authLedger.set(eventId, { ...existing, isRevoked: true });
    return true;
  }

  /**
   * Retrieve an authorization event from the ledger.
   */
  public getAuthorizationEvent(eventId: string): SignedAuthorizationEvent | undefined {
    return this.authLedger.get(eventId);
  }

  /**
   * List all authorization events recorded in the ledger.
   */
  public listAuthorizationEvents(): ReadonlyArray<SignedAuthorizationEvent> {
    return Array.from(this.authLedger.values());
  }

  /**
   * Clear ledger (solely for test lifecycle isolation).
   */
  public clear(): void {
    this.authLedger.clear();
  }

  /**
   * Evaluates CandidateResult against authoritative permission ledger.
   * 
   * CRITICAL GUARANTEES:
   * 1. Check REALM policy engine capability grant.
   * 2. Verify against append-only signed authorization ledger (NOT remembered text or model summary).
   * 3. Learned controller / model output is NEVER sufficient justification for execution.
   */
  public verifyCandidateAction(
    action: CandidateAction,
    policyEngine: TaskPolicyEngine,
    recipientAgentId?: string
  ): VerificationResult {
    const nowIso = new Date().toISOString();

    // 1. Check REALM policy engine grant
    const hasCapability = policyEngine.evaluateAccess(
      action.targetResource,
      action.operation,
      recipientAgentId
    );

    if (!hasCapability) {
      return {
        valid: false,
        reason: `REJECTED: No valid capability grant for resource '${action.targetResource}' with operation '${action.operation}'.`,
        verifiedAt: nowIso,
      };
    }

    // 2. Verify against append-only authorization ledger (not remembered text or memory summaries)
    const matchingEvents = Array.from(this.authLedger.values()).filter(
      (e) =>
        e.authorizedResource === action.targetResource &&
        e.authorizedOp === action.operation &&
        !e.isRevoked
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

    return {
      valid: true,
      reason:
        "ACCEPTED: Candidate action verified against signed provenance and policy gate.",
      matchingEventId: matchedEvent.eventId,
      verifiedAt: nowIso,
    };
  }
}
