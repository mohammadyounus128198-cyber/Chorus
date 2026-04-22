import { SAPClaim } from "./types";

export class SAPEngine {
  private claims: Map<string, SAPClaim> = new Map();

  public submitClaim(providerId: string, subject: string): SAPClaim {
    const claim: SAPClaim = {
      id: `sap_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      providerId,
      subject,
      status: 'PENDING'
    };
    this.claims.set(claim.id, claim);
    return claim;
  }

  public commitClaim(claimId: string): boolean {
    const claim = this.claims.get(claimId);
    if (!claim) return false;
    
    // Semantic Lock Logic: Terminal states
    if (claim.status !== 'PENDING') return false;

    claim.status = 'COMMITTED';
    return true;
  }

  public getClaims(): SAPClaim[] {
    return Array.from(this.claims.values());
  }
}

export const sapEngine = new SAPEngine();
