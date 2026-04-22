import { FIXED_SHELLS } from "@/src/lib/field-engine";

interface HarmonicBreakdownProps {
  frequency: number;
}

export default function HarmonicBreakdown({ frequency }: HarmonicBreakdownProps) {
  return (
    <div className="flex-1 grid grid-cols-6 gap-2">
      {FIXED_SHELLS.map((h, i) => (
        <div key={i} className="bg-white/5 border border-white/10 p-2 rounded relative group hover:bg-white/10 transition-colors overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
          <div className="text-[8px] font-mono text-white/30 uppercase mb-1">{h.id}</div>
          <div className="text-xs font-bold text-white tracking-widest">{(h.hz * frequency).toFixed(1)}</div>
          <div className="text-[8px] text-white/20 mt-1 uppercase italic">{h.role}</div>
          <div 
            className="absolute bottom-0 right-0 w-12 h-[2px]"
            style={{ backgroundColor: h.color }}
          />
        </div>
      ))}
    </div>
  );
}
