import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MonolithProps {
  hue?: number;
  speed?: number;
  frequency?: number;
}

function MonolithItem({ pos, i, hue = 170, speed = 1.0, frequency = 1.0 }: { pos: number[], i: number } & MonolithProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const lineMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime * speed;
    const pulseFreq = frequency * 2;

    if (meshRef.current) {
      const targetScale = hovered ? 1.05 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
    }

    if (materialRef.current) {
      const basePulse = 0.2 + (Math.sin(time * pulseFreq + i * 2) * 0.15);
      const targetIntensity = hovered ? basePulse + 0.8 : basePulse;
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        materialRef.current.emissiveIntensity,
        targetIntensity,
        delta * 10
      );
    }

    if (lineMaterialRef.current) {
      const targetOpacity = hovered ? 0.4 : 0.05 + (Math.sin(time * pulseFreq * 1.5 - i) * 0.04);
      lineMaterialRef.current.opacity = THREE.MathUtils.lerp(
        lineMaterialRef.current.opacity,
        targetOpacity,
        delta * 10
      );
    }
  });

  return (
    <mesh 
      ref={meshRef}
      position={pos as [number, number, number]}
      onPointerOver={(e) => { 
        e.stopPropagation(); 
        setHovered(true); 
        document.body.style.cursor = 'pointer'; 
      }}
      onPointerOut={() => { 
        setHovered(false); 
        document.body.style.cursor = 'auto'; 
      }}
    >
      <boxGeometry args={[4, 15, 4]} />
      <meshStandardMaterial 
        ref={materialRef}
        color="#0a111a" 
        emissive={`hsl(${hue}, 100%, 50%)`} 
        emissiveIntensity={0.2}
        roughness={0.2 + (Math.sin(i) * 0.1)}
        metalness={0.8 + (Math.cos(i) * 0.1)}
      />
      {/* Windows / Tech Lines */}
      <mesh position={[0, 0, 2.01]}>
         <planeGeometry args={[3.8, 14.8]} />
         <meshBasicMaterial 
           ref={lineMaterialRef}
           color={`hsl(${hue}, 100%, 50%)`} 
           transparent 
           opacity={0.05} 
           wireframe 
         />
      </mesh>
    </mesh>
  );
}

export function Monolith({ hue = 170, speed = 1.0, frequency = 1.0 }: MonolithProps) {
  const groupRef = useRef<THREE.Group>(null);

  const positions = useMemo(() => {
    return [
      [-5, -2, -5],
      [5, -2, -8],
      [0, -2, -12]
    ];
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime * speed;
    
    // Slow float for the monolith cluster
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <MonolithItem 
          key={i} 
          pos={pos} 
          i={i} 
          hue={hue} 
          frequency={frequency} 
          speed={speed} 
        />
      ))}
    </group>
  );
}
