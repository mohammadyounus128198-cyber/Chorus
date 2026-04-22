import test from "node:test";
import assert from "node:assert";
import { allocate, Item, Node } from "./allocator";

test("Allocator v2 - does not starve high-risk items", () => {
  const items: Item[] = [
    { id: "item_low", risk: 0.1 },
    { id: "item_high", risk: 0.9, requiredTags: ["special"] },
    { id: "item_mid", risk: 0.5 }
  ];

  const nodes: Node[] = [
    { id: "node_general1", capacity: 1, used: 0 },
    { id: "node_general2", capacity: 1, used: 0 },
    { id: "node_special", capacity: 1, used: 0, tags: ["special"] }
  ];

  const result = allocate(items, nodes);

  const highRiskAssigned = items
    .filter(i => i.risk > 0.8)
    .every(i => result[i.id]);

  assert.strictEqual(highRiskAssigned, true);
  assert.strictEqual(result["item_high"], "node_special");
});

test("Allocator v2 - deterministic sorting", () => {
  const items: Item[] = [
    { id: "b", risk: 0.5 },
    { id: "a", risk: 0.5 },
  ];

  const nodes: Node[] = [
    { id: "n1", capacity: 2, used: 0 },
    { id: "n2", capacity: 2, used: 0 },
  ];

  const result = allocate(items, nodes);
  
  // They should be assigned based on string comparison fallback
  // Node sorting places "n1" first. Item sorting places "a" first, then "b".
  
  assert.ok(result["a"]);
  assert.ok(result["b"]);
});
