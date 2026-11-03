import React from 'react';
import { Shield, Play, Sun, Moon, Terminal } from 'lucide-react';
import { TabId } from '../types';

interface HeaderProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onOpenPipelineModal: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenPipelineModal,
  darkMode,
  setDarkMode,
}) => {
  const navItems: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Executive & Doctrines' },
    { id: 'phase-004a', label: '004A: Execution Socket' },
    { id: 'phase-003h', label: '003H: Identity & State' },
    { id: 'phase-004b', label: '004B: Commit Plane' },
    { id: 'phase-004c', label: '004C: Peer Mesh' },
    { id: 'threat-matrix', label: 'Threat Matrix' },
    { id: 'checklist', label: 'Audit Checklist' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400 shadow-sm">
            <Shield className="h-5 w-5" />
          </div>
          <button 
            onClick={() => setActiveTab('overview')}
            className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
          >
            <div className="text-base font-bold tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors whitespace-nowrap">
              Guardian Oracle <span className="text-slate-500 font-normal">/</span> Q-Mesh
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              Sovereign Infrastructure
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-Line, whitespace-nowrap) */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/80 text-cyan-300 border border-cyan-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Utility */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle display theme"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={onOpenPipelineModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-98"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Simulate Pipeline</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Navigation Scroll Strip */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/80 px-4 py-2 gap-1.5 bg-slate-950">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
