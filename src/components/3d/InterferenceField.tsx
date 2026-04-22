import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FIXED_SHELLS, CORE_HZ } from "../../lib/field-engine";

const InterferenceShader = {
  uniforms: {
    uTime: { value: 0 },
    uSpeed: { value: 1.0 },
    uFrequency: { value: 0.5 },
    uComplexity: { value: 1.0 },
    uShells: { value: [] as THREE.Vector4[] }, // radius, rel_hz, influence, index
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uFrequency;
    uniform float uComplexity;
    uniform vec4 uShells[6]; 

    void main() {
      float intensity = 0.0;
      float time = uTime * uSpeed;
      float distToCenter = length(vWorldPosition);
      
      // Multi-node interference approximation based on shells
      for(int i = 0; i < 6; i++) {
        float radius = uShells[i].x * 8.0; 
        float relFreq = uShells[i].y;
        
        // Distance to the shell boundary
        float distToShell = abs(distToCenter - radius);
        
        float falloff = exp(-distToShell * 0.4);
        float wave = sin(distToCenter * (2.0 + uFrequency) - time * (relFreq * 5.0) + float(i));
        
        intensity += wave * falloff * (0.5 + uComplexity * 0.5);
      }

      intensity = abs(intensity);
      
      // Color Mapping Logic
      // deep blue = low energy | cyan = stable | white/teal = harmonics | bright cyan = peak core
      vec3 color;
      float normDist = clamp(distToCenter / 40.0, 0.0, 1.0);
      
      if (normDist < 0.1) {
        color = vec3(1.0, 1.0, 1.0); // Peak White Core
      } else if (normDist < 0.3) {
        color = mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.9, 0.8), (normDist - 0.1) / 0.2); // White to Teal
      } else if (normDist < 0.6) {
        color = mix(vec3(0.0, 0.9, 0.8), vec3(0.0, 0.4, 0.9), (normDist - 0.3) / 0.3); // Teal to Blue
      } else {
        color = mix(vec3(0.0, 0.4, 0.9), vec3(0.0, 0.1, 0.4), (normDist - 0.6) / 0.4); // Blue to Deep Blue
      }
      
      // Additive interference impact (cyan/teal pulse)
      color += vec3(0.0, 1.0, 0.8) * pow(intensity, 4.0) * 0.4;

      float alpha = intensity * 0.12 * (1.0 - pow(normDist, 1.5));
      alpha = clamp(alpha, 0.0, 0.15);
      
      gl_FragColor = vec4(color * 0.8, alpha);
    }
  `
};

export function InterferenceField({ speed = 1.0, frequency = 0.5, complexity = 1.0 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(() => {
    const shellData = FIXED_SHELLS.map((s, i) => 
      new THREE.Vector4(s.radius, s.hz / CORE_HZ, 1.0, i)
    );

    return {
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uFrequency: { value: frequency },
      uComplexity: { value: complexity },
      uShells: { value: shellData }
    };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uSpeed.value = speed;
      material.uniforms.uFrequency.value = frequency;
      material.uniforms.uComplexity.value = complexity;
    }
  });

  return (
    <mesh ref={meshRef} scale={[60, 60, 60]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial 
        args={[InterferenceShader]} 
        transparent 
        side={THREE.DoubleSide}
        depthWrite={false}
        uniforms={uniforms}
      />
    </mesh>
  );
}
