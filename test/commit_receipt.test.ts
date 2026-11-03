/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * AUTOMATED TESTS: MODULE 4 — COMMITRECEIPT & TRACEs ENGINE (PHASE 004B)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  CommitReceiptBuilder,
  CommitReceipt,
  LineageEntry,
  ExecutionEvidence,
  SovereignAuthorizationRef,
} from '../src/core';

describe('Module 4: CommitReceipt — Portable Lineage & Verification Engine', () => {
  const sampleEvidence: ExecutionEvidence = {
    executorId: 'mock-deterministic-v1',
    candidateResultHash: '0x8f4d92a17b03eec9314cba9910d6447814b7e802',
    toolCallsExecuted: ['db:read_telemetry', 'math:compute_balance'],
    executionTimeMs: 142,
    environmentSignature: 'node-22.23.3-linux-x86_64',
  };

  const sampleAuth: SovereignAuthorizationRef = {
    authEventId: 'evt-sig-991',
    grantId: 'grant-finance-commit-300s',
    principalId: 'did:mesh:principal-sovereign-root',
    isVerified: true,
  };

  const sampleLineage: LineageEntry = {
    recordId: 'rec-quarterly-q3',
    provenanceHash: '0x7d94e21a8c08129e924bcfe019941a7d65b1021f',
    sourceType: 'fact',
    timestamp: Date.now() - 5000,
  };

  test('Successfully builds a content-addressed CommitReceipt with verified integrity', () => {
    const builder = new CommitReceiptBuilder();
    builder
      .addLineageEntry(sampleLineage)
      .setExecutionEvidence(sampleEvidence)
      .setAuthorizationRef(sampleAuth)
      .setStateDelta({ account: 'treasury', balanceDelta: +50000 });

    const receipt: CommitReceipt = builder.build();

    assert.ok(receipt.receiptId);
    assert.equal(receipt.receiptId.length, 64);
    assert.equal(receipt.inputLineage.length, 1);
    assert.equal(receipt.inputLineage[0].recordId, 'rec-quarterly-q3');
    assert.equal(receipt.evidence.executorId, 'mock-deterministic-v1');
    assert.equal(receipt.authorization.authEventId, 'evt-sig-991');

    // Cryptographic content-addressed verification
    assert.equal(CommitReceiptBuilder.verifyReceiptIntegrity(receipt), true);
  });

  test('Detects tamper attempts and invalidates modified receipts', () => {
    const builder = new CommitReceiptBuilder();
    builder
      .addLineageEntry(sampleLineage)
      .setExecutionEvidence(sampleEvidence)
      .setAuthorizationRef(sampleAuth)
      .setStateDelta({ committedState: 'RECORD_V1' });

    const receipt = builder.build();
    assert.equal(CommitReceiptBuilder.verifyReceiptIntegrity(receipt), true);

    // Tamper with stateDeltaHash
    const tamperedReceipt: CommitReceipt = {
      ...receipt,
      stateDeltaHash: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    };

    assert.equal(CommitReceiptBuilder.verifyReceiptIntegrity(tamperedReceipt), false);
  });

  test('Fails when attempting to attach an unverified authorization reference', () => {
    const builder = new CommitReceiptBuilder();
    const unverifiedAuth: SovereignAuthorizationRef = {
      authEventId: 'evt-unverified-000',
      grantId: 'grant-unverified',
      principalId: 'attacker-agent',
      isVerified: false,
    };

    assert.throws(
      () => {
        builder.setAuthorizationRef(unverifiedAuth);
      },
      (err: Error) => {
        assert.match(err.message, /Cannot attach unverified authorization ref/);
        return true;
      }
    );
  });

  test('Enforces receipt chaining across multi-agent workflows (parentReceiptId)', () => {
    // Step 1: Initial subtask receipt
    const step1Builder = new CommitReceiptBuilder();
    const step1Receipt = step1Builder
      .addLineageEntry(sampleLineage)
      .setExecutionEvidence(sampleEvidence)
      .setAuthorizationRef(sampleAuth)
      .setStateDelta({ step: 1, intermediateData: 'preprocessed' })
      .build();

    assert.equal(step1Receipt.parentReceiptId, undefined);
    assert.equal(CommitReceiptBuilder.verifyReceiptIntegrity(step1Receipt), true);

    // Step 2: Downstream subtask receipt chained to step 1
    const step2Evidence: ExecutionEvidence = {
      executorId: 'downstream-verifier-v2',
      candidateResultHash: '0x4cb891a07e11409f',
      toolCallsExecuted: ['sec:commit_ledger'],
      executionTimeMs: 88,
      environmentSignature: 'node-22.23.3-linux-x86_64',
    };

    const step2Builder = new CommitReceiptBuilder();
    const step2Receipt = step2Builder
      .setParentReceipt(step1Receipt.receiptId) // Parent chaining
      .addLineageEntry({
        recordId: `receipt:${step1Receipt.receiptId}`,
        provenanceHash: step1Receipt.receiptId,
        sourceType: 'artifact',
        timestamp: Date.now(),
      })
      .setExecutionEvidence(step2Evidence)
      .setAuthorizationRef(sampleAuth)
      .setStateDelta({ step: 2, finalLedgerCommit: 'SUCCESS' })
      .build();

    assert.equal(step2Receipt.parentReceiptId, step1Receipt.receiptId);
    assert.equal(CommitReceiptBuilder.verifyReceiptIntegrity(step2Receipt), true);
  });

  test('Fails closed if evidence, authorization, or state delta are missing', () => {
    const builder = new CommitReceiptBuilder();
    builder.addLineageEntry(sampleLineage);

    assert.throws(
      () => builder.build(),
      (err: Error) => {
        assert.match(err.message, /CommitReceipt requires valid ExecutionEvidence/);
        return true;
      }
    );
  });
});
