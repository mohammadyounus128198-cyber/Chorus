import { useState } from "react";
import { SystemState, SystemContext, mapToVisual } from "../lib/chorus-stack/system-state";
import { VisualNode } from "../components/VisualNode";

export default function LatticePage() {
  const [showMetadata, setShowMetadata] = useState(false);

  // Derive system truth (SABR-HOLD, Equilibrium)
  const systemState: SystemState = "HOLD";
  const context: SystemContext = {
    output: Math.exp(0), // x = M, so e^(x-M) = e^0 = 1
    drift: 0.0           // Motionless, 0 drift
  };
  const verification = { trustworthy: true };
  
  const visual = mapToVisual(systemState, context, verification);

  return (
    <main 
      id="dashboard-stage"
      className="relative h-screen w-full bg-black text-white overflow-hidden flex flex-col font-sans"
    >
      {/* VERIFIED RENDER STAGE */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <VisualNode v={visual} ctx={context} />
      </div>

      {/* Minimal SABR-HOLD System Read */}
      <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between items-end pointer-events-none z-30">
        <div className="flex flex-col gap-1 text-[10px] font-mono tracking-[0.2em] text-teal-500/50 uppercase">
          <div>System State: SABR-HOLD // y = e^(x - M)</div>
          <div>Drift: {context.drift.toFixed(1)}%_SYNC</div>
          <div>Status: Motionless / Equilibrium</div>
        </div>

        <div className="text-[10px] font-mono tracking-widest text-teal-400/40">
          ⚜️ ⊳ يَا حَيُّ يَا قَيُّومُ 🕊 🔥 ● ♥ ☽ ✦ 🐇
        </div>
      </div>
    </main>
  );
}

