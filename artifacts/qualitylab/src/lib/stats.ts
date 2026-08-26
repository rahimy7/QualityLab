/**
 * Estadística didáctica de QualityLab 360.
 *
 * Todas las funciones son puras y sin dependencias: los participantes pueden
 * abrir este archivo y verificar a mano cada fórmula que la plataforma aplica.
 */

/* ------------------------------------------------------------------ */
/* Descriptiva                                                         */
/* ------------------------------------------------------------------ */

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

export function mean(values: number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

/** Desviación estándar muestral (n − 1), la que se usa en mejora continua. */
export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(sum(values.map((v) => (v - m) ** 2)) / (values.length - 1));
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

/** Percentil por interpolación lineal (método inclusivo, igual que Excel). */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const rank = (p / 100) * (s.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return s[low];
  return s[low] + (rank - low) * (s[high] - s[low]);
}

export function range(values: number[]): { min: number; max: number } {
  return { min: Math.min(...values), max: Math.max(...values) };
}

/** Coeficiente de variación en %: cuánta dispersión hay por unidad de media. */
export function coefficientOfVariation(values: number[]): number {
  const m = mean(values);
  return m === 0 ? 0 : (stdDev(values) / m) * 100;
}

export interface Summary {
  n: number;
  mean: number;
  median: number;
  sd: number;
  cv: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
}

export function describe(values: number[]): Summary {
  const { min, max } = values.length ? range(values) : { min: 0, max: 0 };
  return {
    n: values.length,
    mean: mean(values),
    median: median(values),
    sd: stdDev(values),
    cv: coefficientOfVariation(values),
    min,
    max,
    q1: percentile(values, 25),
    q3: percentile(values, 75),
  };
}

/* ------------------------------------------------------------------ */
/* Pareto                                                              */
/* ------------------------------------------------------------------ */

export interface ParetoRow {
  label: string;
  count: number;
  percent: number;
  cumulative: number;
  /** true mientras la categoría pertenece al bloque que explica el 80 %. */
  vital: boolean;
}

/**
 * Ordena categorías de mayor a menor y calcula el acumulado.
 * `cut` (80 por defecto) marca dónde termina el bloque de "pocos vitales".
 */
export function pareto(
  input: Array<{ label: string; count: number }>,
  cut = 80,
): { rows: ParetoRow[]; total: number; vitalCount: number; vitalShare: number } {
  const total = sum(input.map((i) => i.count));
  const sorted = [...input].sort((a, b) => b.count - a.count);

  let running = 0;
  let reached = false;
  const rows: ParetoRow[] = sorted.map((item) => {
    const percent = total === 0 ? 0 : (item.count / total) * 100;
    running += percent;
    // La categoría que cruza el umbral todavía se considera vital: sin ella
    // no se alcanza el 80 %.
    const vital = !reached;
    if (running >= cut) reached = true;
    return { label: item.label, count: item.count, percent, cumulative: running, vital };
  });

  const vital = rows.filter((r) => r.vital);
  return {
    rows,
    total,
    vitalCount: vital.length,
    vitalShare: sum(vital.map((r) => r.percent)),
  };
}

/** Cuenta ocurrencias de un campo y devuelve pares listos para `pareto`. */
export function countBy<T>(items: T[], key: (item: T) => string): Array<{ label: string; count: number }> {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([label, count]) => ({ label, count }));
}

/** Suma un valor (costo, horas) agrupando por categoría. */
export function sumBy<T>(
  items: T[],
  key: (item: T) => string,
  value: (item: T) => number,
): Array<{ label: string; count: number }> {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + value(item));
  }
  return [...map.entries()].map(([label, count]) => ({ label, count }));
}

/* ------------------------------------------------------------------ */
/* Histograma                                                          */
/* ------------------------------------------------------------------ */

export interface Bin {
  from: number;
  to: number;
  label: string;
  count: number;
}

/** Regla de Sturges: k = 1 + 3.322·log10(n), acotada a un rango legible. */
export function sturgesBins(n: number): number {
  if (n <= 1) return 1;
  return Math.min(12, Math.max(5, Math.round(1 + 3.322 * Math.log10(n))));
}

export function histogram(values: number[], binCount?: number): Bin[] {
  if (values.length === 0) return [];
  const k = binCount ?? sturgesBins(values.length);
  const { min, max } = range(values);
  const width = (max - min) / k || 1;
  const bins: Bin[] = Array.from({ length: k }, (_, i) => {
    const from = min + i * width;
    const to = from + width;
    return { from, to, label: `${from.toFixed(1)}–${to.toFixed(1)}`, count: 0 };
  });
  for (const v of values) {
    const idx = Math.min(k - 1, Math.floor((v - min) / width));
    bins[idx].count += 1;
  }
  return bins;
}

/* ------------------------------------------------------------------ */
/* Correlación y regresión                                             */
/* ------------------------------------------------------------------ */

export interface Regression {
  slope: number;
  intercept: number;
  r: number;
  r2: number;
  /** Texto interpretativo listo para mostrar en clase. */
  strength: string;
}

export function linearRegression(points: Array<{ x: number; y: number }>): Regression {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r: 0, r2: 0, strength: 'datos insuficientes' };

  const mx = mean(points.map((p) => p.x));
  const my = mean(points.map((p) => p.y));
  const sxy = sum(points.map((p) => (p.x - mx) * (p.y - my)));
  const sxx = sum(points.map((p) => (p.x - mx) ** 2));
  const syy = sum(points.map((p) => (p.y - my) ** 2));

  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = my - slope * mx;
  const r = sxx === 0 || syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy);

  const abs = Math.abs(r);
  const strength =
    abs >= 0.8 ? 'muy fuerte' : abs >= 0.6 ? 'fuerte' : abs >= 0.4 ? 'moderada' : abs >= 0.2 ? 'débil' : 'prácticamente nula';

  return { slope, intercept, r, r2: r * r, strength };
}

/* ------------------------------------------------------------------ */
/* Control estadístico (carta de individuales I-MR)                    */
/* ------------------------------------------------------------------ */

export interface ControlLimits {
  center: number;
  ucl: number;
  lcl: number;
  sigma: number;
  /** Rango móvil promedio: |x(i) − x(i−1)| promediado. */
  mrBar: number;
}

/**
 * Límites de una carta de individuales.
 * sigma se estima con MR-bar / d2 (d2 = 1.128 para n = 2), NO con la desviación
 * estándar de toda la serie: así los límites reflejan la variación de corto
 * plazo (causas comunes) y no quedan inflados por la tendencia.
 */
export function controlLimits(series: number[], lowerBound = 0): ControlLimits {
  const center = mean(series);
  const movingRanges = series.slice(1).map((v, i) => Math.abs(v - series[i]));
  const mrBar = mean(movingRanges);
  const sigma = mrBar / 1.128;
  return {
    center,
    sigma,
    mrBar,
    ucl: center + 3 * sigma,
    lcl: Math.max(lowerBound, center - 3 * sigma),
  };
}

export type NelsonRule = 1 | 2 | 3 | 5;

export interface Violation {
  index: number;
  rule: NelsonRule;
  message: string;
}

/**
 * Reglas de Nelson que se usan en un módulo introductorio.
 * 1 · un punto fuera de ±3σ
 * 2 · nueve puntos consecutivos del mismo lado de la línea central
 * 3 · seis puntos consecutivos subiendo o bajando
 * 5 · dos de tres puntos consecutivos más allá de 2σ del mismo lado
 */
export function nelsonRules(series: number[], limits: ControlLimits): Violation[] {
  const out: Violation[] = [];
  const { center, sigma, ucl, lcl } = limits;

  series.forEach((v, i) => {
    if (v > ucl || v < lcl) {
      out.push({ index: i, rule: 1, message: 'Punto fuera de los límites de control (±3σ).' });
    }
  });

  let sameSide = 1;
  for (let i = 1; i < series.length; i += 1) {
    const prevSide = Math.sign(series[i - 1] - center);
    const side = Math.sign(series[i] - center);
    sameSide = side !== 0 && side === prevSide ? sameSide + 1 : 1;
    if (sameSide === 9) {
      out.push({ index: i, rule: 2, message: 'Nueve puntos seguidos del mismo lado de la media: el proceso se desplazó.' });
    }
  }

  let trend = 1;
  for (let i = 1; i < series.length; i += 1) {
    const dir = Math.sign(series[i] - series[i - 1]);
    const prevDir = i >= 2 ? Math.sign(series[i - 1] - series[i - 2]) : 0;
    trend = dir !== 0 && dir === prevDir ? trend + 1 : 1;
    if (trend === 6) {
      out.push({ index: i, rule: 3, message: 'Seis puntos consecutivos en la misma dirección: hay una tendencia sostenida.' });
    }
  }

  for (let i = 2; i < series.length; i += 1) {
    const window = [series[i - 2], series[i - 1], series[i]];
    const above = window.filter((v) => v > center + 2 * sigma).length;
    const below = window.filter((v) => v < center - 2 * sigma).length;
    if (above >= 2 || below >= 2) {
      out.push({ index: i, rule: 5, message: 'Dos de tres puntos más allá de 2σ del mismo lado: señal temprana de causa especial.' });
    }
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* Capacidad                                                           */
/* ------------------------------------------------------------------ */

export interface Capability {
  cp: number | null;
  cpk: number;
  verdict: string;
}

export function capability(values: number[], lsl: number | null, usl: number | null): Capability {
  const m = mean(values);
  const s = stdDev(values);
  if (s === 0) return { cp: null, cpk: 0, verdict: 'sin variación medible' };

  const cpu = usl === null ? Infinity : (usl - m) / (3 * s);
  const cpl = lsl === null ? Infinity : (m - lsl) / (3 * s);
  const cpk = Math.min(cpu, cpl);
  const cp = lsl === null || usl === null ? null : (usl - lsl) / (6 * s);

  const verdict =
    cpk >= 1.33 ? 'capaz' : cpk >= 1.0 ? 'marginalmente capaz' : 'no capaz';

  return { cp, cpk, verdict };
}

/* ------------------------------------------------------------------ */
/* Comparación antes / después                                         */
/* ------------------------------------------------------------------ */

export interface BeforeAfter {
  before: Summary;
  after: Summary;
  absoluteChange: number;
  /** Variación relativa en %: negativa cuando el indicador baja. */
  relativeChange: number;
  t: number;
  df: number;
  pValue: number;
  significant: boolean;
  /** Diferencia estandarizada (d de Cohen) sobre la desviación combinada. */
  cohensD: number;
}

/**
 * Prueba t de Welch para dos muestras independientes (no asume varianzas
 * iguales, que es lo habitual cuando un proceso mejora y además se estabiliza).
 */
export function compareBeforeAfter(before: number[], after: number[], alpha = 0.05): BeforeAfter {
  const b = describe(before);
  const a = describe(after);

  const varB = b.sd ** 2;
  const varA = a.sd ** 2;
  const se = Math.sqrt(varB / b.n + varA / a.n);

  const t = se === 0 ? 0 : (a.mean - b.mean) / se;
  const df =
    se === 0
      ? 1
      : (varB / b.n + varA / a.n) ** 2 /
        ((varB / b.n) ** 2 / (b.n - 1) + (varA / a.n) ** 2 / (a.n - 1));

  const pValue = twoTailedP(t, df);
  const pooled = Math.sqrt(((b.n - 1) * varB + (a.n - 1) * varA) / (b.n + a.n - 2));

  return {
    before: b,
    after: a,
    absoluteChange: a.mean - b.mean,
    relativeChange: b.mean === 0 ? 0 : ((a.mean - b.mean) / b.mean) * 100,
    t,
    df,
    pValue,
    significant: pValue < alpha,
    cohensD: pooled === 0 ? 0 : (a.mean - b.mean) / pooled,
  };
}

/* ------------------------------------------------------------------ */
/* Distribución t (para el valor p de la comparación)                  */
/* ------------------------------------------------------------------ */

function logGamma(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j += 1) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

/** Fracción continua de Lentz para la beta incompleta. */
function betacf(a: number, b: number, x: number): number {
  const tiny = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= 200; m += 1) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 3e-10) break;
  }
  return h;
}

function incompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  return x < (a + 1) / (a + b + 2)
    ? (front * betacf(a, b, x)) / a
    : 1 - (front * betacf(b, a, 1 - x)) / b;
}

/** Valor p a dos colas de un estadístico t con `df` grados de libertad. */
export function twoTailedP(t: number, df: number): number {
  if (!Number.isFinite(t) || df <= 0) return 1;
  const x = df / (df + t * t);
  return Math.min(1, incompleteBeta(df / 2, 0.5, x));
}

/* ------------------------------------------------------------------ */
/* Utilidades de tendencia                                             */
/* ------------------------------------------------------------------ */

/** Pendiente por semana de una serie temporal (regresión sobre el índice). */
export function trendSlope(series: number[]): number {
  return linearRegression(series.map((y, x) => ({ x, y }))).slope;
}

/** Media móvil: suaviza el ruido para discutir tendencia en clase. */
export function movingAverage(series: number[], window = 3): Array<number | null> {
  return series.map((_, i) => {
    if (i < window - 1) return null;
    return mean(series.slice(i - window + 1, i + 1));
  });
}
