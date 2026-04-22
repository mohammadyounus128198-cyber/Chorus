import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { LatticeNodes } from "./LatticeNodes";
import { Monolith } from "./Monolith";
import { InterferenceField } from "./InterferenceField";
import { useState } from "react";

interface LatticeSceneProps {
  hue?: number;
  speed?: number;
  complexity?: number;
  frequency?: number;
  autoRotate?: boolean;
}

export function LatticeScene({ hue, speed, complexity, frequency, autoRotate = true }: LatticeSceneProps) {
  const [isInteracting, setIsInteracting] = useState(false);

  return (
    <div className="absolute inset-0 z-0 cursor-move">
      <Canvas gl={{ preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={[0, 8, 30]} fov={60} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          autoRotate={autoRotate && !isInteracting} 
          autoRotateSpeed={0.5}
          makeDefault
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />
        
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 15, 50]} />
        
        <ambientLight intensity={0.02} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#4466ff" />
        <pointLight position={[-10, 5, -5]} intensity={1.5} color="#2244ff" />
        <rectAreaLight width={50} height={50} position={[0, -20, 0]} intensity={1} rotation={[-Math.PI / 2, 0, 0]} color="#000022" />
        
        <LatticeNodes hue={hue} speed={speed} complexity={complexity} frequency={frequency} />
        <InterferenceField speed={speed} frequency={frequency} complexity={complexity} />
        <Monolith hue={hue} speed={speed} frequency={frequency} />
        
        <EffectComposer>
          <Bloom 
            intensity={1.0} 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.8} 
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
