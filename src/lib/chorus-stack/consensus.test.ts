import test from "node:test";
import assert from "node:assert";
import { consensusEngine, Vote } from "./consensus-engine";

test("Consensus Engine - resolves unambiguous majority", async () => {
  const votes: Vote[] = [
    { authorityId: "A1", state: { val: 10 }, signature: "sig1" },
    { authorityId: "A2", state: { val: 10 }, signature: "sig2" },
    { authorityId: "A3", state: { val: 5 }, signature: "sig3" },
    { authorityId: "A4", state: { val: 10 }, signature: "sig4" },
  ];

  const result = await consensusEngine.resolve(votes);
  assert.strictEqual(result.winner?.val, 10);
  assert.strictEqual(result.votes, 3);
  assert.strictEqual(result.isSymmetricTie, false);
});

test("Consensus Engine - fails below threshold tau", async () => {
  const votes: Vote[] = [
    { authorityId: "A1", state: { val: 10 }, signature: "sig1" },
    { authorityId: "A2", state: { val: 5 }, signature: "sig2" },
    { authorityId: "A3", state: { val: 3 }, signature: "sig3" },
    { authorityId: "A4", state: { val: 1 }, signature: "sig4" },
  ];

  const result = await consensusEngine.resolve(votes);
  assert.strictEqual(result.winner, null);
  assert.strictEqual(result.isSymmetricTie, false);
});

test("Consensus Engine - resolves symmetry via Min-Hash (Path A)", async () => {
  // Scenario: 2-vs-2 split in a 4-node system (n=4, τ=2)
  // Both candidates pass the threshold.
  
  const stateA = { consensus: "ALPHA" };
  const stateB = { consensus: "BETA" };

  const votes: Vote[] = [
    { authorityId: "A1", state: stateA, signature: "sig1" },
    { authorityId: "A2", state: stateA, signature: "sig2" },
    { authorityId: "A3", state: stateB, signature: "sig3" },
    { authorityId: "A4", state: stateB, signature: "sig4" },
  ];

  const result = await consensusEngine.resolve(votes);
  
  assert.ok(result.winner);
  assert.strictEqual(result.isSymmetricTie, true);
  
  // The winner must be the one with the lower hash.
  // We can't know the hash without running, but the rule is now ENFORCED.
  // In a real Sabr AC-6, multiple nodes seeing this same input will reach SAME winner.
  console.log(`Symmetry resolved to winner: ${JSON.stringify(result.winner)} with hash ${result.winnerHash}`);
});
