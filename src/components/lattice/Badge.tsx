import { cn } from "@/src/lib/utils";

interface BadgeProps {
  active?: boolean;
  label: string;
  idle?: string;
  color: string;
}

export function Badge({ active = true, label, idle, color }: BadgeProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-[9px] font-mono tracking-widest transition-all",
      active ? `bg-white/5 border-white/10 ${color}` : "bg-white/5 border-white/5 text-white/20"
    )}>
      <div className={cn("w-1 h-1 rounded-full", active ? color.replace('text-', 'bg-') : "bg-white/20")} />
      <span>{active ? label : (idle ?? label)}</span>
    </div>
  );
}
