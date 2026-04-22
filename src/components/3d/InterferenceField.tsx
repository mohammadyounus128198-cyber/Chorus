import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HARMONIC_LADDER, RESONANCE_MAP } from "../../lib/resonance-map";

// Custom Shader for Volumetric Interference
const InterferenceShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#00f5d4") },
    uSpeed: { value: 1.0 },
    uFrequency: { value: 0.5 },
    uComplexity: { value: 1.0 },
    uNodes: { value: [] as THREE.Vector4[] }, // x, y, z, influence
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uFrequency;
    uniform float uComplexity;
    uniform vec4 uNodes[7]; // Core + 6 Harmonics

    void main() {
      float intensity = 0.0;
      float time = uTime * uSpeed;
      
      // Calculate Wave Interference from Harmonic Shells
      for(int i = 0; i < 7; i++) {
        vec3 nodePos = uNodes[i].xyz;
        float relFreq = uNodes[i].w; // Ratio to 167.89 Hz
        
        float dist = length(vPosition - nodePos);
        
        // Radial Decay matched to system atmosphere
        float falloff = exp(-dist * 0.12);
        
        // Synchronized Wave Pulse
        // Phase is shifted by shell index to prevent flat interference
        float phase = float(i) * 1.57; 
        float wave = sin(dist * (1.2 + uFrequency) - time * (relFreq * 2.0) + phase);
        
        intensity += wave * falloff * (0.5 + uComplexity * 0.5);
      }

      intensity = abs(intensity);
      
      // Radial Palette Decay (Decoding your Image: Red -> Green -> Blue)
      float distToCenter = length(vPosition);
      float normDist = clamp(distToCenter / 25.0, 0.0, 1.0);
      
      vec3 color;
      if (normDist < 0.2) {
        color = mix(vec3(1.0, 0.1, 0.0), vec3(1.0, 0.6, 0.0), normDist / 0.2); // Core Red->Orange
      } else if (normDist < 0.5) {
        color = mix(vec3(1.0, 0.6, 0.0), vec3(0.2, 0.9, 0.3), (normDist - 0.2) / 0.3); // Orange->Green
      } else {
        color = mix(vec3(0.2, 0.9, 0.3), vec3(0.0, 0.4, 1.0), (normDist - 0.5) / 0.5); // Green->Blue
      }
      
      // Interference highlights (Construction peaks)
      vec3 highlight = vec3(0.8, 1.0, 0.9) * pow(intensity, 4.0) * 0.4;
      color += highlight;

      // Volumetric density / Alpha falloff - Sharper for "Ray-Sampled" look
      float alpha = (intensity * 0.12 + 0.01) * (1.0 - pow(normDist, 1.5));
      alpha = clamp(alpha, 0.0, 0.12);
      
      // Additional noise-based clip to reveal core
      float noiseMask = fract(distToCenter * 0.5 - time * 0.2);
      if (noiseMask > 0.9) alpha *= 0.2;

      gl_FragColor = vec4(color, alpha);
    }
  `
};

export function InterferenceField({ speed = 1.0, frequency = 0.5, complexity = 1.0 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(() => {
    // Flattened node data for shader: [x, y, z, rel_freq]
    // We need exactly 7 nodes: Foundation + Core + 5 Harmonics
    const allResNodes = [RESONANCE_MAP.foundation, ...HARMONIC_LADDER]; 
    const nodeData = allResNodes.slice(0, 7).map(h => 
      new THREE.Vector4(0, 0, 0, h.hz / 167.89)
    );
    
    // Fill remaining if list was shorter than 7
    while(nodeData.length < 7) {
      nodeData.push(new THREE.Vector4(0, 0, 0, 0));
    }

    // Add simple offsets for harmonics to create spatial variation
    nodeData.forEach((vec, i) => {
        if(i > 0) {
            vec.x = Math.sin(i * 1.5) * 10;
            vec.y = Math.cos(i * 1.5) * 10;
            vec.z = Math.sin(i * 0.5) * 5;
        }
    });

    return {
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uFrequency: { value: frequency },
      uComplexity: { value: complexity },
      uNodes: { value: nodeData.slice(0, 7) }
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
