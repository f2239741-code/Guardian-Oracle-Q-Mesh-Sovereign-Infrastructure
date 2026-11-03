import React from 'react';
import { ShieldCheck, ExternalLink, GitBranch, Lock, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-10 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold text-slate-300">Guardian Oracle & Q-Mesh Systems Architecture</span>
            </div>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="text-slate-400 font-medium">Kenneth Cripps & Guardian Oracle team</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400">
            <a
              href="mailto:kenx@guardianoracle.com"
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono text-[11px] transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>kenx@guardianoracle.com</span>
            </a>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Lock className="h-3 w-3 text-cyan-500" /> Fail-Closed Release
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <GitBranch className="h-3 w-3 text-emerald-500" /> Agora Git DAG
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
          <p>
            Operating Invariant: <code className="text-slate-400 font-mono">Asset Discovery ≠ Execution Authority</code> · Permissions resolve strictly against append-only signed ledgers.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>SSDI 5-Claim Standard</span>
            <span>·</span>
            <span>Pufibara Hash-Bound</span>
            <span>·</span>
            <span>Cascadia libp2p/QUIC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
