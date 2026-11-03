export type PhaseId = '004A' | '003H' | '004B' | '004C';

export type TabId = 
  | 'overview'
  | 'phase-004a'
  | 'phase-003h'
  | 'phase-004b'
  | 'phase-004c'
  | 'threat-matrix'
  | 'checklist';

export interface Doctrine {
  id: number;
  title: string;
  doctrine: string;
  explanation: string;
  invariant: string;
  failureMode: string;
}

export interface PhaseSpec {
  id: PhaseId;
  code: string;
  title: string;
  subtitle: string;
  primaryFocus: string;
  coreResearchInputs: string[];
  criticalPrimitives: string[];
  boundaryDependencies: string;
  metrics: {
    label: string;
    value: string;
    benchmark: string;
  }[];
}

export interface ThreatItem {
  id: string;
  threatCategory: string;
  specificAttackVector: string;
  concreteSystemImpact: string;
  mandatoryStructuralMitigation: string;
  mitigationPhase: PhaseId;
  riskSeverity: 'CRITICAL' | 'HIGH' | 'ELEVATED';
  testedAttackRate: string;
  postMitigationRate: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  formula?: string;
  verificationMethod: string;
  phase: PhaseId;
  status: 'COMPLIANT' | 'NEEDS_AUDIT' | 'ACTIVE';
}

export interface TaskStateObject {
  agentDID: string;
  stateVersion: string;
  memoryRootHash: string;
  skillManifest: string[];
  authScope: {
    resources: string[];
    actions: string[];
    validUntil: string;
  };
  verificationState: {
    provisoVerified: boolean;
    commitReceiptHash: string;
    artifactHash: string;
  };
}

export interface SimulationStep {
  step: number;
  phase: PhaseId;
  component: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'REJECTED' | 'MITIGATED';
  detail: string;
  hash?: string;
  metrics?: Record<string, string | number>;
}
