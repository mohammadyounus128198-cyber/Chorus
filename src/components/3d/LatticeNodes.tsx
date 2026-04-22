import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { HARMONIC_LADDER, RESONANCE_MAP } from "../../lib/resonance-map";

interface LatticeNodesProps {
  hue?: number; // 0-360 (base shift)
  speed?: number; // 0.1 - 5.0
  complexity?: number; // 0.1 - 2.0
  frequency?: number; // 0-1
}

export function LatticeNodes({ hue = 170, speed = 1.0, complexity = 1.0, frequency = 0.5 }: LatticeNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Create nodes distributed across harmonic shells
  const nodes = useMemo(() => {
    const temp = [];
    const pointsPerShell = 50; 

    HARMONIC_LADDER.forEach((shell, shellIdx) => {
      const radius = shell.radius * 5; // Scale radius for visibility
      const count = Math.floor(pointsPerShell * complexity);
      
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        temp.push({ 
          x, y, z, 
          originRadius: radius,
          phi,
          theta,
          hz: shell.hz,
          color: new THREE.Color(shell.color),
          shellIdx
        });
      }
    });

    // Add Core Node specifically
    temp.push({
      x: 0, y: 0, z: 0,
      originRadius: 0,
      phi: 0, theta: 0,
      hz: RESONANCE_MAP.core.hz,
      color: new THREE.Color(RESONANCE_MAP.core.color),
      shellIdx: -1
    });

    return temp;
  }, [complexity]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const time = state.clock.elapsedTime * speed;
    
    nodes.forEach((n, i) => {
      // Oscillation speed tied to real frequency (scaled down for stability)
      const freqScalar = (n.hz / 167.89) * frequency;
      const pulse = Math.sin(time * freqScalar + i) * 0.2;
      
      // Floating motion on the shell
      const r = n.originRadius + pulse;
      const x = r * Math.sin(n.phi + time * 0.1) * Math.cos(n.theta + time * 0.05);
      const y = r * Math.sin(n.phi + time * 0.1) * Math.sin(n.theta + time * 0.05);
      const z = r * Math.cos(n.phi + time * 0.1);

      dummy.position.set(x, y, z);
      const scale = 0.05 + (pulse * 0.1); 
      dummy.scale.setScalar(Math.max(0.01, scale));
      
      // Rotate node based on identity
      dummy.rotation.x = time * 0.2;
      dummy.rotation.y = time * 0.3;
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, n.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]}>
        <boxGeometry args={[1, 1, 1]} /> 
        <meshStandardMaterial 
          emissiveIntensity={2} 
          transparent 
          opacity={0.8}
          metalness={1}
          roughness={0}
        />
      </instancedMesh>
    </group>
  );
}

