import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Check, Download, X } from 'lucide-react';
import {
  definicionCausas,
  incidencias,
  incidenciasCsv,
  incidenciasPorPeriodo,
  type Incidencia,
} from '@/data/incidencias';
import { useProgreso } from '@/store/progreso';
import { countBy, pareto, sum, sumBy } from '@/lib/stats';
import { descargar, num, pct, usd } from '@/lib/formato';
import { tonoColor } from '@/lib/palette';
import { Boton, Chip, EncabezadoPagina, Hallazgo, Panel } from '@/components/lab/primitivos';
import { GraficoPareto } from '@/components/charts/graficos';
import { CoachQ } from '@/components/lab/CoachQ';
import { Teoria } from '@/components/lab/Teoria';
import { Quiz } from '@/components/lab/Quiz';
import { CierreMision } from '@/components/lab/CierreMision';

type Agrupacion = 'causa' | 'area' | 'turno' | 'cliente' | 'responsable';
type Criterio = 'frecuencia' | 'costo' | 'horas';

const agrupaciones: Array<{ id: Agrupacion; label: string }> = [
  { id: 'causa', label: 'Por causa' },
  { id: 'area', label: 'Por área' },
  { id: 'responsable', label: 'Por responsable' },
  { id: 'turno', label: 'Por turno' },
  { id: 'cliente', label: 'Por cliente' },
];

const criterios: Array<{ id: Criterio; label: string; unidad: string }> = [
  { id: 'frecuencia', label: 'Frecuencia', unidad: 'casos' },
  { id: 'costo', label: 'Costo de no calidad', unidad: 'USD' },
  { id: 'horas', label: 'Horas de retraso', unidad: 'horas' },
];

const periodos = [
  { id: 'todo', label: 'Las 24 semanas' },
  { id: 'antes', label: 'Antes (S1–S12)' },
  { id: 'despues', label: 'Después (S13–S24)' },
] as const;

function agregar(rows: Incidencia[], por: Agrupacion, criterio: Criterio) {
  const clave = (i: Incidencia) => String(i[por]);
  if (criterio === 'frecuencia') return countBy(rows, clave);
  if (criterio === 'costo') return sumBy(rows, clave, (i) => i.costo);
  return sumBy(rows, clave, (i) => i.retrasoHoras);
}

export default function ParetoLab() {
  const { estado, set, otorgarLogro } = useProgreso();
  const [por, setPor] = useState<Agrupacion>('causa');
  const [verTabla, setVerTabla] = useState(false);

  const { criterio, periodo, corte, seleccionadas } = estado.pareto;
  const filas = useMemo(() => incidenciasPorPeriodo(periodo), [periodo]);
  const datos = useMemo(() => agregar(filas, por, criterio), [filas, por, criterio]);
  const analisis = useMemo(() => pareto(datos, corte), [datos, corte]);
  const unidad = criterios.find((c) => c.id === criterio)?.unidad ?? '';

  const vitales = analisis.rows.filter((r) => r.vital).map((r) => r.label);
  const seleccionCorrecta =
    seleccionadas.length > 0 &&
    seleccionadas.length === vitales.length &&
    seleccionadas.every((s) => vitales.includes(s));

  // Comparación de Paretos por periodo: el patrón cambia después de intervenir.
  const paretoAntes = useMemo(() => pareto(agregar(incidenciasPorPeriodo('antes'), 'causa', 'frecuencia')), []);
  const paretoDespues = useMemo(() => pareto(agregar(incidenciasPorPeriodo('despues'), 'causa', 'frecuencia')), []);
  const cambioDeOrden = paretoAntes.rows[1]?.label !== paretoDespues.rows[1]?.label;

  const paretoFrecuencia = useMemo(() => pareto(agregar(incidencias, 'causa', 'frecuencia')), []);
  const paretoCosto = useMemo(() => pareto(agregar(incidencias, 'causa', 'costo')), []);
  const difiereCosto = paretoFrecuencia.rows[0]?.label !== paretoCosto.rows[0]?.label;

  useEffect(() => {
    if (seleccionCorrecta) otorgarLogro('pareto-corte');
  }, [seleccionCorrecta, otorgarLogro]);

  const alternarSeleccion = (label: string) => {
    set((prev) => ({
      pareto: {
        ...prev.pareto,
        seleccionadas: prev.pareto.seleccionadas.includes(label)
          ? prev.pareto.seleccionadas.filter((s) => s !== label)
          : [...prev.pareto.seleccionadas, label],
      },
    }));
  };

  const costoTotal = sum(filas.map((f) => f.costo));

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Misión 3 · Pareto Lab"
        titulo="El detective de datos"
        intro={`${incidencias.length} incidencias reales de entrega, con causa, área, turno, costo y horas de retraso. No todas las causas pesan igual: ordena la evidencia y decide dónde poner el primer equipo.`}
        icono={BarChart3}
        acciones={
          <Boton
            variante="secundario"
            testId="boton-csv-pareto"
            onClick={() => descargar(`incidencias-${periodo}.csv`, incidenciasCsv(filas))}
          >
            <Download size={14} /> CSV del filtro
          </Boton>
        }
      />

      <CoachQ labId="pareto" />

      <Panel
        titulo="Construye el Pareto"
        subtitulo={`${filas.length} incidencias en el filtro · ${usd(costoTotal)} de costo de no calidad acumulado`}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {periodos.map((pr) => (
              <Chip
                key={pr.id}
                activo={periodo === pr.id}
                onClick={() => set({ pareto: { ...estado.pareto, periodo: pr.id, seleccionadas: [] } })}
              >
                {pr.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {criterios.map((c) => (
              <Chip
                key={c.id}
                activo={criterio === c.id}
                onClick={() =>
                  set((prev) => ({
                    pareto: {
                      ...prev.pareto,
                      criterio: c.id,
                      seleccionadas: [],
                      criteriosVistos: [...new Set([...prev.pareto.criteriosVistos, c.id])],
                    },
                  }))
                }
              >
                {c.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {agrupaciones.map((a) => (
              <Chip key={a.id} activo={por === a.id} onClick={() => { setPor(a.id); set({ pareto: { ...estado.pareto, seleccionadas: [] } }); }}>
                {a.label}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
              Corte acumulado
            </span>
            <input
              type="range"
              min={50}
              max={95}
              step={5}
              value={corte}
              data-testid="slider-corte"
              onChange={(e) => set({ pareto: { ...estado.pareto, corte: Number(e.target.value), seleccionadas: [] } })}
              className="h-1.5 w-44 cursor-pointer appearance-none rounded-full bg-[hsl(var(--muted))] accent-[hsl(var(--primary))]"
            />
            <span className="ql-mono text-xs font-bold text-[hsl(var(--primary))]">{corte} %</span>
          </div>
        </div>

        <div className="mt-5">
          <GraficoPareto
            datos={datos}
            corte={corte}
            unidad={unidad}
            alSeleccionar={alternarSeleccion}
            seleccionadas={seleccionadas}
            altura={330}
          />
        </div>

        <div className="mt-4">
          <Hallazgo>
            Las primeras <strong>{analisis.vitalCount}</strong> categorías concentran{' '}
            <strong>{pct(analisis.vitalShare)}</strong> del total ({num(analisis.total, 0)} {unidad}). El resto —
            {analisis.rows.length - analisis.vitalCount} categorías— compite por los mismos recursos aportando{' '}
            {pct(100 - analisis.vitalShare)}.
          </Hallazgo>
        </div>
      </Panel>

      <Panel titulo="Ejercicio · marca los pocos vitales" subtitulo="Toca las barras o los nombres. La plataforma valida tu corte." delay={0.05}>
        <div className="flex flex-wrap gap-1.5">
          {analisis.rows.map((r) => (
            <Chip key={r.label} activo={seleccionadas.includes(r.label)} onClick={() => alternarSeleccion(r.label)}>
              {seleccionadas.includes(r.label) ? <Check size={12} /> : null}
              {r.label} · {num(r.percent)} %
            </Chip>
          ))}
        </div>

        {seleccionadas.length > 0 ? (
          <div
            className="mt-4 flex items-start gap-2.5 rounded-xl border p-3.5"
            style={{
              borderColor: `${seleccionCorrecta ? tonoColor.ok : tonoColor.alerta}55`,
              backgroundColor: `${seleccionCorrecta ? tonoColor.ok : tonoColor.alerta}12`,
            }}
          >
            {seleccionCorrecta ? (
              <Check size={16} className="mt-px shrink-0" style={{ color: tonoColor.ok }} />
            ) : (
              <X size={16} className="mt-px shrink-0" style={{ color: tonoColor.alerta }} />
            )}
            <div className="text-[11px] leading-5">
              {seleccionCorrecta ? (
                <>
                  <strong style={{ color: tonoColor.ok }}>Corte exacto · +40 QP.</strong> Tu selección acumula{' '}
                  {pct(analisis.vitalShare)}, justo el bloque mínimo que alcanza el {corte} %. Añadir una categoría más
                  sería diluir el esfuerzo.
                </>
              ) : (
                <>
                  Tu selección acumula{' '}
                  {pct(
                    sum(
                      analisis.rows.filter((r) => seleccionadas.includes(r.label)).map((r) => r.percent),
                    ),
                  )}
                  . El bloque vital con corte al {corte} % son las primeras {analisis.vitalCount} categorías. Recuerda
                  que el orden importa: el bloque se arma de mayor a menor, sin saltos.
                </>
              )}
            </div>
          </div>
        ) : null}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel titulo="¿Frecuencia o costo?" subtitulo="El mismo dataset, dos criterios de priorización" delay={0.1}>
          <div className="space-y-4">
            {[
              { titulo: 'Por número de casos', p: paretoFrecuencia, unidad: 'casos', decimales: 0 },
              { titulo: 'Por costo de no calidad', p: paretoCosto, unidad: 'USD', decimales: 0 },
            ].map((bloque) => (
              <div key={bloque.titulo}>
                <div className="ql-mono mb-2 text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                  {bloque.titulo}
                </div>
                <ol className="space-y-1">
                  {bloque.p.rows.slice(0, 3).map((r, i) => (
                    <li key={r.label} className="flex items-center gap-2 text-[11px]">
                      <span className="ql-mono grid h-4 w-4 shrink-0 place-items-center rounded bg-[hsl(var(--muted))] text-[9px] font-bold">
                        {i + 1}
                      </span>
                      <span className="min-w-0 truncate font-semibold">{r.label}</span>
                      <span className="ml-auto shrink-0 text-[hsl(var(--muted-foreground))]">
                        {num(r.percent)} %
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
            {difiereCosto
              ? 'El primer lugar cambia según el criterio: hay causas menos frecuentes pero más caras por evento. Cuando esto pasa, la prioridad se discute con las dos vistas sobre la mesa.'
              : 'Ambos criterios coinciden en el primer lugar: la prioridad es indiscutible y el argumento ante la gerencia es más simple.'}
          </p>
        </Panel>

        <Panel titulo="El patrón cambia con el tiempo" subtitulo="Pareto antes vs. después de la intervención" delay={0.15}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { titulo: 'Antes (S1–S12)', p: paretoAntes },
              { titulo: 'Después (S13–S24)', p: paretoDespues },
            ].map((bloque) => (
              <div key={bloque.titulo}>
                <div className="ql-mono mb-2 text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                  {bloque.titulo}
                </div>
                <ol className="space-y-1.5">
                  {bloque.p.rows.slice(0, 4).map((r, i) => (
                    <li key={r.label} className="text-[11px] leading-4">
                      <span className="font-bold">{i + 1}. </span>
                      <span>{r.label}</span>
                      <span className="block text-[hsl(var(--muted-foreground))]">
                        {r.count} casos · {num(r.percent)} %
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Boton
              variante="secundario"
              testId="boton-detectar-cambio"
              onClick={() => otorgarLogro('pareto-periodo')}
              disabled={estado.logros.includes('pareto-periodo')}
            >
              {estado.logros.includes('pareto-periodo') ? 'Cambio registrado · +40 QP' : 'Registré el cambio de patrón'}
            </Boton>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
            {cambioDeOrden
              ? `Después de la intervención, "${paretoDespues.rows[1]?.label}" sube al segundo lugar. El Pareto describe el pasado: si el proceso cambió, la prioridad también.`
              : 'El orden se mantiene: la intervención redujo el volumen pero no cambió la estructura del problema.'}
          </p>
        </Panel>
      </div>

      <Panel
        titulo="Los datos crudos"
        subtitulo={`${filas.length} registros del filtro actual`}
        delay={0.2}
        acciones={
          <Boton variante="secundario" onClick={() => setVerTabla((v) => !v)} testId="boton-ver-tabla">
            {verTabla ? 'Ocultar tabla' : 'Ver tabla'}
          </Boton>
        }
      >
        {verTabla ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  {['ID', 'Fecha', 'S', 'Cliente', 'Causa', 'Área', 'Turno', 'Retraso (h)', 'Costo'].map((h) => (
                    <th key={h} className="ql-mono px-2 py-2 font-bold uppercase tracking-[.08em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filas.slice(0, 40).map((f) => (
                  <tr key={f.id} className="border-b border-[hsl(var(--border)/.5)]">
                    <td className="ql-mono px-2 py-1.5">{f.id}</td>
                    <td className="px-2 py-1.5">{f.fecha}</td>
                    <td className="px-2 py-1.5">{f.semana}</td>
                    <td className="px-2 py-1.5">{f.cliente}</td>
                    <td className="px-2 py-1.5 font-semibold">{f.causa}</td>
                    <td className="px-2 py-1.5">{f.area}</td>
                    <td className="px-2 py-1.5">{f.turno}</td>
                    <td className="px-2 py-1.5">{num(f.retrasoHoras)}</td>
                    <td className="px-2 py-1.5">{usd(f.costo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filas.length > 40 ? (
              <p className="mt-3 text-[11px] text-[hsl(var(--muted-foreground))]">
                Mostrando 40 de {filas.length}. Descarga el CSV para trabajar el resto en Excel.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {definicionCausas.map((d) => (
              <div key={d.causa} className="rounded-xl border border-[hsl(var(--border))] p-3">
                <div className="text-xs font-bold">{d.causa}</div>
                <p className="mt-1 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">{d.detalle}</p>
                <div className="ql-mono mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                  {d.antes + d.despues} casos · rama {d.eme} · {d.responsable}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Teoria labId="pareto" />

      <Panel delay={0.25}>
        <Quiz labId="pareto" titulo="Ponlo a prueba" />
      </Panel>

      <CierreMision
        clave="pareto"
        requisitos={[
          { label: 'Identificaste correctamente el bloque vital', cumplido: seleccionCorrecta },
          {
            label: 'Priorizaste también por costo, no solo por frecuencia',
            cumplido: estado.pareto.criteriosVistos.includes('costo'),
          },
          { label: 'Registraste el cambio de patrón entre periodos', cumplido: estado.logros.includes('pareto-periodo') },
          { label: 'Respondiste los ejercicios', cumplido: Boolean(estado.quiz['pareto-1'] && estado.quiz['pareto-2']) },
        ]}
        siguiente={{ ruta: '/ishikawa', label: 'Ir a Ishikawa' }}
      />
    </div>
  );
}
