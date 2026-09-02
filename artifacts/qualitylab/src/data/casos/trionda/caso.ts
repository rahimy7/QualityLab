/**
 * Caso Trionda: fabricación del balón oficial del Mundial 2026 en la planta
 * de Adidas. Panel de 4 paneles, termosellado, chip de 500 Hz y controles de
 * calidad extremadamente estrictos (circunferencia, peso, absorción, rebote).
 */
import type { Empresa, Emes, IndicadorBase } from '../tipos';

export const empresa: Empresa = {
  nombre: 'Adidas Sport-Ball Manufacturing',
  sector: 'Fabricación de balones oficiales FIFA',
  tamano: '480 colaboradores · 1 planta · 4 líneas de termosellado',
  encargo:
    'Han sido contratados como equipo de mejora. La producción del balón oficial del Mundial 2026 arrancó hace seis meses y el 18 % de las unidades no supera el control de homologación FIFA: circunferencia fuera de 68–70 cm, peso fuera de 410–450 g, absorción de agua elevada o defectos de superficie. La gerencia entregará datos durante el módulo. Al final deben demostrar qué está ocurriendo, por qué ocurre y cuánto puede recuperarse antes del envío final.',
  periodo: '24 semanas de producción · intervención desplegada en la semana 13',
};

export const indicadoresBase: IndicadorBase[] = [
  {
    id: 'homologacion',
    label: 'Balones homologables a la primera',
    valor: 82,
    unidad: '%',
    meta: 96,
    menorEsMejor: false,
    variacion: -4.8,
    contexto: 'Unidades que superan homologación FIFA sin reproceso · n = 620 balones/mes',
    fuente: 'Sistema de control de calidad · reporte de inspección',
    responsable: 'Calidad',
  },
  {
    id: 'defectos-termosellado',
    label: 'Defectos de termosellado',
    valor: 9.4,
    unidad: '%',
    meta: 2,
    menorEsMejor: true,
    variacion: 3.1,
    contexto: 'Uniones entre paneles con burbujas, microarrugas o adhesión pobre',
    fuente: 'Inspección visual + cámara de alta resolución',
    responsable: 'Producción',
  },
  {
    id: 'peso-fuera-rango',
    label: 'Peso fuera de 410–450 g',
    valor: 6.2,
    unidad: '%',
    meta: 1,
    menorEsMejor: true,
    variacion: 1.4,
    contexto: 'Balones cuyo peso final excede la tolerancia FIFA',
    fuente: 'Balanza calibrada · muestreo por lote',
    responsable: 'Producción',
  },
  {
    id: 'circunferencia-cp',
    label: 'Capacidad de circunferencia (Cp)',
    valor: 0.86,
    unidad: '',
    meta: 1.33,
    menorEsMejor: false,
    variacion: -0.12,
    contexto: 'Capacidad del proceso de inflado · circunferencia 68.0–70.0 cm',
    fuente: 'Cinta métrica láser · muestreo por lote',
    responsable: 'Producción',
  },
  {
    id: 'chip-fallos',
    label: 'Fallos del chip 500 Hz',
    valor: 3.8,
    unidad: '%',
    meta: 0.5,
    menorEsMejor: true,
    variacion: 0.9,
    contexto: 'Balones cuyo chip no transmite señal estable al sistema del VAR',
    fuente: 'Banco de prueba electrónica · 100 % inspección',
    responsable: 'Electrónica',
  },
];

export const economia = {
  balonesPorAno: 260_000,
  costoBalonRechazado: 74, // materiales + hora de línea perdida
  costoReproceso: 28,
  costoDevolucionFifa: 320, // reproceso, flete internacional y penalidad de contrato
  margenPorBalon: 58,
  clientesPerdidosTrimestre: 2, // socios comerciales/patrocinadores
  ventaAnualPorCliente: 620_000,
  inversionMejora: 84_000, // sistema de control térmico + capacitación + calibración
  horasCapacitacion: 360,
} as const;

export const areas = [
  'Materiales',
  'Corte',
  'Laminación',
  'Termosellado',
  'Chip electrónico',
  'Control de calidad',
] as const;

export type Area = (typeof areas)[number];

export const responsables = [
  'Producción',
  'Calidad',
  'Materiales',
  'Electrónica',
  'Ingeniería de proceso',
  'Compras',
] as const;

export const seisEmes: readonly Emes[] = [
  { id: 'metodo', label: 'Método', guia: '¿El procedimiento de termosellado está actualizado y se sigue?', color: 'chart-1' },
  { id: 'mano-obra', label: 'Mano de obra', guia: '¿El operador domina el ciclo térmico y el ensamble del chip?', color: 'chart-2' },
  { id: 'maquina', label: 'Máquina', guia: '¿La prensa térmica y la troqueladora responden dentro de tolerancia?', color: 'chart-3' },
  { id: 'material', label: 'Material', guia: '¿Poliuretano, imprimación y vejiga de látex están dentro de spec?', color: 'chart-4' },
  { id: 'medicion', label: 'Medición', guia: '¿Balanza, cinta láser y banco electrónico están calibrados?', color: 'chart-5' },
  { id: 'medio', label: 'Medio ambiente', guia: '¿Temperatura y humedad de la sala de termosellado son estables?', color: 'chart-1' },
] as const;

export type EmeId = (typeof seisEmes)[number]['id'];
