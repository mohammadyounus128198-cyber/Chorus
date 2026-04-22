/**
 * types.ts
 * Shared types for the Chorus Stack
 */

export type KernelMode = 'NORMAL' | 'THROTTLED' | 'STRESS' | 'INVERTED' | 'RECOVERY';

export interface ChorusTx {
  id: string;
  timestamp: number;
  payload: any;
  sig: string;
}

export interface SAPClaim {
  id: string;
  providerId: string;
  subject: string;
  status: 'PENDING' | 'COMMITTED' | 'REJECTED';
}

export interface RTTSEvidence {
  id: string;
  targetId: string;
  score: number; // 0-1 contamination score
  notations: string[];
}

export interface ModeState {
  current: KernelMode;
  since: number;
  reason?: string;
}
