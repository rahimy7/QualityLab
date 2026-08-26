/**
 * Caso integrador del módulo: Distribuidora Andina.
 *
 * Todas las cifras de arranque salen del diagnóstico entregado por la gerencia
 * en la Misión 1 y se reutilizan en el resto de los laboratorios, de modo que
 * el participante trabaje siempre sobre la misma empresa.
 */

export const empresa = {
  nombre: 'Distribuidora Andina S.A.',
  sector: 'Distribución mayorista de consumo masivo',
  tamano: '340 colaboradores · 3 centros de distribución',
  encargo:
    'Han sido contratados como equipo de mejora. La gerencia perdió tres clientes clave en el último trimestre y les entregará datos durante el módulo. Al final deben demostrar qué está ocurriendo, por qué ocurre y cuánto puede mejorar la organización.',
  periodo: '24 semanas de operación · intervención desplegada en la semana 13',
} as const;

export type Tono = 'critico' | 'alerta' | 'ok';

export interface IndicadorBase {
  id: string;
  label: string;
  valor: number;
  unidad: string;
  meta: number;
  /** true cuando un valor más bajo es mejor (reclamos, retrasos, retrabajos). */
  menorEsMejor: boolean;
  variacion: number;
  contexto: string;
  fuente: string;
  responsable: string;
}

export const indicadoresBase: IndicadorBase[] = [
  {
    id: 'satisfaccion',
    label: 'Satisfacción del cliente',
    valor: 72,
    unidad: '%',
    meta: 90,
    menorEsMejor: false,
    variacion: -4.1,
    contexto: 'Encuesta post-entrega · n = 412 respuestas',
    fuente: 'Encuesta CSAT trimestral',
    responsable: 'Servicio al cliente',
  },
  {
    id: 'entregas',
    label: 'Entregas tardías',
    valor: 19,
    unidad: '%',
    meta: 8,
    menorEsMejor: true,
    variacion: 6.8,
    contexto: 'Pedidos entregados después de la fecha comprometida',
    fuente: 'ERP · módulo de despacho',
    responsable: 'Logística',
  },
  {
    id: 'reclamos',
    label: 'Reclamos',
    valor: 8.7,
    unidad: '%',
    meta: 3,
    menorEsMejor: true,
    variacion: 2.3,
    contexto: 'Reclamos formales sobre total de pedidos facturados',
    fuente: 'CRM · casos de servicio',
    responsable: 'Calidad',
  },
  {
    id: 'retrabajos',
    label: 'Retrabajos',
    valor: 12,
    unidad: '%',
    meta: 5,
    menorEsMejor: true,
    variacion: 3.9,
    contexto: 'Órdenes que debieron rearmarse antes de salir',
    fuente: 'Registro de almacén',
    responsable: 'Operaciones',
  },
  {
    id: 'productividad',
    label: 'Productividad',
    valor: 78,
    unidad: '%',
    meta: 86,
    menorEsMejor: false,
    variacion: -7.4,
    contexto: 'Líneas preparadas por hora-hombre vs. estándar',
    fuente: 'WMS · reporte de picking',
    responsable: 'Almacén',
  },
];

/** Semáforo estándar del módulo: se usa en KPI Lab, Dashboard y Auditoría. */
export function semaforo(
  valor: number,
  meta: number,
  menorEsMejor: boolean,
): { tono: Tono; etiqueta: string; brecha: number } {
  const brecha = menorEsMejor ? valor - meta : meta - valor;
  // Tolerancia del 15 % sobre la meta antes de declarar rojo.
  const tolerancia = Math.abs(meta) * 0.15;
  if (brecha <= 0) return { tono: 'ok', etiqueta: 'En meta', brecha };
  if (brecha <= tolerancia) return { tono: 'alerta', etiqueta: 'En alerta', brecha };
  return { tono: 'critico', etiqueta: 'Fuera de meta', brecha };
}

/**
 * Parámetros económicos que la gerencia entrega para la calculadora de impacto.
 * Son los que el participante usa para convertir puntos porcentuales en dinero.
 */
export const economia = {
  pedidosPorAno: 24_800,
  costoEntregaTardia: 42, // USD por pedido: reproceso, flete urgente y crédito
  costoReclamo: 118, // USD por reclamo atendido, incluye nota de crédito promedio
  costoRetrabajo: 27, // USD por orden rearmada
  margenPorPedido: 96, // USD de margen bruto promedio
  clientesPerdidosTrimestre: 3,
  ventaAnualPorCliente: 148_000,
  inversionMejora: 46_500, // USD del proyecto: WMS, capacitación y rediseño de ruta
  horasCapacitacion: 480,
} as const;

export const areas = [
  'Compras',
  'Almacén',
  'Despacho',
  'Transporte',
  'Servicio al cliente',
  'Calidad',
] as const;

export type Area = (typeof areas)[number];

export const responsables = [
  'Logística',
  'Almacén',
  'Compras',
  'Calidad',
  'Comercial',
  'Transporte',
] as const;

/** Las seis M del diagrama de Ishikawa, con la pregunta guía de cada rama. */
export const seisEmes = [
  { id: 'metodo', label: 'Método', guia: '¿El procedimiento existe, está actualizado y se sigue?', color: 'chart-1' },
  { id: 'mano-obra', label: 'Mano de obra', guia: '¿La persona sabe, puede y tiene tiempo para hacerlo bien?', color: 'chart-2' },
  { id: 'maquina', label: 'Máquina', guia: '¿El equipo o sistema responde como se espera?', color: 'chart-3' },
  { id: 'material', label: 'Material', guia: '¿El insumo llega completo, a tiempo y con la calidad pactada?', color: 'chart-4' },
  { id: 'medicion', label: 'Medición', guia: '¿Se mide, se registra y el dato es confiable?', color: 'chart-5' },
  { id: 'medio', label: 'Medio ambiente', guia: '¿El entorno físico u organizacional dificulta la tarea?', color: 'chart-1' },
] as const;

export type EmeId = (typeof seisEmes)[number]['id'];
