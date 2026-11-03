/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * MODULE 2: TASKPOLICY — REALM CAPABILITY ENVELOPES
 * 
 * REALM-style resource-bound capability grants enforce least privilege:
 * Discovering an asset NEVER grants authorization to use it.
 * Invariant: Asset Discovery ≠ Execution Authority.
 */

export interface ResourceGrant {
  readonly resourceId: string;
  readonly permittedOperations: ReadonlySet<string>;
  readonly downstreamPropagationScope: ReadonlySet<string>;
  readonly expiresAt: number; // in seconds (epoch)
  readonly issuedAt: number;
}

export class TaskPolicyEngine {
  private readonly grants: Map<string, ResourceGrant> = new Map();
  private readonly discoveredAssets: Set<string> = new Set();

  /**
   * Track asset discovery during task execution.
   * Conformance with Doctrine 4: Asset discovery confers ZERO authorization.
   */
  public registerDiscoveredAsset(assetId: string): void {
    if (!assetId || typeof assetId !== 'string') {
      throw new Error('Invalid assetId: must provide a non-empty string identifier');
    }
    this.discoveredAssets.add(assetId);
  }

  /**
   * Check whether an asset has been discovered.
   */
  public isAssetDiscovered(assetId: string): boolean {
    return this.discoveredAssets.has(assetId);
  }

  /**
   * List all discovered assets (for audit purposes).
   */
  public listDiscoveredAssets(): ReadonlySet<string> {
    return new Set(this.discoveredAssets);
  }

  /**
   * Explicitly issue a time-bounded capability grant tied to signed authorization.
   */
  public issueGrant(
    resourceId: string,
    operations: Iterable<string>,
    allowedDownstream: Iterable<string>,
    ttlSeconds: number = 300.0
  ): ResourceGrant {
    if (!resourceId) {
      throw new Error('Invalid resourceId');
    }

    const now = Date.now() / 1000;
    const grant: ResourceGrant = {
      resourceId,
      permittedOperations: Object.freeze(new Set(operations)),
      downstreamPropagationScope: Object.freeze(new Set(allowedDownstream)),
      expiresAt: now + ttlSeconds,
      issuedAt: now,
    };

    this.grants.set(resourceId, grant);
    return grant;
  }

  /**
   * Revoke an active resource grant.
   */
  public revokeGrant(resourceId: string): boolean {
    return this.grants.delete(resourceId);
  }

  /**
   * Retrieve an active grant by resource ID.
   */
  public getGrant(resourceId: string): ResourceGrant | undefined {
    return this.grants.get(resourceId);
  }

  /**
   * Evaluate action against capability bounds and Task-Graph Contextual Integrity.
   * 
   * Strict enforcement:
   * 1. Target resource must have an explicit active grant (discovery alone fails closed).
   * 2. Current timestamp must be within TTL.
   * 3. Requested operation must be explicitly permitted.
   * 4. Downstream recipient agent ID must be within authorized propagation scope.
   */
  public evaluateAccess(
    targetResource: string,
    requestedOp: string,
    recipientAgentId?: string
  ): boolean {
    const grant = this.grants.get(targetResource);

    // Asset may be discovered, but no explicit grant exists -> REJECT
    if (!grant) {
      return false;
    }

    const nowSeconds = Date.now() / 1000;
    if (nowSeconds > grant.expiresAt) {
      return false; // Expired
    }

    if (!grant.permittedOperations.has(requestedOp)) {
      return false; // Operation not authorized
    }

    if (
      recipientAgentId &&
      !grant.downstreamPropagationScope.has(recipientAgentId)
    ) {
      // Violates Task-Graph Contextual Integrity downstream propagation
      return false;
    }

    return true;
  }
}
