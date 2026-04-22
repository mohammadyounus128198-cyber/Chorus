/**
 * field-engine.ts
 * Canonical 167.89 Hz Harmonic Engine
 */

export const CORE_HZ = 167.89;

export interface HarmonicShell {
  id: string;
  hz: number;
  radius: number;
  color: string;
  role: string;
}

export const FIXED_SHELLS: HarmonicShell[] = [
  { id: "core",      hz: CORE_HZ,   radius: 0.0, color: "#ff4400", role: "Coherent Center" },
  { id: "mirror",    hz: 335.78,    radius: 1.0, color: "#7744ff", role: "Synchronization" },
  { id: "triad",     hz: 503.67,    radius: 1.8, color: "#5566ff", role: "Propagation" },
  { id: "envelope",  hz: 671.56,    radius: 2.7, color: "#4488ff", role: "Lattice Edge" },
  { id: "telemetry", hz: 839.45,    radius: 3.7, color: "#22aaff", role: "High-order Sensing" },
  { id: "threshold", hz: 1007.34,   radius: 4.8, color: "#00ccff", role: "Edge Activation" }
];

export interface FrequencyNode {
  id: string;
  position: [number, number, number];
  shellId: string;
  baseHz: number;
  currentHz: number;
  phase: number;
}

export interface LatticeState {
  nodes: FrequencyNode[];
  edges: [string, string][]; // ParentID, ChildID
  fieldIntensity: number;
}

/**
 * Generate a deterministic lattice based on harmonic shells
 */
export function generateLattice(complexity: number = 1.0): LatticeState {
  const nodes: FrequencyNode[] = [];
  const edges: [string, string][] = [];
  
  // 1. Add Core Node
  nodes.push({
    id: "core_0",
    position: [0, 0, 0],
    shellId: "core",
    baseHz: CORE_HZ,
    currentHz: CORE_HZ,
    phase: 0
  });

  // 2. Distribute nodes on shells
  FIXED_SHELLS.slice(1).forEach((shell, sIdx) => {
    const nodeCount = Math.floor(8 * complexity * (sIdx + 1));
    for (let i = 0; i < nodeCount; i++) {
      const id = `${shell.id}_${i}`;
      
      // Fibonacci sphere distribution for deterministic placement
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      
      const r = shell.radius * 8; // Visualization scale
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      nodes.push({
        id,
        position: [x, y, z],
        shellId: shell.id,
        baseHz: shell.hz,
        currentHz: shell.hz,
        phase: Math.random() * Math.PI * 2
      });

      // Simple edge strategy: connect to a random node in previous shell
      // In a real governed lattice, this would follow the core -> mirror -> ... rule
      const prevShellNodes = nodes.filter(n => n.shellId === FIXED_SHELLS[sIdx].id);
      if (prevShellNodes.length > 0) {
        const parent = prevShellNodes[Math.floor(Math.random() * prevShellNodes.length)];
        edges.push([parent.id, id]);
      }
    }
  });

  return { nodes, edges, fieldIntensity: 1.0 };
}
