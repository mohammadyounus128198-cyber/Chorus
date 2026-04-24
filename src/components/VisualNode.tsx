import { VisualState } from "../lib/chorus-stack/system-state";

export function VisualNode({ v, ctx }: { v: VisualState, ctx: any }) {
  // Enforce invariant
  if (v.intensity !== Math.min(1, Math.max(0, ctx.output))) {
    throw new Error("Visual mismatch");
  }

  return (
    <div
      style={{
        width: 120 + v.radius * 20,
        height: 120 + v.radius * 20,
        borderRadius: "50%",
        background:
          v.color === "teal"
            ? "#14b8a6"
            : v.color === "amber"
            ? "#f59e0b"
            : "#ef4444",
        opacity: v.intensity,
        margin: "40px auto",
        transition: "all 200ms ease"
      }}
    />
  );
}
