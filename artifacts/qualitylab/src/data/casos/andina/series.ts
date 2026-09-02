/**
 * Series temporales y muestras del caso.
 *
 * Las series semanales son las que la gerencia entrega ya consolidadas; las
 * muestras individuales se generan con semilla fija a partir de los mismos
 * parámetros del proceso.
 */
import { normal, roundTo, seeded } from '../../../lib/random';
import { SEMANA_INTERVENCION, TOTAL_SEMANAS } from './incidencias';

export const semanas = Array.from({ length: TOTAL_SEMANAS }, (_, i) => i + 1);

/**
 * % de entregas tardías por semana. Semanas 1–12: situación base.
 * Semana 13: se despliega la intervención. Semanas 13–15 son de transición,
 * un detalle deliberado para discutir desde cuándo empieza el "después".
 */
export const entregasTardias = [
  17.9, 19.4, 18.2, 20.1, 17.6, 19.8, 18.9, 21.3, 17.4, 18.0, 19.2, 15.4,
  12.4, 10.1, 8.9, 7.6, 6.9, 6.2, 6.8, 5.7, 5.1, 5.6, 4.6, 6.5,
];

export const entregasAntes = entregasTardias.slice(0, SEMANA_INTERVENCION - 1);
export const entregasDespues = entregasTardias.slice(SEMANA_INTERVENCION - 1);

/**
 * Tiempo de preparación de pedido (minutos, promedio semanal).
 * La semana 8 contiene una causa especial: el WMS estuvo caído dos días y el
 * picking se hizo con listas impresas.
 */
export const tiempoPreparacion = [
  45.2, 47.8, 44.6, 46.9, 48.1, 45.4, 47.2, 61.3, 46.1, 44.9, 47.5, 45.8,
  46.4, 44.3, 42.2, 40.8, 39.6, 38.9, 39.4, 37.8, 38.2, 37.1, 36.6, 38.4,
];

/** Reclamos formales por semana, en % de pedidos facturados. */
export const reclamos = [
  8.1, 8.9, 8.4, 9.6, 8.2, 9.1, 8.8, 10.2, 8.5, 8.3, 9.0, 7.8,
  6.9, 6.1, 5.4, 4.8, 4.2, 3.9, 4.1, 3.4, 3.1, 3.3, 2.8, 3.6,
];

/** Satisfacción del cliente medida por pulso semanal (%). */
export const satisfaccion = [
  72.4, 71.2, 72.8, 70.6, 72.1, 71.5, 72.0, 69.8, 72.6, 73.1, 72.2, 74.5,
  76.8, 78.4, 80.1, 81.6, 83.2, 84.5, 85.1, 86.4, 87.2, 87.9, 88.6, 88.1,
];

/** Productividad: líneas preparadas por hora-hombre vs. estándar (%). */
export const productividad = [
  78.2, 77.4, 78.9, 76.1, 78.5, 77.8, 78.1, 74.6, 78.8, 79.2, 78.4, 80.6,
  82.1, 83.4, 84.6, 85.9, 86.8, 87.4, 87.1, 88.2, 88.9, 89.3, 90.1, 89.4,
];

/** Retrabajos: órdenes rearmadas antes de salir (%). */
export const retrabajos = [
  11.8, 12.4, 11.6, 13.2, 12.0, 12.8, 12.2, 14.1, 11.9, 12.1, 12.6, 10.8,
  9.4, 8.6, 7.8, 7.1, 6.4, 5.9, 6.2, 5.4, 5.1, 5.3, 4.8, 5.6,
];

export interface SerieDefinicion {
  id: string;
  label: string;
  unidad: string;
  valores: number[];
  meta: number;
  menorEsMejor: boolean;
  /** Límites de especificación para el análisis de capacidad, si aplican. */
  lsl: number | null;
  usl: number | null;
  descripcion: string;
}

export const series: SerieDefinicion[] = [
  {
    id: 'entregas',
    label: 'Entregas tardías',
    unidad: '%',
    valores: entregasTardias,
    meta: 8,
    menorEsMejor: true,
    lsl: null,
    usl: 8,
    descripcion: 'Porcentaje de pedidos entregados después de la fecha comprometida.',
  },
  {
    id: 'preparacion',
    label: 'Tiempo de preparación',
    unidad: 'min',
    valores: tiempoPreparacion,
    meta: 40,
    menorEsMejor: true,
    lsl: null,
    usl: 50,
    descripcion: 'Minutos promedio entre liberación de la orden y pedido listo para cargar.',
  },
  {
    id: 'reclamos',
    label: 'Reclamos',
    unidad: '%',
    valores: reclamos,
    meta: 3,
    menorEsMejor: true,
    lsl: null,
    usl: 3,
    descripcion: 'Reclamos formales sobre el total de pedidos facturados.',
  },
  {
    id: 'satisfaccion',
    label: 'Satisfacción',
    unidad: '%',
    valores: satisfaccion,
    meta: 90,
    menorEsMejor: false,
    lsl: 90,
    usl: null,
    descripcion: 'Pulso semanal de satisfacción post-entrega.',
  },
  {
    id: 'productividad',
    label: 'Productividad',
    unidad: '%',
    valores: productividad,
    meta: 86,
    menorEsMejor: false,
    lsl: 86,
    usl: null,
    descripcion: 'Líneas preparadas por hora-hombre contra el estándar de la operación.',
  },
  {
    id: 'retrabajos',
    label: 'Retrabajos',
    unidad: '%',
    valores: retrabajos,
    meta: 5,
    menorEsMejor: true,
    lsl: null,
    usl: 5,
    descripcion: 'Órdenes que debieron rearmarse antes de salir del centro de distribución.',
  },
];

export function serie(id: string): SerieDefinicion {
  return series.find((s) => s.id === id) ?? series[0];
}

/* ------------------------------------------------------------------ */
/* Muestras individuales                                               */
/* ------------------------------------------------------------------ */

/**
 * 80 mediciones individuales de tiempo de preparación tomadas en el periodo
 * base. Sirven para el histograma y el análisis de capacidad: la distribución
 * tiene cola derecha, que es justo lo que un promedio esconde.
 */
export const muestraPreparacion: number[] = (() => {
  const rand = seeded(77002);
  return Array.from({ length: 80 }, () => {
    const base = normal(rand, 42.5, 3.6);
    // Un 16 % de los pedidos cae en la cola larga: el operario tuvo que buscar
    // producto fuera de su ubicación. Es la cola, no el promedio, la que rompe
    // la promesa de entrega.
    const cola = rand() < 0.16 ? 14 + Math.abs(normal(rand, 6, 4)) : 0;
    return roundTo(Math.max(30, base + cola), 1);
  });
})();

export interface Operario {
  id: string;
  horasCapacitacion: number;
  erroresPicking: number;
  lineasPorHora: number;
  antiguedadMeses: number;
}

/**
 * 24 operarios de almacén. La relación capacitación → errores es real y fuerte,
 * pero la correlación con antigüedad es débil: material perfecto para discutir
 * que correlación no implica causalidad.
 */
export const operarios: Operario[] = (() => {
  const rand = seeded(31415);
  return Array.from({ length: 24 }, (_, i) => {
    const horas = roundTo(4 + rand() * 36, 0);
    const errores = Math.max(0, Math.round(26 - horas * 0.52 + normal(rand, 0, 3.1)));
    return {
      id: `OP-${String(i + 1).padStart(2, '0')}`,
      horasCapacitacion: horas,
      erroresPicking: errores,
      lineasPorHora: roundTo(38 + horas * 0.44 + normal(rand, 0, 3.4), 1),
      antiguedadMeses: Math.round(3 + rand() * 92),
    };
  });
})();

/**
 * 60 pedidos con su número de líneas y el tiempo real de preparación.
 * Relación positiva clara: sirve para enseñar dispersión y regresión.
 */
export const pedidosMuestra = (() => {
  const rand = seeded(90210);
  return Array.from({ length: 60 }, (_, i) => {
    const lineas = Math.max(2, Math.round(normal(rand, 15, 6)));
    return {
      id: `PED-${String(i + 1).padStart(3, '0')}`,
      lineas,
      minutos: roundTo(12 + lineas * 2.15 + normal(rand, 0, 5.2), 1),
    };
  });
})();

/** Votación en vivo de la Misión 1: se muestra como resultado del grupo. */
export const votosIniciales: Record<string, number> = {
  entregas: 9,
  reclamos: 3,
  satisfaccion: 4,
  retrabajos: 2,
  productividad: 2,
};
