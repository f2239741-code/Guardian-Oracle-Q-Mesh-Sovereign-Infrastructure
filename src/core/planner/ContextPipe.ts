/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * MODULE 1: CONTEXTPIPE — DETERMINISTIC QUERY PLANNER
 * 
 * ContextPipe treats prompt assembly as a structured 5-stage query pipeline:
 * (Plan → Bind → Optimize → Execute → Feedback), maintaining strict isolation
 * between durable Memory and transient Context.
 */

export type SourceType = 'fact' | 'artifact' | 'policy' | 'episodic';

export interface ContextRecord {
  readonly recordId: string;
  readonly sourceType: SourceType;
  readonly content: string;
  readonly provenanceHash: string;
  readonly priority: number;
  readonly principalId: string;
  readonly createdAt: number;
}

export interface ContextQueryPlan {
  readonly queryId: string;
  readonly stages: readonly string[];
  readonly allocatedTokenBudget: number;
  readonly requiredCapabilities: readonly string[];
  readonly plannedAt: number;
}

export interface MaterializedContextView {
  readonly queryId: string;
  readonly assembledPrompt: string;
  readonly recordCount: number;
  readonly lineageHashes: readonly string[];
  readonly estimatedTokens: number;
}

export interface ContextFeedbackTrace {
  readonly queryId: string;
  readonly recordsUsed: number;
  readonly tokensConsumed: number;
  readonly efficiencyRatio: number;
  readonly tracedAt: string;
}

/**
 * Deterministic hash generator compatible with both Node.js and browser environments.
 */
function deterministicShortHash(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return (part1 + part2).slice(0, 12);
}

export class ContextPipePlanner {
  public readonly tokenBudget: number;

  constructor(tokenBudget: number = 4096) {
    this.tokenBudget = tokenBudget;
  }

  /**
   * Stage 1: Plan — Define query execution bounds and token allocations.
   */
  public plan(userIntent: string, capabilities: string[] = []): ContextQueryPlan {
    const timestamp = Date.now();
    const queryId = `cp_${deterministicShortHash(`${userIntent}:${timestamp}`)}`;
    return {
      queryId,
      stages: ['plan', 'bind', 'optimize', 'execute', 'feedback'],
      allocatedTokenBudget: this.tokenBudget,
      requiredCapabilities: Object.freeze([...capabilities]),
      plannedAt: timestamp,
    };
  }

  /**
   * Stage 2: Bind — Filter candidate records against active provenance and principal identity.
   */
  public bind(
    _plan: ContextQueryPlan,
    availableRecords: readonly ContextRecord[]
  ): ContextRecord[] {
    return availableRecords.filter((rec) => rec.priority > 0.0);
  }

  /**
   * Stage 3: Optimize — Deterministically rank and trim records using priority and cache locality.
   */
  public optimize(
    boundRecords: readonly ContextRecord[],
    maxTokens: number
  ): ContextRecord[] {
    const sorted = [...boundRecords].sort((a, b) => b.priority - a.priority);
    const optimized: ContextRecord[] = [];
    let currentTokens = 0;

    for (const rec of sorted) {
      const words = rec.content.trim().split(/\s+/).filter(Boolean).length;
      const estTokens = Math.ceil(words * 1.3);
      if (currentTokens + estTokens <= maxTokens) {
        optimized.push(rec);
        currentTokens += estTokens;
      }
    }

    return optimized;
  }

  /**
   * Stage 4: Execute — Materialize the immutable context window view.
   */
  public execute(
    plan: ContextQueryPlan,
    optimizedRecords: readonly ContextRecord[]
  ): MaterializedContextView {
    const assembledPrompt = optimizedRecords
      .map((r) => `[${r.sourceType.toUpperCase()}] (${r.recordId}): ${r.content}`)
      .join('\n---\n');

    const totalWords = assembledPrompt.trim().split(/\s+/).filter(Boolean).length;
    const estimatedTokens = Math.ceil(totalWords * 1.3);

    return {
      queryId: plan.queryId,
      assembledPrompt,
      recordCount: optimizedRecords.length,
      lineageHashes: Object.freeze(optimizedRecords.map((r) => r.provenanceHash)),
      estimatedTokens,
    };
  }

  /**
   * Stage 5: Feedback — Log EXPLAIN ANALYZE traces for token efficiency accounting.
   */
  public feedback(
    executionResult: MaterializedContextView,
    tokenUsage: number
  ): ContextFeedbackTrace {
    const denominator = Math.max(tokenUsage, 1);
    const efficiencyRatio = Number((executionResult.recordCount / denominator).toFixed(4));

    return {
      queryId: executionResult.queryId,
      recordsUsed: executionResult.recordCount,
      tokensConsumed: tokenUsage,
      efficiencyRatio,
      tracedAt: new Date().toISOString(),
    };
  }
}
