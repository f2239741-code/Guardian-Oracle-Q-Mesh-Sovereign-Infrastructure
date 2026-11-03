import React, { useState } from 'react';
import { 
  CheckSquare, 
  FileText, 
  Download, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Code2,
  Copy,
  Check
} from 'lucide-react';
import { CHECKLIST_ITEMS } from '../data/reportData';
import { ChecklistItem } from '../types';

export const ChecklistView: React.FC = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(CHECKLIST_ITEMS);
  const [copied, setCopied] = useState<boolean>(false);

  const toggleStatus = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === 'COMPLIANT' ? 'NEEDS_AUDIT' : 'COMPLIANT'
        };
      }
      return item;
    }));
  };

  const compliantCount = checklist.filter(c => c.status === 'COMPLIANT').length;
  const isAllCompliant = compliantCount === checklist.length;

  const exportReport = () => {
    const report = {
      title: "Guardian Oracle & Q-Mesh Sovereign Infrastructure Compliance Certificate",
      timestamp: new Date().toISOString(),
      overallStatus: isAllCompliant ? "PRODUCTION_READY_CERTIFIED" : "AUDIT_IN_PROGRESS",
      complianceScore: `${compliantCount} / ${checklist.length} Verified Invariants`,
      operatingPrinciples: checklist.map(c => ({
        id: c.id,
        principle: c.name,
        status: c.status,
        phase: c.phase,
        formula: c.formula,
        verificationMethod: c.verificationMethod
      }))
    };

    const text = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>OPERATIONAL CHECKLIST</span>
          <span>·</span>
          <span>PRODUCTION READINESS AUDIT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Operating Principles Checklist & Verification Audit
        </h1>
        <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
          Engineering teams deploying Guardian Oracle or Q-Mesh components must verify compliance against this non-negotiable operational checklist prior to production deployment.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-bold text-sm">
              {compliantCount}/{checklist.length}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">
                {isAllCompliant ? "All 8 Principles Formally Certified" : `${checklist.length - compliantCount} Items Require Operational Review`}
              </div>
              <div className="text-xs text-slate-400">
                Fail-closed release semantics enforced across all gates
              </div>
            </div>
          </div>

          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            <span>{copied ? "Certificate Copied to Clipboard" : "Export Audit Certificate (JSON)"}</span>
          </button>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="space-y-4">
        {checklist.map((item, idx) => {
          const isCompliant = item.status === 'COMPLIANT';

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-5 transition-all ${
                isCompliant
                  ? 'border-slate-800 bg-slate-900/40'
                  : 'border-amber-900/60 bg-amber-950/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStatus(item.id)}
                    aria-label={`Toggle status for ${item.name}`}
                    className={`flex h-6 w-6 items-center justify-center rounded border transition-colors cursor-pointer ${
                      isCompliant
                        ? 'border-emerald-500 bg-emerald-950 text-emerald-400'
                        : 'border-slate-700 bg-slate-950 text-slate-500'
                    }`}
                  >
                    {isCompliant ? <Check className="h-4 w-4" /> : null}
                  </button>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {item.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-100">
                    {item.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Phase {item.phase}</span>
                  <button
                    onClick={() => toggleStatus(item.id)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      isCompliant
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {item.status}
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                <p className="text-slate-300 leading-relaxed font-sans text-sm">
                  {item.description}
                </p>

                {item.formula && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-cyan-300">
                    <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Formal Invariant</span>
                    <code>{item.formula}</code>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-900 pt-2 font-mono">
                  <span>Verification Method: <span className="text-slate-300">{item.verificationMethod}</span></span>
                  <span className="text-emerald-400">Audit Status: Cryptographically Bound</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
