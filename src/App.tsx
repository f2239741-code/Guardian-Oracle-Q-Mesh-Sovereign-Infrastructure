import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DoctrinesView } from './components/DoctrinesView';
import { Phase004AView } from './components/Phase004AView';
import { Phase003HView } from './components/Phase003HView';
import { Phase004BView } from './components/Phase004BView';
import { Phase004CView } from './components/Phase004CView';
import { ThreatMatrixView } from './components/ThreatMatrixView';
import { ChecklistView } from './components/ChecklistView';
import { PipelineSimulatorModal } from './components/PipelineSimulatorModal';
import { TabId } from './types';
import { Shield, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Synchronize dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case 'overview':
        return 'Executive Strategy & Founding Doctrines';
      case 'phase-004a':
        return 'Phase 004A · Execution Socket & Efficiency';
      case 'phase-003h':
        return 'Phase 003H · Identity, Capability & Governed State';
      case 'phase-004b':
        return 'Phase 004B · Verifiable Execution & Commit Plane';
      case 'phase-004c':
        return 'Phase 004C · Peer Compute & Mesh Execution';
      case 'threat-matrix':
        return 'Section 6.0 · Unified Security Rules & Threat Matrix';
      case 'checklist':
        return 'Production Readiness · Operating Principles Checklist';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Contract (1 row, 3 zones) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPipelineModal={() => setIsModalOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Sub-Header Context & Breadcrumbs */}
      <div className="border-b border-slate-900 bg-slate-950/50 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400">Architecture Spec</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-cyan-400 font-semibold">{getBreadcrumbLabel()}</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Seq: Phase 004A ⟶ 003H ⟶ 004B ⟶ 004C</span>
            <span>·</span>
            <span className="text-emerald-400">Fail-Closed Invariant</span>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'overview' && (
          <DoctrinesView 
            onSelectTab={setActiveTab} 
            onOpenPipelineModal={() => setIsModalOpen(true)} 
          />
        )}
        {activeTab === 'phase-004a' && <Phase004AView />}
        {activeTab === 'phase-003h' && <Phase003HView />}
        {activeTab === 'phase-004b' && <Phase004BView />}
        {activeTab === 'phase-004c' && <Phase004CView />}
        {activeTab === 'threat-matrix' && <ThreatMatrixView />}
        {activeTab === 'checklist' && <ChecklistView />}
      </main>

      {/* End-to-End Pipeline Simulator Modal */}
      <PipelineSimulatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Clean Footer */}
      <Footer />
    </div>
  );
}
