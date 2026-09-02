/**
 * Series semanales y muestras de Pinturas del Sur.
 */
import { normal, roundTo, seeded } from '../../../lib/random';
import { SEMANA_INTERVENCION, TOTAL_SEMANAS } from './incidencias';

export const semanas = Array.from({ length: TOTAL_SEMANAS }, (_, i) => i + 1);

/**
 * % de lotes conformes a la primera. Semanas 1-12 base. Semana 13 se despliega
 * la intervención (control de dispersión + capacitación + kit de instrumentos).
 * Semanas 13-15 son de transición.
 */
export const conformidadLotes = [
  73.4, 71.8, 74.1, 72.5, 70.9, 74.6, 72.2, 68.9, 74.8, 73.1, 72.0, 75.4,
  79.2, 82.1, 84.6, 87.3, 89.4, 91.2, 90.6, 92.1, 92.8, 93.4, 94.1, 93.2,
];

export const conformidadAntes = conformidadLotes.slice(0, SEMANA_INTERVENCION - 1);
export const conformidadDespues = conformidadLotes.slice(SEMANA_INTERVENCION - 1);

/**
 * Tiempo total de dispersión + molienda por lote (minutos, promedio semanal).
 * Semana 8: fallo del molino principal, se usó molino auxiliar más lento.
 */
export const tiempoDispersion = [
  186.2, 192.5, 188.7, 195.1, 190.4, 193.8, 191.2, 234.6, 189.3, 187.8, 192.1, 188.4,
  178.6, 172.3, 165.8, 158.4, 152.9, 148.2, 149.6, 144.1, 141.8, 139.2, 137.6, 140.4,
];

/** Devoluciones de cliente por semana (% pedidos facturados). */
export const devoluciones = [
  6.2, 6.8, 5.9, 7.1, 6.3, 6.7, 6.5, 7.9, 6.1, 6.4, 6.9, 5.8,
  4.9, 4.2, 3.6, 3.1, 2.7, 2.4, 2.6, 2.1, 1.9, 2.0, 1.7, 2.2,
];

/** Reprocesos de dispersión por semana (%). */
export const reprocesos = [
  20.8, 21.9, 20.4, 22.7, 21.2, 22.1, 21.6, 24.3, 20.9, 21.4, 22.0, 19.6,
  16.1, 13.8, 11.7, 10.2, 8.9, 7.6, 8.1, 6.9, 6.2, 6.4, 5.8, 6.7,
];

/** Productividad de línea (%). */
export const productividadLinea = [
  71.4, 70.8, 71.9, 69.6, 71.5, 70.9, 71.2, 66.4, 71.8, 72.1, 71.4, 73.2,
  75.6, 77.1, 79.4, 81.2, 82.6, 83.8, 83.4, 84.9, 85.6, 86.2, 87.1, 86.4,
];

/** Capacidad de viscosidad (Cp del proceso, semanal). Adimensional. */
export const capacidadCp = [
  0.71, 0.69, 0.73, 0.68, 0.72, 0.70, 0.71, 0.62, 0.73, 0.72, 0.70, 0.76,
  0.84, 0.94, 1.05, 1.14, 1.22, 1.29, 1.28, 1.34, 1.37, 1.39, 1.42, 1.40,
];

export interface SerieDefinicion {
  id: string;
  label: string;
  unidad: string;
  valores: number[];
  meta: number;
  menorEsMejor: boolean;
  lsl: number | null;
  usl: number | null;
  descripcion: string;
}

export const series: SerieDefinicion[] = [
  {
    id: 'conformidad',
    label: 'Lotes conformes a la primera',
    unidad: '%',
    valores: conformidadLotes,
    meta: 92,
    menorEsMejor: false,
    lsl: 92,
    usl: null,
    descripcion: 'Porcentaje de lotes que superan control de calidad sin ajuste ni reproceso.',
  },
  {
    id: 'dispersion',
    label: 'Tiempo de dispersión',
    unidad: 'min',
    valores: tiempoDispersion,
    meta: 150,
    menorEsMejor: true,
    lsl: null,
    usl: 180,
    descripcion: 'Minutos promedio de dispersión + molienda por lote.',
  },
  {
    id: 'devoluciones',
    label: 'Devoluciones',
    unidad: '%',
    valores: devoluciones,
    meta: 2,
    menorEsMejor: true,
    lsl: null,
    usl: 2,
    descripcion: 'Pedidos devueltos por color, viscosidad o acabado fuera de tolerancia.',
  },
  {
    id: 'reprocesos',
    label: 'Reprocesos',
    unidad: '%',
    valores: reprocesos,
    meta: 8,
    menorEsMejor: true,
    lsl: null,
    usl: 8,
    descripcion: 'Lotes que exigieron molienda adicional para bajar la finura del pigmento.',
  },
  {
    id: 'productividad',
    label: 'Productividad de línea',
    unidad: '%',
    valores: productividadLinea,
    meta: 88,
    menorEsMejor: false,
    lsl: 88,
    usl: null,
    descripcion: 'Kilogramos por hora-línea contra el estándar de la formulación.',
  },
  {
    id: 'cp-viscosidad',
    label: 'Capacidad viscosidad (Cp)',
    unidad: '',
    valores: capacidadCp,
    meta: 1.33,
    menorEsMejor: false,
    lsl: 1.33,
    usl: null,
    descripcion: 'Capacidad de proceso Cp del ajuste final de viscosidad (KU 90–110).',
  },
];

export function serie(id: string): SerieDefinicion {
  return series.find((s) => s.id === id) ?? series[0];
}

/**
 * 80 mediciones individuales de viscosidad (unidades Krebs) del periodo base.
 * La distribución tiene cola derecha: hay lotes que se disparan por exceso de
 * resina, y esos son los que hacen fallar la especificación superior.
 */
export const muestraPreparacion: number[] = (() => {
  const rand = seeded(88015);
  return Array.from({ length: 80 }, () => {
    const base = normal(rand, 98, 4.2);
    const cola = rand() < 0.18 ? 8 + Math.abs(normal(rand, 4, 3)) : 0;
    return roundTo(Math.max(86, base + cola), 1);
  });
})();

export interface Operario {
  id: string;
  horasCapacitacion: number;
  erroresPicking: number;
  lineasPorHora: number;
  antiguedadMeses: number;
}

/** 22 operarios de dispersión. Relación fuerte capacitación → errores de dosificación. */
export const operarios: Operario[] = (() => {
  const rand = seeded(41200);
  return Array.from({ length: 22 }, (_, i) => {
    const horas = roundTo(4 + rand() * 40, 0);
    const errores = Math.max(0, Math.round(22 - horas * 0.48 + normal(rand, 0, 2.8)));
    return {
      id: `OP-${String(i + 1).padStart(2, '0')}`,
      horasCapacitacion: horas,
      erroresPicking: errores,
      lineasPorHora: roundTo(24 + horas * 0.36 + normal(rand, 0, 2.6), 1),
      antiguedadMeses: Math.round(6 + rand() * 108),
    };
  });
})();

/**
 * 60 lotes con su tamaño (cientos de kg) y minutos de dispersión reales.
 * Relación positiva clara: sirve para dispersión y regresión.
 */
export const pedidosMuestra = (() => {
  const rand = seeded(70301);
  return Array.from({ length: 60 }, (_, i) => {
    const lineas = Math.max(3, Math.round(normal(rand, 18, 6)));
    return {
      id: `LOT-${String(i + 1).padStart(3, '0')}`,
      lineas,
      minutos: roundTo(85 + lineas * 5.4 + normal(rand, 0, 12), 1),
    };
  });
})();

/** Votación en vivo Misión 1: se muestra como resultado del grupo. */
export const votosIniciales: Record<string, number> = {
  reprocesos: 8,
  devoluciones: 5,
  conformidad: 3,
  'viscosidad-cp': 2,
  productividad: 2,
};
