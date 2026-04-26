export type CanonicalPayload = {
  principal: number;
  rate: number;
  years: number;
  final: number;
  gain: number;
};

/**
 * Deeply canonicalizes an object by sorting keys at every level.
 */
export function canonicalize(obj: any): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalize).join(",") + "]";
  }

  const keys = Object.keys(obj).sort();
  const pairs = keys.map(key => `"${key}":${canonicalize(obj[key])}`);
  return "{" + pairs.join(",") + "}";
}
