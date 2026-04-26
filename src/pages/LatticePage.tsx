import { useState, useEffect } from "react";
import { SystemState, SystemContext, mapToVisual } from "../lib/chorus-stack/system-state";
import { VisualNode } from "../components/VisualNode";
import { VerifyOverlay } from "../components/VerifyOverlay";
import { ExportProofBtn } from "../components/ExportProofBtn";
import { AudioEmbed } from "../components/AudioEmbed";
import { SymmetryVisualizer } from "../components/SymmetryVisualizer";
import { calculateBound, ProofData } from "../lib/chorus-stack/proof";
import { isTrustedIssuer, getAuthority } from "../lib/chorus-stack/trust";

export default function LatticePage() {
  const [isErrorMode, setIsErrorMode] = useState(false);
  const [proof, setProof] = useState<ProofData | null>(null);

  const handleCalculate = async () => {
    const p = await calculateBound({ principal: 167.89, rate: 0.05, years: 10 });
    setProof(p);
    setIsErrorMode(false);
  };

  // Derive system truth (SABR-HOLD, Equilibrium)
  const isTrusted = proof ? isTrustedIssuer(proof.verification.publicKey) : true;
  const systemState: SystemState = isErrorMode ? "ERROR" : (proof ? proof.system.state : "HOLD");
  const context: SystemContext = isErrorMode 
    ? { output: 0.3, drift: 4.5 } 
    : (proof ? proof.system.context : { output: 1.0, drift: 0.0 });
    
  // Granular Verification Status
  let verificationLevel: "VERIFIED" | "UNTRUSTED" | "COMPROMISED" = "VERIFIED";
  if (isErrorMode) {
    verificationLevel = "COMPROMISED";
  } else if (proof !== null) {
    if (!isTrusted) {
      verificationLevel = "UNTRUSTED";
    }
  }

  const verification = { 
    trustworthy: verificationLevel === "VERIFIED",
    status: verificationLevel,
    authorityName: proof ? getAuthority(proof.verification.publicKey)?.name : "Ω-SENTINEL-MASTER"
  };
  
  const visual = mapToVisual(systemState, context, verification);

  const toggleState = () => setIsErrorMode(prev => !prev);

  return (
    <main 
      id="dashboard-stage"
      className="relative h-screen w-full bg-black text-white overflow-hidden flex flex-col font-sans"
    >
      <VerifyOverlay v={visual} ctx={context} verification={verification} hash={proof?.verification.hash} />

      {/* NEW: Carrier Visualizer */}
      <div className="absolute top-8 right-8 z-50 pointer-events-none flex flex-col gap-6">
        <AudioEmbed />
        <SymmetryVisualizer />
      </div>

      {/* VERIFIED RENDER STAGE */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <VisualNode v={visual} ctx={context} />
      </div>

      {/* Minimal SABR-HOLD System Read */}
      <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between items-end pointer-events-none z-30">
        <div className="flex flex-col gap-1 text-[10px] font-mono tracking-[0.2em] text-teal-500/50 uppercase">
          <div>System State: {systemState} // y = e^(x - M)</div>
          <div>Drift: {context.drift.toFixed(1)}%_SYNC</div>
          <div>Status: {isErrorMode ? "Desynchronized / Deviation" : "Motionless / Equilibrium"}</div>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleCalculate} 
              className="pointer-events-auto px-3 py-1 bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 text-teal-400 transition-colors disabled:opacity-50"
            >
              Calculate & Bind Data
            </button>
            <button 
              onClick={toggleState} 
              className="pointer-events-auto px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 transition-colors"
            >
              Inject Drift [Test]
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <ExportProofBtn proof={proof} />
          <a href="/verifier" className="px-5 h-[42px] inline-flex items-center justify-center gap-2 text-[11px] font-mono tracking-widest font-bold uppercase rounded border transition-colors bg-[#fb7185]/10 text-[#fb7185] border-[#fb7185]/30 hover:bg-[#fb7185]/20">
            Open Verifier
          </a>
          
          <div className="text-[10px] font-mono tracking-widest text-teal-400/40 mt-2 pointer-events-none">
            ⚜️ ⊳ يَا حَيُّ يَا قَيُّومُ 🕊 🔥 ● ♥ ☽ ✦ 🐇
          </div>
        </div>
      </div>
    </main>
  );
}


