/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * TEST IMPLEMENTATION ONLY — SOLELY FOR CONTRACT VERIFICATION
 * 
 * MockModelProvider: A deterministic, non-authoritative candidate generator
 * for testing execution contracts without network, hardware, or model dependencies.
 */

import {
  ModelProvider,
  ProviderMetadata,
  ProviderError,
  TaskRequest,
  ExecutionResult,
  CandidateResult,
} from '../contracts/execution';

export interface MockModelProviderOptions {
  readonly id?: string;
  readonly name?: string;
  readonly defaultResponse?: string;
  readonly simulateFailure?: boolean;
  readonly failureError?: ProviderError;
  readonly simulateUnavailable?: boolean;
  readonly simulatedLatencyMs?: number;
}

/**
 * Deterministic Mock Provider for contract verification.
 * 
 * STRICT BOUNDARIES:
 * - Does not perform network requests.
 * - Does not access filesystem or persistent storage.
 * - Emits strictly unprivileged CandidateResult objects with zero authority.
 */
export class MockModelProvider implements ModelProvider {
  public readonly id: string;
  public readonly metadata: ProviderMetadata;

  private simulateUnavailable: boolean;
  private simulateFailure: boolean;
  private failureError?: ProviderError;
  private defaultResponse: string;
  private simulatedLatencyMs: number;

  constructor(options: MockModelProviderOptions = {}) {
    this.id = options.id ?? 'mock-deterministic-v1';
    this.simulateUnavailable = options.simulateUnavailable ?? false;
    this.simulateFailure = options.simulateFailure ?? false;
    this.failureError = options.failureError;
    this.defaultResponse = options.defaultResponse ?? 'PROPOSED_CANDIDATE_OUTPUT';
    this.simulatedLatencyMs = options.simulatedLatencyMs ?? 5;

    this.metadata = {
      id: this.id,
      name: options.name ?? 'Deterministic Mock Model Provider (Test Only)',
      version: '1.0.0-test',
      isAvailable: !this.simulateUnavailable,
      capabilities: {
        streaming: false,
        maxContextTokens: 4096,
        supportedTaskTypes: ['general_inference', 'code_review', 'query_plan'],
        substrateTarget: 'SIMULATED',
      },
    };
  }

  /**
   * Set operational availability for test scenarios.
   */
  public setAvailable(isAvailable: boolean): void {
    this.simulateUnavailable = !isAvailable;
    // Reflect in metadata
    (this.metadata as { isAvailable: boolean }).isAvailable = isAvailable;
  }

  /**
   * Set simulated failure state for test scenarios.
   */
  public setSimulateFailure(shouldFail: boolean, customError?: ProviderError): void {
    this.simulateFailure = shouldFail;
    this.failureError = customError;
  }

  /**
   * Check operational availability.
   */
  public async isAvailable(): Promise<boolean> {
    return !this.simulateUnavailable;
  }

  /**
   * Generate an untrusted candidate result.
   */
  public async generateCandidate(request: TaskRequest): Promise<ExecutionResult> {
    if (this.simulateUnavailable) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_UNAVAILABLE',
          providerId: this.id,
          message: `Provider "${this.id}" is marked unavailable`,
          isRecoverable: true,
        },
      };
    }

    if (this.simulateFailure) {
      return {
        success: false,
        error: this.failureError ?? {
          code: 'EXECUTION_FAILED',
          providerId: this.id,
          message: `Simulated failure triggered on provider "${this.id}"`,
          isRecoverable: false,
        },
      };
    }

    // Produce deterministic, non-authoritative candidate result
    const candidate: CandidateResult = {
      requestId: request.requestId,
      providerId: this.id,
      content: typeof request.input === 'string' 
        ? `[MOCK_PROPOSAL]: ${request.input}` 
        : this.defaultResponse,
      status: 'PROPOSED',
      metadata: {
        modelIdentifier: `${this.id}::deterministic-engine`,
        latencyMs: this.simulatedLatencyMs,
        finishReason: 'stop',
        isUntrustedProposal: true,
        generatedAt: new Date().toISOString(),
      },
    };

    return {
      success: true,
      candidate,
    };
  }
}
