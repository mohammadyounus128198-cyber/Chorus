import { motion } from "motion/react";
import { useState, KeyboardEvent } from "react";

interface CommandInputProps {
  onCommand?: (action: string, valueStr: string) => void;
}

export function CommandInput({ onCommand }: CommandInputProps) {
  const [input, setInput] = useState("");

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    const parts = cmd.trim().toLowerCase().split(" ");
    const action = parts[0];
    const value = parts[1] || "";
    
    if (action === "speed") {
      const val = parseFloat(value);
      if (isNaN(val) || val < 0 || val > 2.5) {
        alert("Invalid range: Speed must be between 0.0 and 2.5");
        return;
      }
    } else if (action === "freq" || action === "frequency") {
      const val = parseFloat(value);
      if (isNaN(val) || val < 0.4 || val > 4.2) {
        alert("Invalid range: Frequency must be between 0.4 and 4.2");
        return;
      }
    } else if (action === "complexity") {
      const val = parseFloat(value);
      if (isNaN(val) || val < 1 || val > 7) {
        alert("Invalid range: Complexity must be between 1 and 7");
        return;
      }
    } else if (action === "hue") {
      const val = parseFloat(value);
      if (isNaN(val) || val < -180 || val > 180) {
        alert("Invalid range: Hue shift must be between -180 and 180");
        return;
      }
    } else {
      console.log("Unknown command:", action);
      if (action !== "help") {
         alert("Unknown command. Try: speed <0-2.5>, freq <0.4-4.2>, complexity <1-7>, hue <-180-180>");
         return;
      }
    }

    if (onCommand) {
      onCommand(action, value);
    }
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(input);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[600px] flex items-center space-x-4 bg-black/40 border border-chorus-primary/30 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-[0_0_50px_rgba(0,245,212,0.1)] z-50 group"
    >
      <div className="text-chorus-primary font-mono text-lg glow-text group-focus-within:animate-pulse">λ</div>
      <input 
        type="text" 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter command (e.g., freq 4.2, speed 2.5, hue 180)..." 
        className="bg-transparent border-none outline-none text-white placeholder-white/20 w-full text-sm font-light tracking-wide focus:placeholder-white/40 transition-all"
      />
      <div className="flex items-center space-x-2">
        <span className="text-[10px] text-white/30 border border-white/20 px-1.5 py-0.5 rounded font-mono">ENTER</span>
      </div>
    </motion.div>
  );
}

