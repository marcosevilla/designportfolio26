// site/components/pixel-canvas/primitives/verlet-chain.ts
// Jakobsen-style verlet rope with pinned root node.

export type VerletNode = {
  x: number;
  y: number;
  px: number; // previous x
  py: number; // previous y
  pinned: boolean;
};

export type VerletChain = {
  nodes: VerletNode[];
  segmentLength: number;
  stiffness: number; // 0..1, 1 = fully rigid constraint (applied over multiple iterations)
};

export function createChain(
  rootX: number,
  rootY: number,
  count: number,
  segmentLength: number,
  stiffness = 0.94
): VerletChain {
  const nodes: VerletNode[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: rootX,
      y: rootY + i * segmentLength,
      px: rootX,
      py: rootY + i * segmentLength,
      pinned: i === 0,
    });
  }
  return { nodes, segmentLength, stiffness };
}

export function setRoot(chain: VerletChain, x: number, y: number): void {
  const root = chain.nodes[0];
  root.x = x;
  root.y = y;
  root.px = x;
  root.py = y;
}

// One verlet step: integrate velocity + apply per-node force.
// force: (index, node) => { fx, fy } — e.g. gravity + noise.
export function step(
  chain: VerletChain,
  dt: number,
  force: (i: number, node: VerletNode) => { fx: number; fy: number }
): void {
  // Clamp dt to avoid explosion on tab-switch catch-up
  const d = Math.min(dt, 1 / 30);
  const damping = 0.98;
  for (let i = 0; i < chain.nodes.length; i++) {
    const n = chain.nodes[i];
    if (n.pinned) continue;
    const { fx, fy } = force(i, n);
    const vx = (n.x - n.px) * damping + fx * d * d;
    const vy = (n.y - n.py) * damping + fy * d * d;
    n.px = n.x;
    n.py = n.y;
    n.x += vx;
    n.y += vy;
  }
}

// Constrain each pair to segmentLength. Run multiple iterations for stiffness.
export function constrain(chain: VerletChain, iterations = 4): void {
  for (let k = 0; k < iterations; k++) {
    for (let i = 0; i < chain.nodes.length - 1; i++) {
      const a = chain.nodes[i];
      const b = chain.nodes[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1e-6;
      const diff = (dist - chain.segmentLength) / dist;
      const pull = diff * chain.stiffness * 0.5;
      if (!a.pinned) {
        a.x += dx * pull;
        a.y += dy * pull;
      }
      if (!b.pinned) {
        b.x -= dx * pull;
        b.y -= dy * pull;
      }
    }
  }
}
