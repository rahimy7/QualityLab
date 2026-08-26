import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { GitBranch, Plus, Star, Trash2 } from 'lucide-react';
import { seisEmes, type EmeId } from '@/data/caso';
import { definicionCausas } from '@/data/incidencias';
import { useProgreso, type CausaIshikawa } from '@/store/progreso';
import { usePaleta } from '@/lib/palette';
import { Boton, EncabezadoPagina, Hallazgo, Panel } from '@/components/lab/primitivos';
import { CoachQ } from '@/components/lab/CoachQ';
import { Teoria } from '@/components/lab/Teoria';

const EFECTO = 'Pedido entregado después de la fecha comprometida';

/** Causas del caso que el participante puede colocar en la rama que crea correcta. */
const banco: Array<{ texto: string; correcta: EmeId }> = [
  { texto: 'El proveedor entrega después de la fecha confirmada', correcta: 'material' },
  { texto: 'El operario busca producto fuera de su ubicación', correcta: 'mano-obra' },
  { texto: 'El maestro de ubicaciones no se actualiza tras el relayout', correcta: 'metodo' },
  { texto: 'La terminal de radiofrecuencia se traba y se pica con lista impresa', correcta: 'maquina' },
  { texto: 'El campo "causa del retraso" no es obligatorio en el ERP', correcta: 'medicion' },
  { texto: 'El pasillo C tiene etiquetas antiguas todavía adheridas', correcta: 'medio' },
  { texto: 'No existe criterio común de urgencia entre Ventas y Operaciones', correcta: 'metodo' },
  { texto: 'La ruta se reprograma sin avisar a despacho', correcta: 'medio' },
  { texto: 'No se mide el tiempo de liberación de la orden', correcta: 'medicion' },
  { texto: 'El montacargas del turno noche está fuera de servicio', correcta: 'maquina' },
];

function Espina({ conteos }: { conteos: Record<string, number> }) {
  const p = usePaleta();
  const arriba = seisEmes.slice(0, 3);
  const abajo = seisEmes.slice(3);

  return (
    <svg viewBox="0 0 640 260" className="w-full">
      <line x1={40} y1={130} x2={520} y2={130} stroke={p.muted} strokeWidth={2.5} />
      <polygon points="520,120 552,130 520,140" fill={p.primary} />
      <rect x={556} y={106} width={78} height={48} rx={9} fill={p.primary} />
      <text x={595} y={126} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={700}>
        EFECTO
      </text>
      <text x={595} y={140} textAnchor="middle" fontSize={7.5} fill="#fff" opacity={0.85}>
        Entrega tardía
      </text>

      {[...arriba.map((e, i) => ({ e, i, arriba: true })), ...abajo.map((e, i) => ({ e, i, arriba: false }))].map(
        ({ e, i, arriba: esArriba }) => {
          const x = 110 + i * 140;
          const yBase = 130;
          const yPunta = esArriba ? 46 : 214;
          const n = conteos[e.id] ?? 0;
          return (
            <motion.g
              key={e.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08 + (esArriba ? 0 : 0.24) }}
              style={{ transformOrigin: `${x}px ${yBase}px` }}
            >
              <line
                x1={x - 42}
                y1={yBase}
                x2={x + 34}
                y2={yPunta}
                stroke={n > 0 ? p.primary : p.grid}
                strokeWidth={n > 0 ? 2.2 : 1.5}
              />
              <rect
                x={x - 6}
                y={esArriba ? yPunta - 22 : yPunta + 2}
                width={104}
                height={22}
                rx={7}
                fill={n > 0 ? p.primary : 'transparent'}
                stroke={n > 0 ? 'none' : p.grid}
                strokeWidth={1.2}
              />
              <text
                x={x + 46}
                y={esArriba ? yPunta - 7 : yPunta + 17}
                textAnchor="middle"
                fontSize={9}
                fontWeight={700}
                fill={n > 0 ? '#fff' : p.muted}
              >
                {e.label} {n > 0 ? `(${n})` : ''}
              </text>
            </motion.g>
          );
        },
      )}
    </svg>
  );
}

export default function Ishikawa() {
  const { estado, set, otorgarLogro } = useProgreso();
  const [borradores, setBorradores] = useState<Record<string, string>>({});
  const ishikawa = estado.ishikawa;

  const conteos = useMemo(
    () => Object.fromEntries(seisEmes.map((e) => [e.id, (ishikawa[e.id] ?? []).length])),
    [ishikawa],
  );
  const total = Object.values(conteos).reduce((a, b) => a + b, 0);
  const ramasCubiertas = Object.values(conteos).filter((n) => n > 0).length;
  const conEvidencia = Object.values(ishikawa).flat().filter((c) => c.tieneEvidencia).length;

  useEffect(() => {
    if (ramasCubiertas === seisEmes.length) otorgarLogro('ishikawa-completo');
  }, [ramasCubiertas, otorgarLogro]);

  const agregar = (eme: EmeId, texto: string) => {
    const limpio = texto.trim();
    if (!limpio) return;
    const nueva: CausaIshikawa = {
      id: `${eme}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      texto: limpio,
      impacto: 2,
      tieneEvidencia: false,
    };
    set((prev) => ({ ishikawa: { ...prev.ishikawa, [eme]: [...(prev.ishikawa[eme] ?? []), nueva] } }));
    setBorradores((b) => ({ ...b, [eme]: '' }));
  };

  const actualizar = (eme: EmeId, id: string, parcial: Partial<CausaIshikawa>) => {
    set((prev) => ({
      ishikawa: {
        ...prev.ishikawa,
        [eme]: (prev.ishikawa[eme] ?? []).map((c) => (c.id === id ? { ...c, ...parcial } : c)),
      },
    }));
  };

  const eliminar = (eme: EmeId, id: string) => {
    set((prev) => ({ ishikawa: { ...prev.ishikawa, [eme]: (prev.ishikawa[eme] ?? []).filter((c) => c.id !== id) } }));
  };

  const yaUsadas = new Set(Object.values(ishikawa).flat().map((c) => c.texto));
  const disponibles = banco.filter((b) => !yaUsadas.has(b.texto));

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Misión 4a · Root Cause Lab"
        titulo="Ishikawa 6M"
        intro={`Efecto bajo análisis: ${EFECTO}. Organiza las causas posibles en las seis ramas antes de bajar con los 5 porqués: así evitas profundizar por la rama equivocada.`}
        icono={GitBranch}
      />

      <CoachQ labId="ishikawa" />

      <Panel titulo="El diagrama" subtitulo={`${total} causas registradas · ${ramasCubiertas}/6 ramas con contenido · ${conEvidencia} con evidencia`}>
        <Espina conteos={conteos} />
        {ramasCubiertas === seisEmes.length ? (
          <div className="mt-2">
            <Hallazgo titulo="Espina completa · +40 QP">
              Tienes al menos una causa en cada rama. Ahora la parte difícil: de estas {total} causas, ¿cuáles tienen
              evidencia y cuáles son solo hipótesis? Marca la estrella únicamente en las que puedas sustentar con un
              registro, una observación o una entrevista.
            </Hallazgo>
          </div>
        ) : null}
      </Panel>

      {disponibles.length > 0 ? (
        <Panel titulo="Banco de causas del caso" subtitulo="Toca una causa y colócala en la rama que consideres correcta" delay={0.05}>
          <div className="space-y-2">
            {disponibles.map((b) => (
              <div
                key={b.texto}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-[hsl(var(--border))] p-2.5"
              >
                <span className="min-w-0 flex-1 text-[11px] leading-4">{b.texto}</span>
                <div className="flex flex-wrap gap-1">
                  {seisEmes.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      data-testid={`colocar-${e.id}`}
                      onClick={() => agregar(e.id, b.texto)}
                      className="rounded-md border border-[hsl(var(--border))] px-1.5 py-1 text-[9px] font-bold uppercase tracking-[.06em] text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                    >
                      {e.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
            No hay una única clasificación correcta: lo importante es que el equipo pueda defender por qué una causa
            pertenece a esa rama. Discutirlo es parte del ejercicio.
          </p>
        </Panel>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {seisEmes.map((eme, i) => (
          <Panel key={eme.id} titulo={eme.label} subtitulo={eme.guia} delay={0.05 + i * 0.03}>
            <div className="space-y-2">
              {(ishikawa[eme.id] ?? []).map((causa) => (
                <div key={causa.id} className="rounded-xl border border-[hsl(var(--border))] p-2.5">
                  <div className="flex items-start gap-2">
                    <span className="min-w-0 flex-1 text-[11px] leading-4">{causa.texto}</span>
                    <button
                      type="button"
                      onClick={() => eliminar(eme.id, causa.id)}
                      className="shrink-0 text-[hsl(var(--muted-foreground))] transition hover:text-[#d1523f]"
                      aria-label="Eliminar causa"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {([1, 2, 3] as const).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => actualizar(eme.id, causa.id, { impacto: n })}
                          aria-label={`Impacto ${n}`}
                        >
                          <Star
                            size={12}
                            className={n <= causa.impacto ? 'fill-[hsl(var(--accent))] text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]'}
                          />
                        </button>
                      ))}
                    </div>
                    <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">
                      <input
                        type="checkbox"
                        checked={causa.tieneEvidencia}
                        onChange={(e) => actualizar(eme.id, causa.id, { tieneEvidencia: e.target.checked })}
                        className="h-3 w-3 accent-[hsl(var(--primary))]"
                      />
                      Tengo evidencia
                    </label>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  value={borradores[eme.id] ?? ''}
                  data-testid={`input-causa-${eme.id}`}
                  onChange={(e) => setBorradores((b) => ({ ...b, [eme.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') agregar(eme.id, borradores[eme.id] ?? '');
                  }}
                  placeholder="Añadir causa…"
                  className="min-w-0 flex-1 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background)/.6)] px-2.5 py-2 text-[11px] outline-none focus:border-[hsl(var(--primary))]"
                />
                <Boton
                  variante="secundario"
                  className="shrink-0 px-2.5"
                  onClick={() => agregar(eme.id, borradores[eme.id] ?? '')}
                  testId={`agregar-${eme.id}`}
                >
                  <Plus size={14} />
                </Boton>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel titulo="Cómo clasificó el caso real" subtitulo="Las causas del dataset, con la rama a la que corresponden" delay={0.2}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {definicionCausas.map((d) => {
            const rama = seisEmes.find((e) => e.id === d.eme);
            return (
              <div key={d.causa} className="rounded-xl border border-[hsl(var(--border))] p-3">
                <div className="ql-mono text-[9px] uppercase tracking-[.12em] text-[hsl(var(--primary))]">
                  {rama?.label}
                </div>
                <div className="mt-1 text-xs font-bold">{d.causa}</div>
                <p className="mt-1 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">{d.detalle}</p>
              </div>
            );
          })}
        </div>
      </Panel>

      <Teoria labId="ishikawa" />

      <div className="ql-card rounded-2xl p-5">
        <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          El Ishikawa abre el abanico de hipótesis. La misión 4 se cierra en{' '}
          <Link href="/cinco-porques" className="font-bold text-[hsl(var(--primary))] hover:underline">
            5 Porqués
          </Link>
          , donde eliges una rama y bajas hasta la causa raíz.
        </p>
      </div>
    </div>
  );
}
