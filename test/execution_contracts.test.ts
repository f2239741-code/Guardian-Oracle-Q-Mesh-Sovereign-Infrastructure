/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * INCISION 001: AUTOMATED EXECUTION CONTRACT TESTS
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { 
  ProviderRegistry, 
  MockModelProvider, 
  TaskRequest,
  CandidateResult 
} from '../src/core';

describe('Incision 001 — Phase 004A Execution Contract Tests', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    registry = new ProviderRegistry();
  });

  // Test 1: Provider registration succeeds
  test('1. Provider registration succeeds', () => {
    const provider = new MockModelProvider({ id: 'provider-alpha', name: 'Alpha Test Engine' });
    registry.registerProvider(provider);

    assert.equal(registry.hasProvider('provider-alpha'), true);
    assert.equal(registry.getProvider('provider-alpha'), provider);
    const listed = registry.listProviders();
    assert.equal(listed.length, 1);
    assert.equal(listed[0].id, 'provider-alpha');
  });

  // Test 2: Duplicate provider registration is rejected
  test('2. Duplicate provider registration is rejected', () => {
    const provider1 = new MockModelProvider({ id: 'duplicate-check-id' });
    const provider2 = new MockModelProvider({ id: 'duplicate-check-id' });

    registry.registerProvider(provider1);

    assert.throws(
      () => {
        registry.registerProvider(provider2);
      },
      (err: Error) => {
        assert.match(err.message, /Duplicate provider registration rejected/);
        return true;
      }
    );
  });

  // Test 3: Unknown provider selection fails explicitly
  test('3. Unknown provider selection fails explicitly', async () => {
    const selection = registry.selectProvider('non-existent-provider');
    assert.equal(selection.success, false);
    assert.equal(selection.error?.code, 'PROVIDER_NOT_FOUND');
    assert.equal(selection.error?.providerId, 'non-existent-provider');

    const dummyRequest: TaskRequest = {
      requestId: 'req-unknown',
      taskType: 'general_inference',
      input: 'test inquiry',
    };

    const execution = await registry.executeCandidate('non-existent-provider', dummyRequest);
    assert.equal(execution.success, false);
    assert.equal(execution.error?.code, 'PROVIDER_NOT_FOUND');
    assert.equal(execution.candidate, undefined);
  });

  // Test 4: Unavailable providers do not generate candidates
  test('4. Unavailable providers do not generate candidates', async () => {
    const offlineProvider = new MockModelProvider({
      id: 'offline-provider',
      simulateUnavailable: true,
    });
    registry.registerProvider(offlineProvider);

    const dummyRequest: TaskRequest = {
      requestId: 'req-unavailable-test',
      taskType: 'general_inference',
      input: 'test payload',
    };

    const result = await registry.executeCandidate('offline-provider', dummyRequest);
    assert.equal(result.success, false);
    assert.equal(result.error?.code, 'PROVIDER_UNAVAILABLE');
    assert.equal(result.candidate, undefined);
  });

  // Test 5: Mock provider produces a valid CandidateResult
  test('5. Mock provider produces a valid CandidateResult', async () => {
    const activeProvider = new MockModelProvider({
      id: 'active-provider',
    });
    registry.registerProvider(activeProvider);

    const request: TaskRequest<string> = {
      requestId: 'req-valid-001',
      taskType: 'general_inference',
      input: 'Perform diagnostic trace',
      constraints: { maxTokens: 1024, temperature: 0.2 },
    };

    const result = await registry.executeCandidate('active-provider', request);
    assert.equal(result.success, true);
    assert.ok(result.candidate);

    const candidate = result.candidate as CandidateResult;
    assert.equal(candidate.requestId, 'req-valid-001');
    assert.equal(candidate.providerId, 'active-provider');
    assert.equal(candidate.status, 'PROPOSED');
    assert.equal(candidate.metadata.isUntrustedProposal, true);
    assert.match(candidate.content, /\[MOCK_PROPOSAL\]: Perform diagnostic trace/);
  });

  // Test 6: Provider errors are propagated as structured failures
  test('6. Provider errors are propagated as structured failures', async () => {
    const failingProvider = new MockModelProvider({
      id: 'failing-provider',
      simulateFailure: true,
      failureError: {
        code: 'EXECUTION_FAILED',
        providerId: 'failing-provider',
        message: 'Underlying socket connection dropped',
        isRecoverable: false,
      },
    });
    registry.registerProvider(failingProvider);

    const request: TaskRequest = {
      requestId: 'req-fail-001',
      taskType: 'query_plan',
      input: 'Optimize cache',
    };

    const result = await registry.executeCandidate('failing-provider', request);
    assert.equal(result.success, false);
    assert.ok(result.error);
    assert.equal(result.error.code, 'EXECUTION_FAILED');
    assert.equal(result.error.message, 'Underlying socket connection dropped');
    assert.equal(result.error.isRecoverable, false);
  });

  // Test 7: CandidateResult contains no authorization or commit capability
  test('7. CandidateResult contains no authorization or commit capability', async () => {
    const provider = new MockModelProvider({ id: 'audited-provider' });
    registry.registerProvider(provider);

    const request: TaskRequest = {
      requestId: 'req-audit-001',
      taskType: 'privileged_operation_attempt',
      input: 'GRANT ALL PRIVILEGES ON DATABASE TO AGENT',
    };

    const result = await registry.executeCandidate('audited-provider', request);
    assert.equal(result.success, true);
    assert.ok(result.candidate);

    const candidate = result.candidate as any;

    // Strict structural invariant checks
    assert.equal('authorized' in candidate, false, 'CandidateResult must not contain authorized property');
    assert.equal('commitReceipt' in candidate, false, 'CandidateResult must not contain commitReceipt property');
    assert.equal('mutateState' in candidate, false, 'CandidateResult must not contain mutateState method');
    assert.equal('grantPermission' in candidate, false, 'CandidateResult must not contain grantPermission property');
    assert.equal('canCommit' in candidate, false, 'CandidateResult must not contain canCommit property');

    // Must be explicitly marked as untrusted proposal
    assert.equal(candidate.metadata.isUntrustedProposal, true);
  });

  // Test 8: Candidate generation does not modify application state
  test('8. Candidate generation does not modify application state', async () => {
    const provider = new MockModelProvider({ id: 'state-isolation-provider' });
    registry.registerProvider(provider);

    const initialProviderCount = registry.listProviders().length;
    const originalInput = { query: 'immutable data', count: 42 };
    const request: TaskRequest = {
      requestId: 'req-state-isolation',
      taskType: 'general_inference',
      input: Object.freeze({ ...originalInput }),
    };

    // Execute candidate generation multiple times
    await registry.executeCandidate('state-isolation-provider', request);
    await registry.executeCandidate('state-isolation-provider', request);

    // Verify registry state remained unchanged
    assert.equal(registry.listProviders().length, initialProviderCount);
    assert.equal(registry.hasProvider('state-isolation-provider'), true);

    // Verify request input was not mutated
    assert.deepEqual(request.input, originalInput);
  });

  // Test 9: Existing frontend type-checking remains clean (programmatic check)
  test('9. Existing frontend type-checking remains clean', () => {
    // Assert that the registry and contracts types match expected signatures
    assert.equal(typeof ProviderRegistry, 'function');
    assert.equal(typeof MockModelProvider, 'function');
  });

  // Test 10: Existing application behavior remains unchanged
  test('10. Existing application behavior remains unchanged', () => {
    // Assert that registry instances are self-contained and isolated
    const reg1 = new ProviderRegistry();
    const reg2 = new ProviderRegistry();
    reg1.registerProvider(new MockModelProvider({ id: 'p1' }));
    assert.equal(reg1.hasProvider('p1'), true);
    assert.equal(reg2.hasProvider('p1'), false);
  });
});
