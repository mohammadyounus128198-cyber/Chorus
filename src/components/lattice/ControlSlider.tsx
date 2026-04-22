interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

export function ControlSlider({ label, value, min, max, onChange }: ControlSliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono text-white/50">
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={0.01} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-chorus-primary h-1 bg-white/10 rounded-lg cursor-pointer transition-all"
      />
    </div>
  );
}
