import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardCheck, FileText } from 'lucide-react';
import {
  cicloHallazgo,
  clasificaciones,
  itemsAuditoria,
  puntosPorAcierto,
  type Clasificacion,
} from '@/data/auditoria';
import { useProgreso } from '@/store/progreso';
import { num, pct } from '@/lib/formato';
import { tonoColor } from '@/lib/palette';
import { EncabezadoPagina, Hallazgo, Panel, Semaforo, Tile } from '@/components/lab/primitivos';
import { CoachQ } from '@/components/lab/CoachQ';
import { Teoria } from '@/components/lab/Teoria';
import { Quiz } from '@/components/lab/Quiz';
import { CierreMision } from '@/components/lab/CierreMision';

const puntaje: Record<Clasificacion, number> = { conforme: 100, observacion: 50, 'no-conformidad': 0 };

function TileOculto({ label }: { label: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--background)/.3)] p-3.5">
      <div className="ql-mono truncate text-[10px] uppercase tracking-[-.02em] text-[hsl(var(--muted-foreground))]">
        {label}
      </div>
      <div className="ql-display mt-1.5 text-[26px] font-bold leading-none text-[hsl(var(--muted-foreground)/.45)]">
        ——
      </div>
      <div className="mt-1.5 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">
        Se revela al clasificar los {itemsAuditoria.length} puntos
      </div>
    </div>
  );
}

export default function Auditoria() {
  const { estado, set, otorgarLogro } = useProgreso();
  const respuestas = estado.auditoria;

  const resumen = useMemo(() => {
    const respondidos = itemsAuditoria.filter((i) => respuestas[i.id]);
    const aciertos = itemsAuditoria.filter((i) => respuestas[i.id] === i.respuesta).length;
    // El cumplimiento se calcula con la clasificación real del criterio, no con
    // la del participante: es el estado del proceso, no su calificación.
    const cumplimiento =
      itemsAuditoria.reduce((acc, i) => acc + puntaje[i.respuesta], 0) / itemsAuditoria.length;
    return { respondidos: respondidos.length, aciertos, cumplimiento };
  }, [respuestas]);

  const todosRespondidos = resumen.respondidos === itemsAuditoria.length;
  const auditoriaLimpia = todosRespondidos && resumen.aciertos >= itemsAuditoria.length - 1;

  useEffect(() => {
    if (auditoriaLimpia) otorgarLogro('auditoria-limpia');
  }, [auditoriaLimpia, otorgarLogro]);

  const tonoCumplimiento = resumen.cumplimiento >= 85 ? 'ok' : resumen.cumplimiento >= 60 ? 'alerta' : 'critico';

  const clasificar = (itemId: string, valor: Clasificacion) => {
    set((prev) =>
      // Una sola oportunidad por punto: la retroalimentación pierde valor si se
      // puede probar hasta acertar.
      prev.auditoria[itemId] ? {} : { auditoria: { ...prev.auditoria, [itemId]: valor } },
    );
  };

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Misión 7 · Audit Lab"
        titulo="Cerrar el ciclo"
        intro="Auditar no es buscar culpables: es comprobar si el nuevo estándar vive cuando la sala deja de mirar. Lee la evidencia de cada punto y clasifícala. Cada decisión se contrasta con el criterio del módulo."
        icono={ClipboardCheck}
      />

      <CoachQ labId="auditoria" />

      {/* El cumplimiento y el conteo de no conformidades se calculan con la
          clasificación correcta: mostrarlos antes de tiempo sería entregar la
          respuesta del ejercicio. Se revelan al cerrar la auditoría. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Puntos auditados" valor={resumen.respondidos} decimales={0} detalle={`de ${itemsAuditoria.length}`} />
        <Tile label="Clasificaciones correctas" valor={resumen.aciertos} decimales={0} />
        {todosRespondidos ? (
          <>
            <Tile label="Cumplimiento del proceso" valor={resumen.cumplimiento} sufijo=" %" tono={tonoCumplimiento} />
            <Tile
              label="No conformidades"
              valor={itemsAuditoria.filter((i) => i.respuesta === 'no-conformidad').length}
              decimales={0}
              tono="critico"
            />
          </>
        ) : (
          <>
            <TileOculto label="Cumplimiento del proceso" />
            <TileOculto label="No conformidades" />
          </>
        )}
      </div>

      <Panel titulo="Misión de auditoría · proceso de despacho" subtitulo="Criterio: PR-LOG-04 rev. 3 e IT-ALM-02">
        <div className="space-y-4">
          {itemsAuditoria.map((item, indice) => {
            const elegida = respuestas[item.id];
            const acerto = elegida === item.respuesta;

            return (
              <div key={item.id} className="rounded-2xl border border-[hsl(var(--border))] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="ql-mono grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[hsl(var(--primary)/.12)] text-[11px] font-bold text-[hsl(var(--primary))]">
                    {indice + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-6">{item.pregunta}</p>
                    <p className="ql-mono mt-1 text-[10px] uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                      Criterio: {item.criterio}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  {item.evidencias.map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg bg-[hsl(var(--muted)/.45)] px-3 py-2"
                    >
                      <FileText size={13} className="mt-0.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
                      <div className="min-w-0 text-[11px] leading-4">
                        <span className="ql-mono font-bold uppercase tracking-[.07em] text-[hsl(var(--primary))]">
                          {ev.tipo}
                        </span>
                        <span className="text-[hsl(var(--muted-foreground))]"> · {ev.detalle}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {clasificaciones.map((c) => {
                    const esElegida = elegida === c.id;
                    const esCorrecta = c.id === item.respuesta;
                    const revelar = Boolean(elegida) && (esElegida || esCorrecta);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        data-testid={`audit-${item.id}-${c.id}`}
                        disabled={Boolean(elegida)}
                        onClick={() => clasificar(item.id, c.id)}
                        className={`rounded-xl border p-3 text-left transition ${
                          elegida ? 'cursor-default' : 'hover:border-[hsl(var(--primary))]'
                        }`}
                        style={{
                          borderColor: revelar
                            ? esCorrecta
                              ? tonoColor.ok
                              : tonoColor.critico
                            : 'hsl(var(--border))',
                          backgroundColor: revelar
                            ? `${esCorrecta ? tonoColor.ok : tonoColor.critico}12`
                            : undefined,
                        }}
                      >
                        <div className="text-[11px] font-bold">{c.label}</div>
                        <p className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">
                          {c.descripcion}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {elegida ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mt-4 rounded-xl border p-3.5"
                        style={{
                          borderColor: `${acerto ? tonoColor.ok : tonoColor.alerta}55`,
                          backgroundColor: `${acerto ? tonoColor.ok : tonoColor.alerta}0e`,
                        }}
                      >
                        <div
                          className="ql-mono text-[10px] font-bold uppercase tracking-[.12em]"
                          style={{ color: acerto ? tonoColor.ok : tonoColor.alerta }}
                        >
                          {acerto ? `Correcto · +${puntosPorAcierto} QP` : 'Revisemos el criterio'}
                        </div>
                        <p className="mt-1.5 text-[11px] leading-5">{item.explicacion}</p>
                        <div className="mt-3 rounded-lg bg-[hsl(var(--background)/.6)] p-2.5">
                          <div className="ql-mono text-[9px] font-bold uppercase tracking-[.11em] text-[hsl(var(--muted-foreground))]">
                            Redacción del hallazgo
                          </div>
                          <p className="mt-1 text-[11px] leading-5">{item.hallazgo}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Panel>

      {todosRespondidos ? (
        <Panel titulo="Resultado de la auditoría" delay={0.05}>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="ql-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                Cumplimiento del proceso
              </div>
              <div className="ql-display text-5xl font-bold" style={{ color: tonoColor[tonoCumplimiento] }}>
                {num(resumen.cumplimiento, 0)} %
              </div>
            </div>
            <Semaforo
              tono={tonoCumplimiento}
              etiqueta={
                tonoCumplimiento === 'ok'
                  ? 'Sistema sostenible'
                  : tonoCumplimiento === 'alerta'
                    ? 'Sistema en observación'
                    : 'Sistema en riesgo'
              }
            />
          </div>
          <div className="mt-4">
            <Hallazgo>
              Clasificaste correctamente {resumen.aciertos} de {itemsAuditoria.length} puntos. El proceso mejoró su
              resultado, pero el sistema que lo sostiene tiene {itemsAuditoria.filter((i) => i.respuesta === 'no-conformidad').length}{' '}
              no conformidades: el estándar existe y produce resultados mientras hay atención, pero todavía no vive
              solo. Ese es exactamente el punto donde la mayoría de los proyectos de mejora se pierden.
            </Hallazgo>
          </div>
        </Panel>
      ) : null}

      <Panel titulo="Del hallazgo a la eficacia" subtitulo="El ciclo completo, y el paso que casi siempre se salta" delay={0.1}>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {cicloHallazgo.map((paso, i) => (
            <motion.div
              key={paso.paso}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-[hsl(var(--border))] p-3.5"
              style={i === cicloHallazgo.length - 1 ? { borderColor: 'hsl(var(--primary))' } : undefined}
            >
              <div className="ql-mono text-[9px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">
                Paso {i + 1}
              </div>
              <div className="mt-1 text-xs font-bold">{paso.paso}</div>
              <p className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{paso.detalle}</p>
            </motion.div>
          ))}
        </div>
      </Panel>

      <Teoria labId="auditoria" />

      <Panel delay={0.15}>
        <Quiz labId="auditoria" titulo="Ponlo a prueba" />
      </Panel>

      <CierreMision
        clave="auditoria"
        requisitos={[
          { label: 'Clasificaste los seis puntos', cumplido: todosRespondidos },
          { label: 'Al menos 5 de 6 clasificaciones correctas', cumplido: resumen.aciertos >= 5 },
          { label: 'Respondiste los ejercicios', cumplido: Boolean(estado.quiz['audit-1'] && estado.quiz['audit-2']) },
        ]}
        siguiente={{ ruta: '/proyecto', label: 'Armar el proyecto final' }}
      />
    </div>
  );
}
