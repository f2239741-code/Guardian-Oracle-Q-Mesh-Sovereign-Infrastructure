/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * AUTOMATED TESTS: MODULES 1, 2, AND 3
 * 
 * - Module 1: ContextPipe Deterministic Query Planner
 * - Module 2: TaskPolicy REALM Capability Envelopes
 * - Module 3: PROVISO Authorization Gate & Laundering Defense
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  ContextPipePlanner,
  ContextRecord,
  TaskPolicyEngine,
  ProvisoVerificationGate,
  CandidateAction,
  SignedAuthorizationEvent,
} from '../src/core';

describe('Module 1: ContextPipe — Deterministic Query Planner', () => {
  let planner: ContextPipePlanner;

  beforeEach(() => {
    planner = new ContextPipePlanner(2048);
  });

  test('Stage 1 (Plan): Generates query plan with allocated budget and 5 stages', () => {
    const plan = planner.plan('Analyze quarterly ledger balances', ['read_ledger']);

    assert.ok(plan.queryId.startsWith('cp_'));
    assert.deepEqual(plan.stages, ['plan', 'bind', 'optimize', 'execute', 'feedback']);
    assert.equal(plan.allocatedTokenBudget, 2048);
    assert.deepEqual(plan.requiredCapabilities, ['read_ledger']);
  });

  test('Stage 2 (Bind): Filters out zero or negative priority candidate records', () => {
    const plan = planner.plan('Filter low priority records');
    const records: ContextRecord[] = [
      {
        recordId: 'rec-1',
        sourceType: 'fact',
        content: 'Valid active customer account ledger',
        provenanceHash: '0xabc1',
        priority: 0.9,
        principalId: 'agent-1',
        createdAt: Date.now(),
      },
      {
        recordId: 'rec-2',
        sourceType: 'episodic',
        content: 'Irrelevant conversational smalltalk',
        provenanceHash: '0xabc2',
        priority: 0.0,
        principalId: 'agent-1',
        createdAt: Date.now(),
      },
      {
        recordId: 'rec-3',
        sourceType: 'policy',
        content: 'System fail-closed policy',
        provenanceHash: '0xabc3',
        priority: 1.0,
        principalId: 'root',
        createdAt: Date.now(),
      },
    ];

    const bound = planner.bind(plan, records);
    assert.equal(bound.length, 2);
    assert.equal(bound[0].recordId, 'rec-1');
    assert.equal(bound[1].recordId, 'rec-3');
  });

  test('Stage 3 (Optimize): Deterministically ranks by priority and trims to token limit', () => {
    const records: ContextRecord[] = [
      {
        recordId: 'low-prio',
        sourceType: 'episodic',
        content: 'A long description of an old conversation that takes up many words and tokens in the budget.',
        provenanceHash: '0x1',
        priority: 0.2,
        principalId: 'agent-1',
        createdAt: Date.now(),
      },
      {
        recordId: 'high-prio',
        sourceType: 'policy',
        content: 'Security rule A',
        provenanceHash: '0x2',
        priority: 0.95,
        principalId: 'root',
        createdAt: Date.now(),
      },
      {
        recordId: 'mid-prio',
        sourceType: 'fact',
        content: 'Critical state fact B',
        provenanceHash: '0x3',
        priority: 0.7,
        principalId: 'agent-2',
        createdAt: Date.now(),
      },
    ];

    // Restrict max tokens so low priority record must be pruned
    const optimized = planner.optimize(records, 15);
    assert.equal(optimized.length >= 1, true);
    assert.equal(optimized[0].recordId, 'high-prio');
    assert.equal(optimized.some((r) => r.recordId === 'low-prio'), false);
  });

  test('Stage 4 & 5 (Execute & Feedback): Assembles prompt view and computes token efficiency', () => {
    const plan = planner.plan('Assemble context view');
    const records: ContextRecord[] = [
      {
        recordId: 'rec-fact',
        sourceType: 'fact',
        content: 'Ledger root is 0xdeadbeef',
        provenanceHash: '0xhash1',
        priority: 0.8,
        principalId: 'admin',
        createdAt: Date.now(),
      },
      {
        recordId: 'rec-policy',
        sourceType: 'policy',
        content: 'All writes require signed commit',
        provenanceHash: '0xhash2',
        priority: 1.0,
        principalId: 'root',
        createdAt: Date.now(),
      },
    ];

    const execution = planner.execute(plan, records);
    assert.equal(execution.queryId, plan.queryId);
    assert.equal(execution.recordCount, 2);
    assert.deepEqual(execution.lineageHashes, ['0xhash1', '0xhash2']);
    assert.match(execution.assembledPrompt, /\[FACT\] \(rec-fact\): Ledger root is 0xdeadbeef/);
    assert.match(execution.assembledPrompt, /\[POLICY\] \(rec-policy\): All writes require signed commit/);

    const feedback = planner.feedback(execution, 50);
    assert.equal(feedback.queryId, plan.queryId);
    assert.equal(feedback.recordsUsed, 2);
    assert.equal(feedback.tokensConsumed, 50);
    assert.equal(feedback.efficiencyRatio, 0.04);
  });
});

describe('Module 2: TaskPolicy — REALM Capability Envelopes', () => {
  let policy: TaskPolicyEngine;

  beforeEach(() => {
    policy = new TaskPolicyEngine();
  });

  test('Invariant: Asset discovery tracked but grants ZERO authorization', () => {
    policy.registerDiscoveredAsset('db:production/users');

    assert.equal(policy.isAssetDiscovered('db:production/users'), true);
    assert.equal(policy.isAssetDiscovered('db:other'), false);

    // Asset was discovered, but NO grant was issued -> evaluateAccess must return false
    const canRead = policy.evaluateAccess('db:production/users', 'read');
    const canWrite = policy.evaluateAccess('db:production/users', 'write');

    assert.equal(canRead, false);
    assert.equal(canWrite, false);
  });

  test('Explicit grant allows permitted operations within TTL', () => {
    policy.issueGrant(
      'fs:/secure/data.csv',
      ['read', 'parse'],
      ['agent-reader', 'agent-worker'],
      60 // 60 seconds TTL
    );

    assert.equal(policy.evaluateAccess('fs:/secure/data.csv', 'read', 'agent-reader'), true);
    assert.equal(policy.evaluateAccess('fs:/secure/data.csv', 'parse', 'agent-worker'), true);

    // Unpermitted operation fails
    assert.equal(policy.evaluateAccess('fs:/secure/data.csv', 'delete', 'agent-reader'), false);
  });

  test('Task-Graph Contextual Integrity: Restricts downstream recipient scope', () => {
    policy.issueGrant(
      'api:internal/telemetry',
      ['read'],
      ['authorized-agent-a'], // Only agent A is authorized
      300
    );

    // Agent A can access
    assert.equal(policy.evaluateAccess('api:internal/telemetry', 'read', 'authorized-agent-a'), true);

    // Third-party downstream agent B is blocked (preventing downstream data leaks)
    assert.equal(policy.evaluateAccess('api:internal/telemetry', 'read', 'unauthorized-downstream-agent-b'), false);
  });

  test('Expired grants fail closed', () => {
    policy.issueGrant(
      'token:temporary-session',
      ['execute'],
      ['agent-x'],
      -10 // Expired 10 seconds ago
    );

    assert.equal(policy.evaluateAccess('token:temporary-session', 'execute', 'agent-x'), false);
  });
});

describe('Module 3: Verification Gate — PROVISO Authorization Gate', () => {
  let gate: ProvisoVerificationGate;
  let policy: TaskPolicyEngine;

  beforeEach(() => {
    gate = new ProvisoVerificationGate();
    policy = new TaskPolicyEngine();
  });

  test('Rejects candidate action when no REALM policy grant exists', () => {
    const action: CandidateAction = {
      actionId: 'act-001',
      targetResource: 'db:financial/ledger',
      operation: 'commit_transaction',
      proposedByModel: 'model-proposer-v1',
      payloadHash: '0x9911',
    };

    const result = gate.verifyCandidateAction(action, policy);
    assert.equal(result.valid, false);
    assert.match(result.reason, /No valid capability grant for resource/);
  });

  test('Mitigates Endogenous Authorization Laundering: Rejects action lacking signed ledger event', () => {
    // Policy engine grant exists
    policy.issueGrant('db:financial/ledger', ['commit_transaction'], ['agent-1'], 300);

    const action: CandidateAction = {
      actionId: 'act-002',
      targetResource: 'db:financial/ledger',
      operation: 'commit_transaction',
      proposedByModel: 'model-proposer-v1',
      payloadHash: '0x9922',
    };

    // No signed authorization event in ledger! (Simulating memory summary hallucinating permission)
    const result = gate.verifyCandidateAction(action, policy);
    assert.equal(result.valid, false);
    assert.match(result.reason, /Authorization laundering detected/);
  });

  test('Rejects action when backing signed authorization event has been revoked', () => {
    policy.issueGrant('db:financial/ledger', ['commit_transaction'], ['agent-1'], 300);

    const event: SignedAuthorizationEvent = {
      eventId: 'evt-001',
      principalSignature: 'sig:ed25519:operator-root',
      authorizedResource: 'db:financial/ledger',
      authorizedOp: 'commit_transaction',
      isRevoked: false,
    };
    gate.appendAuthorizationEvent(event);

    // Revoke the event
    gate.revokeAuthorizationEvent('evt-001');

    const action: CandidateAction = {
      actionId: 'act-003',
      targetResource: 'db:financial/ledger',
      operation: 'commit_transaction',
      proposedByModel: 'model-proposer-v1',
      payloadHash: '0x9933',
    };

    const result = gate.verifyCandidateAction(action, policy);
    assert.equal(result.valid, false);
    assert.match(result.reason, /Authorization laundering detected/);
  });

  test('Accepts candidate action when verified against both policy grant and active signed ledger event', () => {
    policy.issueGrant('db:financial/ledger', ['commit_transaction'], ['agent-1'], 300);

    const event: SignedAuthorizationEvent = {
      eventId: 'evt-valid-100',
      principalSignature: 'sig:ed25519:operator-root',
      authorizedResource: 'db:financial/ledger',
      authorizedOp: 'commit_transaction',
      isRevoked: false,
    };
    gate.appendAuthorizationEvent(event);

    const action: CandidateAction = {
      actionId: 'act-004',
      targetResource: 'db:financial/ledger',
      operation: 'commit_transaction',
      proposedByModel: 'model-proposer-v1',
      payloadHash: '0x9944',
    };

    const result = gate.verifyCandidateAction(action, policy);
    assert.equal(result.valid, true);
    assert.equal(result.matchingEventId, 'evt-valid-100');
    assert.match(result.reason, /Candidate action verified against signed provenance/);
  });
});
