/**
 * Entrevista con IA a un empleado del caso.
 *
 * Al abrir el diálogo:
 *  - Se sortea un rol de `casoActivo.rolesEntrevista`.
 *  - Se sortea también, en secreto, si el testimonio será coherente o tendrá
 *    contradicciones con la data. El participante no lo sabe hasta cerrar.
 *
 * El chat consulta a POST /api/entrevista/mensaje, que reenvía a OpenAI
 * usando la key del servidor (nunca en el navegador).
 */
import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, MessagesSquare, Send, Shuffle, Sparkles, X } from 'lucide-react';
import { casoActivo } from '@/data/casos';
import { idDispositivo } from '@/lib/dispositivo';
import type { RolEmpleado } from '@/data/casos/tipos';
import { Boton } from './primitivos';
import { useProgreso } from '@/store/progreso';

interface Mensaje {
  role: 'user' | 'assistant';
  content: string;
}

/** Extrae hechos verificables del caso activo para pasarlos al prompt. */
function hechosDelCaso(): string[] {
  const c = casoActivo;
  const inds = c.indicadoresBase.map(
    (i) =>
      `${i.label}: ${i.valor}${i.unidad} (meta ${i.menorEsMejor ? '≤' : '≥'} ${i.meta}${i.unidad}, fuente ${i.fuente})`,
  );
  const paretoTop = c.definicionCausas
    .slice()
    .sort((a, b) => b.antes + b.despues - (a.antes + a.despues))
    .slice(0, 3)
    .map((d) => `${d.causa}: ${d.antes + d.despues} eventos totales (${d.antes} antes, ${d.despues} después)`);
  return [
    `Encargo: ${c.empresa.encargo}`,
    `Semana de intervención: ${c.semanaIntervencion} de ${c.totalSemanas}.`,
    ...inds,
    `Top causas del Pareto: ${paretoTop.join('; ')}.`,
    `Volumen anual: ${c.economia.volumenAnual} ${c.economia.volumenLabel}. Inversión mejora: ${c.economia.inversionMejora} USD.`,
  ];
}

function sortear<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Sorteo {
  rol: RolEmpleado;
  coherente: boolean;
}

export function EntrevistaEmpleado() {
  const [abierto, setAbierto] = useState(false);
  const [sorteo, setSorteo] = useState<Sorteo | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [pregunta, setPregunta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { otorgarLogro } = useProgreso();

  const hechos = useMemo(() => hechosDelCaso(), []);

  function iniciar() {
    const rol = sortear(casoActivo.rolesEntrevista);
    const coherente = Math.random() < 0.5;
    setSorteo({ rol, coherente });
    setMensajes([
      {
        role: 'assistant',
        content: `Hola, soy ${rol.puesto.toLowerCase()} del área de ${rol.area}. ¿En qué te ayudo? Tengo unos minutos entre lote y lote.`,
      },
    ]);
    setPregunta('');
    setRevelado(false);
    setErrorMsg(null);
    setAbierto(true);
  }

  function cerrar() {
    setAbierto(false);
  }

  function nuevoEntrevistado() {
    setSorteo(null);
    setMensajes([]);
    setRevelado(false);
    setErrorMsg(null);
    iniciar();
  }

  async function enviar() {
    if (!sorteo || !pregunta.trim() || cargando) return;
    const texto = pregunta.trim();
    const historialParaEnviar = mensajes;
    setMensajes((prev) => [...prev, { role: 'user', content: texto }]);
    setPregunta('');
    setCargando(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/entrevista/mensaje', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          rol: {
            puesto: sorteo.rol.puesto,
            area: sorteo.rol.area,
            antiguedad: sorteo.rol.antiguedad,
            perspectiva: sorteo.rol.perspectiva,
            sabeDe: sorteo.rol.sabeDe,
            desconoce: sorteo.rol.desconoce,
          },
          caso: {
            id: casoActivo.id,
            empresa: casoActivo.empresa.nombre,
            sector: casoActivo.empresa.sector,
            encargo: casoActivo.empresa.encargo,
          },
          hechos,
          coherente: sorteo.coherente,
          historial: historialParaEnviar,
          pregunta: texto,
          dispositivoId: idDispositivo(),
        }),
      });
      if (!res.ok) {
        const detalle = await res.json().catch(() => null);
        throw new Error(detalle?.mensaje ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { respuesta: string };
      setMensajes((prev) => [...prev, { role: 'assistant', content: data.respuesta }]);
      // desplaza al último mensaje.
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      });
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'error desconocido';
      setErrorMsg(`No pude conectar con la IA: ${mensaje}. Verifica que la API esté corriendo y que OPENAI_API_KEY esté configurada.`);
    } finally {
      setCargando(false);
    }
  }

  function revelar() {
    setRevelado(true);
    if (sorteo && !sorteo.coherente) {
      otorgarLogro('entrevista-detective');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={iniciar}
        className="ql-mono inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.08)] px-3 py-2 text-[11px] uppercase tracking-[.14em] text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary)/.15)]"
        data-testid="boton-entrevistar"
      >
        <MessagesSquare size={13} /> Entrevistar a un empleado
      </button>

      <AnimatePresence>
        {abierto && sorteo ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3"
            onClick={cerrar}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start gap-3 border-b border-[hsl(var(--border))] p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[hsl(var(--muted))] text-2xl">
                  {sorteo.rol.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="ql-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">
                    Entrevistando
                  </div>
                  <div className="text-sm font-bold leading-tight">{sorteo.rol.puesto}</div>
                  <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    {sorteo.rol.area} · {sorteo.rol.antiguedad}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={cerrar}
                  className="rounded-md p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/.5)]"
                  data-testid="boton-cerrar-entrevista"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Descripción del rol */}
              <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/.3)] px-4 py-2 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">
                {sorteo.rol.descripcion}
              </div>

              {/* Chat */}
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {mensajes.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-5 ${
                        m.role === 'user'
                          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                          : 'border border-[hsl(var(--border))] bg-[hsl(var(--background))]'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {cargando ? (
                  <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--primary))]" />
                    Pensando…
                  </div>
                ) : null}
                {errorMsg ? (
                  <div className="rounded-md border border-[hsl(var(--destructive)/.4)] bg-[hsl(var(--destructive)/.08)] p-2 text-[11px] text-[hsl(var(--destructive))]">
                    {errorMsg}
                  </div>
                ) : null}
              </div>

              {/* Revelación */}
              {revelado ? (
                <div
                  className={`border-t px-4 py-3 text-[12px] ${
                    sorteo.coherente
                      ? 'border-[hsl(var(--border))] bg-[hsl(140_60%_10%/.6)] text-[hsl(140_60%_80%)]'
                      : 'border-[hsl(var(--destructive)/.4)] bg-[hsl(0_60%_10%/.6)] text-[hsl(15_80%_82%)]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {sorteo.coherente ? (
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    )}
                    <div className="leading-4">
                      <div className="font-semibold">
                        {sorteo.coherente
                          ? 'Testimonio coherente con la data'
                          : 'Testimonio con contradicciones'}
                      </div>
                      <div className="mt-1 text-[11.5px] opacity-90">
                        {sorteo.coherente
                          ? 'La IA tenía instrucciones de mantenerse alineada con los números de la app. Aun así, revisa: hasta un relato coherente puede omitir información. ¿Qué dato importante NO mencionó?'
                          : 'La IA tenía instrucciones de introducir 1 o 2 inconsistencias sutiles: minimizar un problema, culpar a otra área, dar cifras optimistas que la app desmiente. Repasa la conversación y anótalas antes de cerrar.'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Input + acciones */}
              <div className="border-t border-[hsl(var(--border))] p-3">
                <div className="flex gap-2">
                  <input
                    value={pregunta}
                    onChange={(e) => setPregunta(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void enviar();
                      }
                    }}
                    placeholder="Haz una pregunta al empleado…"
                    disabled={cargando}
                    className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-[13px] outline-none focus:border-[hsl(var(--primary))]"
                    data-testid="input-pregunta-entrevista"
                  />
                  <button
                    type="button"
                    onClick={() => void enviar()}
                    disabled={cargando || !pregunta.trim()}
                    className="ql-mono inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--primary))] px-3 py-2 text-[11px] uppercase tracking-[.14em] text-[hsl(var(--primary-foreground))] disabled:opacity-40"
                    data-testid="boton-enviar-entrevista"
                  >
                    <Send size={13} /> Enviar
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={nuevoEntrevistado}
                      className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2 py-1 hover:bg-[hsl(var(--muted)/.5)]"
                      data-testid="boton-sortear-nuevo"
                    >
                      <Shuffle size={11} /> Sortear otro
                    </button>
                    {!revelado ? (
                      <button
                        type="button"
                        onClick={revelar}
                        disabled={mensajes.length < 3}
                        className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--primary)/.3)] px-2 py-1 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.08)] disabled:opacity-40"
                        data-testid="boton-revelar-entrevista"
                        title="Cierra la entrevista y revela si el testimonio era coherente"
                      >
                        <Sparkles size={11} /> Cerrar entrevista y revelar
                      </button>
                    ) : null}
                  </div>
                  <span className="ql-mono uppercase tracking-[.12em]">
                    {mensajes.filter((m) => m.role === 'user').length} preguntas
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
