import { motion } from "motion/react";
import { CORE_HZ } from "@/src/lib/field-engine";

interface MetadataOverlayProps {
  effectiveParams: any;
}

export default function MetadataOverlay({ effectiveParams }: MetadataOverlayProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 bottom-14 bg-black/60 backdrop-blur-md p-8 z-30 border-t border-chorus-primary/40 flex justify-between font-mono"
    >
      <div className="space-y-1">
        <div className="text-chorus-primary text-xs tracking-[0.4em] uppercase font-bold">Resonance_Record // {Date.now()}</div>
        <div className="text-[10px] text-white/40 uppercase">Operator Auth: Omega_v8</div>
      </div>
      <div className="grid grid-cols-4 gap-x-12 gap-y-1 text-[10px]">
        <div className="flex justify-between gap-4"><span className="text-white/30">CORE:</span> <span>{(CORE_HZ * effectiveParams.frequency).toFixed(2)} Hz</span></div>
        <div className="flex justify-between gap-4"><span className="text-white/30">DRIVE:</span> <span>{effectiveParams.speed.toFixed(2)}x</span></div>
        <div className="flex justify-between gap-4"><span className="text-white/30">COMPLEXITY:</span> <span>{(effectiveParams.complexity * 10).toFixed(1)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-white/30">HUE:</span> <span>{(effectiveParams.hue - 170).toFixed(0)}°</span></div>
      </div>
    </motion.div>
  );
}
