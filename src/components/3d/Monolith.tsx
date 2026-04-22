import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Float } from "@react-three/drei";

interface SignalScaffoldProps {
  hue?: number;
  speed?: number;
  frequency?: number;
}

export function Monolith({ hue = 170, speed = 1.0, frequency = 1.0 }: SignalScaffoldProps) {
  const cubeRef = useRef<THREE.Mesh>(null);
  const icosaRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime * speed;
    
    if (cubeRef.current) {
      cubeRef.current.rotation.y = time * 0.2;
      cubeRef.current.rotation.z = time * 0.1;
    }
    
    if (icosaRef.current) {
      icosaRef.current.rotation.y = -time * 0.4;
      icosaRef.current.scale.setScalar(1 + Math.sin(time * frequency * 2) * 0.1);
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.5;
      ring1Ref.current.rotation.y = time * 0.3;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 0.4;
      ring2Ref.current.rotation.z = time * 0.6;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Outer Wireframe Cube */}
        <mesh ref={cubeRef}>
          <boxGeometry args={[14, 14, 14]} />
          <meshStandardMaterial 
            wireframe 
            color="#0066ff" 
            emissive="#0044ff" 
            emissiveIntensity={1}
            transparent
            opacity={0.05}
          />
        </mesh>

        {/* Inner Coherent Core */}
        <mesh ref={icosaRef}>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial 
            color="#ff6600" 
            emissive="#ff4400" 
            emissiveIntensity={8}
            metalness={1}
            roughness={0}
          />
        </mesh>

        {/* Orbital Rings */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[2.5, 0.02, 16, 100]} />
          <meshBasicMaterial color={`hsl(${hue}, 50%, 80%)`} transparent opacity={0.5} />
        </mesh>
        
        <mesh ref={ring2Ref}>
          <torusGeometry args={[3.2, 0.015, 16, 100]} />
          <meshBasicMaterial color={`hsl(${hue + 40}, 50%, 80%)`} transparent opacity={0.3} />
        </mesh>

        {/* Glow point */}
        <pointLight intensity={2} distance={10} color={`hsl(${hue}, 100%, 50%)`} />
      </Float>
    </group>
  );
}
