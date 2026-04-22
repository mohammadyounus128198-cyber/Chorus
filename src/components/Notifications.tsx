import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Info, AlertCircle, CheckCircle } from "lucide-react";

interface Log {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success';
  timestamp: string;
}

export function Notifications() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const messages = [
      "OMEGA_CORE: KERNEL_WARM",
      "SABR_LOOP: 2.618s_CYCLE",
      "NONAGRAM_PLATE: SYNC_VALID",
      "DAN-Ω: EMITTING_PROOFS",
      "MODEL_CHECKER: 0_VIOLATIONS",
      "MFCS_SEAL: LOCKED",
      "V2→V8_ARC: COMPLETE",
      "INVARIANT_03: STABLE",
      "RECURSION_DEPTH: [0]"
    ];

    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      const newLog: Log = {
        id: Math.random().toString(36),
        message: msg,
        type: Math.random() > 0.1 ? 'info' : 'success',
        timestamp: new Date().toLocaleTimeString()
      };
      setLogs(prev => [newLog, ...prev].slice(0, 3));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-[200px] right-[340px] z-50 flex flex-col-reverse gap-2 w-64 pointer-events-none">
      <AnimatePresence>
        {logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/40 backdrop-blur-md border border-white/10 p-2 flex items-center gap-2 border-l-2 border-l-chorus-primary/50"
          >
            {log.type === 'info' ? <Info className="w-3 h-3 text-chorus-primary/70" /> : <CheckCircle className="w-3 h-3 text-chorus-primary/70" />}
            <div className="flex-1">
              <div className="text-[7px] font-mono text-chorus-primary/40 tracking-tighter">{log.timestamp}</div>
              <div className="text-[9px] font-mono text-white/80 tracking-widest">{log.message}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
