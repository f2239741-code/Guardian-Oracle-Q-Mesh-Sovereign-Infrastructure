/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * AUTOMATED TESTS: MODULE 5 — CASCADIA MESH & PHASE 004C PEER COMPUTE
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  CascadiaMeshTransport,
  NodeCapabilityAd,
  PeerTaskBid,
  WanStateDecisionEngine,
  SecretCanaryVerifier,
  SwarmLayerSplitter,
} from '../src/core';

describe('Module 5: CascadiaMeshTransport — Signed Peer Gossip & Routing', () => {
  let transport: CascadiaMeshTransport;

  beforeEach(() => {
    transport = new CascadiaMeshTransport();
  });

  test('Accepts valid signed capability advertisement from gossip', () => {
    const validAd: NodeCapabilityAd = {
      peerId: 'peer:node-alpha-44',
      availableTops: 78,
      maxContextTokens: 8192,
      supportedOps: ['prefill', 'speculative_draft', 'canary_eval'],
      signedTimestamp: Date.now(),
      operatorSignature: 'sig:ed25519:operator-ca-root-alpha',
    };

    const res = transport.receiveGossipAdvertisement(validAd);
    assert.equal(res.success, true);
    assert.equal(transport.getPeer('peer:node-alpha-44')?.availableTops, 78);
  });

  test('Rejects gossip advertisement missing operator CA signature (CA admission invariant)', () => {
    const unsignedAd: NodeCapabilityAd = {
      peerId: 'peer:rogue-node-00',
      availableTops: 100,
      maxContextTokens: 4096,
      supportedOps: ['prefill'],
      signedTimestamp: Date.now(),
      operatorSignature: '', // Missing CA signature
    };

    const res = transport.receiveGossipAdvertisement(unsignedAd);
    assert.equal(res.success, false);
    assert.match(res.reason ?? '', /Missing operator CA signature/);
    assert.equal(transport.getPeer('peer:rogue-node-00'), undefined);
  });

  test('Rejects stale gossip advertisements (>60s age)', () => {
    const staleAd: NodeCapabilityAd = {
      peerId: 'peer:stale-node-99',
      availableTops: 50,
      maxContextTokens: 4096,
      supportedOps: ['prefill'],
      signedTimestamp: Date.now() - 120000, // 2 minutes old
      operatorSignature: 'sig:ed25519:valid-ca',
    };

    const res = transport.receiveGossipAdvertisement(staleAd);
    assert.equal(res.success, false);
    assert.match(res.reason ?? '', /stale/);
  });

  test('Selects optimal peer matching required operations and lowest latency', () => {
    transport.receiveGossipAdvertisement({
      peerId: 'peer:slow-high-tops',
      availableTops: 120,
      maxContextTokens: 8192,
      supportedOps: ['prefill', 'speculative_draft'],
      signedTimestamp: Date.now(),
      operatorSignature: 'sig:ca:1',
    });
    transport.recordPeerHealth({
      peerId: 'peer:slow-high-tops',
      latencyMs: 180,
      activeTasks: 2,
      lastGossipTime: Date.now(),
      isHealthy: true,
    });

    transport.receiveGossipAdvertisement({
      peerId: 'peer:fast-low-tops',
      availableTops: 60,
      maxContextTokens: 8192,
      supportedOps: ['prefill', 'speculative_draft'],
      signedTimestamp: Date.now(),
      operatorSignature: 'sig:ca:2',
    });
    transport.recordPeerHealth({
      peerId: 'peer:fast-low-tops',
      latencyMs: 25, // Much faster latency
      activeTasks: 0,
      lastGossipTime: Date.now(),
      isHealthy: true,
    });

    const chosen = transport.selectOptimalPeer(['prefill', 'speculative_draft'], 200);
    assert.ok(chosen);
    assert.equal(chosen?.peerId, 'peer:fast-low-tops');
  });

  test('Resolves task auction selecting lowest price with thermal and VRAM headroom', () => {
    const bids: PeerTaskBid[] = [
      {
        bidId: 'bid-1',
        peerId: 'peer:hot-node',
        bidPriceTokens: 10,
        estimatedLatencyMs: 30,
        vramAvailableMb: 4096,
        thermalHeadroomPct: 5, // Overheating -> Disqualified
      },
      {
        bidId: 'bid-2',
        peerId: 'peer:expensive-node',
        bidPriceTokens: 50,
        estimatedLatencyMs: 20,
        vramAvailableMb: 8192,
        thermalHeadroomPct: 40,
      },
      {
        bidId: 'bid-3',
        peerId: 'peer:optimal-node',
        bidPriceTokens: 15, // Cheap and safe
        estimatedLatencyMs: 35,
        vramAvailableMb: 4096,
        thermalHeadroomPct: 35,
      },
    ];

    const winner = transport.resolveTaskAuction(bids);
    assert.ok(winner);
    assert.equal(winner?.bidId, 'bid-3');
    assert.equal(winner?.peerId, 'peer:optimal-node');
  });
});

describe('Module 5: WanStateDecisionEngine — Bandwidth Crossover Thresholds', () => {
  test('MHA Attention: Recommends state transfer above 85 Gbps, recompute below', () => {
    const highBandwidth = WanStateDecisionEngine.evaluateTransferDecision('MHA', 95.0);
    assert.equal(highBandwidth.decision, 'TRANSFER_KV_STATE');
    assert.equal(highBandwidth.thresholdGbps, 85.0);

    const lowBandwidth = WanStateDecisionEngine.evaluateTransferDecision('MHA', 40.0);
    assert.equal(lowBandwidth.decision, 'RECOMPUTE_LOCALLY');
  });

  test('GQA Attention: Recommends state transfer above 12 Gbps, recompute below', () => {
    const highBandwidth = WanStateDecisionEngine.evaluateTransferDecision('GQA', 20.0);
    assert.equal(highBandwidth.decision, 'TRANSFER_KV_STATE');
    assert.equal(highBandwidth.thresholdGbps, 12.0);

    const lowBandwidth = WanStateDecisionEngine.evaluateTransferDecision('GQA', 8.0);
    assert.equal(lowBandwidth.decision, 'RECOMPUTE_LOCALLY');
  });
});

describe('Module 5: SecretCanaryVerifier — Activation Drift Defense', () => {
  test('Certifies benign peer node with activation drift <= 0.015', () => {
    const baseline = [0.124, 0.455, -0.221, 0.884, 0.103];
    const reported = [0.125, 0.454, -0.220, 0.885, 0.104]; // Minimal divergence

    const result = SecretCanaryVerifier.verifyCanaryResponse('peer:benign-worker', reported, baseline);
    assert.equal(result.isVerified, true);
    assert.equal(result.verdict, 'BENIGN_CERTIFIED');
    assert.ok(result.activationDrift <= 0.015);
  });

  test('Isolates subverted/malicious peer node with activation drift > 0.015 (100% accuracy)', () => {
    const baseline = [0.124, 0.455, -0.221, 0.884, 0.103];
    const poisoned = [0.899, -0.123, 0.744, -0.312, 0.991]; // Poisoned activations

    const result = SecretCanaryVerifier.verifyCanaryResponse('peer:byzantine-worker', poisoned, baseline);
    assert.equal(result.isVerified, false);
    assert.equal(result.verdict, 'MALICIOUS_ISOLATED');
    assert.ok(result.activationDrift > 0.015);
    assert.match(result.reason, /Abnormal activation drift detected/);
  });
});

describe('Module 5: SwarmLayerSplitter — Dynamic VRAM/RAM Layer Splitting', () => {
  test('Full GPU execution when dedicated VRAM is sufficient', () => {
    const split = SwarmLayerSplitter.calculateLayerSplit(32, 8000, 16000, 32000);
    assert.equal(split.strategy, 'FULL_GPU');
    assert.equal(split.gpuLayers, 32);
    assert.equal(split.cpuLayers, 0);
    assert.equal(split.performanceMultiplier, 3.5);
  });

  test('Recovers 1.8x performance via dynamic split when model exceeds dedicated VRAM', () => {
    // 32 layers require 16 GB, but GPU only has 8 GB
    const split = SwarmLayerSplitter.calculateLayerSplit(32, 16000, 8000, 32000);
    assert.equal(split.strategy, 'SPLIT_VRAM_RAM');
    assert.equal(split.gpuLayers, 16);
    assert.equal(split.cpuLayers, 16);
    assert.equal(split.performanceMultiplier, 1.8);
    assert.equal(split.memoryFit, true);
  });

  test('Falls back to CPU when dedicated VRAM is exhausted', () => {
    const split = SwarmLayerSplitter.calculateLayerSplit(32, 8000, 0, 16000);
    assert.equal(split.strategy, 'CPU_FALLBACK');
    assert.equal(split.gpuLayers, 0);
    assert.equal(split.cpuLayers, 32);
    assert.equal(split.performanceMultiplier, 1.0);
  });
});
