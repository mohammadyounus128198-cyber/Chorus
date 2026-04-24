import { ProofData } from "../lib/chorus-stack/proof";

export function ExportProofBtn({
  proof
}: {
  proof: ProofData | null;
}) {
  const handleExport = () => {
    if (!proof) return;
    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sabr-hold-proof-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!proof) return null;

  return (
    <button
      onClick={handleExport}
      className="pointer-events-auto px-4 py-2 border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-[10px] uppercase font-mono tracking-[0.2em] transition-colors flex items-center gap-2"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export Proof
    </button>
  );
}
