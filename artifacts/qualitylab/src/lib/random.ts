/**
 * Generador pseudoaleatorio con semilla (mulberry32).
 *
 * Los datos del caso se generan con semilla fija: todos los participantes de la
 * clase ven exactamente el mismo dataset, en cualquier dispositivo y sesión.
 */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normal estándar por Box–Muller, útil para simular tiempos de proceso. */
export function normal(rand: () => number, mu = 0, sigma = 1): number {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)];
}

export function roundTo(value: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}
