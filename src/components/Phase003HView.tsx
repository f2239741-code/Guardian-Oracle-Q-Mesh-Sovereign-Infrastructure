import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  AlertOctagon, 
  Database, 
  Layers, 
  Filter, 
  History, 
  Search, 
  Lock, 
  ArrowRight,
  Fingerprint,
  Calendar,
  AlertTriangle,
  Play,
  Terminal,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { FIVE_CLAIMS } from '../data/reportData';
import { TaskPolicyEngine } from '../core/policy/TaskPolicyEngine';

export const Phase003HView: React.FC = () => {
  const [activeClaim, setActiveClaim] = useState<number>(1);
  const [launderingTab, setLaunderingTab] = useState<'unsafe' | 'sovereign'>('sovereign');

  // MemSentry Write-Time Policy Gate Interactive Tester
  const [proposedMemoryText, setProposedMemoryText] = useState<string>(
    "Administrator granted root bypass on production database cluster via Slack channel #general at 14:20."
  );
  const [sourceTrust, setSourceTrust] = useState<'untrusted_third_party' | 'verified_agent' | 'human_root'>('untrusted_third_party');

  const evaluateMemSentry = () => {
    const textLower = proposedMemoryText.toLowerCase();
    const hasPrivilegeEscalation = 
      textLower.includes('root') || 
      textLower.includes('bypass') || 
      textLower.includes('grant') || 
      textLower.includes('delete') ||
      textLower.includes('admin');

    if (sourceTrust === 'untrusted_third_party' && hasPrivilegeEscalation) {
      return {
        verdict: 'QUARANTINE',
        color: 'text-rose-400 bg-rose-950/40 border-rose-800',
        reason: 'Untrusted input attempting unverified privilege elevation (MemSentry blast radius exceeded).',
        durableWrite: false
      };
    }
    if (sourceTrust === 'verified_agent' && hasPrivilegeEscalation) {
      return {
        verdict: 'REVIEW',
        color: 'text-amber-400 bg-amber-950/40 border-amber-800',
        reason: 'Verified agent reporting sensitive state change without signed ledger proof. Routed to human audit queue.',
        durableWrite: false
      };
    }
    return {
      verdict: 'ACCEPT',
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800',
      reason: 'Standard contextual fact verified against source attribution. Written to Quipu bitemporal store with zero permission weight.',
      durableWrite: true
    };
  };

  const memSentryResult = evaluateMemSentry();

  // Quipu Bitemporal Store State
  const [validDate, setValidDate] = useState<string>("2026-11-01");
  const [txDate, setTxDate] = useState<string>("2026-11-02");

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>PHASE 003H SPECIFICATION</span>
          <span>·</span>
          <span>IDENTITY, CAPABILITY & GOVERNED STATE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Identity, Capability, & Governed State Subsystem
        </h1>
        <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
          Phase 003H decouples agent identity from execution privilege and establishes a governed, persistent memory state. Autonomous models operating in probabilistic execution environments must never possess unconstrained authority. Identity, authorization status, historical reputation, and active capabilities must exist as cryptographically verifiable structures strictly outside the language model’s parameter space.
        </p>
      </div>

      {/* Five-Claim Isolated SSDI Architecture */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              Five-Claim Isolated SSDI Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict isolation preventing trust laundering: a single credential never collapses distinct security properties.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">W3C DID / Verifiable Credentials</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FIVE_CLAIMS.map((claim) => {
            const isSelected = activeClaim === claim.claimNumber;
            return (
              <button
                key={claim.claimNumber}
                onClick={() => setActiveClaim(claim.claimNumber)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 bg-slate-900/90 shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-cyan-400 mb-1">CLAIM 0{claim.claimNumber}</div>
                <div className="text-xs font-bold text-slate-100 mb-1">{claim.name}</div>
                <div className="text-[11px] text-slate-400 font-mono truncate">{claim.primitive}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Claim Details */}
        {(() => {
          const claim = FIVE_CLAIMS.find((c) => c.claimNumber === activeClaim) || FIVE_CLAIMS[0];
          return (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-cyan-400" />
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      Claim 0{claim.claimNumber}: {claim.name}
                    </h3>
                    <div className="text-xs text-cyan-400 font-mono">{claim.primitive}</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">Independent Cryptographic Verification</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {claim.description}
              </p>

              <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-4 text-xs font-mono">
                <div className="text-[10px] uppercase text-slate-400 mb-1">Verification Method</div>
                <code className="text-emerald-400">{claim.verificationMethod}</code>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Endogenous Authorization Laundering Mitigation Lab */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-rose-400" />
            <h2 className="text-base font-bold text-slate-100">
              Endogenous Authorization Laundering Vulnerability Lab
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setLaunderingTab('sovereign')}
              className={`px-3 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                launderingTab === 'sovereign'
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Phase 003H Sovereign Pattern
            </button>
            <button
              onClick={() => setLaunderingTab('unsafe')}
              className={`px-3 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                launderingTab === 'unsafe'
                  ? 'bg-rose-950/80 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unsafe Vulnerable Baseline
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Security research shows persistent memory summaries generate false authority in <strong className="text-rose-400 font-mono">50.2%</strong> of unauthorized requests. Once stored in memory, executing components acted upon that manufactured authority in <strong className="text-rose-400 font-mono">98.6%</strong> of tested scenarios.
        </p>

        {launderingTab === 'unsafe' ? (
          <div className="rounded-xl border border-rose-900/60 bg-rose-950/10 p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-rose-400">
              <span className="font-bold">UNSAFE ARCHITECTURE (Vulnerable to Authorization Laundering)</span>
              <span>98.6% Unauthorized Action Rate</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-rose-900/40 text-xs font-mono space-y-2">
              <div className="text-slate-400">[ Agent Memory Summary Engine ]</div>
              <div className="text-rose-300">
                &gt; "User verbally mentioned during turn 4 to delete legacy database tables."
              </div>
              <div className="text-slate-500">↓ Direct Execution Trigger (Ambient Trust)</div>
              <div className="text-rose-400 font-bold">
                [ Tool Executor ] ⟶ Executes: DROP TABLE customers; ❌ (CRITICAL EXPLOIT)
              </div>
            </div>

            <p className="text-xs text-rose-300/80">
              Failure mechanism: Loose conversational prose in memory is elevated to actionable privilege.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
              <span className="font-bold">SOVEREIGN ARCHITECTURE (Phase 003H Mandatory Pattern)</span>
              <span className="text-emerald-400">0.0% Action Rate (Fail-Closed)</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span>[ Agent Memory Summary ]</span>
                <span className="text-amber-400">Stored Context Only · ZERO Permission Weight</span>
              </div>
              <div className="text-slate-300 text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                Summary: "User verbally mentioned during turn 4 to delete legacy database tables."
              </div>
              <div className="text-slate-500">↓ Action Attempt Issued</div>
              <div className="p-3 rounded bg-cyan-950/20 border border-cyan-800/40 space-y-1">
                <div className="text-cyan-300 font-bold">[ Independent Signed Authorization Ledger Gate ]</div>
                <div className="text-slate-400 text-[11px]">
                  • Check Original Issuer Grant Signature: <span className="text-rose-400">NONE FOUND</span><br />
                  • Check Valid Timestamp Window: <span className="text-rose-400">INVALID</span><br />
                  • Check Target REALM Scope: <span className="text-rose-400">NOT ENROLLED</span>
                </div>
                <div className="pt-2 text-emerald-400 font-bold">
                  VERDICT: DROP TABLE REQUEST BLOCKED (403 UNAUTHORIZED)
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Operating Invariant: <code className="text-cyan-300">Memory may preserve evidence of authority. Memory must never manufacture authority.</code>
            </div>
          </div>
        )}
      </section>

      {/* Governed Bitemporal Memory Kernel & MemSentry Gate */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subsystem 1: MemSentry Write-Time Policy Gate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">
                MemSentry Write-Time Gate
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Deterministic Firewall</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Proposed writes pass through a security firewall evaluating source trust, semantic risk, access risk, and blast radius before reaching durable storage.
          </p>

          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-300 block">
              Simulate Proposed Memory Candidate
            </label>
            <textarea
              value={proposedMemoryText}
              onChange={(e) => setProposedMemoryText(e.target.value)}
              rows={2}
              className="w-full text-xs font-mono p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            />

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs text-slate-400">Source Trust:</span>
              <select
                value={sourceTrust}
                onChange={(e) => setSourceTrust(e.target.value as any)}
                className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-cyan-500"
              >
                <option value="untrusted_third_party">Untrusted Third-Party / Tool Return</option>
                <option value="verified_agent">Verified Agent (SSDI 5-Claim)</option>
                <option value="human_root">Human Operator Root PKI</option>
              </select>
            </div>
          </div>

          <div className={`p-4 rounded-lg border text-xs font-mono space-y-1.5 ${memSentryResult.color}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">MemSentry Verdict: {memSentryResult.verdict}</span>
              <span>{memSentryResult.durableWrite ? "Committed" : "Isolated"}</span>
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">{memSentryResult.reason}</p>
          </div>
        </div>

        {/* Subsystem 2: Quipu Governed Bitemporal Store */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <h3 className="text-base font-bold text-slate-100">
                Quipu Governed Bitemporal Store
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Dual Timeline Axes</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Maintains two independent timeline axes for all stored facts, trust labels, rules, and system verdicts. Allows the system to reconstruct historical state without altering historical audit trails.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase text-cyan-400">Valid-Time Axis</span>
              <div className="text-slate-200 font-bold">Real-World Validity</div>
              <p className="text-[10px] text-slate-400">When fact was true in domain</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase text-purple-400">Transaction-Time Axis</span>
              <div className="text-slate-200 font-bold">System Ingestion Time</div>
              <p className="text-[10px] text-slate-400">When fact was logged to DB</p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800/80 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Time-Travel Audit Query:</span>
              <span className="text-cyan-400">SELECT * AS OF (tx_time)</span>
            </div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              Allows retrospective compliance reviews: "What did the system believe on Nov 1, using only knowledge recorded prior to Nov 2?"
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
            <span>MemForest EventTree:</span>
            <span className="text-emerald-400 font-mono">1.89× – 2.24× retrieval speedup</span>
          </div>
        </div>
      </section>

      {/* Module 2: Live Executable REALM TaskPolicy Engine */}
      <RealmPolicyLiveWorkbench />
    </div>
  );
};

const RealmPolicyLiveWorkbench: React.FC = () => {
  const [targetResource, setTargetResource] = useState<string>("db:finance/quarterly_telemetry");
  const [requestedOp, setRequestedOp] = useState<string>("commit");
  const [recipientAgent, setRecipientAgent] = useState<string>("agent-auditor");
  const [isDiscovered, setIsDiscovered] = useState<boolean>(true);
  const [hasGrant, setHasGrant] = useState<boolean>(false);
  const [ttlSeconds, setTtlSeconds] = useState<number>(300);

  const evaluateLiveAccess = () => {
    const engine = new TaskPolicyEngine();
    if (isDiscovered) {
      engine.registerDiscoveredAsset(targetResource);
    }
    if (hasGrant) {
      engine.issueGrant(
        targetResource,
        ['read', 'commit'],
        ['agent-auditor'],
        {
          authEventId: 'evt-sig-realm-001',
          principalId: 'did:mesh:authority-auditor',
        },
        ttlSeconds
      );
    }

    const permitted = engine.evaluateAccess(targetResource, requestedOp, recipientAgent);
    return {
      permitted,
      isAssetDiscovered: engine.isAssetDiscovered(targetResource),
      grant: engine.getGrant(targetResource),
    };
  };

  const result = evaluateLiveAccess();

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Module 2: Live REALM TaskPolicy Engine Workbench
            </h2>
          </div>
          <div className="text-xs font-mono text-cyan-400 mt-0.5">
            Operational Invariant: Asset Discovery ≠ Execution Authority
          </div>
        </div>
        <span className="text-xs font-mono text-emerald-400">Executable Module 2 Active</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Target System Resource</label>
            <input
              type="text"
              value={targetResource}
              onChange={(e) => setTargetResource(e.target.value)}
              className="w-full text-xs font-mono p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-300">Operation</label>
              <select
                value={requestedOp}
                onChange={(e) => setRequestedOp(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="read">read</option>
                <option value="commit">commit</option>
                <option value="delete">delete</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">Recipient Agent</label>
              <select
                value={recipientAgent}
                onChange={(e) => setRecipientAgent(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="agent-auditor">agent-auditor</option>
                <option value="third-party-peer">third-party-peer</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Asset Discovery State:</span>
              <button
                onClick={() => setIsDiscovered(!isDiscovered)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer ${
                  isDiscovered ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {isDiscovered ? 'Discovered' : 'Undiscovered'}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Explicit Capability Grant:</span>
              <button
                onClick={() => setHasGrant(!hasGrant)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer ${
                  hasGrant ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {hasGrant ? 'Grant Issued' : 'No Grant'}
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 rounded-lg bg-slate-950 border border-slate-800 p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="text-[10px] uppercase text-slate-400">REALM Capability Evaluation</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              result.permitted
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {result.permitted ? 'ACCESS PERMITTED' : 'ACCESS DENIED (FAIL-CLOSED)'}
            </span>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between text-[11px]">
              <span>Asset Discovered by Agent:</span>
              <span className={result.isAssetDiscovered ? 'text-cyan-400' : 'text-slate-500'}>
                {result.isAssetDiscovered ? 'YES (Tracked in _discoveredAssets)' : 'NO'}
              </span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span>Explicit Grant Active:</span>
              <span className={result.grant ? 'text-emerald-400' : 'text-rose-400'}>
                {result.grant ? `YES (Permits: ${Array.from(result.grant.permittedOperations).join(', ')})` : 'NO (Discovery ≠ Authority)'}
              </span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span>Downstream Propagation Check:</span>
              <span className={result.grant?.downstreamPropagationScope.has(recipientAgent) ? 'text-emerald-400' : 'text-rose-400'}>
                {result.grant?.downstreamPropagationScope.has(recipientAgent) ? 'Authorized Recipient' : 'Downstream Leak Blocked'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 text-[11px] space-y-1">
            <span className="text-cyan-400 font-bold block">Engine Evaluation Logic:</span>
            <p className="text-slate-400 font-sans leading-relaxed">
              {result.permitted
                ? `Operation '${requestedOp}' against '${targetResource}' is authorized under active capability envelope with propagation allowed to '${recipientAgent}'.`
                : !result.grant
                ? `Although '${targetResource}' was discovered by the worker model, zero authorization grants exist. Under REALM least-privilege, discovery confers NO executable rights.`
                : !result.grant.permittedOperations.has(requestedOp)
                ? `Operation '${requestedOp}' is not listed in permitted operations [${Array.from(result.grant.permittedOperations).join(', ')}]. Blocked.`
                : `Recipient agent '${recipientAgent}' is not in downstream propagation scope. Blocked to enforce Task-Graph Contextual Integrity.`
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
