/**
 * Caso integrador "Pinturas del Sur": una planta de recubrimientos industriales
 * con problemas de conformidad de lote, viscosidad inestable y devoluciones.
 *
 * Todas las cifras salen del reporte que la gerencia entrega en la Misión 1 y
 * se reutilizan en el resto de laboratorios.
 */
import type { Empresa, Emes, IndicadorBase } from '../tipos';

export const empresa: Empresa = {
  nombre: 'Pinturas del Sur S.A.C.',
  sector: 'Fabricación de recubrimientos industriales',
  tamano: '220 colaboradores · 1 planta · 3 líneas de producción',
  encargo:
    'Han sido contratados como equipo de mejora. En los últimos seis meses la planta rechazó el 26 % de los lotes en control de calidad y tres clientes industriales devolvieron pedidos completos. La gerencia entregará datos durante el módulo. Al final deben demostrar qué está ocurriendo, por qué ocurre y cuánto puede recuperarse.',
  periodo: '24 semanas de producción · intervención desplegada en la semana 13',
};

export const indicadoresBase: IndicadorBase[] = [
  {
    id: 'conformidad',
    label: 'Lotes conformes a la primera',
    valor: 74,
    unidad: '%',
    meta: 92,
    menorEsMejor: false,
    variacion: -6.2,
    contexto: 'Lotes que superan control de calidad sin ajuste ni reproceso · n = 96 lotes/mes',
    fuente: 'LIMS · reporte de aprobación de lotes',
    responsable: 'Calidad',
  },
  {
    id: 'reprocesos',
    label: 'Reprocesos de dispersión',
    valor: 21,
    unidad: '%',
    meta: 8,
    menorEsMejor: true,
    variacion: 5.4,
    contexto: 'Lotes que exigieron molienda adicional para bajar la finura del pigmento',
    fuente: 'Registro de producción · orden de trabajo',
    responsable: 'Producción',
  },
  {
    id: 'devoluciones',
    label: 'Devoluciones de cliente',
    valor: 6.4,
    unidad: '%',
    meta: 2,
    menorEsMejor: true,
    variacion: 2.1,
    contexto: 'Pedidos devueltos por color, viscosidad o acabado fuera de tolerancia',
    fuente: 'ERP · notas de crédito por calidad',
    responsable: 'Servicio técnico',
  },
  {
    id: 'viscosidad-cp',
    label: 'Capacidad de viscosidad (Cp)',
    valor: 0.72,
    unidad: '',
    meta: 1.33,
    menorEsMejor: false,
    variacion: -0.18,
    contexto: 'Capacidad del proceso de ajuste final de viscosidad · KU 90–110',
    fuente: 'Copa Krebs · muestreo por lote',
    responsable: 'Producción',
  },
  {
    id: 'productividad',
    label: 'Productividad de línea',
    valor: 71,
    unidad: '%',
    meta: 88,
    menorEsMejor: false,
    variacion: -5.6,
    contexto: 'Kilogramos producidos por hora-línea contra el estándar de la formulación',
    fuente: 'MES · reporte de línea',
    responsable: 'Producción',
  },
];

export const economia = {
  lotesPorAno: 1_150,
  costoLoteRechazado: 1_820, // USD por lote descartado (materia prima + hora línea)
  costoReproceso: 640, // USD por reproceso de dispersión (energía + hora molino)
  costoDevolucion: 4_200, // USD por devolución promedio (flete inverso + reproceso + nota de crédito)
  margenPorLote: 1_450,
  clientesPerdidosTrimestre: 3,
  ventaAnualPorCliente: 218_000,
  inversionMejora: 62_000, // controles de dosificación, capacitación, kit de instrumentos
  horasCapacitacion: 320,
} as const;

export const areas = [
  'Recepción',
  'Formulación',
  'Producción',
  'Calidad',
  'Envasado',
  'Servicio técnico',
] as const;

export type Area = (typeof areas)[number];

export const responsables = [
  'Producción',
  'Calidad',
  'Formulación',
  'Compras',
  'Mantenimiento',
  'Comercial',
] as const;

/** Las 6M con la pregunta guía. Aunque el caso cambia, las 6M son universales. */
export const seisEmes: readonly Emes[] = [
  { id: 'metodo', label: 'Método', guia: '¿El procedimiento existe, está actualizado y se sigue?', color: 'chart-1' },
  { id: 'mano-obra', label: 'Mano de obra', guia: '¿El operador sabe, puede y tiene tiempo para hacerlo bien?', color: 'chart-2' },
  { id: 'maquina', label: 'Máquina', guia: '¿El molino, dosificador o filtro responde como se espera?', color: 'chart-3' },
  { id: 'material', label: 'Material', guia: '¿Pigmentos, resinas y solventes llegan dentro de especificación?', color: 'chart-4' },
  { id: 'medicion', label: 'Medición', guia: '¿Se mide viscosidad, finura y color con instrumentos calibrados?', color: 'chart-5' },
  { id: 'medio', label: 'Medio ambiente', guia: '¿La temperatura y humedad de la planta permiten dispersión estable?', color: 'chart-1' },
] as const;

export type EmeId = (typeof seisEmes)[number]['id'];
