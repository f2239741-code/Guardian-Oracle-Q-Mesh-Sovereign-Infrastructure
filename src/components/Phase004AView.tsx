import React, { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  Activity, 
  Workflow, 
  Sliders, 
  Check, 
  Gauge, 
  Layers, 
  Clock, 
  Sparkles,
  Server,
  DollarSign,
  Play,
  Terminal,
  FileCheck2
} from 'lucide-react';
import { ContextPipePlanner, ContextRecord } from '../core/planner/ContextPipe';

export const Phase004AView: React.FC = () => {
  // 4D Operational Envelope Calculator State
  const [modelType, setModelType] = useState<'edge_moe' | 'dense_70b' | 'iron_654m'>('iron_654m');
  const [backendTarget, setBackendTarget] = useState<'npu_cpu_split' | 'npu_only' | 'cpu_onednn'>('npu_cpu_split');
  const [promptTokens, setPromptTokens] = useState<number>(2048);

  // Calculate simulated 4D metrics
  const getCalculatedMetrics = () => {
    let quality = 0.92;
    let latencyMs = 280;
    let ramMb = 1200;
    let energyJoules = 14.5;
    let costPerTask = 0.0032;

    if (modelType === 'dense_70b') {
      quality = 0.98;
      latencyMs = 1250;
      ramMb = 16400;
      energyJoules = 88.0;
      costPerTask = 0.048;
    } else if (modelType === 'edge_moe') {
      quality = 0.94;
      latencyMs = 450;
      ramMb = 4800;
      energyJoules = 28.0;
      costPerTask = 0.012;
    }

    if (backendTarget === 'npu_only') {
      latencyMs *= 1.45; // Bottlenecked on decoding memory bandwidth
      energyJoules *= 1.548; // Naive single accelerator deployment waste
    } else if (backendTarget === 'cpu_onednn') {
      latencyMs *= 1.3;
      energyJoules *= 1.25;
    } else {
      // npu_cpu_split: optimal heterogeneous
      latencyMs *= 0.72;
      energyJoules *= 0.452; // -54.8% energy reduction
    }

    // 4D Envelope: Operational Efficiency Index (higher is better)
    // Formula: (Quality * 100000) / (Latency * RAM_GB * Energy)
    const ramGb = ramMb / 1024;
    const efficiencyScore = Math.round((quality * 1000000) / (latencyMs * ramGb * energyJoules));

    return {
      quality: (quality * 100).toFixed(1),
      latencyMs: Math.round(latencyMs),
      ramMb,
      energyJoules: energyJoules.toFixed(1),
      efficiencyScore,
      costPerTask: costPerTask.toFixed(4)
    };
  };

  const metrics = getCalculatedMetrics();

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>PHASE 004A SPECIFICATION</span>
          <span>·</span>
          <span>EXECUTION SOCKET & RUNTIME EFFICIENCY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Execution Socket & Efficiency Infrastructure
        </h1>
        <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
          Phase 004A establishes the foundational execution socket, optimizing local compute efficiency, runtime throughput, and resource allocation before introducing higher-layer identity, verification, or mesh networking subsystems. Implementing complex authorization or peer-to-peer execution planes over an unoptimized runtime leads to compounding operational latency and unnecessary compute costs.
        </p>
      </div>

      {/* Execution Socket Architecture Diagram (ASCII Reproduction) */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono">
              PHASE 004A: EXECUTION SOCKET LAYER FLOW
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Deterministic Heterogeneous Split</span>
        </div>

        {/* Visual Pipeline Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Step 1 */}
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-4 space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Input Request</div>
            <div className="text-sm font-semibold text-slate-200">ContextPipe Planner</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              5-Stage Query Planning (Plan, Bind, Optimize, Execute, Feedback). -31% tokens, -23% LLM calls.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-4 space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Coordinated Queue</div>
            <div className="text-sm font-semibold text-slate-200">TAO Joint Scheduler</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Matches external tool returns with KV-cache locality. -26.8% latency, -36.3% TTFT.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-4 space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Local Routing</div>
            <div className="text-sm font-semibold text-slate-200">NVIDIA PAIR Router</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Discovers local RTX/DGX/Mac nodes via mDNS/mTLS. 8m 48s vs 18m multi-agent run.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-lg bg-slate-900/90 border border-cyan-500/30 p-4 space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Heterogeneous Split</div>
            <div className="text-sm font-semibold text-cyan-300">NPU Prefill / CPU Decode</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Prefill onto NPU matrix units; autoregressive token decoding on oneDNN/ZenDNN host CPU.
            </p>
          </div>

          {/* Step 5 */}
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-4 space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Async Stream</div>
            <div className="text-sm font-semibold text-slate-200">ASPIRE Async Socket</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Request-local async decoding (1.70×–4.58× speedup). Eliminates step-locked batch stalls.
            </p>
          </div>
        </div>
      </div>

      {/* Core Research Principles & Empirical Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Heterogeneous Hardware & Runtime Optimization */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Activity className="h-5 w-5" />
            <h3 className="text-base font-semibold text-slate-100">PowerBench Profiling</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Benchmarking reveals that naive deployment strategies—forcing an entire model graph onto a single accelerator—cause severe efficiency losses. Framework selection introduces up to a 10× performance differential on NPUs, while scheduling inefficiencies account for 40% in wasted energy.
          </p>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>NPU Energy Waste:</span>
              <span className="text-rose-400">Up to 40% (Naive)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Optimized Split Reduction:</span>
              <span className="text-emerald-400">-54.8% Energy</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Prefill Target:</span>
              <span className="text-cyan-300">NPU Matrix Units</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Decoding Target:</span>
              <span className="text-blue-300">CPU / oneDNN / ZenDNN</span>
            </div>
          </div>
        </div>

        {/* Card 2: Orchestration & Cost-Reduction Policies */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <DollarSign className="h-5 w-5" />
            <h3 className="text-base font-semibold text-slate-100">Cloudflare Cost Reduction</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Achieved a <strong className="text-slate-100">68% total inference cost reduction</strong> (lowering code-review costs from $0.77 to $0.25 and reducing median completion time from 4m 09s to 1m 32s) by optimizing workflow efficiency rather than relying on cheaper physical hardware.
          </p>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Cost Per Task:</span>
              <span className="text-emerald-400">$0.77 → $0.25 (-68%)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Task Latency:</span>
              <span className="text-cyan-400">4m 09s → 1m 32s (-63%)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Prefix Cache Reuse:</span>
              <span className="text-slate-300">Shared KV alignment</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Dynamic Reasoning:</span>
              <span className="text-slate-300">Minimal Viable Model</span>
            </div>
          </div>
        </div>

        {/* Card 3: Unified CPU Substrate & Jetson Orin Specs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Server className="h-5 w-5" />
            <h3 className="text-base font-semibold text-slate-100">Unified Substrate Independence</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Integrating AMD ZenDNN optimizations directly into the open-source Intel oneDNN PyTorch interface creates a standardized, vendor-neutral CPU target. Compact edge models like IronLLM (654M hybrid attention, 1.48× decoding speedup) and Jetson Orin Nano 2 (78 TOPS, -40% power) preserve portability.
          </p>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800/80 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>IronLLM Edge Model:</span>
              <span className="text-purple-300">654M / 1.48× speedup</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Jetson Orin Nano 2:</span>
              <span className="text-purple-300">78 TOPS / -40% power</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>CPU Backend:</span>
              <span className="text-slate-300">AMD ZenDNN + oneDNN</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Decoding Decoupling:</span>
              <span className="text-slate-300">Frozen MTP Retrofits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 4D Operational Envelope Calculator */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Interactive 4D Operational Envelope Calculator
            </h2>
            <div className="text-xs font-mono text-cyan-400 mt-0.5">
              Formula: Operational Efficiency = Quality × Wall-Clock Latency × RAM × Energy
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Phase 004A Hardware Calibration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Model Architecture</label>
              <div className="space-y-1.5">
                {[
                  { id: 'iron_654m', label: 'IronLLM (654M Hybrid Attention + MTP)' },
                  { id: 'edge_moe', label: 'Edge MoE (Low Active Parameters)' },
                  { id: 'dense_70b', label: 'Dense 70B Full Foundation Model' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setModelType(item.id as any)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
                      modelType === item.id
                        ? 'border-cyan-500 bg-slate-800 text-slate-100 font-medium'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Execution Target Backend</label>
              <div className="space-y-1.5">
                {[
                  { id: 'npu_cpu_split', label: 'Heterogeneous NPU (Prefill) + CPU (Decode)' },
                  { id: 'npu_only', label: 'Monolithic Single Accelerator (Naive)' },
                  { id: 'cpu_onednn', label: 'Unified CPU (Intel oneDNN + AMD ZenDNN)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setBackendTarget(item.id as any)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
                      backendTarget === item.id
                        ? 'border-cyan-500 bg-slate-800 text-slate-100 font-medium'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Context Pipe Token Alignment:</span>
                <span className="font-mono text-cyan-400">{promptTokens} tokens</span>
              </div>
              <input
                type="range"
                min="512"
                max="8192"
                step="512"
                value={promptTokens}
                onChange={(e) => setPromptTokens(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Real-time Computed 4D Metrics Display */}
          <div className="md:col-span-2 rounded-lg bg-slate-950 border border-slate-800/80 p-5 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Simulated 4D Physical & Latency Profile
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Quality Score</div>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
                    {metrics.quality}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Task fidelity</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Wall-Clock Latency</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
                    {metrics.latencyMs} ms
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Time to completion</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Host RAM Resident</div>
                  <div className="text-xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
                    {metrics.ramMb} MB
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">KV + Model Weights</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Energy Consumption</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                    {metrics.energyJoules} J
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Per-task energy</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-cyan-300 font-bold uppercase">
                  4D Operational Efficiency Index
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Synthesized metric weighing Quality / (Latency × RAM × Energy).
                </p>
              </div>
              <div className="text-3xl font-extrabold font-mono text-cyan-400 tabular-nums">
                {metrics.efficiencyScore.toLocaleString()} pts
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-900 pt-3">
              <span>Estimated Cloudflare Task Cost: <strong className="text-slate-200 font-mono">${metrics.costPerTask}</strong></span>
              <span>ContextPipe Token Savings: <strong className="text-emerald-400 font-mono">-31% Volume</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Module 1: Live Executable ContextPipe Query Planner */}
      <ContextPipeLiveWorkbench />
    </div>
  );
};

const SAMPLE_CONTEXT_RECORDS: ContextRecord[] = [
  {
    recordId: 'rec-p1',
    sourceType: 'policy',
    content: 'Founding Doctrine 1: Knowledge can propagate. Privilege cannot. State remains sovereign.',
    provenanceHash: '0x9fa1b203',
    priority: 1.0,
    principalId: 'operator-root',
    createdAt: Date.now() - 60000,
  },
  {
    recordId: 'rec-f1',
    sourceType: 'fact',
    content: 'Heterogeneous compute split active: Prefill target NPU, decode target unified oneDNN/ZenDNN CPU.',
    provenanceHash: '0x4cb891a0',
    priority: 0.85,
    principalId: 'agent-scheduler',
    createdAt: Date.now() - 30000,
  },
  {
    recordId: 'rec-a1',
    sourceType: 'artifact',
    content: 'Generated execution socket container manifest with request-local ASPIRE asynchronous decoding.',
    provenanceHash: '0x7e11409f',
    priority: 0.6,
    principalId: 'builder-agent',
    createdAt: Date.now() - 15000,
  },
  {
    recordId: 'rec-e1',
    sourceType: 'episodic',
    content: 'User chatted about previous benchmark iterations and asked for a status update.',
    provenanceHash: '0x12bb44a1',
    priority: 0.0, // Zero priority -> will be pruned during bind
    principalId: 'chat-interface',
    createdAt: Date.now() - 5000,
  },
];

const ContextPipeLiveWorkbench: React.FC = () => {
  const [userIntent, setUserIntent] = useState<string>("Compile optimized code-review prompt under token envelope");
  const [tokenBudget, setTokenBudget] = useState<number>(2048);
  const [plannerOutput, setPlannerOutput] = useState<{
    plan: ReturnType<ContextPipePlanner['plan']>;
    bound: ContextRecord[];
    optimized: ContextRecord[];
    executed: ReturnType<ContextPipePlanner['execute']>;
    feedback: ReturnType<ContextPipePlanner['feedback']>;
  } | null>(null);

  const handleRunPlanner = () => {
    const planner = new ContextPipePlanner(tokenBudget);
    const plan = planner.plan(userIntent, ['heterogeneous_split', 'prefix_cache_reuse']);
    const bound = planner.bind(plan, SAMPLE_CONTEXT_RECORDS);
    const optimized = planner.optimize(bound, tokenBudget);
    const executed = planner.execute(plan, optimized);
    const feedback = planner.feedback(executed, Math.round(executed.estimatedTokens * 1.1));

    setPlannerOutput({ plan, bound, optimized, executed, feedback });
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Module 1: Live ContextPipe 5-Stage Deterministic Query Planner
            </h2>
          </div>
          <div className="text-xs font-mono text-cyan-400 mt-0.5">
            Plan ⟶ Bind ⟶ Optimize ⟶ Execute ⟶ Feedback
          </div>
        </div>
        <span className="text-xs font-mono text-emerald-400">Executable Module 1 Active</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">User Query Intent</label>
            <input
              type="text"
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              className="w-full text-xs font-mono p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Token Budget Allocation:</span>
              <span className="font-mono text-cyan-400 font-bold">{tokenBudget} tokens</span>
            </div>
            <input
              type="range"
              min="256"
              max="4096"
              step="256"
              value={tokenBudget}
              onChange={(e) => setTokenBudget(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <button
            onClick={handleRunPlanner}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Execute ContextPipe Pipeline</span>
          </button>
        </div>

        <div className="md:col-span-2 rounded-lg bg-slate-950 border border-slate-800 p-5 space-y-4 font-mono text-xs">
          {plannerOutput ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-cyan-400 font-bold">Query Plan: {plannerOutput.plan.queryId}</span>
                <span className="text-slate-400">Budget: {plannerOutput.plan.allocatedTokenBudget} tok</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">Stage 2 Bind</span>
                  <span className="text-slate-200 font-bold">{plannerOutput.bound.length} / {SAMPLE_CONTEXT_RECORDS.length} passed</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">Stage 3 Optimize</span>
                  <span className="text-slate-200 font-bold">{plannerOutput.optimized.length} records</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">Stage 4 Tokens</span>
                  <span className="text-cyan-400 font-bold">~{plannerOutput.executed.estimatedTokens} tok</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase">Stage 5 Efficiency</span>
                  <span className="text-emerald-400 font-bold">{plannerOutput.feedback.efficiencyRatio}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-1">Stage 4 Assembled Prompt View</span>
                <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {plannerOutput.executed.assembledPrompt}
                </pre>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                <span>Lineage Hashes: <code className="text-slate-300">{plannerOutput.executed.lineageHashes.join(', ')}</code></span>
                <span className="text-emerald-400">Strict Memory/Context Isolation</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-center py-8 font-sans">
              Click "Execute ContextPipe Pipeline" to observe the 5-stage deterministic query planner in real time.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
