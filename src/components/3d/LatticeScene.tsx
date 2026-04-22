import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { LatticeNodes } from "./LatticeNodes";
import { Monolith } from "./Monolith";
import { InterferenceField } from "./InterferenceField";

interface LatticeSceneProps {
  hue?: number;
  speed?: number;
  complexity?: number;
  frequency?: number;
}

export function LatticeScene({ hue, speed, complexity, frequency }: LatticeSceneProps) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas gl={{ preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={[0, 5, 25]} fov={75} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.2}
        />
        
        <color attach="background" args={["#020408"]} />
        <fog attach="fog" args={["#020408", 15, 50]} />
        
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={1} color={`hsl(${hue ?? 170}, 100%, 50%)`} />
        <pointLight position={[-10, 5, -5]} intensity={0.5} color="#0044ff" />
        
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
