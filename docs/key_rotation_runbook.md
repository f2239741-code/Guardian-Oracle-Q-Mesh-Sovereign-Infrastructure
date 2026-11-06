# Guardian Oracle / Q-Mesh Sovereign Infrastructure
## Operational Key Generation, Provisioning & Rotation Runbook (REQ-9)

**Document Version:** 1.0.0  
**Security Classification:** Highly Confidential / Sovereign Root Governance  
**Target Roles:** Sovereign Root Key Custodian, Security Operations, Infrastructure Engineering  
**Primary Engine:** `scripts/keygen.ts` (`npm run keygen`)

---

### Executive Summary & Core Doctrine

> *"Knowledge can propagate. Privilege cannot. Compute can migrate. State remains sovereign."*  
> *"Memory may preserve evidence of authority. Memory must never manufacture authority."*

This runbook establishes mandatory cryptographic operational procedures for the generation, hardware custody, secret manager injection, overlapping dual-key rotation, and emergency revocation of Guardian Oracle / Q-Mesh key material:

1. **Sovereign Root Authority (`SOVEREIGN_ROOT_PRIVATE_KEY` / `SOVEREIGN_ROOT_PUBLIC_KEY`)**: Signs ledger roots, genesis authority manifests, and supreme proviso policy updates.
2. **Cascadia Certificate Authority (`CASCADIA_CA_PRIVATE_KEY` / `CASCADIA_CA_PUBLIC_KEY`)**: Issues signed peer node identity certificates, mesh admission tokens, and tier accreditations.
3. **Operator Node Identity (`OPERATOR_PRIVATE_KEY` / `OPERATOR_PUBLIC_KEY`)**: Used by distributed nodes to sign ephemeral capability advertisements, gossip load heartbeats, and local execution evidence.

---

### 1. Pre-Ceremony Requirements & Hardware Isolation

Production root and CA key ceremonies must NEVER occur in browser runtimes, shared development environments, or automated CI/CD runners.

#### 1.1 Air-Gapped Key Ceremony Protocol
1. **Host Environment**: An air-gapped, freshly imaged machine booted from an audited, ephemeral Linux live medium (or hardware HSM/YubiKey HSM enclave).
2. **Network Isolation**: Physical disconnection of Ethernet, Wi-Fi, and Bluetooth hardware modules.
3. **Dual Custody (M-of-N)**: Ceremony conducted in the presence of at least two designated Key Custodians.
4. **Clean Workspace**: Clone the repository or mount only the verified cryptographic utilities (`scripts/keygen.ts` and `src/core/crypto/cryptoUtils.ts`).

---

### 2. Generating New Sovereign Keypairs via `keygen.ts`

The repository provides a deterministic, zero-dependency CLI utility built on Node.js native `crypto.randomBytes(32)` with Secp256k1 curve derivation and SHA-256 blacklisting validation.

#### 2.1 Execution Commands

```bash
# Generate complete sovereign triad (Sovereign Root, Cascadia CA, Operator)
npm run keygen all

# Generate an individual keypair
npm run keygen sovereign-root
npm run keygen cascadia-ca
npm run keygen operator
```

#### 2.2 Validation Assertions Executed Automatically
`scripts/keygen.ts` performs real-time cryptographic integrity checks prior to output:
- Verifies scalar length is strictly 32 bytes (64 hex characters).
- Verifies scalar falls strictly within the valid Secp256k1 curve order (`1 < scalar < n - 1`).
- Verifies public key compression (`02` or `03` prefix, 33 bytes / 66 hex characters).
- Verifies private scalar hash and public key against `COMPROMISED_PRIVATE_KEY_HASHES` and `COMPROMISED_PUBLIC_KEYS`.
- Executes round-trip test signature and verification using Schnorr / Secp256k1.
- Generates SHA-256 key fingerprints for audit logging.

---

### 3. Secret Manager Injection & Environment Configuration

Private keys must **NEVER** be committed to Git or bundled in client-side code. They are loaded exclusively into secure server execution runtimes via environment variables or secret vaults.

#### 3.1 Google Cloud Platform (GCP) Secret Manager

```bash
# 1. Create Sovereign Root Secret
gcloud secrets create sovereign-root-private-key \
    --replication-policy="automatic" \
    --data-file=/path/to/secure/sovereign_root.key

# 2. Grant Secret Accessor role ONLY to sovereign backend orchestrator service account
gcloud secrets add-iam-policy-binding sovereign-root-private-key \
    --member="serviceAccount:guardian-oracle-core@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# 3. Mount into production container runtime
# In Cloud Run / GKE deployment manifest:
env:
  - name: SOVEREIGN_ROOT_PRIVATE_KEY
    valueFrom:
      secretKeyRef:
        name: sovereign-root-private-key
        key: latest
  - name: STRICT_SOVEREIGN_MODE
    value: "true"
```

#### 3.2 HashiCorp Vault

```bash
# Store in Vault KV engine
vault kv put secret/guardian-oracle/sovereign \
    root_private_key="<64_HEX_SCALAR>" \
    cascadia_ca_private_key="<64_HEX_SCALAR>"

# Configure agent template injection
cat << 'EOF' > /vault/config/agent-template.hcl
template {
  destination = "/secrets/env"
  contents = <<EOT
export SOVEREIGN_ROOT_PRIVATE_KEY="{{ with secret "secret/guardian-oracle/sovereign" }}{{ .Data.data.root_private_key }}{{ end }}"
export CASCADIA_CA_PRIVATE_KEY="{{ with secret "secret/guardian-oracle/sovereign" }}{{ .Data.data.cascadia_ca_private_key }}{{ end }}"
export STRICT_SOVEREIGN_MODE="true"
EOT
}
EOF
```

#### 3.3 AWS Secrets Manager

```bash
aws secretsmanager create-secret \
    --name "guardian-oracle/sovereign-keys" \
    --description "Guardian Oracle Sovereign Root and CA Private Keys" \
    --secret-string '{"SOVEREIGN_ROOT_PRIVATE_KEY":"<HEX>","CASCADIA_CA_PRIVATE_KEY":"<HEX>"}'
```

---

### 4. Overlapping Dual-Key Rotation Protocol (Zero Downtime)

To rotate trust anchors without invalidating active receipts, running mesh nodes, or disrupting verifiable execution pipelines:

```
Timeline:
[Phase 1: Dual Trust]    -> [Phase 2: Active Cutover] -> [Phase 3: Deprecate Old]
Trust: {Key_A, Key_B}       Trust: {Key_A, Key_B}        Trust: {Key_B}
Signer: Key_A               Signer: Key_B                Signer: Key_B
```

#### Step 1: Trust Anchor Staging (T - 7 days)
1. Generate new Keypair $B$ using `npm run keygen`.
2. Configure all verifying nodes (both server engines and client verification gates) with updated public trust anchors admitting both $Key_A$ and $Key_B$:
   ```typescript
   // SovereignTrustAnchorRegistry update
   const TRUSTED_SOVEREIGN_ROOTS = [
     PUBLIC_KEY_A, // Active signer
     PUBLIC_KEY_B  // Staged signer
   ];
   ```
3. Deploy trust anchor update across the cluster.

#### Step 2: Signing Cutover (T - 0)
1. Inject $Key\_B$ private scalar into the production secret manager as the active secret (`SOVEREIGN_ROOT_PRIVATE_KEY`).
2. Trigger rolling restart of sovereign signers (`SovereignAuthorityManager`).
3. Nodes now issue new receipts signed with $Key\_B$. Nodes accept receipts signed with either $Key\_A$ or $Key\_B$.

#### Step 3: Decommission & Blacklist (T + 30 days)
1. After all active ephemeral receipts and sessions signed under $Key\_A$ expire or transition to permanent ledger history:
2. Remove $Key\_A$ public key from active signing authorities.
3. If $Key\_A$ retirement is routine: archive $Key\_A$ public key in historical verification registry.
4. If $Key\_A$ retirement is due to suspected compromise: proceed immediately to Section 5.

---

### 5. Emergency Revocation & Compromise Protocol

If any private key is suspected of being exposed or leaked:

1. **Immediate Revocation Signal**: Broadcast a sovereign `REVOKE_AUTHORITY` event signed by the secondary emergency recovery key or hardware root.
2. **Hash-Based Blacklisting**:
   - Compute SHA-256 hash of the exposed private key scalar:
     ```bash
     echo -n "<compromised_private_scalar>" | shasum -a 256
     ```
   - Compute the compressed public key hex (33 bytes) and its SHA-256 hash.
   - Add the public key to `COMPROMISED_PUBLIC_KEYS` and the private key SHA-256 hash to `COMPROMISED_PRIVATE_KEY_HASHES` in `src/core/crypto/cryptoUtils.ts`.
3. **Deploy Emergency Blacklist**:
   - Because `COMPROMISED_PRIVATE_KEY_HASHES` stores only one-way SHA-256 digests, adding hashes to client bundles does not leak the private scalar to attackers.
   - Re-run `npm run build && npm test`.
4. **Ledger Invalidation**:
   - Execute ledger boundary check: mark all uncommitted receipts signed by the compromised key ID as `INVALID_AUTHORITY_REVOKED`.

---

### 6. Audit Checklist & Compliance Sign-Off

| Requirement | Audit Verification Action | Status |
|:---|:---|:---:|
| **REQ-1** | Scan client bundle for raw private scalars (`npm run build && scan`) | PASS |
| **REQ-2** | Check `loadPrivateKeyFromEnv()` throws `SecurityError` in browser context | PASS |
| **REQ-3** | Public trust anchors configured independently from private keys | PASS |
| **REQ-4** | Verified `COMPROMISED_PRIVATE_KEY_HASHES` rejects historical keys | PASS |
| **REQ-5 / 7** | `STRICT_SOVEREIGN_MODE` fails closed on missing credentials | PASS |
| **REQ-8** | Zero raw private scalars present in Vite client assets | PASS |
| **REQ-9** | Air-gapped `keygen.ts` CLI and operational runbook established | PASS |
| **REQ-10** | Automated test suite (62/62 tests passing, 0 TypeScript errors) | PASS |
