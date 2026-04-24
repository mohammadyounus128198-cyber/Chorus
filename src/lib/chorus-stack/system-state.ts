export type SystemState = "HOLD" | "ACTIVE" | "VERIFYING" | "ERROR";

export type SystemContext = {
  output: number; // e^(x-M)
  drift: number;  // deviation
};

export type VisualState = {
  intensity: number;     // 0-1 (from output)
  radius: number;        // from drift
  color: "teal" | "amber" | "red";
  status: SystemState;
};

export function mapToVisual(
  state: SystemState,
  ctx: SystemContext,
  verification?: { trustworthy: boolean }
): VisualState {
  return {
    intensity: Math.min(1, Math.max(0, ctx.output)), 
    radius: ctx.drift,                  
    color:
      state === "ERROR" ? "red" :
      verification && !verification.trustworthy ? "amber" :
      "teal",
    status: state
  };
}
