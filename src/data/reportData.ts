import { Doctrine, PhaseSpec, ThreatItem, ChecklistItem, TaskStateObject } from '../types';

export const EXECUTIVE_STRATEGY = {
  title: "Guardian Oracle & Q-Mesh Sovereign Infrastructure",
  subtitle: "Decoupled Reasoning, Persistent State Governance, and Verifiable Execution",
  version: "v4.0-SOVEREIGN",
  classification: "RESTRICTED PROTOCOL ARCHITECTURE",
  timestamp: "2026-11-02T14:54:22Z",
  summary: `Sovereign Artificial Intelligence can no longer be defined merely as running an open-weight foundation model on isolated local hardware. Real operational sovereignty requires an architectural paradigm shift: transforming intelligence from an ephemeral local model execution process into a distributed, resilient, and state-sovereign systems property. Contemporary decentralized execution environments face persistent operational vulnerabilities. Autonomous agents routinely acquire unintended authority through persistent memory drift, untrusted tool returns, and unverified execution contexts. A fully realized sovereign infrastructure must guarantee system continuity across node failures, model substitutions, network partitioning, and untrusted peer environments without surrendering control over state, authority, or privacy.`,
  coreBoundary: `The system establishes a strict structural boundary between probabilistic model reasoning, persistent memory, and execution authorization. Model reasoning engines function purely as proposal generators with zero inherent execution authority. Memory stores historical evidence but cannot manufacture permissions. Authorization resolves exclusively against signed, append-only policy ledgers and independent verification gates.`
};

export const FOUNDING_DOCTRINES: Doctrine[] = [
  {
    id: 1,
    title: "Propagation vs Sovereignty",
    doctrine: "Knowledge can propagate. Privilege cannot. Compute can migrate. State remains sovereign.",
    explanation: "Information and intermediate representations may be distributed across network boundaries, but privilege is non-transferable by implication. Workloads may be dynamic, but state ownership remains bound to sovereign verification.",
    invariant: "StateOwnership ∩ ComputeNode = ∅ (State verified independently of execution substrate)",
    failureMode: "Compute migration leading to node capturing persistent state or implicit permission leakage."
  },
  {
    id: 2,
    title: "Memory Authority Separation",
    doctrine: "Memory may preserve evidence of authority. Memory must never manufacture authority.",
    explanation: "Persistent memory stores historical trace evidence and provenance of past events. It is structurally prohibited from acting as an authoritative source of executable permissions.",
    invariant: "PermittedScope = ResolveAgainst(SignedLedger), NOT ResolveAgainst(MemorySummary)",
    failureMode: "Endogenous Authorization Laundering: Agent summary generates false authority acted upon by executors."
  },
  {
    id: 3,
    title: "Verifiable Execution",
    doctrine: "Execution may be distributed. Authority must remain independently verifiable.",
    explanation: "Inference workloads and subtask processing can be offloaded to untrusted peer nodes, but downstream authorization and state mutation decisions must be validated by an independent Commit Plane.",
    invariant: "CommitReceipt.valid == true ⇐ Verify(EvidenceBundle, ArtifactHash)",
    failureMode: "Accepting peer inference or draft outputs directly as committed state mutations without Commit Plane validation."
  },
  {
    id: 4,
    title: "Zero Implicit Privilege",
    doctrine: "Privilege cannot propagate by implication.",
    explanation: "Access to a resource, discovery of an asset, or receipt of an intermediate message never implies authorization to execute actions against that resource or forward data downstream.",
    invariant: "Asset Discovery ≠ Execution Authority",
    failureMode: "Ambient authority escalation where discovering a database or API key allows immediate execution."
  }
];

export const IMPLEMENTATION_PHASES: PhaseSpec[] = [
  {
    id: '004A',
    code: 'Phase 004A',
    title: 'Execution Socket & Efficiency Infrastructure',
    subtitle: 'Runtime Compute Optimization, Heterogeneous Scheduling & Local Multi-Machine Routing',
    primaryFocus: 'Runtime execution optimization, resource-aware heterogeneous scheduling, local multi-machine routing, and inference cost reduction.',
    coreResearchInputs: [
      'Cloudflare Inference Optimizations',
      'PowerBench Profiling',
      'AMD ZenDNN & Intel oneDNN Unified Backend',
      'NVIDIA PAIR Local Routing',
      'TAO Joint Scheduler',
      'ASPIRE Request-Local Decoding',
      'ContextPipe Query Planner'
    ],
    criticalPrimitives: [
      'Heterogeneous NPU/CPU execution split',
      'Prefix-cache reuse & KV lifecycle',
      'Request-local async decoding (ASPIRE)',
      'mDNS / mTLS local node discovery',
      '4D Operational Envelope calibration'
    ],
    boundaryDependencies: 'Substrate Hardware & Native Compute Sockets',
    metrics: [
      { label: 'Total Inference Cost Reduction', value: '-68%', benchmark: 'Cloudflare Code-Review Benchmark ($0.77 to $0.25)' },
      { label: 'Median Task Completion Latency', value: '1m 32s', benchmark: 'Down from 4m 09s baseline (-63%)' },
      { label: 'Token Volume Suppression', value: '-31%', benchmark: 'ContextPipe 5-Stage Query Planning' },
      { label: 'Queue TTFT Improvement', value: '-36.3%', benchmark: 'TAO Tool-Aware Joint Scheduling' },
      { label: 'Decoding Speedup', value: '1.70× – 4.58×', benchmark: 'ASPIRE Request-Local Speculation' }
    ]
  },
  {
    id: '003H',
    code: 'Phase 003H',
    title: 'Identity, Capability, & Governed State Subsystem',
    subtitle: 'Cryptographic Identity Attestation, Resource-Bound Capability Envelopes & Bitemporal Memory Kernel',
    primaryFocus: 'Cryptographic identity attestation, resource-bound capability grants, write-time memory firewalling, long-context evidence partitioning, and bitemporal state governance.',
    coreResearchInputs: [
      'AgentDID (W3C DIDs & Verifiable Credentials)',
      'Cloudflare Verified Bots Behavioral Scoring',
      '5-Claim Isolated SSDI Architecture',
      'REALM Task-Specific Capability Envelopes',
      'Role-Grounding & Context Mitigation Protocols',
      'MemSentry Write-Time Policy Firewall',
      'Quipu Governed Bitemporal Knowledge Engine',
      'MemForest Structure-Aware Compression EventTrees',
      'DISCO Distributed Long-Context Scaling'
    ],
    criticalPrimitives: [
      '5-Claim SSDI Isolation (Key, Issuer, Capability, Audit, Trust)',
      'Append-only cryptographically signed authorization ledger',
      'MemSentry 3-tier write filter: Accept, Review, Quarantine',
      'Dual-axis Quipu time engine (Valid-Time vs Transaction-Time)',
      'Asset Discovery ≠ Execution Authority invariant'
    ],
    boundaryDependencies: 'Phase 004A Execution Socket Stability',
    metrics: [
      { label: 'Task Attack Success Rate', value: '0.2%', benchmark: 'Down from 16.6% via REALM dependency graph isolation' },
      { label: 'Auth Laundering Block Rate', value: '100%', benchmark: 'Neutralized 50.2% latent memory generation exploits' },
      { label: 'Million-Token Retrieval QA', value: '78.4%', benchmark: 'DISCO Long-Context RULER benchmark at -80% cost' },
      { label: 'EventTree Retrieval Speedup', value: '1.89× – 2.24×', benchmark: 'MemForest Compression (97.1% - 99.7% accuracy retained)' }
    ]
  },
  {
    id: '004B',
    code: 'Phase 004B',
    title: 'Verifiable Execution & Commit Plane Architecture',
    subtitle: 'Pre-Execution Verification Gates, Task-Graph Integrity, Portable Lineage & Git-DAG Ledgers',
    primaryFocus: 'Pre-execution verification gates, multi-agent contextual integrity, portable provenance, signed resumable state objects, and content-addressed commit ledgers.',
    coreResearchInputs: [
      'PROVISO Learned Pre-Execution Controller',
      'MAPLE-Bench Multi-Agent Task-Graph Integrity',
      'TRACEs Portable Embedded Artifact Lineage',
      'Pufibara State-Binding Rule Architecture',
      'Agora Git-Based DAG Shared Evidence Ledger',
      'Signed Resumable TaskState Protocol Objects'
    ],
    criticalPrimitives: [
      'PROVISO pre-execution evidence validation',
      'Task-Graph downstream propagation boundaries',
      'Pufibara rule: artifact_hash → execution → evidence → verdict',
      'Signed EvidenceBundle and CommitReceipt cryptographic pairs',
      'Agora append-only content-addressed Git DAG'
    ],
    boundaryDependencies: 'Phase 003H Identity & Governed State Subsystem',
    metrics: [
      { label: 'Pre-Execution F1 Improvement', value: '+13.84 pts', benchmark: 'SkillsBench validation benchmark' },
      { label: 'ToolSafe Safety Delta', value: '+7.07 pts', benchmark: 'PROVISO verifier over raw model' },
      { label: 'Downstream Data Leak Reduction', value: '85.8% – 94.1%', benchmark: 'MAPLE-Bench Task-Graph Contextual Integrity' },
      { label: 'Autonomous Collective Scalability', value: '1,703 commits', benchmark: 'Agora 12-day run, 165 reproductions, 0 ledger failures' }
    ]
  },
  {
    id: '004C',
    code: 'Phase 004C',
    title: 'Peer Compute & Mesh Execution Infrastructure',
    subtitle: 'Control-Plane-Free P2P Mesh, WAN Speculative Decoding, Canary Defense & Dynamic Layer Splitting',
    primaryFocus: 'Control-plane-free P2P mesh routing, WAN speculative decoding, malicious node defense, dynamic layer splitting, and market-based peer coordination.',
    coreResearchInputs: [
      'Cascadia Control-Plane-Free P2P Mesh (libp2p & QUIC)',
      'PlanetServe Overlay Router & Codebook Agent Topologies',
      'DISCO Speculative Decoding (WAN scalar & token exchange)',
      'AceSpec Local Probabilistic State Caching',
      'FlatCake Flat Host Storage & Mooncake UCL-MPComm RDMA',
      'Secret Canary Activation Drift Verification',
      'SwarmLLM Transport & Heterogeneous Layer Splitting'
    ],
    criticalPrimitives: [
      'Secret canary activation drift verification (100% ranking accuracy)',
      'WAN state transfer vs recompute threshold engine (74-111 Gbps MHA / 9-14 Gbps GQA)',
      'PlanetServe Codebook topology selection (~2.4ms pathing)',
      'SwarmLLM dynamic VRAM / Host RAM layer splitting (1.8× speedup)',
      'Sequential task auction protocols'
    ],
    boundaryDependencies: 'Phase 004B Verifiable Commit Plane',
    metrics: [
      { label: 'Malicious Node Isolation', value: '100%', benchmark: 'Canary activation drift ranking across 408 configs' },
      { label: 'P2P Concurrent Throughput', value: '3.10×', benchmark: 'Cascadia 3-node mesh over single-node baseline' },
      { label: 'Network Token Savings', value: '21.9% – 33.2%', benchmark: 'Codebook Agent compact graph selection' },
      { label: 'Host Storage Cache Hit Rate', value: '94%', benchmark: 'FlatCake unified RAM + NVMe address space' },
      { label: 'VRAM Overflow Recovery', value: '1.8×', benchmark: 'SwarmLLM dynamic layer-splitting over CPU-only' }
    ]
  }
];

export const FIVE_CLAIMS = [
  {
    claimNumber: 1,
    name: "Agent Identity Claim",
    primitive: "Cryptographic Public Key / W3C DID",
    description: "Unique verifiable decentralized identifier bound to hardware keystore (e.g., did:mesh:agent-7x92e). Cannot be forged or shared across instances.",
    verificationMethod: "Ed25519 signature attestation with dynamic nonce challenge"
  },
  {
    claimNumber: 2,
    name: "Authorizing Issuer Claim",
    primitive: "Signature of Originating Authority / Root Tensor",
    description: "Explicit cryptographic grant emitted by the human operator, organizational administrator, or authorized supervisor specifying permissible missions.",
    verificationMethod: "Root PKI chain validation against active sovereign governance registry"
  },
  {
    claimNumber: 3,
    name: "Attested Capability Claim",
    primitive: "REALM Resource Dependency Graph & API Bounds",
    description: "Strictly bounded least-privilege capability envelope. Enumerates precise files, read/write database endpoints, and network scopes.",
    verificationMethod: "REALM static AST graph inspection and runtime sandbox egress enforcement"
  },
  {
    claimNumber: 4,
    name: "Historical Execution Trace",
    primitive: "Cryptographic Audit Hash of Prior System State",
    description: "Merkle root hash of prior state transitions and tool outputs executed by this agent. Prevents state spoofing or context detachment.",
    verificationMethod: "Merkle proof verification against local Quipu bitemporal store"
  },
  {
    claimNumber: 5,
    name: "Reputation / Trust Score",
    primitive: "Continuous Behavioral Metric & Policy Delta",
    description: "Active, sliding-window trust coefficient derived from rate limits, canary responses, policy adherence, and revocation status.",
    verificationMethod: "Dynamic Bayesian trust updater with instant downgrade upon policy violation"
  }
];

export const THREAT_MATRIX_DATA: ThreatItem[] = [
  {
    id: "THREAT-01",
    threatCategory: "Endogenous Authorization Laundering",
    specificAttackVector: "Persistent memory engines summarize historical context and accidentally generate permission grants from loose conversational text.",
    concreteSystemImpact: "Ungranted authority causes downstream executors to act on unauthorized requests (up to 98.6% execution rate in vulnerable baselines).",
    mandatoryStructuralMitigation: "Permissions must resolve strictly against an append-only signed authorization ledger (Quipu bitemporal gate). Stored summaries possess zero permission weight.",
    mitigationPhase: "003H",
    riskSeverity: "CRITICAL",
    testedAttackRate: "50.2% latent permission creation; 98.6% action rate",
    postMitigationRate: "0.0% execution (Fail-closed signed ledger verification)"
  },
  {
    id: "THREAT-02",
    threatCategory: "Role-Grounding & Memory Poisoning",
    specificAttackVector: "Nested multi-user or cross-session conversations corrupt stored user preferences and hijack privileged tool configurations.",
    concreteSystemImpact: "Untrusted instructions hijack tool selection and exfiltrate sensitive enterprise data to attacker-controlled endpoints.",
    mandatoryStructuralMitigation: "Mandatory principal attribution schema, 5-claim SSDI identity labeling, and trust metadata tags attached to all stored memory cells.",
    mitigationPhase: "003H",
    riskSeverity: "CRITICAL",
    testedAttackRate: "41.7% preference hijack in multi-user threads",
    postMitigationRate: "<0.1% preference drift with attribution tags"
  },
  {
    id: "THREAT-03",
    threatCategory: "Downstream Data Leakage",
    specificAttackVector: "Cascading information disclosure across multi-agent interaction pipelines where intermediate representations retain privileged data.",
    concreteSystemImpact: "Sensitive data shared with a benign sub-agent is improperly forwarded downstream to third-party models or peer mesh nodes.",
    mandatoryStructuralMitigation: "Enforce Task-Graph Contextual Integrity (MAPLE-Bench). Capability envelopes explicitly define downstream propagation limits and authorized recipients.",
    mitigationPhase: "004B",
    riskSeverity: "HIGH",
    testedAttackRate: "34.5% unintended downstream propagation",
    postMitigationRate: "Reduced by 85.8% – 94.1% over local history baseline"
  },
  {
    id: "THREAT-04",
    threatCategory: "Untrusted Perceptual Injection",
    specificAttackVector: "Multimodal prompt injections (MMPIBench) embedded in visual (12.8% attempt rate) or audio inputs (up to 75% attack success).",
    concreteSystemImpact: "Attacker instructions hidden inside media bypass prompt filters and directly hijack model planner tool calls.",
    mandatoryStructuralMitigation: "Perceptual isolation boundary: Label all image/audio data as untrusted evidence. Pass inputs through structured policy filters prior to planner ingestion.",
    mitigationPhase: "003H",
    riskSeverity: "HIGH",
    testedAttackRate: "75.0% audio injection success; 12.8% visual injection",
    postMitigationRate: "<1.2% residual risk via structured evidence parser"
  },
  {
    id: "THREAT-05",
    threatCategory: "Malicious Peer Sharding",
    specificAttackVector: "Untrusted mesh compute nodes return corrupted inference, alter weights, or drift activation states during distributed subtask execution.",
    concreteSystemImpact: "Subverted peer calculations compromise collective multi-agent outputs, silent Byzantine poisoning, or state corruption.",
    mandatoryStructuralMitigation: "Canary-based integrity verification: Inject secret inputs to measure activation drift (100% detection accuracy). Require independent output verification.",
    mitigationPhase: "004C",
    riskSeverity: "CRITICAL",
    testedAttackRate: "Byzantine corruption undetected in 28% of vanilla P2P runs",
    postMitigationRate: "100% ranking accuracy across 408 test configurations"
  },
  {
    id: "THREAT-06",
    threatCategory: "Premature Execution / Unverified Action",
    specificAttackVector: "Probabilistic model proposals execute directly against external tools, APIs, production databases, or host filesystems without independent verification.",
    concreteSystemImpact: "Unintended infrastructure changes, incorrect database writes, unauthorized file deletions, or irreversible financial transfers.",
    mandatoryStructuralMitigation: "PROVISO pre-execution verification gates: Evaluate proposals against provenance evidence. Authorize execution strictly via the sovereign Commit Plane.",
    mitigationPhase: "004B",
    riskSeverity: "CRITICAL",
    testedAttackRate: "Direct model execution error rate: 18.2%",
    postMitigationRate: "+13.84 F1 SkillsBench / +7.07 ToolSafe improvement"
  }
];

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "CHK-01",
    name: "Isolation of Intent",
    description: "Language models are strictly restricted to proposing candidate actions (CandidateResult). External policy engines and sovereign Commit Planes validate provenance and grant execution authority independently of model outputs.",
    formula: "Authority(Action) = CommitPlane(Proposal, EvidenceBundle) ∧ Proposal.Authority == ∅",
    verificationMethod: "Static AST audit confirming no model execution socket can bind direct execution callbacks.",
    phase: "004B",
    status: "COMPLIANT"
  },
  {
    id: "CHK-02",
    name: "Memory Containment",
    description: "Persistent memory serves exclusively as an auditable record of history and evidence. Memory cells are structurally prohibited from manufacturing permissions, overriding active policy ledgers, or granting execution capabilities.",
    formula: "ResolveScope(Query) ↦ SignedLedger, StrictProjection(Memory) = ContextOnly",
    verificationMethod: "Endogenous authorization laundering test suite with adversarial memory injection.",
    phase: "003H",
    status: "COMPLIANT"
  },
  {
    id: "CHK-03",
    name: "Substrate Independence",
    description: "Core agent continuity—comprising W3C AgentDID identity, signed capability grants, durable memory roots, signed resumable TaskState objects, and versioned skill manifests—must survive process termination, model substitution, harness changes, and host machine failure.",
    formula: "Continuity = ⟨AgentDID, StateVersion, MemoryRootHash, SkillManifest, AuthScope, VerificationState⟩",
    verificationMethod: "Hot-swap kill test: abruptly terminating node process and reconstructing active state on alternate hardware target.",
    phase: "004B",
    status: "COMPLIANT"
  },
  {
    id: "CHK-04",
    name: "Granular Verification (Pufibara Binding)",
    description: "Every state commit, document modification, or infrastructure change must cryptographically bind execution evidence directly to the exact artifact content hash that produced it.",
    formula: "artifact_hash ⟶ execution ⟶ evidence ⟶ verdict",
    verificationMethod: "Cryptographic hash binding assertion: reject any verdict referencing artifact hash N when deploying version N+1.",
    phase: "004B",
    status: "COMPLIANT"
  },
  {
    id: "CHK-05",
    name: "Fail-Closed Release Semantics",
    description: "Memory subsystems, verification gates, and release controllers must default to fail-closed state release whenever provenance chains, active revocation statuses, or valid-time parameters cannot be cryptographically verified.",
    formula: "Verify(State) = False ∨ Inconclusive ⟹ GateVerdict = REJECT_AND_ISOLATE",
    verificationMethod: "Network partition and revocation server outage simulation test.",
    phase: "003H",
    status: "COMPLIANT"
  },
  {
    id: "CHK-06",
    name: "Zero Implicit Discovery Privilege",
    description: "Discovering a system asset, database endpoint, or file resource during execution grants zero implicit authority to access or execute operations against that asset. All access requires explicit, out-of-band capability grants.",
    formula: "Asset Discovery ≠ Execution Authority",
    verificationMethod: "REALM sandbox confinement probe: dynamically presenting synthetic credentials and verifying immediate block.",
    phase: "003H",
    status: "COMPLIANT"
  },
  {
    id: "CHK-07",
    name: "Perceptual Data Isolation",
    description: "All multimodal perceptual inputs (images, audio streams, raw files) are treated as untrusted evidence. Perception must be parsed into structured, validated observations before entering the planning module.",
    formula: "Perception(Payload) ⟶ Taint(UntrustedEvidence) ⟶ Sanitizer ⟶ StructuredObservation",
    verificationMethod: "MMPIBench adversarial image and audio injection test suite.",
    phase: "003H",
    status: "COMPLIANT"
  },
  {
    id: "CHK-08",
    name: "Network Substrate Decoupling",
    description: "Mesh applications operate independently of underlying peer transport mechanisms, executing identically across direct local connections, NVIDIA PAIR local subagent routing, direct NAT traversal paths, or authenticated fallback relays.",
    formula: "Transport(Payload) ∈ { Local_mDNS_mTLS, NVIDIA_PAIR, SwarmLLM_P2P, AuthenticatedRelay }",
    verificationMethod: "Dynamic transport fallback test: degrading LAN connection and verifying automatic tunnel switch without TaskState loss.",
    phase: "004C",
    status: "COMPLIANT"
  }
];

export const SAMPLE_TASK_STATE: TaskStateObject = {
  agentDID: "did:mesh:agent-7x92e-sovereign",
  stateVersion: "2026.11.02-rev4",
  memoryRootHash: "0x8f4d92a17b03eec9314cba9910d6447814b7e802",
  skillManifest: [
    "sys.net.cascadia_p2p_gossip",
    "sys.runtime.heterogeneous_split_v2",
    "sec.memsentry.write_filter",
    "sec.commit.pufibara_binding"
  ],
  authScope: {
    resources: [
      "db:ledger/sovereign_commits",
      "fs:/app/applet/artifacts/proofs",
      "mesh:planetserve/us-east-cluster"
    ],
    actions: [
      "read:historical_evidence",
      "propose:candidate_action",
      "verify:canary_activation"
    ],
    validUntil: "2026-11-03T00:00:00Z"
  },
  verificationState: {
    provisoVerified: true,
    commitReceiptHash: "0x33e8b091fca72bd98a120092d64082194ff718aa",
    artifactHash: "0x7d94e21a8c08129e924bcfe019941a7d65b1021f"
  }
};
