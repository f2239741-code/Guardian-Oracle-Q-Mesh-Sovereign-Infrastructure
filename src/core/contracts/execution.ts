/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * PHASE 004A: EXECUTION SOCKET & CORE CONTRACTS
 * 
 * FOUNDING DOCTRINE 1: Knowledge can propagate. Privilege cannot. Compute can migrate. State remains sovereign.
 * IMPLEMENTATION RULE: The model proposes. It does not authorize, execute privileged actions, or commit canonical state.
 */

/**
 * Request-local execution constraints for model inference.
 */
export interface RequestConstraints {
  readonly timeoutMs?: number;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly stopSequences?: readonly string[];
}

/**
 * Immutable task request supplied to an execution socket.
 * All inputs are strictly read-only and cannot be mutated by providers.
 */
export interface TaskRequest<TInput = unknown> {
  readonly requestId: string;
  readonly taskType: string;
  readonly input: Readonly<TInput>;
  readonly context?: Readonly<Record<string, unknown>>;
  readonly constraints?: Readonly<RequestConstraints>;
}

/**
 * Status of candidate generation by a provider.
 */
export type CandidateStatus = 
  | 'PROPOSED'
  | 'FAILED'
  | 'TIMED_OUT'
  | 'UNAVAILABLE';

/**
 * Non-authoritative candidate metadata.
 * Explicitly marks content as an unprivileged, unverified proposal.
 */
export interface CandidateMetadata {
  readonly modelIdentifier?: string;
  readonly latencyMs: number;
  readonly finishReason?: string;
  readonly isUntrustedProposal: true;
  readonly generatedAt: string;
}

/**
 * Structured, non-authoritative candidate result emitted by a ModelProvider.
 * 
 * ARCHITECTURAL INVARIANT:
 * A CandidateResult MUST NOT contain:
 * - Authorization grants
 * - Commit decisions
 * - Canonical-state mutation mechanisms
 * - Execution privileges
 */
export interface CandidateResult {
  readonly requestId: string;
  readonly providerId: string;
  readonly content: string;
  readonly status: CandidateStatus;
  readonly metadata: Readonly<CandidateMetadata>;
}

/**
 * Capability profile of a registered ModelProvider.
 */
export interface ProviderCapabilities {
  readonly streaming: boolean;
  readonly maxContextTokens: number;
  readonly supportedTaskTypes: readonly string[];
  readonly substrateTarget: 'CPU' | 'NPU' | 'GPU' | 'CLOUD_REMOTE' | 'SIMULATED';
}

/**
 * Provider metadata containing identity and status indicators.
 */
export interface ProviderMetadata {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: Readonly<ProviderCapabilities>;
  readonly isAvailable: boolean;
}

/**
 * Structured failure descriptor emitted when a provider fails or is unavailable.
 */
export interface ProviderError {
  readonly code: 
    | 'PROVIDER_UNAVAILABLE'
    | 'PROVIDER_NOT_FOUND'
    | 'DUPLICATE_PROVIDER_ID'
    | 'EXECUTION_FAILED'
    | 'TIMEOUT'
    | 'INVALID_REQUEST';
  readonly providerId?: string;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly isRecoverable: boolean;
}

/**
 * Result returned by a ModelProvider's candidate generation method.
 * Discriminated union requiring callers to handle success vs explicit failure.
 */
export type ExecutionResult =
  | {
      readonly success: true;
      readonly candidate: Readonly<CandidateResult>;
      readonly error?: never;
    }
  | {
      readonly success: false;
      readonly candidate?: never;
      readonly error: Readonly<ProviderError>;
    };

/**
 * Pluggable ModelProvider execution contract.
 * Model providers act solely as untrusted proposal generators.
 */
export interface ModelProvider {
  /** Unique provider identifier */
  readonly id: string;

  /** Capability and availability metadata */
  readonly metadata: Readonly<ProviderMetadata>;

  /** Check current operational availability */
  isAvailable(): Promise<boolean>;

  /** Asynchronously generate an untrusted candidate result */
  generateCandidate(request: TaskRequest): Promise<ExecutionResult>;
}
