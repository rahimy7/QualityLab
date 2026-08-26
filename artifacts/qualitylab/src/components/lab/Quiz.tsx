/**
 * Ejercicio de opción múltiple con retroalimentación por opción.
 *
 * Se responde una sola vez: la retroalimentación pierde su valor pedagógico si
 * el participante puede probar hasta acertar.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, CircleHelp, XCircle } from 'lucide-react';
import { preguntasDe, type Pregunta } from '@/data/quizzes';
import { useProgreso } from '@/store/progreso';
import { cn } from '@/lib/utils';
import { tonoColor } from '@/lib/palette';

function Item({ pregunta }: { pregunta: Pregunta }) {
  const { estado, responder } = useProgreso();
  const elegida = estado.quiz[pregunta.id];
  const respondida = Boolean(elegida);
  const acerto = elegida === pregunta.correcta;

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.45)] p-4 sm:p-5">
      {pregunta.contexto ? (
        <p className="ql-mono mb-3 rounded-lg bg-[hsl(var(--muted)/.5)] px-3 py-2 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
          {pregunta.contexto}
        </p>
      ) : null}

      <div className="flex items-start gap-2.5">
        <CircleHelp size={16} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />
        <p className="text-sm font-semibold leading-6">{pregunta.enunciado}</p>
      </div>

      <div className="mt-4 space-y-2">
        {pregunta.opciones.map((opcion) => {
          const esElegida = elegida === opcion.id;
          const esCorrecta = opcion.id === pregunta.correcta;
          const revelar = respondida && (esElegida || esCorrecta);

          return (
            <div key={opcion.id}>
              <button
                type="button"
                data-testid={`opcion-${pregunta.id}-${opcion.id}`}
                disabled={respondida}
                onClick={() => responder(pregunta.id, opcion.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border p-3 text-left text-xs font-medium leading-5 transition',
                  respondida ? 'cursor-default' : 'hover:border-[hsl(var(--primary))]',
                  revelar && esCorrecta
                    ? 'border-[#2f9e6e] bg-[#2f9e6e]/10'
                    : revelar && esElegida
                      ? 'border-[#d1523f] bg-[#d1523f]/10'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]',
                )}
              >
                <span
                  className={cn(
                    'ql-mono mt-px grid h-5 w-5 shrink-0 place-items-center rounded-md text-[10px] font-bold uppercase',
                    revelar && esCorrecta
                      ? 'bg-[#2f9e6e] text-white'
                      : revelar && esElegida
                        ? 'bg-[#d1523f] text-white'
                        : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
                  )}
                >
                  {opcion.id}
                </span>
                <span className="min-w-0">{opcion.texto}</span>
              </button>

              <AnimatePresence>
                {revelar ? (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pl-11 pr-2 pt-1.5 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]"
                  >
                    {opcion.feedback}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {respondida ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-2.5 rounded-xl border p-3"
            style={{
              borderColor: `${acerto ? tonoColor.ok : tonoColor.critico}55`,
              backgroundColor: `${acerto ? tonoColor.ok : tonoColor.critico}12`,
            }}
          >
            {acerto ? (
              <CheckCircle2 size={16} className="mt-px shrink-0" style={{ color: tonoColor.ok }} />
            ) : (
              <XCircle size={16} className="mt-px shrink-0" style={{ color: tonoColor.critico }} />
            )}
            <div>
              <div className="text-[11px] font-bold" style={{ color: acerto ? tonoColor.ok : tonoColor.critico }}>
                {acerto ? `Correcto · +${pregunta.puntos} Quality Points` : 'Revisemos el razonamiento'}
              </div>
              <p className="mt-1 text-[11px] leading-5 text-[hsl(var(--foreground))]">{pregunta.cierre}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Quiz({ labId, titulo }: { labId: string; titulo?: string }) {
  const lista = preguntasDe(labId);
  const { estado } = useProgreso();
  if (lista.length === 0) return null;

  const respondidas = lista.filter((p) => estado.quiz[p.id]).length;
  const aciertos = lista.filter((p) => estado.quiz[p.id] === p.correcta).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="ql-mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary))]">Ejercicio</div>
          <h2 className="ql-display mt-1 text-xl font-bold">{titulo ?? 'Ponlo a prueba'}</h2>
        </div>
        <span className="ql-mono text-[10px] text-[hsl(var(--muted-foreground))]">
          {respondidas} / {lista.length} respondidas · {aciertos} correctas
        </span>
      </div>
      <div className="space-y-3">
        {lista.map((p) => (
          <Item key={p.id} pregunta={p} />
        ))}
      </div>
    </div>
  );
}

export { Item as PreguntaItem };
