import { KernelMode, ModeState } from "./types";

export class ControlKernel {
  private state: ModeState = {
    current: 'NORMAL',
    since: Date.now()
  };

  public getMode(): KernelMode {
    return this.state.current;
  }

  public evaluate(stressLevel: number, contamination: number): KernelMode {
    let nextMode: KernelMode = 'NORMAL';

    if (contamination > 0.8) {
      nextMode = 'INVERTED';
    } else if (contamination > 0.4) {
      nextMode = 'STRESS';
    } else if (stressLevel > 0.7) {
      nextMode = 'THROTTLED';
    } else if (this.state.current === 'INVERTED' || this.state.current === 'STRESS') {
      nextMode = 'RECOVERY';
    }

    if (nextMode !== this.state.current) {
      this.state = {
        current: nextMode,
        since: Date.now(),
        reason: `Evaluation: Stress=${stressLevel}, Contam=${contamination}`
      };
    }

    return nextMode;
  }

  public isActionAllowed(actionType: string): boolean {
    if (this.state.current === 'INVERTED') return false;
    if (this.state.current === 'STRESS' && actionType === 'SETTLEMENT') return false;
    return true;
  }
}

export const kernel = new ControlKernel();
