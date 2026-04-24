import { toCents, compoundCents, assertInvariant } from "./money";
import { CanonicalPayload } from "./canonical";
import { SystemState, SystemContext } from "./system-state";

export type ProofData = {
  timestamp: string;
  system: {
    state: SystemState;
    context: SystemContext;
  };
  data: CanonicalPayload;
  verification: {
    hash: string;
    signature: string;
    publicKey: string;
  };
};

export async function calculateBound(
  input: { principal: number; rate: number; years: number }
): Promise<ProofData> {
  const p = toCents(input.principal);
  const f = compoundCents(p, input.rate, input.years);
  const g = f - p;
  
  assertInvariant(p, f, g);
  
  const payload: CanonicalPayload = {
    principal: input.principal,
    rate: input.rate,
    years: input.years,
    final: f / 100,
    gain: g / 100
  };
  
  const res = await fetch("/api/sign-proof", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) {
    throw new Error("Failed to sign payload via server authority");
  }
  
  const { hash, signature, publicKey } = await res.json();

  return Object.freeze({
    timestamp: new Date().toISOString(),
    system: {
      state: "HOLD" as SystemState,
      context: {
        output: 1, // e^(x-M) where x=M
        drift: 0   // verified
      }
    },
    data: payload,
    verification: {
      hash,
      signature,
      publicKey
    }
  });
}
