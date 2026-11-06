import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateKeyPair,
  generateSecureKeyPair,
  createEphemeralKeyPair,
  signPayload,
  verifySignature,
  canonicalizeJson,
  computeSha256,
  loadPrivateKeyFromEnv,
  isKeyCompromised,
  assertKeyNotCompromised,
  CompromisedKeyError,
  SecurityError,
  FatalConfigurationError,
  COMPROMISED_STATIC_SEEDS,
  COMPROMISED_PUBLIC_KEYS,
  COMPROMISED_PRIVATE_KEY_HASHES,
  SovereignAuthorityManager,
  SOVEREIGN_ROOT_AUTHORITY,
  CASCADIA_ROOT_CA,
} from '../src/core/crypto/cryptoUtils';
import { ProvisoVerificationGate, createSignedAuthorizationEvent } from '../src/core/verification/ProvisoVerificationGate';
import { CommitReceiptBuilder, createSignedAuthorizationRef } from '../src/core/commit/CommitReceipt';
import { CascadiaMeshTransport, createSignedNodeCapabilityAd } from '../src/core/mesh/CascadiaMeshTransport';

// Historical private key scalars used solely to verify blacklist rejection
const HISTORICAL_REVOKED_TEST_SCALARS: readonly string[] = [
  '9568b4c709e7cfe390721ba775295836716361c92ad598326750895d507115ac',
  '0669947b7bfa53dd0a56baa99dea75d5a183eca5f8781993af08e364b27968de',
  '31dbd912c030f12246c08d51f20b57561c1ac3b7d692759e2df81c6822cad443',
  'b87cd53dc22f0b73881131f706d08e25fc76ac487c5e0e49beca261c03c58f80',
  'e96eacb0c5925a9cf7fe620ba9a767e3e3af19df4967db7779714cdeda006e67',
  '63d6b7d9a4dffd7189e2d00d9ef5849bc9381b7ab86ef8a5b94994030c4031bb',
];

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

  test('Dynamic anchors SOVEREIGN_ROOT_AUTHORITY and CASCADIA_ROOT_CA sign and verify correctly without static seeds', () => {
    const testDoc = { type: 'CA_ADVERTISEMENT_CERT', peer: 'node-1' };
    const sig = signPayload(testDoc, CASCADIA_ROOT_CA.privateKey);
    assert.equal(verifySignature(testDoc, sig, CASCADIA_ROOT_CA.publicKey), true);
  });
});

describe('Sovereign Key Management: Blacklist Invalidation & Secret Decoupling', () => {
  test('Historical committed seed strings are strictly blacklisted and throw CompromisedKeyError', () => {
    for (const seed of COMPROMISED_STATIC_SEEDS) {
      assert.throws(
        () => {
          generateKeyPair(seed);
        },
        (err: Error) => {
          assert.ok(err instanceof CompromisedKeyError);
          assert.match(err.message, /compromised historical seed/);
          return true;
        }
      );
    }
  });

  test('Signing rejects attempts to use compromised private keys via SHA-256 hash match', () => {
    for (const privKey of HISTORICAL_REVOKED_TEST_SCALARS) {
      assert.throws(
        () => {
          signPayload('test-payload', privKey);
        },
        (err: Error) => {
          assert.ok(err instanceof CompromisedKeyError);
          assert.match(err.message, /compromised\/revoked historical key/);
          return true;
        }
      );
    }
  });

  test('COMPROMISED_PRIVATE_KEY_HASHES stores SHA-256 hashes rather than raw private scalars', () => {
    assert.equal(COMPROMISED_PRIVATE_KEY_HASHES.size, 6);
    for (const privKey of HISTORICAL_REVOKED_TEST_SCALARS) {
      const hash = computeSha256(privKey);
      assert.ok(COMPROMISED_PRIVATE_KEY_HASHES.has(hash));
      assert.equal(isKeyCompromised(privKey), true);
    }
  });

  test('Verification immediately fails-closed if public key is in compromised registry', () => {
    for (const pubKey of COMPROMISED_PUBLIC_KEYS) {
      assert.equal(isKeyCompromised(pubKey), true);
      const fakeSig = 'sig:schnorr:0000000000000000000000000000000000000000000000000000000000000001:0000000000000000000000000000000000000000000000000000000000000001';
      const result = verifySignature('hello', fakeSig, pubKey);
      assert.equal(result, false);
    }
  });

  test('loadPrivateKeyFromEnv strictly fails closed with SecurityError in browser/client runtimes (REQ-2)', () => {
    // Simulate browser runtime with global window
    (globalThis as any).window = {};
    try {
      assert.throws(
        () => {
          loadPrivateKeyFromEnv('SOVEREIGN_ROOT_PRIVATE_KEY');
        },
        (err: Error) => {
          assert.ok(err instanceof SecurityError);
          assert.match(err.message, /SECURITY BOUNDARY VIOLATION/);
          return true;
        }
      );
    } finally {
      delete (globalThis as any).window;
    }
  });

  test('SovereignAuthorityManager in strict production mode throws FatalConfigurationError on missing secrets (REQ-5, REQ-7)', () => {
    SovereignAuthorityManager.resetAuthorities();
    SovereignAuthorityManager.setStrictMode(true);

    try {
      // Clear environment secrets if set
      const prevSovereign = process.env.SOVEREIGN_ROOT_PRIVATE_KEY;
      const prevCascadia = process.env.CASCADIA_CA_PRIVATE_KEY;
      delete process.env.SOVEREIGN_ROOT_PRIVATE_KEY;
      delete process.env.CASCADIA_CA_PRIVATE_KEY;

      assert.throws(
        () => {
          SovereignAuthorityManager.getSovereignRootAuthority();
        },
        (err: Error) => {
          assert.ok(err instanceof FatalConfigurationError);
          assert.match(err.message, /Missing required SOVEREIGN_ROOT_PRIVATE_KEY secret in production/);
          return true;
        }
      );

      assert.throws(
        () => {
          SovereignAuthorityManager.getCascadiaRootCa();
        },
        (err: Error) => {
          assert.ok(err instanceof FatalConfigurationError);
          assert.match(err.message, /Missing required CASCADIA_CA_PRIVATE_KEY secret in production/);
          return true;
        }
      );

      if (prevSovereign) process.env.SOVEREIGN_ROOT_PRIVATE_KEY = prevSovereign;
      if (prevCascadia) process.env.CASCADIA_CA_PRIVATE_KEY = prevCascadia;
    } finally {
      SovereignAuthorityManager.resetAuthorities();
    }
  });

  test('createEphemeralKeyPair generates cryptographically unique keys via CSPRNG', () => {
    const k1 = createEphemeralKeyPair('test-session-1');
    const k2 = createEphemeralKeyPair('test-session-2');

    assert.equal(k1.isEphemeral, true);
    assert.equal(k2.isEphemeral, true);
    assert.notEqual(k1.privateKey, k2.privateKey);
    assert.notEqual(k1.publicKey, k2.publicKey);
    assert.equal(k1.privateKey.length, 64);
    assert.equal(k1.publicKey.length, 66);
  });

  test('ProvisoVerificationGate rejects admission of events signed with compromised keys', () => {
    const gate = new ProvisoVerificationGate();
    const compromisedPub = Array.from(COMPROMISED_PUBLIC_KEYS)[0];

    const fakeEvent = {
      eventId: 'evt-compromised-01',
      principalId: 'did:mesh:hacker',
      principalPublicKey: compromisedPub,
      principalSignature: 'sig:schnorr:0000000000000000000000000000000000000000000000000000000000000001:0000000000000000000000000000000000000000000000000000000000000001',
      authorizedResource: 'db:secrets',
      authorizedOp: 'read',
      issuedAt: Date.now(),
    };

    assert.throws(
      () => {
        gate.appendAuthorizationEvent(fakeEvent);
      },
      (err: Error) => {
        assert.ok(err instanceof CompromisedKeyError);
        return true;
      }
    );
  });

  test('CascadiaMeshTransport rejects peer advertisements signed by compromised CA keys', () => {
    const mesh = new CascadiaMeshTransport();
    const compromisedPub = Array.from(COMPROMISED_PUBLIC_KEYS)[1];

    const fakeAd = {
      peerId: 'peer-rogue-01',
      availableTops: 100,
      maxContextTokens: 4096,
      supportedOps: ['infer'],
      signedTimestamp: Date.now(),
      operatorSignature: 'sig:schnorr:0000000000000000000000000000000000000000000000000000000000000001:0000000000000000000000000000000000000000000000000000000000000001',
      caPublicKey: compromisedPub,
    };

    const admission = mesh.receiveGossipAdvertisement(fakeAd);
    assert.equal(admission.success, false);
    assert.match(admission.reason || '', /revoked or compromised/);
  });

  test('CommitReceipt verification validates strictly against independent trusted public keys', () => {
    const sessionAuthority = createEphemeralKeyPair('Independent Sovereign Authority');
    const authRef = createSignedAuthorizationRef(
      {
        authEventId: 'evt-rec-01',
        grantId: 'grant-rec-01',
        principalId: 'did:mesh:authority-ephemeral',
      },
      sessionAuthority
    );

    const builder = new CommitReceiptBuilder();
    builder.setExecutionEvidence({
      executorId: 'gemini-test',
      candidateResultHash: computeSha256('result-1'),
      toolCallsExecuted: ['search'],
      executionTimeMs: 42,
      environmentSignature: 'node-v20',
    });
    builder.setAuthorizationRef(authRef);
    builder.setStateDelta({ balance: 500 });

    const receipt = builder.signAndBuild(sessionAuthority);

    // Verifier only knows public key
    const trustedKeys = new Set([sessionAuthority.publicKey]);
    const isValid = CommitReceiptBuilder.verifyReceiptIntegrity(receipt, trustedKeys);
    assert.equal(isValid, true);

    // Untrusted public keys fails verification
    const otherAuthority = createEphemeralKeyPair('Other Authority');
    const isUntrusted = CommitReceiptBuilder.verifyReceiptIntegrity(receipt, new Set([otherAuthority.publicKey]));
    assert.equal(isUntrusted, false);
  });
});

