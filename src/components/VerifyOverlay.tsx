import { VisualState, SystemContext } from "../lib/chorus-stack/system-state";

export function VerifyOverlay({ 
  v, 
  ctx, 
  verification,
  hash 
}: { 
  v: VisualState; 
  ctx: SystemContext; 
  verification: { trustworthy: boolean, status?: string, authorityName?: string };
  hash?: string;
}) {
  const isError = v.color !== "teal" || (verification.status === "COMPROMISED");
  const isUntrusted = verification.status === "UNTRUSTED";
  
  if (!isError && !isUntrusted && v.status === "HOLD") return null;

  return (
    <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-lg border p-6 backdrop-blur-md z-40 transition-colors ${
      isError 
        ? "bg-red-500/10 border-red-500/50 text-red-500/90 shadow-[0_0_30px_rgba(239,68,68,0.2)]" 
        : isUntrusted
        ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500/90 shadow-[0_0_30px_rgba(234,179,8,0.1)]"
        : "bg-teal-500/10 border-teal-500/50 text-teal-400/90 shadow-[0_0_30px_rgba(20,184,166,0.1)]"
    }`}>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-sm font-mono tracking-widest uppercase font-bold">
          {isError ? "Verification Failed" : isUntrusted ? "Integrity Warning" : "Verification Active"}
        </h2>
        <div className="text-[10px] font-mono tracking-widest uppercase">
          {v.status}
        </div>
      </div>

      <div className="space-y-2 mt-4 text-xs font-mono opacity-80 flex flex-col gap-1">
        <div className="flex justify-between border-b pb-1 border-current/20">
          <span>Trust Rating</span>
          <span className="flex items-center gap-2">
            {verification.status === "VERIFIED" ? "🟢 VERIFIED" : verification.status === "UNTRUSTED" ? "🟡 UNTRUSTED" : "🔴 COMPROMISED"}
          </span>
        </div>
        <div className="flex justify-between border-b pb-1 border-current/20">
          <span>Identity Root</span>
          <span>{verification.status === "VERIFIED" ? (verification.authorityName || "Ω-SENTINEL-MASTER") : isUntrusted ? "EXTERNAL-SIGNER" : "UNKNOWN"}</span>
        </div>
        <div className="flex justify-between border-b pb-1 border-current/20">
          <span>System Drift</span>
          <span>{ctx.drift.toFixed(3)}%</span>
        </div>
        <div className="flex justify-between border-b pb-1 border-current/20">
          <span>Output Coherence</span>
          <span>{ctx.output.toFixed(4)}</span>
        </div>
        <div className="flex justify-between pt-2">
          <span>Checksum</span>
          <span className="truncate max-w-[200px]">{isError ? "MISMATCH" : (hash ? hash : "WAITING")}</span>
        </div>
      </div>
      
      {isError && (
        <div className="mt-6 text-[10px] uppercase tracking-widest bg-red-500/20 text-red-400 p-2 border border-red-500/30 text-center animate-pulse">
          Invariant Breach Detected. System Halt Recommended.
        </div>
      )}
    </div>
  );
}
