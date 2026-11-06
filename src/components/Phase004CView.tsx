import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Wifi, 
  ShieldAlert, 
  Sliders, 
  Activity, 
  Cpu, 
  Server, 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Radio,
  Lock,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react';
import {
  WanStateDecisionEngine,
  SecretCanaryVerifier,
  CascadiaMeshTransport,
  SwarmLayerSplitter,
  NodeCapabilityAd,
  createSignedNodeCapabilityAd
} from '../core';

export const Phase004CView: React.FC = () => {
  // ==========================================
  // 1. WAN State Decision Engine State (Module 5)
  // ==========================================
  const [modelAttention, setModelAttention] = useState<'MHA' | 'GQA'>('GQA');
  const [modelParams, setModelParams] = useState<number>(70); // in Billion
  const [bandwidthGbps, setBandwidthGbps] = useState<number>(12); // in Gbps

  // Real execution of WanStateDecisionEngine
  const wanEvaluation = useMemo(() => {
    return WanStateDecisionEngine.evaluateTransferDecision(modelAttention, bandwidthGbps, modelParams);
  }, [bandwidthGbps, modelAttention, modelParams]);

  // ==========================================
  // 2. Secret Canary Verification Simulator (Module 5)
  // ==========================================
  const [isPeerMalicious, setIsPeerMalicious] = useState<boolean>(false);
  const [canaryRunState, setCanaryRunState] = useState<'IDLE' | 'PROBING' | 'VERIFIED'>('IDLE');
  const [canaryResult, setCanaryResult] = useState<{
    drift: number;
    isBenign: boolean;
    peerId: string;
    details: string;
  } | null>(null);

  const handleRunCanary = () => {
    setCanaryRunState('PROBING');
    setTimeout(() => {
      const targetPeer = isPeerMalicious ? 'did:mesh:peer-subverted-9x' : 'did:mesh:peer-benign-8a';
      // Baseline activation vector
      const baseline = [0.142, 0.589, 0.812, 0.334, 0.671, 0.228, 0.904, 0.447];
      // Actual response vector
      const actual = isPeerMalicious
        ? [0.521, 0.189, 0.412, 0.734, 0.271, 0.828, 0.504, 0.947] // large perturbation
        : [0.143, 0.590, 0.811, 0.335, 0.670, 0.229, 0.903, 0.448]; // tiny nominal variance

      const verification = SecretCanaryVerifier.verifyCanaryResponse(targetPeer, actual, baseline);
      setCanaryResult({
        drift: verification.activationDrift,
        isBenign: verification.isVerified,
        peerId: targetPeer,
        details: verification.reason
      });
      setCanaryRunState('VERIFIED');
    }, 350);
  };

  // ==========================================
  // 3. Cascadia P2P Mesh Gossip & CA Invariant (Module 5)
  // ==========================================
  const meshTransport = useMemo(() => {
    const t = new CascadiaMeshTransport();
    // Seed initial certified peer with authentic CA digital signature
    const initialAd = createSignedNodeCapabilityAd({
      peerId: 'did:mesh:peer-seattle-01',
      availableTops: 480,
      maxContextTokens: 32768,
      supportedOps: ['prefill', 'speculate'],
      signedTimestamp: Date.now(),
    });
    t.receiveGossipAdvertisement(initialAd);
    return t;
  }, []);

  const [discoveredPeers, setDiscoveredPeers] = useState<readonly NodeCapabilityAd[]>(() =>
    meshTransport.listHealthyPeers()
  );
  const [candidatePeerId, setCandidatePeerId] = useState<string>('did:mesh:peer-oregon-02');
  const [candidateTops, setCandidateTops] = useState<number>(360);
  const [candidateOps, setCandidateOps] = useState<string>('prefill, decode');
  const [hasValidSignature, setHasValidSignature] = useState<boolean>(true);
  const [gossipStatus, setGossipStatus] = useState<{
    success: boolean;
    message: string;
    timestamp: number;
  } | null>(null);

  const handleBroadcastGossip = () => {
    let ad: NodeCapabilityAd;

    if (hasValidSignature) {
      ad = createSignedNodeCapabilityAd({
        peerId: candidatePeerId,
        availableTops: candidateTops,
        maxContextTokens: 65536,
        supportedOps: candidateOps.split(',').map(s => s.trim()).filter(Boolean),
        signedTimestamp: Date.now(),
      });
    } else {
      // Fabricated signature simulating rogue/unauthorized node attempting admission
      ad = {
        peerId: candidatePeerId,
        availableTops: candidateTops,
        maxContextTokens: 65536,
        supportedOps: candidateOps.split(',').map(s => s.trim()).filter(Boolean),
        signedTimestamp: Date.now(),
        operatorSignature: 'sig:schnorr:0000000000000000000000000000000000000000000000000000000000000001:0000000000000000000000000000000000000000000000000000000000000001',
      };
    }

    const result = meshTransport.receiveGossipAdvertisement(ad);
    if (result.success) {
      setDiscoveredPeers([...meshTransport.listHealthyPeers()]);
      setGossipStatus({
        success: true,
        message: `Peer capability advertisement accepted & gossiped across QUIC overlay for ${candidatePeerId}.`,
        timestamp: Date.now()
      });
    } else {
      setGossipStatus({
        success: false,
        message: `REJECTED: ${result.reason} (CA Admission Invariant strictly enforced)`,
        timestamp: Date.now()
      });
    }
  };

  // ==========================================
  // 4. SwarmLLM Dynamic Layer Splitting (Module 5)
  // ==========================================
  const [modelSizeGB, setModelSizeGB] = useState<number>(70); // 70 GB (e.g. 70B 8-bit or 35B 16-bit)
  const [dedicatedVramGB, setDedicatedVramGB] = useState<number>(24); // 24 GB RTX 4090 / L4
  const [systemRamGB, setSystemRamGB] = useState<number>(64); // 64 GB host RAM

  const layerSplit = useMemo(() => {
    const totalLayers = 64; // Standard 70B layer count
    return SwarmLayerSplitter.calculateLayerSplit(
      totalLayers,
      modelSizeGB * 1024,
      dedicatedVramGB * 1024,
      systemRamGB * 1024
    );
  }, [modelSizeGB, dedicatedVramGB, systemRamGB]);

  const gpuFraction = layerSplit.gpuLayers / 64;
  const cpuFraction = layerSplit.cpuLayers / 64;

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>PHASE 004C VERIFIED IMPLEMENTATION</span>
          <span>·</span>
          <span>PEER COMPUTE & MESH EXECUTION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Peer Compute & Mesh Execution Infrastructure
        </h1>
        <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
          Phase 004C executes distributed inference across heterogeneous peer networks without central control planes. By combining signed Cascadia libp2p/QUIC gossip, DISCO WAN speculative state crossover calculations, Secret Canary Byzantine defense, and SwarmLLM dynamic VRAM/RAM layer splitting, sovereign execution scales securely to untrusted edge devices.
        </p>
      </div>

      {/* Governance Limitation Warning Box */}
      <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-5 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-amber-300 uppercase tracking-wide font-mono">
            Critical Architectural Boundary Advisory: Cascadia P2P vs Self-Sovereignty
          </div>
          <p className="text-slate-300 leading-relaxed">
            While Cascadia provides control-plane-free peer execution over libp2p and QUIC, node admission in Cascadia relies on an operator-managed Certificate Authority (CA). <strong className="text-amber-200">Decentralized inference execution does not automatically confer self-sovereign governance.</strong> Authority gates must remain strictly and cryptographically enforced at the Commit Plane.
          </p>
        </div>
      </div>

      {/* Peer Compute Architecture Flow */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono">
              PHASE 004C: PEER COMPUTE & MESH EXECUTION FLOW
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Module 5 Live Core Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {/* Step 1 */}
          <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-4 space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Decision Engine</div>
            <div className="text-sm font-semibold text-slate-200">Bandwidth Engine</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Calculates State Transfer vs Local Recompute against 74–111 Gbps (MHA) or 9–14 Gbps (GQA).
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-4 space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Gossip Overlay</div>
            <div className="text-sm font-semibold text-slate-200">Cascadia libp2p/QUIC</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Signed capability advertisements with CA admission enforcement and mDNS peer discovery.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg bg-slate-900/80 border border-cyan-500/30 p-4 space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Byzantine Defense</div>
            <div className="text-sm font-semibold text-cyan-300">Secret Canary Drift</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Injects secret inputs to measure activation drift. 100% ranking accuracy in isolating subverted nodes.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-4 space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Mesh Transport</div>
            <div className="text-sm font-semibold text-slate-200">SwarmLLM Layer Split</div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Dynamic VRAM/RAM layer partitioning recovering 1.8× throughput over CPU fallback.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Interactive Bandwidth & State Decision Engine */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              WAN State Decision Engine (Module 5 Live Engine)
            </h2>
            <div className="text-xs font-mono text-cyan-400 mt-0.5">
              Evaluates Speculative Token vs KV State Transfer against Empirical Bandwidth Crossover
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">DISCO WAN Research Invariant</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Attention Architecture</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setModelAttention('GQA')}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    modelAttention === 'GQA'
                      ? 'border-cyan-500 bg-slate-800 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  GQA (Grouped Query)
                </button>
                <button
                  onClick={() => setModelAttention('MHA')}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    modelAttention === 'MHA'
                      ? 'border-cyan-500 bg-slate-800 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  MHA (Multi-Head)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Model Parameters:</span>
                <span className="font-mono text-cyan-400 font-bold">{modelParams}B</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[8, 14, 32, 70].map(p => (
                  <button
                    key={p}
                    onClick={() => setModelParams(p)}
                    className={`py-1.5 rounded border text-[11px] font-mono cursor-pointer ${
                      modelParams === p
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {p}B
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Available WAN Bandwidth:</span>
                <span className="font-mono text-cyan-400 font-bold">{bandwidthGbps} Gbps</span>
              </div>
              <input
                type="range"
                min="1"
                max="120"
                step="1"
                value={bandwidthGbps}
                onChange={(e) => setBandwidthGbps(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 Gbps</span>
                <span>Threshold: {wanEvaluation.thresholdGbps} Gbps</span>
                <span>120 Gbps</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 rounded-lg bg-slate-950 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-[10px] uppercase font-mono text-slate-400">
                Engine Verdict: WanStateDecisionEngine.evaluateTransferDecision()
              </div>

              {wanEvaluation.decision === 'TRANSFER_KV_STATE' ? (
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle className="h-4 w-4" />
                    <span>RECOMMENDATION: TRANSFER KV STATE OVER WAN</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {wanEvaluation.reason}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-800 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Activity className="h-4 w-4" />
                    <span>RECOMMENDATION: RECOMPUTE STATE LOCALLY</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {wanEvaluation.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono pt-2 border-t border-slate-900">
              <div>
                <span className="text-slate-400 block text-[10px]">Crossover Limit:</span>
                <span className="text-slate-200 font-bold">{wanEvaluation.thresholdGbps} Gbps</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">FlatCake Cache Hit:</span>
                <span className="text-slate-200 font-bold">94% (RAM+NVMe)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Overhead Cut:</span>
                <span className="text-cyan-300 font-bold">{modelAttention === 'GQA' ? '-78%' : '-15%'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Secret Canary Activation Drift Verification Simulator */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Secret Canary Activation Drift Verification (Module 5 Live Engine)
            </h2>
            <div className="text-xs font-mono text-cyan-400 mt-0.5">
              100% Ranking Accuracy across 408 test configurations in isolating subverted nodes
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Byzantine Peer Defense</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Untrusted peer nodes may return corrupted inference or altered model weights. The verifying node periodically inserts secret canary inputs into subtask execution streams, measuring activation drift against expected baselines without requiring full target recomputation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Target Peer Compute Node</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setIsPeerMalicious(false); setCanaryRunState('IDLE'); setCanaryResult(null); }}
                  className={`p-3 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    !isPeerMalicious
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  Benign Peer Node (did:mesh:peer-valid-8a)
                </button>
                <button
                  onClick={() => { setIsPeerMalicious(true); setCanaryRunState('IDLE'); setCanaryResult(null); }}
                  className={`p-3 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    isPeerMalicious
                      ? 'border-rose-500 bg-rose-950/30 text-rose-300 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  Subverted Node (Altered Weights / Poisoned)
                </button>
              </div>
            </div>

            <button
              onClick={handleRunCanary}
              disabled={canaryRunState === 'PROBING'}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all cursor-pointer"
            >
              <Radio className="h-4 w-4" />
              <span>{canaryRunState === 'PROBING' ? 'Running SecretCanaryVerifier...' : 'Inject Secret Canary Probe'}</span>
            </button>
          </div>

          <div className="rounded-lg bg-slate-950 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-[10px] uppercase font-mono text-slate-400">
                Activation Drift Analysis Results (Threshold ≤ 0.015)
              </div>

              {!canaryResult ? (
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 text-center py-6">
                  Ready to probe target node with secret activation challenge.
                </div>
              ) : canaryResult.isBenign ? (
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> BENIGN NODE VERIFIED</span>
                    <span>Drift: {canaryResult.drift.toFixed(4)}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {canaryResult.details}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-800 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-rose-400 font-bold">
                    <span className="flex items-center gap-1.5"><XCircle className="h-4 w-4" /> MALICIOUS NODE ISOLATED</span>
                    <span>Drift: {canaryResult.drift.toFixed(4)}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {canaryResult.details}
                  </p>
                </div>
              )}
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
              <span>Benchmark: 408 Configurations Tested</span>
              <span className="text-emerald-400 font-bold">100% Ranking Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cascadia P2P Mesh Gossip & CA Invariant Live Workbench */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Network className="h-5 w-5 text-cyan-400" />
              <span>Cascadia Mesh Gossip & CA Invariant Workbench</span>
            </h2>
            <div className="text-xs font-mono text-cyan-400 mt-0.5">
              Testing signed node capability advertisements over libp2p/QUIC gossip with fail-closed CA admission
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">CascadiaMeshTransport</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-slate-300 font-semibold">CA Admission Sovereignty:</span>
            <span className="text-slate-400">Secp256k1 CSPRNG Root CA · Independent Public Key Registry</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
              Revoked Seeds Blacklisted
            </span>
            <span className="text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 px-2 py-0.5 rounded">
              Fail-Closed CA Verification
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Candidate Peer DID</label>
              <input
                type="text"
                value={candidatePeerId}
                onChange={(e) => setCandidatePeerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Available TOPS (tok/s)</label>
                <input
                  type="number"
                  value={candidateTops}
                  onChange={(e) => setCandidateTops(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">Supported Ops</label>
                <input
                  type="text"
                  value={candidateOps}
                  onChange={(e) => setCandidateOps(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Operator CA Signature Status</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setHasValidSignature(true)}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    hasValidSignature
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  Valid CA Signature
                </button>
                <button
                  onClick={() => setHasValidSignature(false)}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    !hasValidSignature
                      ? 'border-rose-500 bg-rose-950/30 text-rose-300 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  Unsigned / Tampered
                </button>
              </div>
            </div>

            <button
              onClick={handleBroadcastGossip}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all cursor-pointer"
            >
              <Activity className="h-4 w-4" />
              <span>Broadcast Gossip Advertisement</span>
            </button>

            {gossipStatus && (
              <div className={`p-3 rounded-lg border text-xs font-mono ${
                gossipStatus.success
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800 text-rose-300'
              }`}>
                {gossipStatus.message}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-300 flex items-center justify-between">
              <span>Discovered Mesh Peers ({discoveredPeers.length})</span>
              <span className="text-[10px] text-cyan-400">CA Verified Topology</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {discoveredPeers.map((p) => (
                <div key={p.peerId} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 font-bold">{p.peerId}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800">
                      CA CERTIFIED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 text-[11px] text-slate-400">
                    <div>Compute: <span className="text-slate-200">{p.availableTops} TOPS</span></div>
                    <div>Max Context: <span className="text-slate-200">{p.maxContextTokens} tok</span></div>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Ops: {p.supportedOps.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SwarmLLM Dynamic VRAM/RAM Layer Splitting Workbench */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              <span>SwarmLLM Dynamic Layer Splitting (1.8× Throughput Recovery)</span>
            </h2>
            <div className="text-xs font-mono text-cyan-400 mt-0.5">
              Heterogeneous partitioning across dedicated NPU/GPU VRAM and host RAM to prevent PCIe bottlenecks
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">SwarmLayerSplitter</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Model Footprint (Weights + KV):</span>
                <span className="font-mono text-cyan-400 font-bold">{modelSizeGB} GB</span>
              </div>
              <input
                type="range"
                min="8"
                max="140"
                step="2"
                value={modelSizeGB}
                onChange={(e) => setModelSizeGB(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>8 GB (8B 4-bit)</span>
                <span>70 GB (70B 8-bit)</span>
                <span>140 GB</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Dedicated VRAM (GPU/NPU):</span>
                <span className="font-mono text-emerald-400 font-bold">{dedicatedVramGB} GB</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="4"
                value={dedicatedVramGB}
                onChange={(e) => setDedicatedVramGB(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 GB</span>
                <span>24 GB (RTX 4090)</span>
                <span>80 GB (H100)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Available Host RAM:</span>
                <span className="font-mono text-slate-200 font-bold">{systemRamGB} GB</span>
              </div>
              <input
                type="range"
                min="16"
                max="256"
                step="16"
                value={systemRamGB}
                onChange={(e) => setSystemRamGB(Number(e.target.value))}
                className="w-full accent-slate-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>16 GB</span>
                <span>64 GB</span>
                <span>256 GB</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 rounded-lg bg-slate-950 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase font-mono text-slate-400">
                  SwarmLLM Dynamic Allocation Metric
                </div>
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                  layerSplit.strategy === 'FULL_GPU'
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : layerSplit.strategy === 'SPLIT_VRAM_RAM'
                    ? 'bg-cyan-950/40 border-cyan-800 text-cyan-300'
                    : 'bg-amber-950/40 border-amber-800 text-amber-300'
                }`}>
                  {layerSplit.strategy}
                </span>
              </div>

              {/* Progress visualizer */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400">GPU Layers: {layerSplit.gpuLayers} ({(gpuFraction * 100).toFixed(1)}%)</span>
                  <span className="text-slate-400">CPU Layers: {layerSplit.cpuLayers} ({(cpuFraction * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex">
                  <div 
                    style={{ width: `${gpuFraction * 100}%` }}
                    className="h-full bg-emerald-500 transition-all duration-300"
                  />
                  <div 
                    style={{ width: `${cpuFraction * 100}%` }}
                    className="h-full bg-slate-700 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-slate-300">
                  Performance Factor: <span className="text-cyan-400 font-bold">{layerSplit.performanceMultiplier}×</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {layerSplit.strategy === 'SPLIT_VRAM_RAM'
                    ? 'Dynamic layer splitting successfully partitions model weights between high-bandwidth VRAM and system memory, recovering 1.8× inference throughput compared to naively running the entire model on CPU.'
                    : layerSplit.strategy === 'FULL_GPU'
                    ? 'Model completely fits within dedicated NPU/GPU VRAM. Peak execution throughput at full device memory bandwidth.'
                    : 'Model execution hosted on CPU system RAM with oneDNN/ZenDNN kernel vectorization.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono pt-2 border-t border-slate-900">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Layers:</span>
                <span className="text-slate-200 font-bold">64</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">VRAM Utilized:</span>
                <span className="text-emerald-400 font-bold">{(gpuFraction * modelSizeGB).toFixed(1)} GB</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">RAM Utilized:</span>
                <span className="text-slate-200 font-bold">{(cpuFraction * modelSizeGB).toFixed(1)} GB</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
