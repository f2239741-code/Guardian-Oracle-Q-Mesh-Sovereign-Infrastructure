/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * PHASE 004A: PROVIDER REGISTRY
 * 
 * Enforces registry boundaries:
 * - Reject duplicate identifiers
 * - Retrieve registered providers
 * - Return structured failure on unavailable or unknown providers
 * - Never silently invent a successful candidate
 */

import {
  ModelProvider,
  ProviderMetadata,
  ProviderError,
  TaskRequest,
  ExecutionResult,
} from '../contracts/execution';

export class ProviderRegistry {
  private readonly providers: Map<string, ModelProvider> = new Map();

  /**
   * Register a new model provider into the execution registry.
   * Rejects registration if a provider with the same identifier already exists.
   */
  public registerProvider(provider: ModelProvider): void {
    if (!provider || !provider.id || typeof provider.id !== 'string') {
      throw new Error('Invalid provider: must provide a non-empty string identifier');
    }

    if (this.providers.has(provider.id)) {
      throw new Error(`Duplicate provider registration rejected: Provider ID "${provider.id}" is already registered`);
    }

    this.providers.set(provider.id, provider);
  }

  /**
   * Check whether a provider with the given identifier is currently registered.
   */
  public hasProvider(id: string): boolean {
    return this.providers.has(id);
  }

  /**
   * Retrieve a registered provider by identifier.
   */
  public getProvider(id: string): ModelProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Retrieve metadata for all currently registered providers.
   */
  public listProviders(): ReadonlyArray<ProviderMetadata> {
    return Array.from(this.providers.values()).map((p) => p.metadata);
  }

  /**
   * Unregister a provider (primarily used for test lifecycle isolation).
   */
  public unregisterProvider(id: string): boolean {
    return this.providers.delete(id);
  }

  /**
   * Clear all registered providers from the registry.
   */
  public clear(): void {
    this.providers.clear();
  }

  /**
   * Select an explicitly requested provider with structured error handling.
   */
  public selectProvider(id: string):
    | { readonly success: true; readonly provider: ModelProvider; readonly error?: never }
    | { readonly success: false; readonly provider?: never; readonly error: ProviderError } {
    const provider = this.providers.get(id);

    if (!provider) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_NOT_FOUND',
          providerId: id,
          message: `Provider with ID "${id}" is not registered in the ProviderRegistry`,
          isRecoverable: false,
        },
      };
    }

    return {
      success: true,
      provider,
    };
  }

  /**
   * Execute an untrusted candidate generation request through an explicitly selected provider.
   * 
   * CRITICAL GUARANTEES:
   * - Fails explicitly if the provider does not exist.
   * - Fails explicitly if the provider is unavailable.
   * - NEVER silently invents or manufactures a successful candidate.
   */
  public async executeCandidate(
    providerId: string,
    request: TaskRequest
  ): Promise<ExecutionResult> {
    const selection = this.selectProvider(providerId);

    if (!selection.success) {
      return {
        success: false,
        error: selection.error,
      };
    }

    const provider = selection.provider;

    // Verify operational availability before delegating inference
    let isAvailable = false;
    try {
      isAvailable = await provider.isAvailable();
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_UNAVAILABLE',
          providerId,
          message: `Availability check threw an exception for provider "${providerId}": ${err instanceof Error ? err.message : String(err)}`,
          isRecoverable: true,
        },
      };
    }

    if (!isAvailable) {
      return {
        success: false,
        error: {
          code: 'PROVIDER_UNAVAILABLE',
          providerId,
          message: `Provider "${providerId}" is currently unavailable and cannot generate candidates`,
          isRecoverable: true,
        },
      };
    }

    try {
      return await provider.generateCandidate(request);
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'EXECUTION_FAILED',
          providerId,
          message: `Unhandled exception during candidate generation on provider "${providerId}": ${err instanceof Error ? err.message : String(err)}`,
          isRecoverable: false,
        },
      };
    }
  }
}
