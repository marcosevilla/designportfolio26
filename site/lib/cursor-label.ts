/**
 * Tiny pub/sub for the cursor chat-bubble label (see CustomCursor.tsx).
 * Cells call setCursorLabel on hover; the bubble subscribes. Module
 * state instead of context so deep grid cells don't need a provider.
 */

type Listener = (label: string | null) => void;

let current: string | null = null;
const listeners = new Set<Listener>();

export function setCursorLabel(label: string | null) {
  if (label === current) return;
  current = label;
  listeners.forEach((fn) => fn(label));
}

export function subscribeCursorLabel(fn: Listener) {
  listeners.add(fn);
  fn(current);
  return () => {
    listeners.delete(fn);
  };
}
