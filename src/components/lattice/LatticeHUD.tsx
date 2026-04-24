import { motion } from "motion/react";
import { CORE_HZ } from "@/src/lib/field-engine";

export function LatticeHUD() {
  return (
    <div className="absolute inset-x-0 top-0 p-8 flex flex-col gap-4 pointer-events-none z-30 font-mono tracking-widest uppercase">
      {/* Top Left Labels */}
      <div className="flex flex-col gap-2 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-sky-950/40 backdrop-blur-md border border-sky-400/30 px-6 py-2 rounded-full text-[10px] text-sky-300"
        >
          Harmonic Lattice / {CORE_HZ} Field
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-5 rounded-2xl flex flex-col gap-2"
        >
          <div className="text-sm font-bold text-white">{CORE_HZ} Hz</div>
          <div className="text-[10px] text-white/40 tracking-[0.4em]">
            281 Nodes / Scan Mode
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, valueColor = "text-white" }: { label: string, value: string, valueColor?: string }) {
  return (
    <div className="flex justify-between items-end border-b border-white/5 pb-1 last:border-0">
      <span className="text-[10px] text-white/40 font-mono tracking-[0.2em]">{label}</span>
      <span className={`text-xs font-bold tracking-widest ${valueColor}`}>{value}</span>
    </div>
  );
}
