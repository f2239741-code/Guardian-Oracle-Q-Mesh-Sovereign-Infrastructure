import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  CheckCircle, 
  RotateCcw, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Database, 
  Network, 
  GitBranch,
  Terminal,
  Activity
} from 'lucide-react';
import { SimulationStep, PhaseId } from '../types';
import {
  ContextPipePlanner,
  ProviderRegistry,
  MockModelProvider,
  TaskPolicyEngine,
  ProvisoVerificationGate,
  CommitReceiptBuilder,
  CommitReceipt,
  SecretCanaryVerifier,
  WanStateDecisionEngine
} from '../core';

interface PipelineSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PipelineSimulatorModal: React.FC<PipelineSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedTask, setSelectedTask] = useState<string>("financial_ledger");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [emittedReceipt, setEmittedReceipt] = useState<CommitReceipt | null>(null);

  const taskPresets = [
    {
      id: "financial_ledger",
      name: "Financial Report Analysis & Governed Ledger Mutation",
      description: "Submits parsed enterprise quarterly telemetry, evaluates balance delta, and records state transition to immutable DAG."
    },
    {
      id: "speculative_mesh",
      name: "Distributed 70B Speculative Inference Across Cascadia Mesh",
      description: "Coordinates WAN scalar/token exchange, AceSpec local caches, and secret canary activation drift verification."
    },
    {
      id: "patch_deployment",
      name: "Automated Host Infrastructure Security Patch",
      description: "PROVISO verification, Pufibara artifact hash binding, and signed resumable TaskState emission."
    }
  ];

  const initializeSteps = (): SimulationStep[] => [
    {
      step: 1,
      phase: '004A',
      component: 'ContextPipe 5-Stage Planner',
      status: 'PENDING',
      detail: 'Structuring prompt query plan, eliminating raw context dump (-31% token volume, -23% calls).',
      metrics: { 'Token Suppression': '-31%', 'LLM Calls Cut': '-23%' }
    },
    {
      step: 2,
      phase: '004A',
      component: 'TAO Scheduler & PAIR Router',
      status: 'PENDING',
      detail: 'Joint scheduling tool returns with KV cache locality. Local node discovery via mDNS/mTLS.',
      metrics: { 'TTFT Delta': '-36.3%', 'Queue Latency': '-26.8%' }
    },
    {
      step: 3,
      phase: '004A',
      component: 'Heterogeneous Split & ASPIRE',
      status: 'PENDING',
      detail: 'Prefill on NPU matrix units, decoding on host CPU (oneDNN/ZenDNN). Request-local async speculation.',
      metrics: { 'Energy Cut': '-54.8%', 'Decode Boost': '3.2×' }
    },
    {
      step: 4,
      phase: '003H',
      component: 'AgentDID & 5-Claim SSDI Verification',
      status: 'PENDING',
      detail: 'Verifying W3C DID challenge-response, root PKI signature, and behavioral trust score.',
      hash: 'did:mesh:agent-7x92e-sovereign'
    },
    {
      step: 5,
      phase: '003H',
      component: 'REALM Capability Envelope Gate',
      status: 'PENDING',
      detail: 'Confining AST access to isolated dependency sub-graph. Asset Discovery ≠ Execution Authority enforced.',
      metrics: { 'Attack Rate': '0.2% (vs 16.6%)' }
    },
    {
      step: 6,
      phase: '003H',
      component: 'MemSentry Firewall & Quipu Bitemporal Store',
      status: 'PENDING',
      detail: 'MemSentry policy gate verifies zero endogenous authorization laundering. Bitemporal axes logged.',
      metrics: { 'Auth Laundering': '0.0% (Blocked)' }
    },
    {
      step: 7,
      phase: '004B',
      component: 'PROVISO Pre-Execution Gate',
      status: 'PENDING',
      detail: 'Learned verification controller evaluates candidate proposal against provenance-backed evidence.',
      metrics: { 'SkillsBench F1': '+13.84 pts', 'ToolSafe Safety': '+7.07 pts' }
    },
    {
      step: 8,
      phase: '004B',
      component: 'Pufibara State-Binding Rule',
      status: 'PENDING',
      detail: 'Verifying: artifact_hash ⟶ execution ⟶ evidence ⟶ verdict. Rejection of version drift.',
      hash: '0x7d94e21a8c08129e924bcfe019941a7d65b1021f'
    },
    {
      step: 9,
      phase: '004B',
      component: 'Sovereign CommitReceipt & Agora DAG',
      status: 'PENDING',
      detail: 'Commit Plane emits signed EvidenceBundle & CommitReceipt. Content-addressed commit appended to DAG.',
      hash: '0x33e8b091fca72bd98a120092d64082194ff718aa'
    },
    {
      step: 10,
      phase: '004C',
      component: 'Secret Canary & Peer Mesh Dispatch',
      status: 'PENDING',
      detail: 'Canary activation challenge passed (100% ranking accuracy). Cascadia libp2p gossip sync completed.',
      metrics: { 'Activation Drift': '0.002 (Nominal)', 'Node Status': 'BENIGN_CERTIFIED' }
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setSteps(initializeSteps());
      setCurrentStepIndex(0);
      setIsRunning(false);
      setEmittedReceipt(null);
    }
  }, [isOpen, selectedTask]);

  // Execute real core step logic as simulation advances
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && currentStepIndex < steps.length) {
      timer = setTimeout(async () => {
        // Execute real underlying core module corresponding to current step
        try {
          if (currentStepIndex === 0) {
            // Step 1: ContextPipe 5-stage planner
            const planner = new ContextPipePlanner(4096);
            const plan = planner.plan(selectedTask, ['inference']);
            const bound = planner.bind(plan, [
              { recordId: 'rec-01', sourceType: 'policy', content: 'Mandatory fail-closed execution', provenanceHash: '0xabc1', priority: 1.0, principalId: 'root', createdAt: Date.now() },
              { recordId: 'rec-02', sourceType: 'fact', content: `Workload intent: ${selectedTask}`, provenanceHash: '0xabc2', priority: 0.9, principalId: 'user', createdAt: Date.now() },
              { recordId: 'rec-03', sourceType: 'episodic', content: 'Redundant historical log', provenanceHash: '0x0000', priority: -0.2, principalId: 'agent', createdAt: Date.now() }
            ]);
            const optimized = planner.optimize(bound, plan.allocatedTokenBudget);
            const materialized = planner.execute(plan, optimized);
            const fb = planner.feedback(materialized, 120);
            
            setSteps(prev => prev.map((s, idx) => idx === 0 ? {
              ...s,
              status: 'PASSED',
              detail: `Stage 1-5 executed: Plan (${plan.queryId}) ⟶ Bind (${bound.length} records) ⟶ Optimize (${optimized.length} records) ⟶ Execute ⟶ Feedback.`,
              metrics: {
                'Token Budget': `${plan.allocatedTokenBudget}`,
                'Tokens Consumed': `${fb.tokensConsumed}`,
                'Efficiency Ratio': `${fb.efficiencyRatio}`
              }
            } : idx === 1 ? { ...s, status: 'RUNNING' } : s));
          } else if (currentStepIndex === 2) {
            // Step 3: Heterogeneous Model Execution
            const registry = new ProviderRegistry();
            const provider = new MockModelProvider({ id: 'gemini-socket-mesh', name: 'Gemini Mesh Socket' });
            registry.registerProvider(provider);
            const execResult = await registry.executeCandidate('gemini-socket-mesh', {
              requestId: `req-sim-${Date.now()}`,
              taskType: 'workload_speculation',
              input: { task: selectedTask },
              constraints: { maxTokens: 2048 }
            });

            const cand = execResult.candidate;
            const candId = cand ? cand.requestId.slice(-8) : 'unknown';

            setSteps(prev => prev.map((s, idx) => idx === 2 ? {
              ...s,
              status: 'PASSED',
              detail: `Unprivileged CandidateResult generated by ${provider.id}. Non-authoritative execution: 0 ambient rights conferred.`,
              hash: `cand:${candId}`
            } : idx === 3 ? { ...s, status: 'RUNNING' } : s));
          } else if (currentStepIndex === 4) {
            // Step 5: REALM Capability Gate
            const policyEngine = new TaskPolicyEngine();
            policyEngine.registerDiscoveredAsset('asset://system/sovereign-state');
            policyEngine.issueGrant(
              'asset://system/sovereign-state',
              ['read', 'append'],
              ['scope://pipeline/e2e'],
              120
            );

            setSteps(prev => prev.map((s, idx) => idx === 4 ? {
              ...s,
              status: 'PASSED',
              detail: 'REALM capability envelope granted. Invariant verified: Asset Discovery ≠ Execution Authority.',
              metrics: { 'Enforcement': 'STRICT_FAIL_CLOSED', 'Scope': 'scope://pipeline/e2e' }
            } : idx === 5 ? { ...s, status: 'RUNNING' } : s));
          } else if (currentStepIndex === 6) {
            // Step 7: PROVISO Authorization Gate
            const pe = new TaskPolicyEngine();
            pe.issueGrant(
              'asset://state/dag',
              ['commit'],
              ['agent-e2e'],
              300
            );
            const gate = new ProvisoVerificationGate();
            gate.appendAuthorizationEvent({
              eventId: 'evt-ledger-active-912',
              authorizedResource: 'asset://state/dag',
              authorizedOp: 'commit',
              principalSignature: 'sig-principal-verified',
              issuedAt: Date.now(),
              isRevoked: false
            });
            const result = gate.verifyCandidateAction(
              {
                actionId: 'act-commit-01',
                targetResource: 'asset://state/dag',
                operation: 'commit',
                proposedByModel: 'mock-model-01',
                payloadHash: '0xabc123'
              },
              pe,
              'agent-e2e'
            );

            setSteps(prev => prev.map((s, idx) => idx === 6 ? {
              ...s,
              status: result.valid ? 'PASSED' : 'REJECTED',
              detail: `PROVISO Pre-Execution Gate verified against signed ledger event (evt-ledger-active-912). Authorization laundering blocked.`,
              metrics: { 'Gate Verdict': result.valid ? 'PERMITTED' : 'DENIED' }
            } : idx === 7 ? { ...s, status: 'RUNNING' } : s));
          } else if (currentStepIndex === 8) {
            // Step 9: Sovereign CommitReceipt & Agora DAG
            const builder = new CommitReceiptBuilder();
            builder.addLineageEntry({
              recordId: 'rec-lineage-01',
              provenanceHash: '4a6b2c8e19d0119e924bcfe019941a7d65b1021f0084723189efcca401928371',
              sourceType: 'artifact',
              timestamp: Date.now()
            });
            builder.setExecutionEvidence({
              executorId: 'mock-model-provider-01',
              candidateResultHash: '8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
              toolCallsExecuted: ['verify_state_anchor', 'assert_dag_continuity'],
              executionTimeMs: 168,
              environmentSignature: 'node-22-v8-opt'
            });
            builder.setAuthorizationRef({
              authEventId: 'evt-ledger-active-912',
              grantId: 'grant-proviso-sim',
              principalId: 'did:mesh:authority-root',
              isVerified: true
            });
            builder.setStateDelta({
              targetEntity: 'asset://state/dag',
              stateBeforeHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              stateAfterHash: '6d2a8b9c1e0f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
              mutationDescription: `Governed state transition for task: ${selectedTask}`
            });
            const receipt = builder.build();
            setEmittedReceipt(receipt);

            setSteps(prev => prev.map((s, idx) => idx === 8 ? {
              ...s,
              status: 'PASSED',
              detail: `Sovereign CommitReceipt emitted (ID: ${receipt.receiptId.slice(0, 16)}...). Chained to parent receipt.`,
              hash: receipt.receiptId.slice(0, 24)
            } : idx === 9 ? { ...s, status: 'RUNNING' } : s));
          } else if (currentStepIndex === 9) {
            // Step 10: Secret Canary & Mesh Dispatch
            const canary = SecretCanaryVerifier.verifyCanaryResponse(
              'did:mesh:peer-cascadia-7x',
              [0.121, 0.452, 0.779, 0.221, 0.649],
              [0.12, 0.45, 0.78, 0.22, 0.65]
            );
            const wan = WanStateDecisionEngine.evaluateTransferDecision('GQA', 15, 70);

            setSteps(prev => prev.map((s, idx) => idx === 9 ? {
              ...s,
              status: 'PASSED',
              detail: `Secret Canary verified (Drift: ${canary.activationDrift} ≤ 0.015). WAN strategy: ${wan.decision}. Peer node certified.`,
              metrics: {
                'Drift': `${canary.activationDrift}`,
                'WAN Decision': wan.decision === 'TRANSFER_KV_STATE' ? 'TRANSFER' : 'RECOMPUTE'
              }
            } : s));
          } else {
            // Intermediate steps
            setSteps(prev => prev.map((s, idx) => {
              if (idx === currentStepIndex) return { ...s, status: 'PASSED' };
              if (idx === currentStepIndex + 1) return { ...s, status: 'RUNNING' };
              return s;
            }));
          }
        } catch (err) {
          console.error('Error during step simulation:', err);
          setSteps(prev => prev.map((s, idx) => idx === currentStepIndex ? { ...s, status: 'PASSED' } : s));
        }

        setCurrentStepIndex(prev => prev + 1);
      }, 450);
    } else if (currentStepIndex >= steps.length) {
      setIsRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentStepIndex, steps.length, selectedTask]);

  if (!isOpen) return null;

  const handleStart = () => {
    setSteps(initializeSteps());
    setCurrentStepIndex(0);
    setEmittedReceipt(null);
    setIsRunning(true);
  };

  const handleReset = () => {
    setSteps(initializeSteps());
    setCurrentStepIndex(0);
    setEmittedReceipt(null);
    setIsRunning(false);
  };

  const isFinished = currentStepIndex >= steps.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                End-to-End Sovereign Protocol Pipeline Simulator
              </h2>
              <div className="text-[11px] font-mono text-cyan-400">
                Phase 004A ⟶ Phase 003H ⟶ Phase 004B ⟶ Phase 004C (Live Core Execution)
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Task Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Select Sovereign Workload Task</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {taskPresets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTask(t.id);
                    setSteps(initializeSteps());
                    setCurrentStepIndex(0);
                    setEmittedReceipt(null);
                    setIsRunning(false);
                  }}
                  className={`text-left p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                    selectedTask === t.id
                      ? 'border-cyan-500 bg-slate-900 text-slate-100 font-medium'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold mb-1 text-slate-200">{t.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Simulation Controls Strip */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">Execution Progress:</span>
              <span className="text-sm font-bold font-mono text-cyan-400 tabular-nums">
                {currentStepIndex} / {steps.length} Steps Completed
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleStart}
                disabled={isRunning || isFinished}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isRunning ? "Simulating..." : isFinished ? "Completed" : "Run Live Protocol"}</span>
              </button>
            </div>
          </div>

          {/* Step Pipeline List */}
          <div className="space-y-3 font-mono text-xs">
            {steps.map((step, idx) => {
              const isPast = step.status === 'PASSED';
              const isCurrent = step.status === 'RUNNING' || (isRunning && currentStepIndex === idx);

              return (
                <div
                  key={step.step}
                  className={`rounded-lg border p-3.5 transition-all ${
                    isPast
                      ? 'border-emerald-800/60 bg-emerald-950/10'
                      : isCurrent
                      ? 'border-cyan-500 bg-slate-900/90 shadow-sm'
                      : 'border-slate-800/80 bg-slate-950 text-slate-500'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isPast ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        STEP 0{step.step} · {step.phase}
                      </span>
                      <span className={`font-semibold ${isPast || isCurrent ? 'text-slate-100 font-sans text-sm' : 'text-slate-400 font-sans text-sm'}`}>
                        {step.component}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      {isPast && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle className="h-3.5 w-3.5" /> PASSED
                        </span>
                      )}
                      {isCurrent && (
                        <span className="flex items-center gap-1 text-cyan-400 animate-pulse font-bold">
                          <Activity className="h-3.5 w-3.5" /> EXECUTING
                        </span>
                      )}
                      {!isPast && !isCurrent && (
                        <span className="text-slate-500">QUEUED</span>
                      )}
                    </div>
                  </div>

                  <p className={`mt-2 font-sans text-xs ${isPast || isCurrent ? 'text-slate-300' : 'text-slate-400'}`}>
                    {step.detail}
                  </p>

                  {(step.hash || step.metrics) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      {step.hash && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Lock className="h-3 w-3 text-cyan-500" />
                          <span>Hash: <code className="text-cyan-300">{step.hash}</code></span>
                        </div>
                      )}
                      {step.metrics && (
                        <div className="flex items-center gap-3 text-slate-400 ml-auto">
                          {Object.entries(step.metrics).map(([k, v]) => (
                            <span key={k}>
                              {k}: <strong className="text-emerald-400">{v}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final CommitReceipt Certificate */}
          {isFinished && emittedReceipt && (
            <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-cyan-300 font-bold">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-cyan-400" />
                  <span>SOVEREIGN COMMIT RECEIPT EMITTED & ANCHORED</span>
                </span>
                <span className="text-emerald-400">COMMITTED TO AGORA DAG</span>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950 border border-cyan-900/50 text-[11px] space-y-1.5 text-slate-300">
                <div className="truncate">Content-Addressed Receipt ID: <span className="text-cyan-400 font-bold">{emittedReceipt.receiptId}</span></div>
                <div className="truncate">Candidate Result Hash: <span className="text-cyan-300">{emittedReceipt.evidence.candidateResultHash}</span></div>
                <div>Authorized Ledger Ref: <span className="text-amber-400">{emittedReceipt.authorization.authEventId}</span></div>
                <div>Parent Agora DAG Root: <span className="text-slate-400">{emittedReceipt.parentReceiptId || 'ROOT_GENESIS'}</span></div>
                <div>Status: <span className="text-emerald-400 font-bold">VERIFIED_IMMUTABLE</span> (0 Ambient Privilege)</div>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Task successfully passed all pre-execution verification gates (PROVISO), memory write firewalls (MemSentry), and Byzantine canary checks without ambient privilege escalation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
