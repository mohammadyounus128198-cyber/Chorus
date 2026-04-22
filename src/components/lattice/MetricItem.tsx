import { motion } from "motion/react";

interface MetricItemProps {
  label: string;
  value: string;
  percent: number;
  icon: any;
}

export function MetricItem({ label, value, percent, icon: Icon }: MetricItemProps) {
  return (
    <div className="space-y-1.5 ring-1 ring-white/5 p-2 rounded hover:ring-white/20 transition-all">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
          <Icon className="w-3 h-3" /> {label}
        </div>
        <div className="text-xs font-bold font-mono text-white">{value}</div>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          className="h-full bg-chorus-primary shadow-[0_0_10px_rgba(0,245,212,0.3)]"
        />
      </div>
    </div>
  );
}
