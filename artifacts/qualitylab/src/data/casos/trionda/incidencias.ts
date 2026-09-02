/**
 * Registro de balones no conformes de la planta Adidas Sport-Ball.
 * 144 unidades con desviación durante 24 semanas, con semilla fija.
 */
import { normal, pick, roundTo, seeded } from '../../../lib/random';
import type { EmeId } from './caso';

export const SEMANA_INTERVENCION = 13;
export const TOTAL_SEMANAS = 24;

export interface DefinicionCausa {
  causa: string;
  eme: EmeId;
  area: string;
  responsable: string;
  antes: number;
  despues: number;
  retraso: [number, number];
  costoFijo: number;
  detalle: string;
}

export const definicionCausas: DefinicionCausa[] = [
  {
    causa: 'Termosellado con burbujas',
    eme: 'maquina',
    area: 'Termosellado',
    responsable: 'Producción',
    antes: 40,
    despues: 10,
    retraso: [3, 12],
    costoFijo: 74,
    detalle: 'Ciclo térmico irregular deja microburbujas entre paneles. El balón se identifica por inspección visual y se descarta.',
  },
  {
    causa: 'Peso fuera de 410–450 g',
    eme: 'metodo',
    area: 'Laminación',
    responsable: 'Producción',
    antes: 28,
    despues: 8,
    retraso: [2, 8],
    costoFijo: 46,
    detalle: 'Grosor de láminas fuera de tolerancia. Se detecta al pesar el balón terminado y no puede ajustarse.',
  },
  {
    causa: 'Circunferencia fuera de 68–70 cm',
    eme: 'medicion',
    area: 'Termosellado',
    responsable: 'Producción',
    antes: 22,
    despues: 6,
    retraso: [2, 10],
    costoFijo: 74,
    detalle: 'Corte de panel o cierre del ensamble alteran la geometría. El balón se mide con cinta láser tras el inflado inicial.',
  },
  {
    causa: 'Chip no transmite',
    eme: 'material',
    area: 'Chip electrónico',
    responsable: 'Electrónica',
    antes: 15,
    despues: 4,
    retraso: [1, 6],
    costoFijo: 210,
    detalle: 'El sensor de 500 Hz falla el banco de prueba (sin transmisión al sistema del VAR). Componente costoso, no reutilizable.',
  },
  {
    causa: 'Absorción de agua elevada',
    eme: 'material',
    area: 'Materiales',
    responsable: 'Materiales',
    antes: 11,
    despues: 4,
    retraso: [4, 18],
    costoFijo: 62,
    detalle: 'La imprimación no cubre uniformemente el poliuretano. El balón sumergido gana peso más allá del límite FIFA.',
  },
  {
    causa: 'Adhesión pobre panel-vejiga',
    eme: 'mano-obra',
    area: 'Laminación',
    responsable: 'Producción',
    antes: 8,
    despues: 3,
    retraso: [2, 9],
    costoFijo: 88,
    detalle: 'Aplicación manual de adhesivo con espesor no uniforme. Se detecta en la prueba de resistencia estructural.',
  },
];

export interface Incidencia {
  id: string;
  semana: number;
  fecha: string;
  periodo: 'antes' | 'despues';
  causa: string;
  eme: EmeId;
  area: string;
  responsable: string;
  cliente: string;
  turno: 'Mañana' | 'Tarde' | 'Noche';
  retrasoHoras: number;
  costo: number;
  lineas: number;
  operario: string;
}

const clientes = [
  'FIFA · Envío oficial',
  'Federación Mexicana',
  'US Soccer',
  'Canadian Soccer',
  'Réplica minorista LATAM',
  'Réplica minorista EU',
  'Distribuidora Asia',
  'Retail directo Adidas',
];

const turnos = ['Mañana', 'Tarde', 'Noche'] as const;

const INICIO = new Date(Date.UTC(2025, 4, 5));

function fechaDeSemana(semana: number, diaOffset: number): string {
  const d = new Date(INICIO);
  d.setUTCDate(d.getUTCDate() + (semana - 1) * 7 + diaOffset);
  return d.toISOString().slice(0, 10);
}

function construir(): Incidencia[] {
  const rand = seeded(20260620);
  const out: Incidencia[] = [];
  let n = 0;

  for (const def of definicionCausas) {
    for (const periodo of ['antes', 'despues'] as const) {
      const cantidad = periodo === 'antes' ? def.antes : def.despues;
      const desde = periodo === 'antes' ? 1 : SEMANA_INTERVENCION;
      const hasta = periodo === 'antes' ? SEMANA_INTERVENCION - 1 : TOTAL_SEMANAS;

      for (let i = 0; i < cantidad; i += 1) {
        n += 1;
        const semana = desde + Math.floor(rand() * (hasta - desde + 1));
        const [minH, maxH] = def.retraso;
        const factor = periodo === 'despues' ? 0.55 : 1;
        const retrasoHoras = roundTo((minH + rand() * (maxH - minH)) * factor, 1);
        const lineas = Math.max(1, Math.round(normal(rand, 22, 8)));
        const costo = roundTo(
          def.costoFijo + 32 + retrasoHoras * 3.1 + lineas * 1.8 + rand() * 42,
          2,
        );

        out.push({
          id: `BAL-${String(n).padStart(3, '0')}`,
          semana,
          fecha: fechaDeSemana(semana, Math.floor(rand() * 5)),
          periodo,
          causa: def.causa,
          eme: def.eme,
          area: def.area,
          responsable: def.responsable,
          cliente: pick(rand, clientes),
          turno: pick(rand, turnos),
          retrasoHoras,
          costo,
          lineas,
          operario: `OP-${String(1 + Math.floor(rand() * 26)).padStart(2, '0')}`,
        });
      }
    }
  }

  return out.sort((a, b) => (a.semana - b.semana) || a.fecha.localeCompare(b.fecha));
}

export const incidencias: Incidencia[] = construir();

export function incidenciasPorPeriodo(periodo: 'todo' | 'antes' | 'despues'): Incidencia[] {
  if (periodo === 'todo') return incidencias;
  return incidencias.filter((i) => i.periodo === periodo);
}
