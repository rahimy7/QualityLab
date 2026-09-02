/**
 * Series semanales del caso Trionda.
 */
import { normal, roundTo, seeded } from '../../../lib/random';
import { SEMANA_INTERVENCION, TOTAL_SEMANAS } from './incidencias';

export const semanas = Array.from({ length: TOTAL_SEMANAS }, (_, i) => i + 1);

/** % balones homologables a la primera. Semana 8: fallo de sensor térmico. */
export const homologacionBalones = [
  82.4, 81.6, 83.1, 80.8, 82.5, 81.9, 82.7, 74.6, 82.9, 83.1, 82.0, 84.2,
  87.6, 90.1, 92.3, 93.8, 94.8, 95.6, 95.2, 96.1, 96.7, 97.1, 97.4, 97.0,
];

export const homologacionAntes = homologacionBalones.slice(0, SEMANA_INTERVENCION - 1);
export const homologacionDespues = homologacionBalones.slice(SEMANA_INTERVENCION - 1);

/** Ciclo de termosellado (segundos, promedio semanal). */
export const cicloTermosellado = [
  164.5, 168.2, 165.4, 170.8, 166.1, 169.4, 167.2, 189.6, 165.3, 166.8, 167.9, 163.4,
  158.6, 154.1, 150.2, 146.4, 143.8, 141.6, 142.4, 140.1, 138.4, 136.8, 135.9, 138.4,
];

/** Defectos de termosellado (%). */
export const defectosTermosellado = [
  9.2, 9.8, 8.9, 10.4, 9.4, 9.7, 9.1, 12.6, 9.3, 9.6, 9.5, 8.8,
  7.4, 6.2, 5.1, 4.2, 3.4, 2.8, 3.1, 2.4, 2.1, 2.0, 1.8, 2.1,
];

/** Fallos del chip 500 Hz (%). */
export const chipFallos = [
  3.8, 4.1, 3.6, 4.3, 3.9, 4.0, 3.7, 4.8, 3.8, 4.0, 3.9, 3.4,
  2.8, 2.2, 1.7, 1.3, 1.0, 0.8, 0.9, 0.7, 0.6, 0.5, 0.4, 0.6,
];

/** Peso fuera de rango (%). */
export const pesoFueraRango = [
  6.1, 6.4, 5.9, 6.8, 6.3, 6.5, 6.2, 7.9, 6.0, 6.2, 6.6, 5.7,
  4.8, 4.1, 3.4, 2.8, 2.2, 1.7, 1.9, 1.5, 1.2, 1.1, 0.9, 1.1,
];

/** Capacidad de circunferencia (Cp) semanal. */
export const circunferenciaCp = [
  0.84, 0.82, 0.86, 0.79, 0.85, 0.83, 0.84, 0.71, 0.86, 0.85, 0.83, 0.89,
  0.98, 1.08, 1.16, 1.24, 1.30, 1.35, 1.33, 1.38, 1.41, 1.43, 1.45, 1.44,
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
    id: 'homologacion',
    label: 'Balones homologables a la primera',
    unidad: '%',
    valores: homologacionBalones,
    meta: 96,
    menorEsMejor: false,
    lsl: 96,
    usl: null,
    descripcion: 'Porcentaje de balones que superan homologación FIFA sin reproceso.',
  },
  {
    id: 'ciclo',
    label: 'Ciclo de termosellado',
    unidad: 's',
    valores: cicloTermosellado,
    meta: 140,
    menorEsMejor: true,
    lsl: null,
    usl: 155,
    descripcion: 'Duración promedio del ciclo térmico de ensamblaje del balón.',
  },
  {
    id: 'defectos',
    label: 'Defectos de termosellado',
    unidad: '%',
    valores: defectosTermosellado,
    meta: 2,
    menorEsMejor: true,
    lsl: null,
    usl: 2,
    descripcion: 'Uniones entre paneles con burbujas, microarrugas o adhesión pobre.',
  },
  {
    id: 'chip',
    label: 'Fallos del chip 500 Hz',
    unidad: '%',
    valores: chipFallos,
    meta: 0.5,
    menorEsMejor: true,
    lsl: null,
    usl: 0.5,
    descripcion: 'Balones cuyo chip no transmite señal estable al sistema del VAR.',
  },
  {
    id: 'peso',
    label: 'Peso fuera de 410–450 g',
    unidad: '%',
    valores: pesoFueraRango,
    meta: 1,
    menorEsMejor: true,
    lsl: null,
    usl: 1,
    descripcion: 'Balones cuyo peso final excede la tolerancia FIFA.',
  },
  {
    id: 'circunferencia',
    label: 'Capacidad circunferencia (Cp)',
    unidad: '',
    valores: circunferenciaCp,
    meta: 1.33,
    menorEsMejor: false,
    lsl: 1.33,
    usl: null,
    descripcion: 'Capacidad de proceso Cp del inflado inicial (68.0–70.0 cm).',
  },
];

export function serie(id: string): SerieDefinicion {
  return series.find((s) => s.id === id) ?? series[0];
}

/**
 * 80 mediciones individuales de circunferencia (cm) del periodo base.
 * La FIFA exige 68–70 cm: la cola derecha es la que dispara los rechazos.
 */
export const muestraPreparacion: number[] = (() => {
  const rand = seeded(66302);
  return Array.from({ length: 80 }, () => {
    const base = normal(rand, 69.1, 0.42);
    const cola = rand() < 0.14 ? 0.6 + Math.abs(normal(rand, 0.4, 0.3)) : 0;
    return roundTo(Math.max(67.5, base + cola), 2);
  });
})();

export interface Operario {
  id: string;
  horasCapacitacion: number;
  erroresPicking: number;
  lineasPorHora: number;
  antiguedadMeses: number;
}

/** 26 técnicos de termosellado. Relación fuerte capacitación → defectos. */
export const operarios: Operario[] = (() => {
  const rand = seeded(88401);
  return Array.from({ length: 26 }, (_, i) => {
    const horas = roundTo(6 + rand() * 44, 0);
    const errores = Math.max(0, Math.round(24 - horas * 0.42 + normal(rand, 0, 2.6)));
    return {
      id: `OP-${String(i + 1).padStart(2, '0')}`,
      horasCapacitacion: horas,
      erroresPicking: errores,
      lineasPorHora: roundTo(46 + horas * 0.5 + normal(rand, 0, 3.4), 1),
      antiguedadMeses: Math.round(4 + rand() * 108),
    };
  });
})();

/** 60 balones con tamaño de lote y minutos de termosellado. */
export const pedidosMuestra = (() => {
  const rand = seeded(30291);
  return Array.from({ length: 60 }, (_, i) => {
    const lineas = Math.max(4, Math.round(normal(rand, 22, 8)));
    return {
      id: `BAL-${String(i + 1).padStart(3, '0')}`,
      lineas,
      minutos: roundTo(90 + lineas * 3.6 + normal(rand, 0, 8), 1),
    };
  });
})();

/** Votación en vivo Misión 1. */
export const votosIniciales: Record<string, number> = {
  'defectos-termosellado': 9,
  homologacion: 4,
  'peso-fuera-rango': 3,
  'chip-fallos': 2,
  'circunferencia-cp': 2,
};
