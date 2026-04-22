import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from "react";
import { LatticeScene } from "../components/3d/LatticeScene";
import { CommandInput } from "../components/CommandInput";
import { Notifications } from "../components/Notifications";
import { Badge } from "../components/lattice/Badge";
import { LatticeHUD } from "../components/lattice/LatticeHUD";
import { 
  Camera, 
  Box,
  RefreshCw 
} from "lucide-react";
import { DEFAULT_PLATES, DEFAULT_TRANSITIONS, INFINITY_CORE } from "../lib/nonagram-codex";
import { CORE_HZ } from "../lib/field-engine";

// 1. Code-splitting secondary panels
const TelemetryRail = lazy(() => import("../components/lattice/TelemetryRail"));
const HarmonicBreakdown = lazy(() => import("../components/lattice/HarmonicBreakdown"));
const MetadataOverlay = lazy(() => import("../components/lattice/MetadataOverlay"));

interface ResonanceParams {
  hueShift: number;
  speed: number;
  complexity: number;
  freq: number;
  timestamp: number;
  source: string;
}

export default function LatticePage() {
  // 1. Core Runtime State (Synced from Tuner)
  const [runtimeParams, setRuntimeParams] = useState({
    hue: 170,
    speed: 1.0,
    complexity: 1.0,
    frequency: 1.0 // Normalized to 1.0x CORE_HZ
  });

  // 2. Local Override State (Dashboard Tuning)
  const [localParams, setLocalParams] = useState({
    hue: 170,
    speed: 1.0,
    complexity: 1.0,
    frequency: 1.0,
    isOverridden: false
  });

  const [isSynced, setIsSynced] = useState(false);
  const [currentPlateIdx, setCurrentPlateIdx] = useState(0);
  const [lastLinkTimestamp, setLastLinkTimestamp] = useState(0);
  const [showMetadata, setShowMetadata] = useState(false);

  // 3. Derived Effective Params
  const effectiveParams = useMemo(() => {
    return localParams.isOverridden ? localParams : runtimeParams;
  }, [localParams, runtimeParams]);

  // Nonagram Sequence Animation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPlateIdx(prev => (prev + 1) % DEFAULT_PLATES.length);
    }, 2618);
    return () => clearInterval(timer);
  }, []);

  const activePlate = useMemo(() => DEFAULT_PLATES[currentPlateIdx], [currentPlateIdx]);

  // Sync Listener Logic
  useEffect(() => {
    const LINK_MAX_AGE_MS = 1000;
    const handleSync = () => {
      const stored = localStorage.getItem('lumina-wave-params');
      if (stored) {
        try {
          const payload: ResonanceParams = JSON.parse(stored);
          const age = Date.now() - payload.timestamp;
          if (age < LINK_MAX_AGE_MS && payload.timestamp > lastLinkTimestamp) {
            setRuntimeParams({
              hue: 170 + (payload.hueShift || 0),
              speed: payload.speed ?? 1.0, 
              complexity: (payload.complexity ?? 3) / 3.5,
              frequency: (payload.freq ?? 1.0) / 2
            });
            setIsSynced(true);
            setLastLinkTimestamp(payload.timestamp);
          } else if (age > LINK_MAX_AGE_MS) {
            setIsSynced(false);
          }
        } catch (e) {
          console.error("Sync Error:", e);
        }
      }
    };
    const poll = setInterval(handleSync, 200);
    return () => clearInterval(poll);
  }, [lastLinkTimestamp]);

  // 2. Dynamic import for html2canvas
  const captureScreen = useCallback(async () => {
    const stage = document.getElementById('dashboard-stage');
    if (!stage) return;

    setShowMetadata(true); 
    
    setTimeout(async () => {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(stage, {
          backgroundColor: '#020408',
          scale: 2,
          useCORS: true
        });
        const link = document.createElement('a');
        link.download = `resonance_capture_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } finally {
        setShowMetadata(false);
      }
    }, 100);
  }, []);

  const resetToLive = () => {
    setLocalParams(prev => ({ ...prev, isOverridden: false }));
  };

  const handleCommand = useCallback((action: string, valueStr: string) => {
    const val = parseFloat(valueStr);
    
    if (action === "reset") {
      resetToLive();
      return;
    }

    if (action === "capture") {
      captureScreen();
      return;
    }

    if (isNaN(val)) return;

    setLocalParams(prev => {
      const next = { ...prev, isOverridden: true };
      if (action === "speed") next.speed = val;
      if (action === "freq" || action === "frequency") next.frequency = val / 2;
      if (action === "complexity") next.complexity = val / 3.5;
      if (action === "hue") next.hue = 170 + val;
      return next;
    });
  }, [captureScreen]);

  return (
    <main 
      id="dashboard-stage"
      className="relative h-screen w-full bg-chorus-bg text-white overflow-hidden flex flex-col font-sans"
    >
      {/* 1. TOP RAIL: Runtime Badges & Seals */}
      <nav className="h-14 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-chorus-primary rotate-45 flex items-center justify-center">
              <div className="w-2 h-2 bg-chorus-primary shadow-[0_0_8px_white]" />
            </div>
            <span className="text-sm font-bold tracking-[0.3em] glow-text uppercase">OMEGA_CORE</span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge 
              active={localParams.isOverridden} 
              label="OVERRIDE_ACTIVE" 
              idle="LIVE_SYNC" 
              color={localParams.isOverridden ? "text-amber-400" : "text-emerald-400"}
            />
            <Badge active label="GUARDRAIL: OK" color="text-sky-400" />
            <Badge active={isSynced} label="LINK: ACTIVE" idle="LINK: PASSIVE" color={isSynced ? "text-emerald-400" : "text-white/20"} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.open('/tuner', '_blank')}
            className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors text-[10px] uppercase font-mono tracking-widest text-chorus-primary"
          >
            <RefreshCw className="w-3 h-3" />
            Launch Tuner
          </button>
          <button 
            onClick={captureScreen}
            className="flex items-center gap-2 px-3 py-1 bg-chorus-primary/20 border border-chorus-primary/50 text-chorus-primary rounded-md hover:bg-chorus-primary/30 transition-colors text-[10px] uppercase font-mono tracking-widest"
          >
            <Camera className="w-3 h-3" />
            Capture
          </button>
        </div>
      </nav>

      {/* 2. MAIN STAGE: Visualization & Telemetry */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Lattice Engine (Full Background within stage) */}
        <LatticeScene 
          hue={effectiveParams.hue} 
          speed={effectiveParams.speed} 
          complexity={effectiveParams.complexity} 
          frequency={effectiveParams.frequency}
        />

        <LatticeHUD />

        <Notifications />

        {/* Telemetry Rail (Right) - Deferred via Suspense */}
        <Suspense fallback={null}>
          <TelemetryRail 
            effectiveParams={effectiveParams}
            localParams={localParams}
            setLocalParams={setLocalParams}
            resetToLive={resetToLive}
          />
        </Suspense>

        {/* Burn-in Metadata Overlay (Only visible during capture / state toggle) */}
        <AnimatePresence>
          {showMetadata && (
            <Suspense fallback={null}>
              <MetadataOverlay effectiveParams={effectiveParams} />
            </Suspense>
          )}
        </AnimatePresence>
      </div>

      {/* 3. LOWER RAIL: Stats & Harmoncs */}
      <footer className="relative min-h-[180px] bg-black/60 border-t border-white/5 backdrop-blur-2xl z-20 flex flex-col p-6">
        <div className="flex-1 flex gap-8">
          {/* Harmonic Breakdown - Deferred via Suspense */}
          <Suspense fallback={<div className="flex-1 bg-white/5 animate-pulse rounded" />}>
            <HarmonicBreakdown frequency={effectiveParams.frequency} />
          </Suspense>

          {/* Node detail / current plate */}
          <div className="w-80 flex gap-4">
             <div className="flex-1 bg-white/5 border border-chorus-primary/20 p-3 rounded-lg flex flex-col justify-between">
                <header className="flex justify-between items-center">
                   <div className="text-[9px] font-mono text-chorus-primary uppercase tracking-widest flex items-center gap-1">
                      <Box className="w-3 h-3" /> Active_Plate
                   </div>
                   <div className="w-2 h-2 rounded-full bg-chorus-primary animate-pulse" />
                </header>
                <div className="flex-1 flex flex-col justify-center py-2">
                   <div className="text-xs font-bold tracking-[0.2em] uppercase">{activePlate.name}</div>
                   <div className="text-[9px] text-white/30 mt-1 italic">{activePlate.role}</div>
                </div>
                <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">
                   Mode: {activePlate.stateType} // → {DEFAULT_TRANSITIONS[activePlate.id] === INFINITY_CORE ? "∞" : DEFAULT_TRANSITIONS[activePlate.id]}
                </div>
             </div>
          </div>
        </div>

        {/* Command Interface */}
        <div className="mt-6 flex items-center justify-center relative">
          <CommandInput onCommand={handleCommand} />
          <div className="absolute right-0 flex items-center gap-4 text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">
            <span>167.89 Hz // Stable</span>
            <span>V.8.4_DAS</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

