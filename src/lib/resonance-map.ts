// resonance-map.ts
// Core Frequency Logic for 167.89 Hz
// Generated from Operator Specification 167.89

export const CORE_FREQUENCY = 167.89;

export interface ResonanceNode {
  hz: number;
  label: string;
  role: string;
  radius: number;
  color: string; // Hex representation of the radial map
  description: string;
}

export const RESONANCE_MAP: Record<string, ResonanceNode> = {
  foundation: {
    hz: 83.945,
    label: "Foundation",
    role: "Kernel",
    radius: 0.1,
    color: "#050a10",
    description: "Ground / pressure / lower anchor"
  },
  core: {
    hz: 167.89,
    label: "Core",
    role: "Active State",
    radius: 0.0,
    color: "#ff3300", // Red center
    description: "Chest / center / stable audible core"
  },
  mirror: {
    hz: 335.78,
    label: "Mirror",
    role: "Synchronization",
    radius: 1.0,
    color: "#ff9900", // Orange
    description: "Clarity / form / intelligibility"
  },
  triad: {
    hz: 503.67,
    label: "Triad",
    role: "Propagation",
    radius: 1.8,
    color: "#ffcc00", // Yellow
    description: "Signal / articulation harmonic"
  },
  envelope: {
    hz: 671.56,
    label: "Envelope",
    role: "Lattice Edge",
    radius: 2.7,
    color: "#33cc33", // Green
    description: "Crown / air / sheen"
  },
  telemetry: {
    hz: 839.45,
    label: "Telemetry",
    role: "High-order sensing",
    radius: 3.7,
    color: "#00ccff", // Cyan
    description: "Filter / data interaction layer"
  },
  threshold: {
    hz: 1007.34,
    label: "Threshold",
    role: "Edge Activation",
    radius: 4.8,
    color: "#0066ff", // Blue
    description: "Dissipation / limit"
  }
};

export const HARMONIC_LADDER = [
  RESONANCE_MAP.core,
  RESONANCE_MAP.mirror,
  RESONANCE_MAP.triad,
  RESONANCE_MAP.envelope,
  RESONANCE_MAP.telemetry,
  RESONANCE_MAP.threshold
];

export const SUBHARMONICS = [
  RESONANCE_MAP.foundation,
  { hz: 41.9725, label: "Sub-Deep", role: "Sub-anchor", radius: 0.2, color: "#020408", description: "Infra-pressure" }
];
