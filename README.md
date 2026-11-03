# Guardian Oracle / Q-Mesh Sovereign Infrastructure
Kenneth Cripps & Guardian Oracle team

> **Founding Architectural Doctrines**  
> 🛡️ *Knowledge can propagate. Privilege cannot. Compute can migrate. State remains sovereign.*  
> 🔑 *Memory may preserve evidence of authority. Memory must never manufacture authority.*  
> 🚫 *Asset Discovery ≠ Execution Authority.*

---

## Overview

**Guardian Oracle / Q-Mesh** is a zero-trust, decentralized AI infrastructure framework designed to decouple execution, memory, and authority across distributed agent networks. By separating unprivileged model inference from sovereign state validation, Q-Mesh prevents endogenous authorization laundering, role-grounding preference corruption, and unauthorized privilege escalation across edge-cloud continuums.

The implementation is organized into six core modules spanning four architectural phases (**004A**, **003H**, **004B**, and **004C**), fully integrated with interactive live workbenches and verified via automated test suites.

---

## Core Architectural Phases & Module Inventory

| Module                                | Core Source Files                                                                                                                          | Target Phase | Primary Architectural Invariant                                                                                                                                                       | Live UI Workbench                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Module 0: Execution Socket**        | `/src/core/contracts/execution.ts` `/src/core/registry/ProviderRegistry.ts` `/src/core/providers/MockModelProvider.ts`                     | Phase 004A   | Model providers output strictly unprivileged candidate results; candidate generation confers 0 ambient authority.                                                                     | Interactive Provider Registry & Candidate Execution |
| **Module 1: ContextPipe Planner**     | `/src/core/planner/ContextPipe.ts`                                                                                                         | Phase 004A   | 5-stage deterministic query planner (`Plan` → `Bind` → `Optimize` → `Execute` → `Feedback`); strictly isolates durable memory from transient context.                                 | `ContextPipeLiveWorkbench` in `Phase004AView`       |
| **Module 2: TaskPolicy Engine**       | `/src/core/policy/TaskPolicyEngine.ts`                                                                                                     | Phase 003H   | **Asset Discovery ≠ Execution Authority**. REALM capability envelopes enforce time-bounded TTLs and Task-Graph Contextual Integrity.                                                  | `RealmPolicyLiveWorkbench` in `Phase003HView`       |
| **Module 3: PROVISO Gate**            | `/src/core/verification/ProvisoVerificationGate.ts`                                                                                        | Phase 004B   | **Memory must never manufacture authority**. Dual-stage verification requires active, signed ledger events before candidate proposals commit.                                         | `ProvisoLiveWorkbench` in `Phase004BView`           |
| **Module 4: CommitReceipt Engine**    | `/src/core/commit/CommitReceipt.ts`                                                                                                        | Phase 004B   | Content-addressed portable receipts (`SHA-256`); strictly decouples executor-produced evidence from sovereign ledger attestations; supports parent receipt chaining.                  | `CommitReceiptLiveWorkbench` in `Phase004BView`     |
| **Module 5: Cascadia Mesh Transport** | `/src/core/mesh/CascadiaMeshTransport.ts` `/src/core/mesh/SpeculativeBandwidthCalculator.ts` `/src/core/mesh/SecretCanaryDriftDetector.ts` | Phase 004C   | Control-plane-free libp2p/QUIC gossip with CA admission gate, DISCO WAN speculative decoding crossover, Byzantine Secret Canary drift detector, and SwarmLLM dynamic layer splitting. | `Phase004CView` Live Workbenches                    |

---

## Key Security Controls & Technical Breakthroughs

### 1. PROVISO Dual-Stage Verification & Authorization Laundering Defense

* **Problem**: Persistent agent memory can manufacture ungranted permissions (endogenous authorization laundering) or misattribute user preferences (role-grounding attacks).
* **Defense**: The `ProvisoVerificationGate` intercepts proposed actions prior to execution, requiring validation against both an active REALM capability grant and an immutable, append-only ledger of `SignedAuthorizationEvents`. Model output summaries are treated strictly as non-authoritative candidate proposals.

### 2. REALM Capability Envelopes & Task-Graph Contextual Integrity

* **Principle**: *Asset Discovery ≠ Execution Authority*.
* **Defense**: Worker models discovering assets during execution receive zero ambient permissions. The `TaskPolicyEngine` issues time-bounded (`TTL`) capability grants and enforces `Task-Graph Contextual Integrity`, preventing sensitive data from leaking to unauthorized downstream agent recipient scopes.

### 3. CommitReceipt Portable Provenance (TRACEs Framework)

* **Structure**: Embeds consumed input lineage (`recordId`, `provenanceHash`, `sourceType`, `timestamp`) and environment hashes directly within immutable receipt artifacts.
* **Decoupling**: Separates executor-produced evidence (`candidateResultHash`, `toolCallsExecuted`) from sovereign authorization references (`authEventId`, `grantId`).
* **Integrity**: Receipts use content-addressed SHA-256 hashing (`receiptId`) and support `parentReceiptId` chaining to form verifiable multi-agent task DAGs.

### 4. Cascadia Peer Compute & Byzantine Fault Isolation

* **CA Operator Admission**: Peer nodes advertising capabilities (`NodeCapabilityAd`) over libp2p/QUIC gossip must present valid CA operator signatures and fresh timestamps (< 5 min).
* **DISCO WAN Bandwidth Crossover Engine**: Evaluates available WAN link capacity for 70B models (MHA 74–111 Gbps; GQA 9–14 Gbps) to dynamically select between `TRANSFER_KV_STATE` and `RECOMPUTE_LOCALLY`.
* **Secret Canary Drift Detector**: Periodically probes untrusted nodes with secret canary vectors, enforcing a normalized Euclidean activation drift threshold ($\epsilon \le 0.15$) to isolate subverted nodes with high accuracy.
* **SwarmLLM Dynamic Layer Splitting**: Partition transformer layers across GPU VRAM and host RAM when VRAM limits are exceeded, recovering execution throughput while eliminating PCIe bus thrashing.

---

## System Architecture Directory Layout

```
/src/core/
├── contracts/
│   └── execution.ts             # Unprivileged Execution Socket & CandidateResult contracts
├── registry/
│   └── ProviderRegistry.ts      # Plug-and-play provider registration & candidate dispatch
├── providers/
│   └── MockModelProvider.ts     # Sandboxed candidate model provider
├── planner/
│   └── ContextPipe.ts           # 5-Stage deterministic query planner & token accountant
├── policy/
│   └── TaskPolicyEngine.ts      # REALM capability grants & contextual integrity rules
├── verification/
│   └── ProvisoVerificationGate.ts # PROVISO dual-stage gate & append-only auth ledger
├── commit/
│   └── CommitReceipt.ts         # Content-addressed SHA-256 receipts & DAG lineage chain
└── mesh/
    ├── CascadiaMeshTransport.ts        # CA-signed peer gossip & topology discovery
    ├── SpeculativeBandwidthCalculator.ts # DISCO WAN crossover evaluation engine
    └── SecretCanaryDriftDetector.ts    # Byzantine canary activation drift detector
```

---

## Verification & Build Status

The repository has undergone automated test verification and production compilation checks:

* **Automated Test Suite**: `39 passing assertions` across 9 test suites (`0 failures`, `0 skipped`).
* **TypeScript Type Safety**: Clean `tsc --noEmit` check with `0 errors`.
* **Production Compilation**: Production `Vite` bundle compiles cleanly without errors or warnings.
* **Interactive Workbenches**: Live execution workbenches (`Phase004AView`, `Phase003HView`, `Phase004BView`, `Phase004CView`, `PipelineSimulatorModal`) integrated directly into the console UI.

---

## Quickstart

### Installation & Test Execution

```bash
# Install dependencies
npm install

# Run the full automated test suite (39 assertions across 9 test suites)
npm test

# Run TypeScript type check
npm run typecheck

# Build production bundle
npm run build
```

---

## License

Developed under the **Guardian Oracle Sovereign License**.  
*Compute can migrate. State remains sovereign.*
