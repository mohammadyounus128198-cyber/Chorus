# Chorus + 167.89 Field Engine Manifest

## Overview
This document defines the relationship between the physical/visual resonance engine (167.89 Hz) and the governance layer (Chorus Stack).

### 1. The Harmonic Field Engine (167.89 Hz)
The field engine is a local-first simulation of multi-node resonance interference. It is anchored to a 167.89 Hz Core Frequency, propagating outward through five discrete harmonic shells:

- **Core (167.89 Hz)**: The coherent origin of the field.
- **Mirror (335.78 Hz)**: Synchronization and reflection.
- **Triad (503.67 Hz)**: Harmonic propagation.
- **Envelope (671.56 Hz)**: Spatial bounding.
- **Telemetry (839.45 Hz)**: Data-carrying harmonics.
- **Threshold (1007.34 Hz)**: Edge activation and limit detection.

**Implementation**: `src/lib/field-engine.ts`, `src/components/3d/InterferenceField.tsx`.

### 2. The Chorus Stack
The Chorus Stack is the governance layer that interprets the resonance state and enforces constrained actions. It is deterministic and local-first in this repo.

- **Control Kernel**: Evaluates system stress and contamination. It determines the `KernelMode` (Normal, Throttled, Stress, Inverted, Recovery).
- **Assignment Engine**: Manages task distribution. In Inverted or Stress modes, reassignments are frozen to prevent cascading failures.
- **SAP (Settlement & Attribution Protocol)**: A deterministic state machine for claims. Claims undergo a semantic lock before being committed.
- **RTTS (Real-Time Truth Service)**: Evidence-only scoring. RTTS provides the "Contamination Score" that the Kernel uses for mode evaluation but cannot directly drive governance.
- **Chorus Core**: The central coordination point and ledger of system actions.

**Implementation**: `src/lib/chorus-stack/`.

## Operational Relationship
The Field Engine provides the **physical environment** (resonance, frequency, interference), while the Chorus Stack provides the **interpretive authority** (trust, governance, action). 

In `INVERTED` mode, the field engine's spectral mapping reflects maximum instability (deep red/blue shifts), while the Chorus Core halts all transaction settlements.
