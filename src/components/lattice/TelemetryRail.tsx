import { Cpu, Gauge, Activity, Layers, RotateCcw, Sliders, RefreshCw } from "lucide-react";
import { MetricItem } from "./MetricItem";
import { ControlSlider } from "./ControlSlider";
import { CORE_HZ } from "@/src/lib/field-engine";

interface TelemetryRailProps {
  effectiveParams: any;
  localParams: any;
  setLocalParams: React.Dispatch<React.SetStateAction<any>>;
  resetToLive: () => void;
}

export default function TelemetryRail({ 
  effectiveParams, 
  localParams, 
  setLocalParams, 
  resetToLive 
}: TelemetryRailProps) {
  return (
    <aside className="absolute right-0 top-0 bottom-0 w-80 border-l border-white/5 bg-black/20 backdrop-blur-sm z-10 flex flex-col p-6 space-y-6">
      <header className="flex justify-between items-center pb-2 border-b border-white/10">
        <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/50 flex items-center gap-2">
          <Cpu className="w-3 h-3" /> System Metrics
        </h2>
        <div className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">STABLE</div>
      </header>

      <div className="space-y-4 flex-1">
        <MetricItem 
          label="Core Potential" 
          value={`${(CORE_HZ * effectiveParams.frequency).toFixed(2)} Hz`} 
          percent={effectiveParams.frequency * 50}
          icon={Gauge}
        />
        <MetricItem 
          label="Drive Multiplier" 
          value={`${effectiveParams.frequency.toFixed(2)}x`} 
          percent={effectiveParams.frequency * 25}
          icon={Activity}
        />
        <MetricItem 
          label="Field Complexity" 
          value={`${(effectiveParams.complexity * 10).toFixed(1)}`} 
          percent={effectiveParams.complexity * 50}
          icon={Layers}
        />
        <MetricItem 
          label="Hue Translation" 
          value={`${(effectiveParams.hue - 170).toFixed(0)}°`} 
          percent={(effectiveParams.hue - 170 + 180) / 3.6}
          icon={RotateCcw}
        />
      </div>

      {/* Controls Detail */}
      <div className="space-y-3 pt-6 border-t border-white/10">
        <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Sliders className="w-3 h-3" /> Local Controls
        </div>
        
        <ControlSlider 
          label="Freq" 
          value={effectiveParams.frequency} 
          min={0.1} max={4.0} 
          onChange={(v) => {
            setLocalParams((p: any) => ({ ...p, frequency: v, isOverridden: true }));
          }} 
        />
         <ControlSlider 
          label="Speed" 
          value={effectiveParams.speed} 
          min={0} max={2.5} 
          onChange={(v) => {
            setLocalParams((p: any) => ({ ...p, speed: v, isOverridden: true }));
          }} 
        />
        
        {localParams.isOverridden && (
          <button 
            onClick={resetToLive}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center justify-center gap-2 text-[10px] font-mono tracking-widest transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Reset to Live
          </button>
        )}
      </div>
    </aside>
  );
}
