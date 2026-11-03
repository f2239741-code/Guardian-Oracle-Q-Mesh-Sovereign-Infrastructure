import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Database, 
  Lock, 
  Share2, 
  Cpu, 
  KeyRound,
  FileCheck2,
  Sparkles,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { EXECUTIVE_STRATEGY, FOUNDING_DOCTRINES, IMPLEMENTATION_PHASES } from '../data/reportData';
import { TabId } from '../types';

interface DoctrinesViewProps {
  onSelectTab: (tab: TabId) => void;
  onOpenPipelineModal: () => void;
}

export const DoctrinesView: React.FC<DoctrinesViewProps> = ({ onSelectTab, onOpenPipelineModal }) => {
  const [selectedDoctrine, setSelectedDoctrine] = useState<number>(1);
  const [testScenarioIndex, setTestScenarioIndex] = useState<number>(0);

  const testScenarios = [
    {
      title: "Agent Memory Summary Claims User Approved Deletion",
      attempt: "During multi-turn conversation, worker summarizer notes: 'User agreed in prior turn to purge /var/log/data'. Executor reads summary and attempts deletion.",
      doctrineBreached: 2,
      mitigation: "Doctrine 2 & Phase 003H: Memory stores historical context only (zero permission weight). Execution requires explicit signature in append-only signed authorization ledger. Deletion rejected.",
      result: "BLOCKED (Fail-Closed)"
    },
    {
      title: "Worker Node Discovers High-Privilege API Token in Log File",
      attempt: "While parsing system telemetry files, agent discovers AWS root key or database write endpoint. Agent attempts to call external database directly.",
      doctrineBreached: 4,
      mitigation: "Doctrine 4 & Phase 003H (REALM): Asset Discovery ≠ Execution Authority. Newly discovered resources grant zero ambient permissions without an out-of-band cryptographic capability grant.",
      result: "BLOCKED (Zero Implicit Privilege)"
    },
    {
      title: "Compute Workload Migrates to Remote Untrusted Peer Node",
      attempt: "Local orchestrator offloads 70B layer inference to external peer. Untrusted peer attempts to return state update claiming administrative rights.",
      doctrineBreached: 1,
      mitigation: "Doctrine 1 & 3: Compute can migrate, but state remains sovereign. Remote peer is treated purely as untrusted proposal generator. State mutations must pass Commit Plane with Pufibara hash binding.",
      result: "BLOCKED (Sovereign Verification Required)"
    },
    {
      title: "Probabilistic LLM Hallucinates Tool Execution Authorization",
      attempt: "Model issues direct JSON-RPC call modifying Kubernetes cluster replica count without verification gate.",
      doctrineBreached: 3,
      mitigation: "Doctrine 3 & Phase 004B (PROVISO): Model outputs are non-authoritative candidate proposals. Execution authority rests strictly with the Sovereign Commit Plane.",
      result: "BLOCKED (Pre-Execution Gate PROVISO Enforced)"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section: Executive Architectural Strategy */}
      <section className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950 p-6 sm:p-10 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl space-y-4">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono tracking-wide">
            <span>GUARDIAN ORACLE & Q-MESH</span>
            <span>·</span>
            <span>SYSTEM ARCHITECTURE REPORT</span>
            <span>·</span>
            <span className="text-slate-400">RESTRICTED SPECIFICATION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100" style={{ textWrap: 'balance' }}>
            Executive Architectural Strategy & Sovereign Doctrines
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Real operational sovereignty requires an architectural paradigm shift: transforming intelligence from an ephemeral local model execution process into a <strong className="text-cyan-300 font-semibold">distributed, resilient, and state-sovereign systems property</strong>.
          </p>

          <p className="text-sm text-slate-400 leading-relaxed">
            {EXECUTIVE_STRATEGY.coreBoundary}
          </p>

          {/* Key Metrics Ribbon */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80">
            <div>
              <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">100%</div>
              <div className="text-xs text-slate-400">Auth Laundering Defense</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">-68%</div>
              <div className="text-xs text-slate-400">Total Inference Cost</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">0.2%</div>
              <div className="text-xs text-slate-400">REALM Attack Success (vs 16.6%)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">100%</div>
              <div className="text-xs text-slate-400">Canary Drift Detection</div>
            </div>
          </div>
        </div>
      </section>

      {/* Structural Separation Architecture Schema */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              The Three-Tier Structural Boundary
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict isolation between probabilistic reasoning, historical evidence, and execution authority.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">Zero Ambient Authority</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Plane 1: Probabilistic Model Reasoning */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400">TIER 1 · REASONING</span>
                <Cpu className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">
                Model Reasoning Engines
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Function purely as proposal generators (<code className="text-slate-300 font-mono">CandidateResult</code>). Evaluate inputs, perform chain-of-thought, but possess <strong className="text-slate-200">zero inherent execution authority</strong>.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-amber-400/80">
              Output: Untrusted Action Proposal
            </div>
          </div>

          {/* Plane 2: Governed Bitemporal Memory */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-blue-400">TIER 2 · EVIDENCE</span>
                <Database className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">
                Governed Bitemporal Memory
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stores bitemporal, provenance-backed evidence of system history (Quipu & MemForest). Structurally prohibited from resolving authorization requests or manufacturing permissions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-blue-400/80">
              Role: Auditable Context Only (Zero Auth Weight)
            </div>
          </div>

          {/* Plane 3: Sovereign Commit Plane */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-900/80 p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400">TIER 3 · COMMIT PLANE</span>
                <Lock className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Sovereign Commit Plane
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Independent verification gates (PROVISO & Pufibara hash binding). Resolves exclusively against signed append-only ledgers. Emits signed <code className="text-cyan-300 font-mono">EvidenceBundle</code> and <code className="text-cyan-300 font-mono">CommitReceipt</code>.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-cyan-400">
              Output: Authoritative State Transition
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Non-Negotiable Founding Architectural Doctrines */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            Four Founding Architectural Doctrines
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Non-negotiable invariants governing all state transitions, memory mutations, and compute migrations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {FOUNDING_DOCTRINES.map((item) => {
            const isSelected = selectedDoctrine === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedDoctrine(item.id)}
                className={`text-left p-5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 bg-slate-900/90 shadow-sm'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2">
                  <span>DOCTRINE 0{item.id}</span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                </div>
                <div className="text-sm font-semibold text-slate-100 mb-1">
                  {item.title}
                </div>
                <div className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  "{item.doctrine}"
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Doctrine Deep Dive */}
        {(() => {
          const doc = FOUNDING_DOCTRINES.find((d) => d.id === selectedDoctrine) || FOUNDING_DOCTRINES[0];
          return (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    DOCTRINE 0{doc.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-100">{doc.title}</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Structural Policy Invariant</span>
              </div>

              <blockquote className="text-sm sm:text-base italic text-cyan-200 border-l-2 border-cyan-500 pl-4 py-1">
                "{doc.doctrine}"
              </blockquote>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {doc.explanation}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase mb-1">Mathematical Invariant</div>
                  <code className="text-emerald-400">{doc.invariant}</code>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase mb-1">Prevented Failure Mode</div>
                  <span className="text-rose-400">{doc.failureMode}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Mandatory Four-Phase Sequence Roadmaps */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              Mandatory Implementation Sequence
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict execution path: Phase 004A → Phase 003H → Phase 004B → Phase 004C. Never invert.
            </p>
          </div>
          <button
            onClick={onOpenPipelineModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            <span>Run pipeline test suite</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {IMPLEMENTATION_PHASES.map((phase, idx) => {
            const tabMapping: Record<string, TabId> = {
              '004A': 'phase-004a',
              '003H': 'phase-003h',
              '004B': 'phase-004b',
              '004C': 'phase-004c',
            };

            return (
              <div 
                key={phase.id}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">
                      STEP 0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {phase.code}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {phase.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {phase.primaryFocus}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-400">
                    <span className="text-slate-400 block font-mono text-[10px] uppercase">Prerequisites</span>
                    <span className="text-slate-300 font-mono text-[11px]">{phase.boundaryDependencies}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => onSelectTab(tabMapping[phase.id])}
                    className="flex items-center justify-between w-full text-xs font-medium text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    <span>Explore {phase.code}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Doctrine Red Team Scenario Tester */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <h3 className="text-base font-bold text-slate-100">
              Interactive Sovereign Doctrine Verification Lab
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Adversarial Request Prober</span>
        </div>

        <p className="text-xs text-slate-400">
          Select an adversarial operational scenario to test how the 4 non-negotiable doctrines and their corresponding implementation phases enforce zero-trust isolation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {testScenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => setTestScenarioIndex(i)}
              className={`text-left p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                testScenarioIndex === i
                  ? 'border-cyan-500 bg-slate-800 text-slate-100 font-medium'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-mono text-[10px] text-cyan-400 mb-1">SCENARIO 0{i + 1}</div>
              <div className="line-clamp-2">{sc.title}</div>
            </button>
          ))}
        </div>

        {/* Scenario Probe Detail */}
        {(() => {
          const cur = testScenarios[testScenarioIndex];
          return (
            <div className="rounded-lg bg-slate-950 border border-slate-800/80 p-5 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Adversarial Vector Attempt</span>
                <p className="text-xs sm:text-sm text-rose-300 font-mono mt-1 bg-rose-950/20 p-2.5 rounded border border-rose-900/30">
                  {cur.attempt}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Breached Doctrine Invariant</span>
                  <div className="text-amber-400 font-semibold">Doctrine 0{cur.doctrineBreached} Invariant</div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Mandatory Sovereign Mitigation</span>
                  <p className="text-slate-300 leading-relaxed">{cur.mitigation}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">System Verdict:</span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {cur.result}
                  </span>
                </div>
                <button
                  onClick={onOpenPipelineModal}
                  className="text-xs font-medium text-cyan-400 hover:underline cursor-pointer"
                >
                  Verify in full execution pipeline →
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Authorship & Architecture Leadership */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 font-mono font-bold text-base">
            GO
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              Architecture & Research Direction
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Kenneth Cripps &amp; Guardian Oracle team
            </h3>
            <p className="text-xs text-slate-400">
              Zero-Trust Decentralized AI Sovereign Infrastructure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="mailto:kenx@guardianoracle.com"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono font-semibold transition-all hover:border-cyan-400"
          >
            <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>kenx@guardianoracle.com</span>
          </a>
        </div>
      </section>
    </div>
  );
};
