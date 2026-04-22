import { KernelMode } from "./types";

export interface Assignment {
  id: string;
  workerId: string;
  taskId: string;
  expiresAt: number;
}

export class AssignmentEngine {
  private assignments: Map<string, Assignment> = new Map();

  public createAssignment(workerId: string, taskId: string, mode: KernelMode): Assignment | null {
    // FROZEN: No reassignment during inverted or extreme stress
    if (mode === 'INVERTED' || mode === 'STRESS') {
      console.warn(`Assignment Engine: Operation Frozen due to mode ${mode}`);
      return null;
    }

    const assignment: Assignment = {
      id: Math.random().toString(36).substring(7),
      workerId,
      taskId,
      expiresAt: Date.now() + (mode === 'THROTTLED' ? 10000 : 60000)
    };

    this.assignments.set(assignment.id, assignment);
    return assignment;
  }

  public getAssignments(): Assignment[] {
    return Array.from(this.assignments.values());
  }
}

export const assignmentEngine = new AssignmentEngine();
