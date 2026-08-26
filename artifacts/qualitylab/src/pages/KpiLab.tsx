import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Gauge, Sparkles, TriangleAlert, Wand2 } from 'lucide-react';
import { responsables, semaforo } from '@/data/caso';
import { entregasTardias } from '@/data/series';
import { useProgreso, type FichaKpi } from '@/store/progreso';
import { num, pct, pp } from '@/lib/formato';
import { tonoColor } from '@/lib/palette';
import { mean, trendSlope } from '@/lib/stats';
import { Boton, Campo, EncabezadoPagina, Hallazgo, Panel, Semaforo } from '@/components/lab/primitivos';
import { GraficoTendencia, Medidor } from '@/components/charts/graficos';
import { CoachQ } from '@/components/lab/CoachQ';
import { Teoria } from '@/components/lab/Teoria';
import { Quiz } from '@/components/lab/Quiz';
import { CierreMision } from '@/components/lab/CierreMision';

interface Regla {
  campo: keyof FichaKpi;
  label: string;
  peso: number;
  valida: (f: FichaKpi) => boolean;
  falla: string;
}

/**
 * Las diez reglas del Quality Score. No basta con que el campo esté lleno:
 * cada una comprueba que el contenido sirva para gestionar.
 */
const reglas: Regla[] = [
  {
    campo: 'objetivo',
    label: 'Objetivo',
    peso: 10,
    valida: (f) => f.objetivo.trim().length >= 15,
    falla: 'El objetivo debe decir qué comportamiento quieres cambiar, no solo nombrar un área.',
  },
  {
    campo: 'indicador',
    label: 'Indicador',
    peso: 10,
    valida: (f) => f.indicador.trim().length >= 5,
    falla: 'Falta el nombre exacto de lo que se mide.',
  },
  {
    campo: 'formula',
    label: 'Fórmula',
    peso: 10,
    valida: (f) => /[/÷]/.test(f.formula) && f.formula.trim().length >= 10,
    falla: 'La fórmula necesita numerador y denominador explícitos (usa "/" o "÷").',
  },
  {
    campo: 'lineaBase',
    label: 'Línea base',
    peso: 10,
    valida: (f) => f.lineaBase.trim() !== '' && Number.isFinite(Number(f.lineaBase)),
    falla: 'Sin línea base numérica no podrás demostrar después que algo cambió.',
  },
  {
    campo: 'meta',
    label: 'Meta',
    peso: 10,
    valida: (f) => f.meta.trim() !== '' && Number.isFinite(Number(f.meta)),
    falla: 'Falta el valor de la meta.',
  },
  {
    campo: 'meta',
    label: 'Meta exigente',
    peso: 10,
    valida: (f) => {
      const base = Number(f.lineaBase);
      const meta = Number(f.meta);
      if (!Number.isFinite(base) || !Number.isFinite(meta)) return false;
      // Para un indicador de "entregas tardías" la meta debe ser menor que la base.
      return meta !== base;
    },
    falla: 'La meta es igual a la línea base: así el indicador informa, pero no exige nada.',
  },
  {
    campo: 'fecha',
    label: 'Fecha de la meta',
    peso: 10,
    valida: (f) => f.fecha.trim().length >= 4,
    falla: 'Una meta sin fecha no es una meta: es una aspiración.',
  },
  {
    campo: 'frecuencia',
    label: 'Frecuencia',
    peso: 10,
    valida: (f) => f.frecuencia.trim() !== '',
    falla: 'Define cada cuánto se lee y se discute el indicador.',
  },
  {
    campo: 'fuente',
    label: 'Fuente del dato',
    peso: 10,
    valida: (f) => f.fuente.trim().length >= 4,
    falla: 'Es el componente que más se omite: sin fuente declarada el indicador no es auditable.',
  },
  {
    campo: 'responsable',
    label: 'Responsable',
    peso: 5,
    valida: (f) => f.responsable.trim() !== '',
    falla: 'Alguien tiene que responder cuando el semáforo cambie de color.',
  },
  {
    campo: 'umbral',
    label: 'Umbral de reacción',
    peso: 5,
    valida: (f) => f.umbral.trim().length >= 3,
    falla: 'Declara a partir de qué valor se dispara una acción, no solo la meta final.',
  },
];

const ejemplo: FichaKpi = {
  objetivo: 'Recuperar la confiabilidad de la promesa de entrega al cliente mayorista',
  indicador: '% de entregas tardías',
  formula: 'Entregas tardías / Total de entregas × 100',
  lineaBase: '19',
  meta: '8',
  fecha: 'Cierre del semestre',
  frecuencia: 'Semanal',
  fuente: 'ERP · módulo de despacho, corte domingo 23:59',
  responsable: 'Logística',
  umbral: 'Sobre 12 % dispara revisión con el equipo en 24 h',
};

export default function KpiLab() {
  const { estado, set, otorgarLogro, quitarLogro } = useProgreso();
  const ficha = estado.kpi;

  const evaluacion = useMemo(() => {
    const resultados = reglas.map((r) => ({ ...r, ok: r.valida(ficha) }));
    const score = resultados.reduce((acc, r) => acc + (r.ok ? r.peso : 0), 0);
    return { resultados, score, faltantes: resultados.filter((r) => !r.ok) };
  }, [ficha]);

  const base = Number(ficha.lineaBase);
  const meta = Number(ficha.meta);
  const hayNumeros = Number.isFinite(base) && Number.isFinite(meta) && ficha.lineaBase !== '' && ficha.meta !== '';
  const menorEsMejor = hayNumeros ? meta < base : true;

  const actual = mean(entregasTardias.slice(-4));
  const s = hayNumeros ? semaforo(actual, meta, menorEsMejor) : null;
  const pendiente = trendSlope(entregasTardias.slice(-8));

  const actualizar = (campo: keyof FichaKpi, valor: string) => {
    set({ kpi: { ...ficha, [campo]: valor } });
  };

  // El logro se otorga y se retira según el estado real de la ficha.
  useEffect(() => {
    if (evaluacion.score === 100) otorgarLogro('kpi-perfecto');
    else quitarLogro('kpi-perfecto');
  }, [evaluacion.score, otorgarLogro, quitarLogro]);

  const colorScore =
    evaluacion.score >= 90 ? tonoColor.ok : evaluacion.score >= 65 ? tonoColor.alerta : tonoColor.critico;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Misión 2 · KPI Lab"
        titulo="Medir lo importante"
        intro="Un KPI no es un número decorativo: es un acuerdo de comportamiento. Completa la ficha y la plataforma evalúa si tu indicador realmente permite gestionar."
        icono={Gauge}
        acciones={
          <Boton variante="secundario" testId="boton-ejemplo-kpi" onClick={() => set({ kpi: ejemplo })}>
            <Wand2 size={14} /> Cargar ejemplo del caso
          </Boton>
        }
      />

      <CoachQ labId="kpi" />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel titulo="Ficha del indicador" subtitulo="Los once componentes que hacen gestionable un KPI">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              label="Objetivo"
              valor={ficha.objetivo}
              onChange={(v) => actualizar('objetivo', v)}
              placeholder="¿Qué quieres cambiar?"
              className="sm:col-span-2"
              testId="kpi-objetivo"
            />
            <Campo
              label="Indicador"
              valor={ficha.indicador}
              onChange={(v) => actualizar('indicador', v)}
              placeholder="% de entregas tardías"
              testId="kpi-indicador"
            />
            <Campo
              label="Fórmula"
              valor={ficha.formula}
              onChange={(v) => actualizar('formula', v)}
              placeholder="Numerador / denominador × 100"
              testId="kpi-formula"
            />
            <Campo
              label="Línea base"
              valor={ficha.lineaBase}
              onChange={(v) => actualizar('lineaBase', v)}
              placeholder="19"
              tipo="number"
              ayuda="El valor actual, con su n y periodo."
              testId="kpi-base"
            />
            <Campo
              label="Meta"
              valor={ficha.meta}
              onChange={(v) => actualizar('meta', v)}
              placeholder="8"
              tipo="number"
              testId="kpi-meta"
            />
            <Campo
              label="Fecha de la meta"
              valor={ficha.fecha}
              onChange={(v) => actualizar('fecha', v)}
              placeholder="Cierre del semestre"
              testId="kpi-fecha"
            />
            <Campo
              label="Frecuencia"
              valor={ficha.frecuencia}
              onChange={(v) => actualizar('frecuencia', v)}
              opciones={['Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Trimestral']}
              testId="kpi-frecuencia"
            />
            <Campo
              label="Fuente del dato"
              valor={ficha.fuente}
              onChange={(v) => actualizar('fuente', v)}
              placeholder="ERP, módulo y hora de corte"
              testId="kpi-fuente"
            />
            <Campo
              label="Responsable"
              valor={ficha.responsable}
              onChange={(v) => actualizar('responsable', v)}
              opciones={[...responsables]}
              testId="kpi-responsable"
            />
            <Campo
              label="Umbral de reacción"
              valor={ficha.umbral}
              onChange={(v) => actualizar('umbral', v)}
              placeholder="Sobre 12 % se convoca al equipo en 24 h"
              className="sm:col-span-2"
              testId="kpi-umbral"
            />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel titulo="Quality Score" subtitulo="Se recalcula mientras escribes" delay={0.05}>
            <div className="text-center">
              <motion.div
                key={evaluacion.score}
                initial={{ scale: 0.94, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className="ql-display text-6xl font-bold leading-none"
                style={{ color: colorScore }}
              >
                {evaluacion.score}
                <span className="text-2xl text-[hsl(var(--muted-foreground))]">/100</span>
              </motion.div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: colorScore }}
                  initial={{ width: 0 }}
                  animate={{ width: `${evaluacion.score}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="mt-5 space-y-1.5">
              {evaluacion.resultados.map((r, i) => (
                <div key={`${r.campo}-${i}`} className="flex items-start gap-2 text-[11px] leading-4">
                  <span
                    className="mt-px grid h-4 w-4 shrink-0 place-items-center rounded-full"
                    style={{
                      backgroundColor: r.ok ? `${tonoColor.ok}22` : `${tonoColor.alerta}22`,
                      color: r.ok ? tonoColor.ok : tonoColor.alerta,
                    }}
                  >
                    {r.ok ? <Check size={10} strokeWidth={3} /> : <TriangleAlert size={9} />}
                  </span>
                  <span className={r.ok ? 'font-semibold' : 'text-[hsl(var(--muted-foreground))]'}>
                    {r.label}
                    {!r.ok ? <span className="block font-normal">{r.falla}</span> : null}
                  </span>
                </div>
              ))}
            </div>

            {evaluacion.score === 100 ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 rounded-xl p-3 text-[11px] font-bold"
                style={{ backgroundColor: `${tonoColor.ok}16`, color: tonoColor.ok }}
              >
                <Sparkles size={14} /> Ficha impecable · +50 QP
              </motion.div>
            ) : null}
          </Panel>

          {hayNumeros ? (
            <Panel titulo="Semáforo del indicador" subtitulo="Últimas 4 semanas del caso contra tu meta" delay={0.1}>
              <div className="flex justify-center">
                <Medidor
                  valor={actual}
                  meta={meta}
                  maximo={Math.max(base * 1.25, meta * 1.5, actual * 1.3)}
                  unidad="%"
                  menorEsMejor={menorEsMejor}
                  color={s ? tonoColor[s.tono] : tonoColor.alerta}
                />
              </div>
              {s ? (
                <div className="mt-3 space-y-2 text-center">
                  <Semaforo tono={s.tono} etiqueta={s.etiqueta} />
                  <p className="text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
                    Brecha de <strong>{num(Math.abs(s.brecha))} pp</strong> contra la meta. Tendencia de las últimas 8
                    semanas: <strong>{pp(pendiente)} por semana</strong>.
                  </p>
                </div>
              ) : null}
            </Panel>
          ) : null}
        </div>
      </div>

      {hayNumeros ? (
        <Panel titulo="Tu indicador en el tiempo" subtitulo="24 semanas del caso, con tu meta y el corte de la intervención" delay={0.15}>
          <GraficoTendencia
            valores={entregasTardias}
            meta={meta}
            unidad="%"
            nombre="Entregas tardías"
            intervencion={13}
            suavizado
          />
          <div className="mt-4">
            <Hallazgo>
              La línea base de {pct(mean(entregasTardias.slice(0, 12)))} corresponde a las 12 semanas previas a la
              intervención; el nivel actual es {pct(actual)}. Un indicador solo se puede leer contra su historia: el
              mismo {pct(actual)} sería excelente si vinieras de 30 % y preocupante si vinieras de 4 %.
            </Hallazgo>
          </div>
        </Panel>
      ) : null}

      <Teoria labId="kpi" />

      <Panel delay={0.2}>
        <Quiz labId="kpi" titulo="Ponlo a prueba" />
      </Panel>

      <CierreMision
        clave="kpi"
        requisitos={[
          { label: 'Quality Score de al menos 80', cumplido: evaluacion.score >= 80 },
          { label: 'Fórmula con numerador y denominador', cumplido: reglas[2].valida(ficha) },
          { label: 'Fuente del dato declarada', cumplido: reglas[8].valida(ficha) },
          { label: 'Respondiste los ejercicios', cumplido: Boolean(estado.quiz['kpi-1'] && estado.quiz['kpi-2']) },
        ]}
        siguiente={{ ruta: '/pareto-lab', label: 'Ir a Pareto Lab' }}
      />
    </div>
  );
}
