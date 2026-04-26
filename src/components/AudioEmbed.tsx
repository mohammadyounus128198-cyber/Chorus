import { useEffect, useRef, useState } from 'react';
import { Play, Square, Volume2, Code, Download } from 'lucide-react';

const workletCode = `
class D6DriftInjector extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(8192);
    this.writeIndex = 0;
    this.currentDelay = 0; 
    this.isReflected = false;
    this.N = 65.664; // 44100 / 671.6

    this.port.onmessage = (event) => {
      if (event.data.type === 'INJECT_DRIFT') {
        const k = event.data.k; 
        
        // 1. Reflection
        this.isReflected = !this.isReflected;
        
        // 2. Rotation
        this.currentDelay = -this.currentDelay - (k / 6.0) * this.N;
      }
    };
  }

  sinc(x) {
    if (x === 0) return 1.0;
    const px = Math.PI * x;
    return Math.sin(px) / px;
  }

  getFractionalSample(readIndex) {
    let base = Math.floor(readIndex);
    let frac = readIndex - base;
    let sum = 0;
    
    // 4-point windowed-sinc interpolation
    for (let i = -1; i <= 2; i++) {
      let idx = (base + i);
      while (idx < 0) idx += this.buffer.length;
      idx = idx % this.buffer.length;
      
      let x = frac - i;
      // Hann window over exactly the 4 points
      let w = 0.5 * (1.0 + Math.cos(Math.PI * (x - 0.5) / 2.0)); 
      
      sum += this.buffer[idx] * this.sinc(x) * w;
    }
    return sum;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (!input || !input[0] || !output || !output[0]) return true;

    const channelIn = input[0];
    const channelOut = output[0];
    
    for (let i = 0; i < channelIn.length; i++) {
        // Write incoming signal to ring buffer
        this.buffer[this.writeIndex] = channelIn[i];
        
        // Exponential decay towards 0 (HOLD)
        this.currentDelay *= 0.9995; 
        
        // Read from fractional delay pointer
        let readIdx = this.writeIndex - this.currentDelay;
        while (readIdx < 0) readIdx += this.buffer.length;
        
        channelOut[i] = this.getFractionalSample(readIdx);
        
        this.writeIndex = (this.writeIndex + 1) % this.buffer.length;
    }
    
    // Send periodic updates
    if (this.writeIndex % 512 === 0) {
        this.port.postMessage({ type: 'STATUS', delay: this.currentDelay });
    }
    
    return true;
  }
}

registerProcessor('d6-drift-injector', D6DriftInjector);
`;

export function AudioEmbed() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(40);
  const [currentDelay, setCurrentDelay] = useState(0);
  const [showCode, setShowCode] = useState(false);
  
  const audioRef = useRef<{
    ctx: AudioContext;
    osc: OscillatorNode;
    worklet: AudioWorkletNode;
    gain: GainNode;
    analyser: AnalyserNode;
    dataArray: Uint8Array;
  } | null>(null);
  const frameRef = useRef<number>(0);
  
  const FREQ = 671.6;

  const initAudio = async () => {
    if (!audioRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      
      const worklet = new AudioWorkletNode(ctx, 'd6-drift-injector', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
      });

      worklet.port.onmessage = (e) => {
        if (e.data.type === 'STATUS') {
            setCurrentDelay(e.data.delay);
        }
      };

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const gain = ctx.createGain();
      gain.gain.value = 0;
      
      worklet.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);
      
      audioRef.current = { ctx, osc: null as any, worklet, gain, analyser, dataArray };
    }
  };

  const getGainValue = (vol: number) => {
    const v = vol / 100;
    return v * v * 0.4;
  };

  const start = async () => {
    await initAudio();
    const { ctx, gain, worklet } = audioRef.current!;
    if (ctx.state === 'suspended') await ctx.resume();

    if (audioRef.current?.osc) {
      try { audioRef.current.osc.stop(); } catch(e) {}
      audioRef.current.osc.disconnect();
    }

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(FREQ, ctx.currentTime);
    
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(getGainValue(volume), ctx.currentTime + 0.05);

    osc.connect(worklet);
    osc.start();

    audioRef.current!.osc = osc;
    setIsPlaying(true);
  };

  const stop = () => {
    if (!isPlaying || !audioRef.current) return;
    const { ctx, gain, osc } = audioRef.current;
    
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);

    setTimeout(() => {
      if (osc) {
        try { osc.stop(); } catch(e) {}
        osc.disconnect();
        if (audioRef.current) audioRef.current.osc = null as any;
      }
    }, 100);

    setIsPlaying(false);
  };

  const toggle = () => isPlaying ? stop() : start();

  const injectDrift = () => {
    if (audioRef.current?.worklet) {
        const k = Math.floor(Math.random() * 5) + 1; // Random D6 shift
        audioRef.current.worklet.port.postMessage({ type: 'INJECT_DRIFT', k });
    }
  };

  useEffect(() => {
    if (isPlaying && audioRef.current?.gain) {
        audioRef.current.gain.gain.setTargetAtTime(getGainValue(volume), audioRef.current.ctx.currentTime, 0.1);
    }
  }, [volume, isPlaying]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try { audioRef.current.osc?.stop(); } catch(e) {}
        audioRef.current.ctx.close();
      }
    };
  }, []);

  // Canvas Draw Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx2d.setTransform(1,0,0,1,0,0);
      ctx2d.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      
      ctx2d.clearRect(0, 0, w, h);
      
      ctx2d.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx2d.lineWidth = 1;
      ctx2d.beginPath();
      ctx2d.moveTo(0, h/2);
      ctx2d.lineTo(w, h/2);
      ctx2d.stroke();

      if (isPlaying && audioRef.current) {
        const { analyser, dataArray } = audioRef.current;
        analyser.getByteTimeDomainData(dataArray);
        ctx2d.lineWidth = 2.5;
        
        const isDistorted = Math.abs(currentDelay) > 0.1;
        ctx2d.strokeStyle = isDistorted ? '#fb7185' : '#a5b4fc';
        ctx2d.shadowColor = isDistorted ? 'rgba(244,63,94,0.8)' : 'rgba(99,102,241,0.8)';
        ctx2d.shadowBlur = 16;
        ctx2d.beginPath();
        
        const slice = w / dataArray.length;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          const y = h/2 + v * (h * 0.38);
          if (i === 0) ctx2d.moveTo(x, y);
          else ctx2d.lineTo(x, y);
          x += slice;
        }
        ctx2d.stroke();
        ctx2d.shadowBlur = 0;
      } else {
        ctx2d.lineWidth = 2;
        ctx2d.strokeStyle = 'rgba(113,113,122,0.4)';
        ctx2d.beginPath();
        const cycles = 6;
        const t = Date.now() * 0.001;
        for (let x = 0; x <= w; x += 2) {
          const progress = x / w;
          const y = h/2 + Math.sin(progress * Math.PI * 2 * cycles + t * 1.5) * 28;
          if (x === 0) ctx2d.moveTo(x, y);
          else ctx2d.lineTo(x, y);
        }
        ctx2d.stroke();
      }
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    }
  }, [isPlaying, currentDelay]);

  return (
    <div className="w-full max-w-[400px] bg-[#0e0e12]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden font-sans pointer-events-auto">
      <div className="absolute inset-0 pointer-events-none" />
      
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div>
           <h3 className="text-xl font-bold tracking-tighter bg-gradient-to-b from-white via-indigo-200 to-indigo-300 text-transparent bg-clip-text font-mono drop-shadow-[0_8px_32px_rgba(99,102,241,0.25)]">
             D6DriftEngine
           </h3>
           <p className="text-gray-400 font-medium text-[11px] tracking-wide mt-1">
               {FREQ}Hz / 44.1kHz • 4-pt Sinc
           </p>
        </div>
        <button 
          onClick={() => setShowCode(!showCode)}
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 transition-colors"
          title="C/PY EXPORT toggle"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {showCode ? (
        <div className="relative h-[250px] bg-black/80 rounded-xl border border-white/10 p-4 mb-5 overflow-auto text-[10px] font-mono text-emerald-400 whitespace-pre">
          {workletCode.trim()}
          <button 
             onClick={() => {
                const blob = new Blob([workletCode], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'D6DriftInjector.js';
                a.click();
             }}
             className="sticky bottom-0 left-full mt-4 p-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded shadow backdrop-blur inline-flex justify-center items-center"
             title="Download Source"
          >
             <Download className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <>
          <div className="relative h-[120px] rounded-xl overflow-hidden bg-black/60 border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] mb-5">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none transition-opacity duration-500 ${isPlaying && Math.abs(currentDelay) < 0.1 ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.2),transparent_70%)] pointer-events-none transition-opacity duration-500 ${isPlaying && Math.abs(currentDelay) >= 0.1 ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          <div className="flex flex-col gap-3 relative z-10 mb-4">
             <div className="flex justify-between text-[11px] font-mono tracking-widest text-white/50">
                <span>Phase Shift:</span>
                <span className={Math.abs(currentDelay) >= 0.05 ? "text-rose-400" : "text-emerald-400"}>
                   {currentDelay.toFixed(3)} samples
                </span>
             </div>
             <button 
                onClick={injectDrift}
                disabled={!isPlaying}
                className="w-full h-10 border border-rose-500/30 rounded-xl bg-rose-500/10 text-rose-300 font-mono text-sm tracking-wider hover:bg-rose-500/20 active:bg-rose-500/30 transition-colors disabled:opacity-30"
             >
                INJECT DRIFT (srᵏ)
             </button>
          </div>
        </>
      )}

      <div className="flex gap-3 relative z-10">
        <button 
          onClick={toggle}
          className={`flex-[0_0_auto] flex items-center justify-center gap-2 px-5 h-[56px] rounded-[18px] font-semibold text-white transition-all duration-200 active:scale-95 shadow-[0_10px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] ${
              isPlaying 
              ? 'bg-gradient-to-b from-teal-500 to-teal-600 shadow-teal-500/30' 
              : 'bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-indigo-500/30'
          }`}
        >
          {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span className="text-[15px]">{isPlaying ? 'Stop' : 'Play'}</span>
        </button>

        <div className="flex-1 flex items-center gap-3 px-4 h-[56px] rounded-[18px] bg-black/50 border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
          <Volume2 className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${volume}%, #27272a ${volume}%, #27272a 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}
