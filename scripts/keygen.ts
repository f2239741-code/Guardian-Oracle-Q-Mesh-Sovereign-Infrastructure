/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * OUT-OF-BAND SECURE KEY CEREMONY & GENERATION TOOL (REQ-9)
 * 
 * Usage:
 *   npx tsx scripts/keygen.ts [role]
 * 
 * Roles:
 *   sovereign-root  (default) - Generates Sovereign Root Authority keypair
 *   cascadia-ca              - Generates Cascadia Root Certificate Authority keypair
 *   operator                 - Generates Certified Node Operator keypair
 *   all                      - Generates complete independent suite for production deployment
 */

import {
  generateSecureKeyPair,
  computeSha256,
  assertKeyNotCompromised,
  KeyPair,
} from '../src/core/crypto/cryptoUtils';

function printKeyHeader(title: string) {
  console.log('\n' + '='.repeat(78));
  console.log(` 🛡️  GUARDIAN ORACLE / Q-MESH — ${title}`);
  console.log('='.repeat(78));
}

function displayKeyPair(role: string, envVarName: string, pair: KeyPair) {
  // Validate generated keypair against the compromised key blacklist
  assertKeyNotCompromised(pair.privateKey, `${role} private key`);
  assertKeyNotCompromised(pair.publicKey, `${role} public key`);

  const pubKeyFingerprint = computeSha256(pair.publicKey);
  const privKeyDigest = computeSha256(pair.privateKey);

  console.log(`\n[ROLE]: ${role}`);
  console.log(`[ENVIRONMENT VARIABLE]: ${envVarName}`);
  console.log('-'.repeat(78));
  console.log(`PUBLIC KEY (Trust Anchor to enroll in Verifiers):`);
  console.log(`  ${pair.publicKey}`);
  console.log(`PUBLIC KEY FINGERPRINT (SHA-256):`);
  console.log(`  ${pubKeyFingerprint}`);
  console.log(`\nPRIVATE KEY (64-hex scalar - INJECT INTO SECRET MANAGER ONLY):`);
  console.log(`  ${pair.privateKey}`);
  console.log(`PRIVATE KEY AUDIT DIGEST (SHA-256):`);
  console.log(`  ${privKeyDigest}`);
  console.log('\n🔒 SECURITY COMPLIANCE:');
  console.log('  • Generated via CSPRNG 256-bit entropy (globalThis.crypto.getRandomValues).');
  console.log('  • Validated against revoked historical key blacklist (FAIL-CLOSED).');
  console.log('  • NEVER commit this private scalar to source control, logs, or client bundles.');
}

async function runKeyCeremony() {
  const role = process.argv[2] || 'sovereign-root';

  printKeyHeader('OUT-OF-BAND CRYPTOGRAPHIC KEY CEREMONY');

  switch (role.toLowerCase()) {
    case 'sovereign-root': {
      const pair = generateSecureKeyPair();
      displayKeyPair('Sovereign Root Authority (PROVISO & CommitReceipt Gate)', 'SOVEREIGN_ROOT_PRIVATE_KEY', pair);
      break;
    }
    case 'cascadia-ca': {
      const pair = generateSecureKeyPair();
      displayKeyPair('Cascadia Mesh Root Certificate Authority (Peer Admission)', 'CASCADIA_CA_PRIVATE_KEY', pair);
      break;
    }
    case 'operator': {
      const pair = generateSecureKeyPair();
      displayKeyPair('Certified Node Operator (Alpha Mesh Node)', 'OPERATOR_NODE_ALPHA_PRIVATE_KEY', pair);
      break;
    }
    case 'all': {
      console.log('Generating complete sovereign production key hierarchy...\n');
      const sovereign = generateSecureKeyPair();
      displayKeyPair('Sovereign Root Authority', 'SOVEREIGN_ROOT_PRIVATE_KEY', sovereign);

      const cascadia = generateSecureKeyPair();
      displayKeyPair('Cascadia Mesh Root CA', 'CASCADIA_CA_PRIVATE_KEY', cascadia);

      const operator = generateSecureKeyPair();
      displayKeyPair('Certified Node Operator Alpha', 'OPERATOR_NODE_ALPHA_PRIVATE_KEY', operator);
      break;
    }
    default: {
      console.error(`Unknown role: ${role}. Valid options: sovereign-root, cascadia-ca, operator, all.`);
      process.exit(1);
    }
  }

  console.log('\n' + '='.repeat(78));
  console.log(' CEREMONY COMPLETE: Inject secrets into Vault/KMS and enroll public keys.');
  console.log('='.repeat(78) + '\n');
}

runKeyCeremony().catch(err => {
  console.error('\n❌ FATAL KEY CEREMONY ERROR:', err);
  process.exit(1);
});
