import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { GlassHUD } from "../components/GlassHUD";
import { Activity, Zap, Shield, Link as LinkIcon, Link2Off } from "lucide-react";
import { cn } from "../lib/utils";

const LINK_KEY = 'lumina-wave-params';
const LINK_SOURCE = 'resonance-tuner';

export default function TunerPage() {
  const [luminaLinked, setLuminaLinked] = useState(false);
  const [params, setParams] = useState({
    freq: 1.0,
    speed: 1.0,
    complexity: 1.0,
    hueShift: 0
  });

  const lastSentAt = useRef(0);
  const lastSentSig = useRef('');

  useEffect(() => {
    if (!luminaLinked) return;
    
    const now = Date.now();
    const sig = `${params.freq.toFixed(3)}|${params.speed.toFixed(3)}|${params.complexity.toFixed(3)}|${params.hueShift}`;
    
    if (sig === lastSentSig.current && now - lastSentAt.current < 250) return;
    if (now - lastSentAt.current < 33) return; // ~30 Hz max

    lastSentSig.current = sig;
    lastSentAt.current = now;

    const payload = {
      ...params,
      timestamp: Date.now(),
      source: LINK_SOURCE
    };

    try {
      localStorage.setItem(LINK_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Lumina link write failed:', err);
    }
  }, [params, luminaLinked]);

  // Read initial state if available (optional)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LINK_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.source === LINK_SOURCE) {
          setParams({
            freq: parsed.freq ?? 1.0,
            speed: parsed.speed ?? 1.0,
            complexity: parsed.complexity ?? 1.0,
            hueShift: parsed.hueShift ?? 0
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-chorus-bg text-white p-8 font-sans selection:bg-chorus-primary/30">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-8 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-widest text-chorus-primary glow-text uppercase">Resonance Tuner</h1>
            <p className="text-xs text-white/40 uppercase tracking-[0.2em] mt-2">Core Frequency: 167.89 Hz</p>
          </div>
          
          <button
            onClick={() => setLuminaLinked(prev => !prev)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded border font-mono text-xs uppercase tracking-widest transition-all",
              luminaLinked 
                ? "bg-chorus-primary/20 border-chorus-primary text-chorus-primary shadow-[0_0_15px_rgba(0,245,212,0.3)]"
                : "bg-white/5 border-white/20 text-white/50 hover:bg-white/10 hover:text-white"
            )}
          >
            {luminaLinked ? <LinkIcon className="w-4 h-4" /> : <Link2Off className="w-4 h-4" />}
            {luminaLinked ? "Link ACTIVE" : "Link OFFLINE"}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassHUD title="Temporal Pulse (Freq)">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-mono text-white/50">
                <span>0.4 Hz</span>
                <span className="text-chorus-primary">{params.freq.toFixed(2)} Hz</span>
                <span>4.2 Hz</span>
              </div>
              <input 
                type="range" min="0.4" max="4.2" step="0.01"
                value={params.freq}
                onChange={e => setParams(p => ({...p, freq: parseFloat(e.target.value)}))}
                className="w-full accent-chorus-primary hover:accent-chorus-primary/80"
              />
            </div>
          </GlassHUD>

          <GlassHUD title="Drift Rate (Speed)">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-mono text-white/50">
                <span>0.0x</span>
                <span className="text-chorus-primary">{params.speed.toFixed(2)}x</span>
                <span>2.5x</span>
              </div>
              <input 
                type="range" min="0.0" max="2.5" step="0.01"
                value={params.speed}
                onChange={e => setParams(p => ({...p, speed: parseFloat(e.target.value)}))}
                className="w-full accent-chorus-primary hover:accent-chorus-primary/80"
              />
            </div>
          </GlassHUD>

          <GlassHUD title="Spatial Density (Complexity)">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-mono text-white/50">
                <span>1</span>
                <span className="text-chorus-primary">{params.complexity}</span>
                <span>7</span>
              </div>
              <input 
                type="range" min="1" max="7" step="1"
                value={params.complexity}
                onChange={e => setParams(p => ({...p, complexity: parseInt(e.target.value)}))}
                className="w-full accent-chorus-primary hover:accent-chorus-primary/80"
              />
            </div>
          </GlassHUD>

          <GlassHUD title="Chromatic Shift (Hue)">
             <div className="space-y-4">
               <div className="flex justify-between text-xs font-mono text-white/50">
                 <span>-180°</span>
                 <span className="text-chorus-primary">{params.hueShift}°</span>
                 <span>+180°</span>
               </div>
               <input 
                 type="range" min="-180" max="180" step="1"
                 value={params.hueShift}
                 onChange={e => setParams(p => ({...p, hueShift: parseInt(e.target.value)}))}
                 className="w-full h-2 rounded-lg appearance-none bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
               />
             </div>
          </GlassHUD>
        </div>

        {/* Quick Presets */}
        <div className="space-y-4 mt-8 pt-8 border-t border-white/10">
           <h3 className="text-[10px] font-bold uppercase tracking-wider text-chorus-primary glow-text">Quick Overrides</h3>
           <div className="flex flex-wrap gap-4">
             <button 
               onClick={() => setParams({ freq: 1.0, speed: 1.0, complexity: 1, hueShift: 0 })}
               className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 font-mono text-xs transition-colors"
             >
               HARMONIC SYNC
             </button>
             <button 
               onClick={() => setParams({ freq: 4.2, speed: 2.5, complexity: 7, hueShift: 180 })}
               className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 font-mono text-xs transition-colors"
             >
               PEAK PROPAGATION
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}
