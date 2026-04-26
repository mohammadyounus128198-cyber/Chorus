/**
 * Ω-DIRECTIVE AUTHORITY REGISTRY
 * Maps public keys to trusted Sentinel identities.
 */

export type AuthorityStatus = "ACTIVE" | "REVOKED" | "ROTATED" | "EXPIRED" | "UNKNOWN";

export interface Authority {
  id: string;
  name: string;
  role: string;
  trustScore: number;
  status: AuthorityStatus;
  expiresAt?: number; // Epoch timestamp
}

const AUTHORITIES: Record<string, Authority> = {
  // Sentinel Master Authority (Master Root - Ω)
  "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7p6lB9n1V6y/yS8Z6q6X6vP9Ym8P8p8u8w7e8r6q6X6vP9Ym8P8p8u8w7e8r6q6w8p6lB9n1V6y/yS8Z6q6w==": {
    id: "SENTINEL-MASTER",
    name: "Master Authority (Ω)",
    role: "Root Trust Provider",
    trustScore: 1.0,
    status: "ACTIVE",
    expiresAt: 4070908800000 // 2099
  },
  // Alpha Protocol Signer (Current Epoch)
  "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7p6lB9n1V6y/yS8Z6q6w8p6lB9n1V6y/yS8Z6q6w8p6lB9n1V6y/yS8Z6q6w==": {
    id: "SENTINEL-01",
    name: "Sentinel-01",
    role: "Regional Validator",
    trustScore: 0.98,
    status: "ACTIVE",
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 // Valid for 1 week
  },
  // Compromised Key Example
  "REvOkED_K3y_PhAnToM_SiGnEr_vX_001": {
    id: "PHANTOM-NODE",
    name: "Ghost Node (Shadow)",
    role: "Legacy Relay",
    trustScore: 0.0,
    status: "REVOKED"
  }
};

export function classifyAuthority(publicKey: string): AuthorityStatus {
  const auth = AUTHORITIES[publicKey];
  if (!auth) return "UNKNOWN";
  if (auth.status === "REVOKED") return "REVOKED";
  if (auth.status === "ROTATED") return "ROTATED";
  if (auth.expiresAt && Date.now() > auth.expiresAt) return "EXPIRED";
  return "ACTIVE";
}

export function isKeyExpired(publicKey: string): boolean {
  return classifyAuthority(publicKey) === "EXPIRED";
}

export function getAuthority(publicKey: string): Authority | null {
  return AUTHORITIES[publicKey] || null;
}

export function isTrustedIssuer(publicKey: string): boolean {
  return classifyAuthority(publicKey) === "ACTIVE";
}
