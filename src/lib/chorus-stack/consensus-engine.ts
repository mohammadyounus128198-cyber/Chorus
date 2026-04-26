import { sha256 } from "./crypto";
import { canonicalize } from "./canonical";
import { Vote, ConsensusResult } from "./types";

export type { Vote, ConsensusResult };

/**
 * 🔱 CONSENSUS ENGINE (Sabr AC-6 Hardened)
 */
export class ConsensusEngine {
  private n: number; // Total nodes
  private tau: number; // Threshold

  /**
   * @param totalNodes (n)
   * @param threshold (τ) - The minimum required agreements for validity
   */
  constructor(totalNodes: number = 4, threshold: number = 2) {
    this.n = totalNodes;
    this.tau = threshold;
  }

  /**
   * Resolves consensus from a set of authoritative votes.
   * Path A (HARDEN) is enforced here to handle split-brain scenarios deterministically.
   */
  public async resolve(votes: Vote[]): Promise<ConsensusResult> {
    const stateCounts: Map<string, { state: any; count: number; hash: string }> = new Map();

    for (const vote of votes) {
      // We ensure the state is canonical before hashing
      const canonical = canonicalize(vote.state);
      const hash = await sha256(canonical);
      
      const existing = stateCounts.get(hash);
      if (existing) {
        existing.count++;
      } else {
        stateCounts.set(hash, { state: vote.state, count: 1, hash });
      }
    }

    // Filter all candidate states that have passed the agreement threshold τ
    const candidates = Array.from(stateCounts.values()).filter(c => c.count >= this.tau);

    if (candidates.length === 0) {
      // Validity failure: No state reached majority τ
      return { winner: null, votes: 0, total: votes.length, threshold: this.tau, isSymmetricTie: false };
    }

    if (candidates.length === 1) {
      // Ideal case: Unambiguous majority
      return { 
        winner: candidates[0].state, 
        votes: candidates[0].count, 
        total: votes.length, 
        threshold: this.tau, 
        isSymmetricTie: false,
        winnerHash: candidates[0].hash
      };
    }

    /**
     * ⚖️ MAJORITY SYMMETRY DETECTED (f >= n/2)
     * Two or more conflicting states have reached the threshold τ.
     * 
     * Rule: Path A (HARDEN) - Lexicographical Hash Minimum
     * Every node selects the candidate with the lowest SHA-256 hash.
     * This ensures non-interactive convergence across the entire network.
     */
    console.warn(`Ω-DIRECTIVE: Symmetry Bridge engaged for ${candidates.length} conflicting candidates.`);
    
    // Step: Deterministic Sort by Hash
    candidates.sort((a, b) => a.hash.localeCompare(b.hash));
    
    const absoluteWinner = candidates[0];

    return {
      winner: absoluteWinner.state,
      votes: absoluteWinner.count,
      total: votes.length,
      threshold: this.tau,
      isSymmetricTie: true,
      winnerHash: absoluteWinner.hash
    };
  }

  public setParameters(n: number, tau: number) {
    this.n = n;
    this.tau = tau;
  }
}

export const consensusEngine = new ConsensusEngine();
