import { useMemo, useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { semaforo } from '@/data/caso';
import { incidencias, incidenciasPorPeriodo } from '@/data/incidencias';
import { semanas, series, serie } from '@/data/series';
import { countBy, mean, pareto, trendSlope } from '@/lib/stats';
import { num, pct, pp } from '@/lib/formato';
import { tonoColor } from '@/lib/palette';
import { Chip, EncabezadoPagina, Panel, Semaforo } from '@/components/lab/primitivos';
import { GraficoPareto, GraficoTendencia, Medidor } from '@/components/charts/graficos';

type Ventana = 'todo' | 'antes' | 'despues' | 'ultimas6';

const ventanas: Array<{ id: Ventana; label: string }> = [
  { id: 'todo', label: '24 semanas' },
  { id: 'antes', label: 'Antes (S1–S12)' },
  { id: 'despues', label: 'Después (S13–S24)' },
  { id: 'ultimas6', label: 'Últimas 6' },
];

function recorte(valores: number[], ventana: Ventana): number[] {
  if (ventana === 'antes') return valores.slice(0, 12);
  if (ventana === 'despues') return valores.slice(12);
  if (ventana === 'ultimas6') return valores.slice(-6);
  return valores;
}

export default function Dashboard() {
  const [ventana, setVentana] = useState<Ventana>('ultimas6');
  const [detalle, setDetalle] = useState('entregas');

  const tarjetas = useMemo(
    () =>
      series.map((s) => {
        const trozo = recorte(s.valores, ventana);
        const valor = mean(trozo);
        const referencia = mean(recorte(s.valores, 'antes'));
        const est = semaforo(valor, s.meta, s.menorEsMejor);
        return {
          ...s,
          valor,
          variacion: valor - referencia,
          tono: est.tono,
          etiqueta: est.etiqueta,
          brecha: est.brecha,
          pendiente: trendSlope(trozo),
        };
      }),
    [ventana],
  );

  const enMeta = tarjetas.filter((t) => t.tono === 'ok').length;
  const s = serie(detalle);
  const tarjetaDetalle = tarjetas.find((t) => t.id === detalle) ?? tarjetas[0];

  const paretoPeriodo = useMemo(() => {
    const filas = ventana === 'antes' ? incidenciasPorPeriodo('antes') : ventana === 'todo' ? incidencias : incidenciasPorPeriodo('despues');
    return countBy(filas, (i) => i.causa);
  }, [ventana]);

  const analisisPareto = useMemo(() => pareto(paretoPeriodo), [paretoPeriodo]);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Sala de control"
        titulo="Dashboard ejecutivo"
        intro="La vista que la gerencia mira cada semana: nivel, brecha contra meta, tendencia y dónde se concentran las incidencias. Cambia la ventana temporal y observa cómo cambia la conclusión."
        icono={LayoutDashboard}
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {ventanas.map((v) => (
          <Chip key={v.id} activo={ventana === v.id} onClick={() => setVentana(v.id)}>
            {v.label}
          </Chip>
        ))}
        <span className="ql-mono ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">
          {enMeta} de {tarjetas.length} indicadores en meta
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((t) => (
          <button
            key={t.id}
            type="button"
            data-testid={`tarjeta-${t.id}`}
            onClick={() => setDetalle(t.id)}
            className={`ql-card rounded-2xl p-4 text-left transition ${
              detalle === t.id ? 'ring-2 ring-[hsl(var(--primary))]' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="ql-mono text-[10px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">
                {t.label}
              </span>
              <Semaforo tono={t.tono} etiqueta={t.etiqueta} size="sm" />
            </div>
            <div className="ql-display mt-1.5 text-[30px] font-bold leading-none" style={{ color: tonoColor[t.tono] }}>
              {num(t.valor)}
              <span className="ml-1 text-base">{t.unidad}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[hsl(var(--muted-foreground))]">
              <span>
                meta {t.menorEsMejor ? '≤' : '≥'} {t.meta}
                {t.unidad}
              </span>
              <span>brecha {num(Math.abs(t.brecha))} pp</span>
              <span
                style={{
                  color:
                    (t.menorEsMejor && t.variacion < 0) || (!t.menorEsMejor && t.variacion > 0)
                      ? tonoColor.ok
                      : tonoColor.critico,
                }}
              >
                {pp(t.variacion)} vs. base
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel titulo={s.label} subtitulo={s.descripcion} delay={0.05}>
          <GraficoTendencia
            valores={s.valores}
            etiquetas={semanas.map((n) => `S${n}`)}
            meta={s.meta}
            unidad={s.unidad}
            nombre={s.label}
            intervencion={13}
            suavizado
            altura={300}
          />
          <p className="mt-4 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            En la ventana seleccionada el indicador promedia {num(tarjetaDetalle.valor)} {s.unidad} con una pendiente de{' '}
            {num(tarjetaDetalle.pendiente, 2)} {s.unidad} por semana. Un mismo número puede significar cosas opuestas
            según la ventana: por eso el reporte ejecutivo declara siempre el periodo.
          </p>
        </Panel>

        <div className="space-y-6">
          <Panel titulo="Cumplimiento de meta" delay={0.1}>
            <div className="flex justify-center">
              <Medidor
                valor={tarjetaDetalle.valor}
                meta={s.meta}
                maximo={Math.max(...s.valores) * 1.15}
                unidad={s.unidad}
                menorEsMejor={s.menorEsMejor}
                color={tonoColor[tarjetaDetalle.tono]}
              />
            </div>
          </Panel>

          <Panel titulo="Concentración de incidencias" subtitulo={`${analisisPareto.vitalCount} causas explican ${pct(analisisPareto.vitalShare)}`} delay={0.15}>
            <GraficoPareto datos={paretoPeriodo} unidad="casos" altura={240} />
          </Panel>
        </div>
      </div>

      <Panel titulo="Semáforo consolidado" subtitulo="Todas las series, con su meta y su estado en la ventana actual" delay={0.2}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                {['Indicador', 'Valor', 'Meta', 'Brecha', 'Tendencia', 'Estado', 'Responsable'].map((h) => (
                  <th key={h} className="ql-mono px-2 py-2 font-bold uppercase tracking-[.08em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tarjetas.map((t) => (
                <tr key={t.id} className="border-b border-[hsl(var(--border)/.5)]">
                  <td className="px-2 py-2 font-semibold">{t.label}</td>
                  <td className="px-2 py-2">
                    {num(t.valor)} {t.unidad}
                  </td>
                  <td className="px-2 py-2">
                    {t.menorEsMejor ? '≤' : '≥'} {t.meta} {t.unidad}
                  </td>
                  <td className="px-2 py-2">{num(Math.abs(t.brecha))} pp</td>
                  <td className="px-2 py-2" style={{ color: t.pendiente < 0 === t.menorEsMejor ? tonoColor.ok : tonoColor.critico }}>
                    {num(t.pendiente, 2)} / semana
                  </td>
                  <td className="px-2 py-2">
                    <Semaforo tono={t.tono} etiqueta={t.etiqueta} size="sm" />
                  </td>
                  <td className="px-2 py-2 text-[hsl(var(--muted-foreground))]">
                    {t.id === 'entregas' || t.id === 'preparacion' ? 'Logística' : t.id === 'reclamos' ? 'Calidad' : 'Operaciones'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
