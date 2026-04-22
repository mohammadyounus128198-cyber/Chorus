import { ChorusTx } from "./types";
import { sapEngine } from "./sap-engine";
import { kernel } from "./control-kernel";

export class ChorusCore {
  private ledger: ChorusTx[] = [];

  public async processTransaction(payload: any): Promise<boolean> {
    const mode = kernel.getMode();
    
    // Core Governance: Cannot commit if mode is Inverted
    if (mode === 'INVERTED') {
      throw new Error("Chorus Core: Settlement Bridge Inverted - Execution Halted");
    }

    const tx: ChorusTx = {
      id: `tx_${Date.now()}`,
      timestamp: Date.now(),
      payload,
      sig: "0x_LOCAL_AUTH"
    };

    this.ledger.push(tx);
    return true;
  }

  public getLedger(): ChorusTx[] {
    return this.ledger;
  }
}

export const chorusCore = new ChorusCore();
