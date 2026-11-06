/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * AUTOMATED TESTS: MODULES 1, 2, AND 3
 * 
 * - Module 1: ContextPipe Deterministic Query Planner
 * - Module 2: TaskPolicy REALM Capability Envelopes (Mandatory Recipient & Sovereign Ref)
 * - Module 3: PROVISO Authorization Gate & Append-Only Cryptographic Ledger
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
  createSignedAuthorizationEvent,
  generateKeyPair,
  SOVEREIGN_ROOT_AUTHORITY,
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
  const sampleAuthRef = {
    authEventId: 'evt-auth-realm-001',
    principalId: 'did:mesh:authority-sovereign',
  };

  beforeEach(() => {
    policy = new TaskPolicyEngine();
  });

  test('Invariant: Asset discovery tracked but grants ZERO authorization', () => {
    policy.registerDiscoveredAsset('db:production/users');

    assert.equal(policy.isAssetDiscovered('db:production/users'), true);
    assert.equal(policy.isAssetDiscovered('db:other'), false);

    // Asset was discovered, but NO grant was issued -> evaluateAccess must return false
    const canRead = policy.evaluateAccess('db:production/users', 'read', 'agent-reader');
    const canWrite = policy.evaluateAccess('db:production/users', 'write', 'agent-reader');

    assert.equal(canRead, false);
    assert.equal(canWrite, false);
  });

  test('Critical: Omitting or passing empty recipientAgentId fails closed', () => {
    policy.issueGrant(
      'db:production/users',
      ['read'],
      ['agent-reader'],
      sampleAuthRef,
      300
    );

    // Omitting / empty recipient must fail closed to prevent downstream propagation bypass
    assert.equal(policy.evaluateAccess('db:production/users', 'read', ''), false);
    assert.equal(policy.evaluateAccess('db:production/users', 'read', '   '), false);
    // Explicit authorized recipient succeeds
    assert.equal(policy.evaluateAccess('db:production/users', 'read', 'agent-reader'), true);
  });

  test('Critical: Cannot manufacture authority — issueGrant requires backing authorizationRef', () => {
    assert.throws(
      () => {
        // @ts-expect-error Testing missing authorizationRef
        policy.issueGrant('db:records', ['read'], ['agent-1'], undefined);
      },
      (err: Error) => {
        assert.match(err.message, /Cannot manufacture authority/);
        return true;
      }
    );
  });

  test('Explicit grant allows permitted operations within TTL', () => {
    policy.issueGrant(
      'fs:/secure/data.csv',
      ['read', 'parse'],
      ['agent-reader', 'agent-worker'],
      sampleAuthRef,
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
      sampleAuthRef,
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
      sampleAuthRef,
      -10 // Expired 10 seconds ago
    );

    assert.equal(policy.evaluateAccess('token:temporary-session', 'execute', 'agent-x'), false);
  });
});

describe('Module 3: Verification Gate — PROVISO Authorization Gate', () => {
  let gate: ProvisoVerificationGate;
  let policy: TaskPolicyEngine;
  const sampleAuthRef = {
    authEventId: 'evt-sig-991',
    principalId: 'did:mesh:authority-sovereign',
  };

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

    const result = gate.verifyCandidateAction(action, policy, 'agent-1');
    assert.equal(result.valid, false);
    assert.match(result.reason, /No valid capability grant for resource/);
  });

  test('Mitigates Endogenous Authorization Laundering: Rejects action lacking signed ledger event', () => {
    // Policy engine grant exists
    policy.issueGrant('db:financial/ledger', ['commit_transaction'], ['agent-1'], sampleAuthRef, 300);

    const action: CandidateAction = {
      actionId: 'act-002',
      targetResource: 'db:financial/ledger',
      operation: 'commit_transaction',
      proposedByModel: 'model-proposer-v1',
      payloadHash: '0x9922',
    };

    // No signed authorization event in ledger! (Simulating memory summary hallucinating permission)
    const result = gate.verifyCandidateAction(action, policy, 'agent-1');
    assert.equal(result.valid, false);
    assert.match(result.reason, /Authorization laundering detected/);
  });

  test('Critical: Cryptographically verifies principalSignature and rejects forged signatures', () => {
    policy.issueGrant('db:financial/ledger', ['commit_transaction'], ['agent-1'], sampleAuthRef, 300);

    const attackerKey = generateKeyPair('attacker_seed_77');
    // 1. Attempting to inject an authorization event with an unenrolled attacker key
    const unenrolledEvent: SignedAuthorizationEvent = {
      eventId: 'evt-unenrolled-01',
      principalId: 'did:mesh:authority-sovereign',
      principalPublicKey: attackerKey.publicKey,
      principalSignature: 'sig:schnorr:0000000000000000000000000000000000000000000000000000000000000001:0000000000000000000000000000000000000000000000000000000000000001',
      authorizedResource: 'db:financial/ledger',
      authorizedOp: 'commit_transaction',
      issuedAt: Date.now(),
    };

    assert.throws(
      () => {
        gate.appendAuthorizationEvent(unenrolledEvent);
      },
      (err: Error) => {
        assert.match(err.message, /not an enrolled sovereign authority/);
        return true;
      }
    );

    // 2. Attempting to inject a forged signature under an enrolled authority key
    const forgedSignatureEvent: SignedAuthorizationEvent = {
      eventId: 'evt-forged-02',
      principalId: 'did:mesh:authority-sovereign',
      principalPublicKey: SOVEREIGN_ROOT_AUTHORITY.publicKey,
      principalSignature: 'sig:schnorr:0000000000000000000000000000000000000000000000000000000000000001:0000000000000000000000000000000000000000000000000000000000000001',
      authorizedResource: 'db:financial/ledger',
      authorizedOp: 'commit_transaction',
      issuedAt: Date.now(),
    };

    assert.throws(
      () => {
        gate.appendAuthorizationEvent(forgedSignatureEvent);
      },
      (err: Error) => {
        assert.match(err.message, /Invalid digital signature/);
        return true;
      }
    );
  });

  test('Critical: Append-only ledger rejects duplicate eventId overwrites (immutability)', () => {
    const validEvent = createSignedAuthorizationEvent({
      eventId: 'evt-immutable-001',
      principalId: 'did:mesh:authority-sovereign',
      authorizedResource: 'db:financial/ledger',
      authorizedOp: 'commit_transaction',
    });

    gate.appendAuthorizationEvent(validEvent);

    // Attempting to overwrite existing eventId must be rejected fail-closed
    assert.throws(
      () => {
        gate.appendAuthorizationEvent(validEvent);
      },
      (err: Error) => {
        assert.match(err.message, /Append-only ledger violation/);
        return true;
      }
    );
  });

  test('Rejects action when backing signed authorization event has an appended revocation record', () => {
    policy.issueGrant('db:financial/ledger', ['commit_transaction'], ['agent-1'], sampleAuthRef, 300);

    const event = createSignedAuthorizationEvent({
      eventId: 'evt-001',
      principalId: 'did:mesh:authority-sovereign',
      authorizedResource: 'db:financial/ledger',
      authorizedOp: 'commit_transaction',
    });
    gate.appendAuthorizationEvent(event);

    // Revoke the event by appending a signed revocation record
    const revoked = gate.revokeAuthorizationEvent('evt-001', 'Security audit revocation');
    assert.equal(revoked, true);
    assert.equal(gate.isEventRevoked('evt-001'), true);

    const action: CandidateAction = {
      actionId: 'act-003',
      targetResource: 'db:financial/ledger',
      operation: 'commit_transaction',
      proposedByModel: 'model-proposer-v1',
      payloadHash: '0x9933',
    };

    const result = gate.verifyCandidateAction(action, policy, 'agent-1');
    assert.equal(result.valid, false);
    assert.match(result.reason, /Authorization laundering detected/);
  });

  test('Accepts candidate action when verified against both policy grant and active signed ledger event', () => {
    policy.issueGrant('db:financial/ledger', ['commit_transaction'], ['agent-1'], sampleAuthRef, 300);

    const event = createSignedAuthorizationEvent({
      eventId: 'evt-valid-100',
      principalId: 'did:mesh:authority-sovereign',
      authorizedResource: 'db:financial/ledger',
      authorizedOp: 'commit_transaction',
    });
    gate.appendAuthorizationEvent(event);

    const action: CandidateAction = {
      actionId: 'act-004',
      targetResource: 'db:financial/ledger',
      operation: 'commit_transaction',
      proposedByModel: 'model-proposer-v1',
      payloadHash: '0x9944',
    };

    const result = gate.verifyCandidateAction(action, policy, 'agent-1');
    assert.equal(result.valid, true);
    assert.equal(result.matchingEventId, 'evt-valid-100');
    assert.match(result.reason, /Candidate action verified against signed provenance/);
  });
});
