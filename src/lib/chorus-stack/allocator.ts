export type Item = {
  id: string;
  risk: number; // higher = more constrained
  requiredTags?: string[];
};

export type Node = {
  id: string;
  capacity: number;
  used: number;
  tags?: string[];
};

export function canAssign(item: Item, node: Node): boolean {
  if (node.used >= node.capacity) return false;
  if (!item.requiredTags?.length) return true;
  return item.requiredTags.every((t) => node.tags?.includes(t));
}

export function slack(node: Node): number {
  return node.capacity - node.used;
}

export function selectNode(item: Item, nodes: Node[]): Node | null {
  const candidates = nodes.filter((n) => canAssign(item, n));
  if (!candidates.length) return null;

  // Separate constrained vs permissive nodes
  const constrained = candidates.filter((n) => slack(n) <= 1);
  const permissive = candidates.filter((n) => slack(n) > 1);

  // Prefer constrained nodes for constrained items
  if (item.risk > 0.7 && constrained.length) {
    return constrained.sort((a, b) => slack(a) - slack(b))[0];
  }

  // Otherwise prefer nodes with more slack (preserve tight ones)
  return permissive.length
    ? permissive.sort((a, b) => slack(b) - slack(a))[0]
    : candidates.sort((a, b) => slack(a) - slack(b))[0];
}

export function allocate(items: Item[], nodes: Node[]): Record<string, string> {
  // Ensure stable sorting to prevent random ordering differences
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const sortedItemsBase = [...items].sort((a, b) => a.id.localeCompare(b.id));

  const itemsSorted = sortedItemsBase.sort((a, b) => {
    // higher risk first
    if (b.risk !== a.risk) return b.risk - a.risk;
    // fewer eligible nodes first (tighter constraint)
    const aOptions = sortedNodes.filter((n) => canAssign(a, n)).length;
    const bOptions = sortedNodes.filter((n) => canAssign(b, n)).length;
    return aOptions - bOptions;
  });

  const assignments: Record<string, string> = {};

  for (const item of itemsSorted) {
    const node = selectNode(item, sortedNodes);
    if (!node) continue;
    node.used += 1;
    assignments[item.id] = node.id;
  }

  return assignments;
}
