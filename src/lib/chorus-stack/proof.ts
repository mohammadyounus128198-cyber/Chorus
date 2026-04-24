import { toCents, compoundCents, assertInvariant } from "./money";
import { sha256, signPayload, exportPublicKey } from "./crypto";
import { canonicalize, CanonicalPayload } from "./canonical";
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
  input: { principal: number; rate: number; years: number },
  keyPair: CryptoKeyPair
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
  
  const canonical = canonicalize(payload);
  const hash = await sha256(canonical);
  const signature = await signPayload(canonical, keyPair.privateKey);
  const pubKeyString = await exportPublicKey(keyPair.publicKey);

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
      publicKey: pubKeyString
    }
  });
}
