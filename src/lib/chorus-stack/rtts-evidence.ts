import { RTTSEvidence } from "./types";

export class RTTSEngine {
  private evidenceBuffer: RTTSEvidence[] = [];

  public logEvidence(targetId: string, score: number, notations: string[]): RTTSEvidence {
    const evidence: RTTSEvidence = {
      id: `rtts_${Date.now()}`,
      targetId,
      score,
      notations
    };
    
    // RTTS is evidence-only: it logs but does not mutate kernel mode directly
    // The kernel evaluates based on this and other factors
    this.evidenceBuffer.push(evidence);
    return evidence;
  }

  public getContaminationScore(targetId: string): number {
    const related = this.evidenceBuffer.filter(e => e.targetId === targetId);
    if (related.length === 0) return 0;
    return related.reduce((acc, curr) => acc + curr.score, 0) / related.length;
  }
}

export const rttsEngine = new RTTSEngine();
