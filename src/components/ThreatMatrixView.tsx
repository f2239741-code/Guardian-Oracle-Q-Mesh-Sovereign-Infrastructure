import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Filter, 
  CheckCircle, 
  Play, 
  Lock, 
  EyeOff, 
  ArrowRight,
  Database,
  Cpu,
  RefreshCw,
  FileCode
} from 'lucide-react';
import { THREAT_MATRIX_DATA } from '../data/reportData';
import { ThreatItem, PhaseId } from '../types';

export const ThreatMatrixView: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [activeSimulationThreat, setActiveSimulationThreat] = useState<ThreatItem>(THREAT_MATRIX_DATA[0]);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simCompleted, setSimCompleted] = useState<boolean>(false);

  const filteredThreats = THREAT_MATRIX_DATA.filter((item) => {
    if (selectedPhase !== 'ALL' && item.mitigationPhase !== selectedPhase) return false;
    if (selectedSeverity !== 'ALL' && item.riskSeverity !== selectedSeverity) return false;
    return true;
  });

  const runAttackSimulation = (threat: ThreatItem) => {
    setActiveSimulationThreat(threat);
    setSimRunning(true);
    setSimCompleted(false);
    setTimeout(() => {
      setSimRunning(false);
      setSimCompleted(true);
    }, 600);
  };

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>SECTION 6.0 SPECIFICATION</span>
          <span>·</span>
          <span>UNIFIED SECURITY RULES & THREAT MATRIX</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Unified Security Rules & System Threat Matrix
        </h1>
        <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
          The Guardian Oracle and Q-Mesh architecture forms a zero-trust computing base over untrusted language models, unreliable hardware, and open network environments. Security is established by embedding hard policy enforcement, write-time memory gates, and cryptographic capabilities outside the probabilistic model reasoning loop.
        </p>
      </div>

      {/* Interactive Red Team Simulation Sandbox */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <h2 className="text-base font-bold text-slate-100">
              Interactive Red Team Attack Simulation Sandbox
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Zero-Trust Attack Injection</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threat Selector List */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">Select Threat Vector to Launch</label>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {THREAT_MATRIX_DATA.map((threat) => {
                const isSelected = activeSimulationThreat.id === threat.id;
                return (
                  <button
                    key={threat.id}
                    onClick={() => {
                      setActiveSimulationThreat(threat);
                      setSimCompleted(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500 bg-slate-800 text-slate-100 font-semibold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-cyan-400 text-[10px]">{threat.id}</span>
                      <span className="text-[10px] text-slate-400 font-sans">{threat.mitigationPhase}</span>
                    </div>
                    <div className="font-sans line-clamp-1 text-slate-200">{threat.threatCategory}</div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => runAttackSimulation(activeSimulationThreat)}
              disabled={simRunning}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold transition-all cursor-pointer mt-2"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{simRunning ? 'Executing Attack Payload...' : 'Launch Simulated Exploit'}</span>
            </button>
          </div>

          {/* Real-time Defense Stack Response */}
          <div className="lg:col-span-2 rounded-lg bg-slate-950 border border-slate-800 p-5 flex flex-col justify-between space-y-4 font-mono text-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-2">
                <span className="text-[10px] uppercase">Active Vector: {activeSimulationThreat.id}</span>
                <span className="text-rose-400 font-bold">{activeSimulationThreat.riskSeverity} SEVERITY</span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-1">Injected Attack Vector</span>
                <p className="text-rose-300 text-xs bg-rose-950/20 p-2.5 rounded border border-rose-900/30 font-sans">
                  {activeSimulationThreat.specificAttackVector}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-1">Unmitigated System Impact</span>
                <p className="text-slate-300 text-xs font-sans">
                  {activeSimulationThreat.concreteSystemImpact}
                </p>
              </div>

              {simCompleted && (
                <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800 space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> SOVEREIGN DEFENSE ENGAGED
                    </span>
                    <span>ATTACK NEUTRALIZED</span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                    <strong className="text-emerald-300 font-mono">Structural Mitigation: </strong>
                    {activeSimulationThreat.mandatoryStructuralMitigation}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-900/40 text-[10px] text-slate-400">
                    <span>Vulnerable Rate: <strong className="text-rose-400">{activeSimulationThreat.testedAttackRate}</strong></span>
                    <span>Post-Mitigation: <strong className="text-emerald-400">{activeSimulationThreat.postMitigationRate}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {!simCompleted && (
              <div className="text-slate-400 text-center py-4 font-sans text-xs">
                Press "Launch Simulated Exploit" to trace verification defenses in real time.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comprehensive Threat Matrix Table */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              Master Threat Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirically evaluated vulnerability classes and mandatory structural mitigations.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              <span>Phase:</span>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs font-mono focus:outline-none"
              >
                <option value="ALL">All Phases</option>
                <option value="003H">Phase 003H</option>
                <option value="004B">Phase 004B</option>
                <option value="004C">Phase 004C</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Severity:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs font-mono focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredThreats.map((threat) => (
            <div
              key={threat.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {threat.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 font-sans">
                    {threat.threatCategory}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Mitigation: Phase {threat.mitigationPhase}</span>
                  <span className="text-rose-400 font-semibold">{threat.riskSeverity}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Specific Attack Vector</span>
                  <p className="text-slate-300 leading-relaxed font-sans">{threat.specificAttackVector}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Concrete System Impact</span>
                  <p className="text-slate-300 leading-relaxed font-sans">{threat.concreteSystemImpact}</p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                  Mandatory Structural Mitigation
                </span>
                <p className="text-slate-300 font-sans leading-relaxed">
                  {threat.mandatoryStructuralMitigation}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-400">
                  <span>Tested Baseline: <span className="text-rose-400">{threat.testedAttackRate}</span></span>
                  <span>Post-Mitigation: <span className="text-emerald-400">{threat.postMitigationRate}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
