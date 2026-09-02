/**
 * Panel "de dónde salió el número": expone la trazabilidad de un indicador.
 *
 * Muestra fórmula, fuente, responsable, últimas mediciones (con periodo y
 * valor), el n de la muestra, y un enlace directo a /datos para inspeccionar el
 * dataset completo. Es la respuesta al reclamo clásico del participante:
 * "¿pero de dónde sacaron ese número?".
 */
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ExternalLink, Info } from 'lucide-react';
import { casoActivo } from '@/data/casos';
import { semaforo } from '@/data/caso';
import type { IndicadorBase, SerieDefinicion } from '@/data/casos/tipos';
import { mean, stdDev } from '@/lib/stats';
import { num } from '@/lib/formato';

interface Props {
  indicador: IndicadorBase;
  /** Cuántas mediciones recientes mostrar en la tabla. */
  ventana?: number;
  /** Serie temporal opcional; si no se pasa se busca por id. */
  serie?: SerieDefinicion;
  className?: string;
}

function serieDe(indicadorId: string): SerieDefinicion | undefined {
  return casoActivo.series.find((s) => s.id === indicadorId);
}

/**
 * Semana calendario aproximada: el caso arranca en una fecha fija y las
 * semanas se cuentan desde ahí. No se muestra al usuario; sólo se usa como
 * etiqueta ligera.
 */
function etiquetaSemana(indiceCero: number, total: number): string {
  return `Sem ${indiceCero + 1} / ${total}`;
}

export function FuenteDeDatos({ indicador, ventana = 6, serie, className }: Props) {
  const s = serie ?? serieDe(indicador.id);
  const valores = s?.valores ?? [];
  const n = valores.length;
  const recientes = valores.slice(-ventana);
  const desde = Math.max(0, n - ventana);

  const promedio = recientes.length ? mean(recientes) : indicador.valor;
  const sigma = recientes.length > 1 ? stdDev(recientes) : 0;
  const sem = semaforo(promedio, indicador.meta, indicador.menorEsMejor);
  const decimales = indicador.valor % 1 === 0 && promedio % 1 === 0 ? 0 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.4)] p-4 ${className ?? ''}`}
      data-testid={`fuente-${indicador.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.14em] ql-mono text-[hsl(var(--muted-foreground))]">
          <Info size={13} className="text-[hsl(var(--primary))]" />
          De dónde sale este número
        </div>
        <Link
          href="/datos"
          className="ql-mono inline-flex items-center gap-1 text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))] hover:underline"
          data-testid={`fuente-datos-${indicador.id}`}
        >
          Ver dataset <ExternalLink size={11} />
        </Link>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <dl className="space-y-2 text-[11.5px] leading-4">
          <div>
            <dt className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
              Fórmula operativa
            </dt>
            <dd className="mt-0.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] px-2 py-1 font-mono text-[11px]">
              {indicador.label} = {indicador.contexto}
            </dd>
          </div>
          <div>
            <dt className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
              Fuente
            </dt>
            <dd className="mt-0.5">{indicador.fuente}</dd>
          </div>
          <div>
            <dt className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
              Responsable
            </dt>
            <dd className="mt-0.5">{indicador.responsable}</dd>
          </div>
          {n > 0 ? (
            <div>
              <dt className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                Muestra en el reporte
              </dt>
              <dd className="mt-0.5">
                n = {n} lecturas · últimas {recientes.length}: media {num(promedio, decimales)}
                {indicador.unidad} · σ {sigma.toFixed(2)}
              </dd>
            </div>
          ) : (
            <div className="text-[hsl(var(--muted-foreground))]">
              Sin serie temporal registrada para este indicador. El valor se toma de la fuente citada.
            </div>
          )}
        </dl>

        {recientes.length > 0 ? (
          <div>
            <div className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
              Últimas {recientes.length} mediciones
            </div>
            <div className="mt-1 max-h-40 overflow-y-auto rounded-md border border-[hsl(var(--border))]">
              <table className="w-full text-[11px]">
                <thead className="bg-[hsl(var(--muted)/.4)] text-[10px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">
                  <tr>
                    <th className="px-2 py-1 text-left font-medium">Periodo</th>
                    <th className="px-2 py-1 text-right font-medium">Valor</th>
                    <th className="px-2 py-1 text-right font-medium">Δ vs meta</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((v, i) => {
                    const brecha = indicador.menorEsMejor
                      ? v - indicador.meta
                      : indicador.meta - v;
                    const alerta = brecha > 0;
                    return (
                      <tr key={i} className="odd:bg-[hsl(var(--background))]">
                        <td className="px-2 py-1 font-mono text-[hsl(var(--muted-foreground))]">
                          {etiquetaSemana(desde + i, n)}
                        </td>
                        <td className="px-2 py-1 text-right font-mono">
                          {v.toFixed(decimales)}
                          {indicador.unidad}
                        </td>
                        <td
                          className={`px-2 py-1 text-right font-mono ${alerta ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--foreground))]'}`}
                        >
                          {alerta ? '+' : ''}
                          {brecha.toFixed(decimales)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[hsl(var(--border))] pt-3 text-[11px] text-[hsl(var(--muted-foreground))]">
        <span className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
          Cálculo actual
        </span>
        <span>
          Meta {indicador.menorEsMejor ? '≤' : '≥'} {indicador.meta}
          {indicador.unidad} · Semáforo <strong className="font-semibold text-[hsl(var(--foreground))]">{sem.etiqueta}</strong> (brecha {sem.brecha.toFixed(decimales)})
        </span>
      </div>
    </motion.div>
  );
}
