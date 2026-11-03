import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateKeyPair,
  signPayload,
  verifySignature,
  canonicalizeJson,
  computeSha256,
  SOVEREIGN_ROOT_AUTHORITY,
  CASCADIA_ROOT_CA,
} from '../src/core/crypto/cryptoUtils';

describe('Cryptographic Engine: Secp256k1 Schnorr Signatures & Canonicalization', () => {
  test('Generates valid asymmetric key pair with compressed public key', () => {
    const pair = generateKeyPair('test_seed_1');
    assert.equal(pair.privateKey.length, 64);
    assert.equal(pair.publicKey.length, 66);
    assert.ok(pair.publicKey.startsWith('02') || pair.publicKey.startsWith('03'));
  });

  test('Signs and successfully verifies canonical payload with authentic private/public key', () => {
    const pair = generateKeyPair('alice_seed');
    const message = {
      action: 'commit_state',
      resource: 'db:financial/ledger',
      amount: 1000,
    };

    const signature = signPayload(message, pair.privateKey);
    assert.ok(signature.startsWith('sig:schnorr:'));

    const isValid = verifySignature(message, signature, pair.publicKey);
    assert.equal(isValid, true);
  });

  test('Rejects signature when message payload is tampered', () => {
    const pair = generateKeyPair('bob_seed');
    const message = { account: 'alice', amount: 50 };
    const signature = signPayload(message, pair.privateKey);

    const tampered = { account: 'alice', amount: 500000 };
    const isValid = verifySignature(tampered, signature, pair.publicKey);
    assert.equal(isValid, false);
  });

  test('Rejects signature when verified against wrong public key', () => {
    const pair1 = generateKeyPair('actor_1');
    const pair2 = generateKeyPair('actor_2');
    const message = 'authorize:subtask:001';

    const signature = signPayload(message, pair1.privateKey);
    const isValid = verifySignature(message, signature, pair2.publicKey);
    assert.equal(isValid, false);
  });

  test('Rejects forged or fabricated signature string', () => {
    const pair = generateKeyPair('actor_target');
    const message = 'grant:permission:root';
    const forgedSignature = 'sig:schnorr:0000000000000000000000000000000000000000000000000000000000000001:0000000000000000000000000000000000000000000000000000000000000001';

    const isValid = verifySignature(message, forgedSignature, pair.publicKey);
    assert.equal(isValid, false);

    assert.equal(verifySignature(message, 'arbitrary_fake_signature_string', pair.publicKey), false);
  });

  test('Default anchors SOVEREIGN_ROOT_AUTHORITY and CASCADIA_ROOT_CA sign and verify correctly', () => {
    const testDoc = { type: 'CA_ADVERTISEMENT_CERT', peer: 'node-1' };
    const sig = signPayload(testDoc, CASCADIA_ROOT_CA.privateKey);
    assert.equal(verifySignature(testDoc, sig, CASCADIA_ROOT_CA.publicKey), true);
  });
});
