import { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCw, FlipHorizontal, RotateCcw } from 'lucide-react';

export function SymmetryVisualizer() {
  const [labels, setLabels] = useState([0, 1, 2, 3, 4, 5]);

  const applyR = () => {
    setLabels(prev => {
      const next = [...prev];
      for (let i = 0; i < 6; i++) next[i] = prev[(i + 5) % 6];
      return next;
    });
  };

  const applyS = () => {
    setLabels(prev => {
      const next = [...prev];
      next[0] = prev[0];
      next[1] = prev[5];
      next[2] = prev[4];
      next[3] = prev[3];
      next[4] = prev[2];
      next[5] = prev[1];
      return next;
    });
  };

  const reset = () => setLabels([0, 1, 2, 3, 4, 5]);

  // Point-up hexagon: Top is i=0
  const getPos = (i: number) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const radius = 90;
    return {
       x: Math.cos(angle) * radius,
       y: Math.sin(angle) * radius
    };
  };

  return (
    <div className="w-full max-w-[320px] bg-[#0e0e12]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden font-sans pointer-events-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold tracking-tight text-white/90">D₆ Symmetry</h3>
        <p className="text-white/40 text-xs font-medium uppercase tracking-widest mt-1">Order 12 Operator</p>
      </div>

      <div className="relative w-[180px] h-[180px] mx-auto mb-6">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <g transform="translate(90, 90)">
            <polygon 
              points={[0,1,2,3,4,5].map(i => `${getPos(i).x},${getPos(i).y}`).join(' ')} 
              fill="none" 
              stroke="rgba(255,255,255,0.06)" 
              strokeWidth="2" 
            />
            {/* s-axis reflection */}
            <line x1="0" y1="-110" x2="0" y2="110" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" className="opacity-60" />
            
            {/* r rotation arrow */}
            <path 
               d="M 50,-75 A 90,90 0 0,1 85,-30" 
               fill="none" 
               stroke="#22c55e" 
               strokeWidth="2" 
               className="opacity-50"
               markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#22c55e" />
              </marker>
            </defs>
          </g>
        </svg>

        <div className="absolute inset-0 pointer-events-none translate-x-[90px] translate-y-[90px]">
          {[0, 1, 2, 3, 4, 5].map(label => {
            const posIndex = labels.indexOf(label);
            const pos = getPos(posIndex);
            
            return (
              <motion.div
                key={label}
                initial={false}
                animate={{ x: pos.x - 16, y: pos.y - 16 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute w-8 h-8 rounded-full bg-white/5 border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none"
              >
                <span className="text-white/80 text-[11px] font-mono font-bold font-sans">Φ{label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={applyR} className="flex-1 py-3 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col items-center gap-1.5 transition-colors group">
          <RotateCw className="w-5 h-5 text-green-400 group-hover:text-green-300 drop-shadow-[0_2px_8px_rgba(34,197,94,0.4)]" />
          <span className="text-[11px] text-white/60 font-mono font-medium">r (60°)</span>
        </button>
        <button onClick={applyS} className="flex-1 py-3 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col items-center gap-1.5 transition-colors group">
          <FlipHorizontal className="w-5 h-5 text-amber-400 group-hover:text-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]" />
          <span className="text-[11px] text-white/60 font-mono font-medium">s (ref)</span>
        </button>
        <button onClick={reset} className="flex-1 py-3 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col items-center gap-1.5 transition-colors">
          <RotateCcw className="w-5 h-5 text-zinc-400" />
          <span className="text-[11px] text-white/60 font-mono font-medium">reset</span>
        </button>
      </div>

      <div className="mt-5 pt-4 border-t border-white/10 text-center flex flex-col gap-1">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          Current Permutation
        </div>
        <div className="text-[12px] font-mono text-indigo-200/80 tracking-widest break-all">
          [{labels.join(', ')}]
        </div>
      </div>
    </div>
  );
}
