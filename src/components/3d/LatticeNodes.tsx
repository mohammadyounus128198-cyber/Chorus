import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { FIXED_SHELLS, CORE_HZ } from "../../lib/field-engine";

interface LatticeNodesProps {
  hue?: number; 
  speed?: number; 
  complexity?: number; 
  frequency?: number; 
}

function Edges({ nodes, speed, frequency }: { nodes: any[], speed: number, frequency: number }) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    
    // Connect nodes to neighbors in the same shell or adjacent shells
    nodes.forEach((n1, i) => {
      // Connect to a few nearby nodes in the same shell
      let connections = 0;
      for (let j = i + 1; j < nodes.length && connections < 2; j++) {
        const n2 = nodes[j];
        if (n1.shellIdx === n2.shellIdx) {
          const dist = Math.sqrt((n1.x - n2.x)**2 + (n1.y - n2.y)**2 + (n1.z - n2.z)**2);
          if (dist < 4) {
            points.push(new THREE.Vector3(n1.x, n1.y, n1.z));
            points.push(new THREE.Vector3(n2.x, n2.y, n2.z));
            connections++;
          }
        }
      }

      // Connect to parent shell nodes
      if (n1.shellIdx > 0) {
        const parentNodes = nodes.filter(n => n.shellIdx === n1.shellIdx - 1);
        const parent = parentNodes[Math.floor(Math.random() * parentNodes.length)];
        if (parent) {
          points.push(new THREE.Vector3(n1.x, n1.y, n1.z));
          points.push(new THREE.Vector3(parent.x, parent.y, parent.z));
        }
      }
    });

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [nodes]);

  useFrame((state) => {
    if (!lineRef.current) return;
    const time = state.clock.elapsedTime * speed;
    const pulse = 0.1 + Math.sin(time * frequency) * 0.05;
    (lineRef.current.material as THREE.LineBasicMaterial).opacity = pulse;
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#00f5d4" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

export function LatticeNodes({ speed = 1.0, complexity = 1.0, frequency = 0.5 }: LatticeNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const nodes = useMemo(() => {
    const temp = [];
    const pointsPerShell = 32; 

    FIXED_SHELLS.forEach((shell, shellIdx) => {
      const radius = shell.radius * 8; 
      const count = shell.id === 'core' ? 1 : Math.floor(pointsPerShell * complexity * (shellIdx + 0.5));
      
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

    return temp;
  }, [complexity]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const time = state.clock.elapsedTime * speed;
    
    nodes.forEach((n, i) => {
      const freqScalar = (n.hz / CORE_HZ) * frequency;
      const pulse = Math.sin(time * freqScalar + i) * 0.15;
      
      const r = n.originRadius + pulse;
      const x = r * Math.sin(n.phi + time * 0.05) * Math.cos(n.theta + time * 0.02);
      const y = r * Math.sin(n.phi + time * 0.05) * Math.sin(n.theta + time * 0.02);
      const z = r * Math.cos(n.phi + time * 0.05);

      dummy.position.set(x, y, z);
      const scale = n.shellIdx === 0 ? 0.3 : 0.08 + (pulse * 0.05); 
      dummy.scale.setScalar(Math.max(0.01, scale));
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, n.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <Edges nodes={nodes} speed={speed} frequency={frequency} />
      <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]}>
        <sphereGeometry args={[0.08, 12, 12]} /> 
        <meshStandardMaterial 
          emissiveIntensity={4} 
          transparent 
          opacity={0.95}
          metalness={0.8}
          roughness={0.1}
          emissive="#ffffff"
        />
      </instancedMesh>
    </group>
  );
}

