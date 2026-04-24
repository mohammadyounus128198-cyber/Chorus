export type CanonicalPayload = {
  principal: number;
  rate: number;
  years: number;
  final: number;
  gain: number;
};

export function canonicalize(data: CanonicalPayload): string {
  // Deterministic JSON by explicitly ordering keys
  return JSON.stringify({
    principal: data.principal,
    rate: data.rate,
    years: data.years,
    final: data.final,
    gain: data.gain
  });
}
