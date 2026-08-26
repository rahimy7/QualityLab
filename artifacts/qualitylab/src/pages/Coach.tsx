import { useMemo, useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { buscarRespuesta, preguntasSugeridas } from '@/data/coach';
import { incidencias } from '@/data/incidencias';
import { entregasTardias } from '@/data/series';
import { useProgreso } from '@/store/progreso';
import { countBy, compareBeforeAfter, mean, pareto, stdDev } from '@/lib/stats';
import { num, pct, valorP } from '@/lib/formato';
import { Chip, EncabezadoPagina, Panel } from '@/components/lab/primitivos';

interface Mensaje {
  de: 'yo' | 'q';
  titulo?: string;
  texto: string;
  repregunta?: string;
}

const BIENVENIDA: Mensaje = {
  de: 'q',
  titulo: 'Q · Coach de mejora continua',
  texto:
    'Puedo ayudarte con lo que estás trabajando en la plataforma. Pregúntame por un concepto, o usa los botones de análisis: reviso tu propio KPI, tu Pareto, tu cadena de porqués, tu Hoshin y tu prueba de mejora con los datos reales que tengas cargados.',
  repregunta: '¿Con qué laboratorio estás ahora?',
};

export default function Coach() {
  const { estado } = useProgreso();
  const [mensajes, setMensajes] = useState<Mensaje[]>([BIENVENIDA]);
  const [entrada, setEntrada] = useState('');
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [mensajes]);

  /* ---------------- Análisis sobre el estado real del participante ---------------- */

  const analisis = useMemo(
    () => ({
      kpi: (): Mensaje => {
        const k = estado.kpi;
        const faltan: string[] = [];
        if (!k.formula.includes('/') && !k.formula.includes('÷')) faltan.push('la fórmula con numerador y denominador');
        if (!k.fuente.trim()) faltan.push('la fuente del dato');
        if (!k.fecha.trim()) faltan.push('la fecha de la meta');
        if (!k.umbral.trim()) faltan.push('el umbral que dispara una acción');
        if (!k.responsable.trim()) faltan.push('el responsable');

        const base = Number(k.lineaBase);
        const meta = Number(k.meta);
        const actual = mean(entregasTardias.slice(-4));

        if (!k.indicador.trim()) {
          return {
            de: 'q',
            titulo: 'Tu KPI',
            texto: 'Todavía no tienes una ficha cargada. Abre KPI Lab y completa al menos objetivo, indicador y fórmula; con eso ya puedo darte una lectura.',
          };
        }

        const brecha = Number.isFinite(meta) ? actual - meta : null;
        return {
          de: 'q',
          titulo: `Lectura de "${k.indicador}"`,
          texto: [
            Number.isFinite(base) && Number.isFinite(meta)
              ? `Nivel: el caso está hoy en ${pct(actual)} y tu meta es ${num(meta)} %. La brecha es de ${num(Math.abs(brecha ?? 0))} puntos porcentuales — no "${num(Math.abs(brecha ?? 0))} %", que es otra cosa.`
              : 'Falta línea base o meta numérica: sin ellas no hay brecha que leer.',
            `Variación: desde la línea base de ${pct(mean(entregasTardias.slice(0, 12)))} la reducción relativa acumulada es de ${pct(Math.abs(((actual - mean(entregasTardias.slice(0, 12))) / mean(entregasTardias.slice(0, 12))) * 100))}.`,
            faltan.length
              ? `Tu ficha todavía no permite gestionar del todo: falta ${faltan.join(', ')}.`
              : 'Tu ficha tiene los componentes necesarios para gestionar: objetivo, fórmula, base, meta con fecha, frecuencia, fuente, dueño y umbral.',
          ].join('\n\n'),
          repregunta: '¿Quién actúa exactamente cuando el indicador cruza tu umbral, y en cuánto tiempo?',
        };
      },

      pareto: (): Mensaje => {
        const datos = countBy(incidencias, (i) => i.causa);
        const p = pareto(datos, estado.pareto.corte);
        const primeras = p.rows.slice(0, p.vitalCount).map((r) => `${r.label} (${num(r.percent)} %)`);
        return {
          de: 'q',
          titulo: 'Tu Pareto',
          texto: `Con corte al ${estado.pareto.corte} %, ${p.vitalCount} de ${p.rows.length} categorías concentran ${pct(p.vitalShare)} de las ${p.total} incidencias: ${primeras.join(', ')}.\n\nAtacar esas ${p.vitalCount} concentra el esfuerzo donde está el problema. Las ${p.rows.length - p.vitalCount} restantes aportan ${pct(100 - p.vitalShare)} y compiten por el mismo equipo.`,
          repregunta: '¿Tu prioridad cambia si ordenas por costo en vez de por número de casos?',
        };
      },

      porques: (): Mensaje => {
        const completos = estado.porques.filter((p) => p.respuesta.trim().length >= 12).length;
        const conEvidencia = estado.porques.filter(
          (p) => p.evidencia.trim() !== '' && !p.evidencia.startsWith('Todavía'),
        ).length;
        if (completos === 0) {
          return {
            de: 'q',
            titulo: 'Tu cadena de porqués',
            texto: 'Todavía no has escrito ningún nivel. Empieza por un hecho verificable: "el 19 % de los pedidos se entrega después de la fecha comprometida", y de ahí baja preguntando por qué.',
          };
        }
        return {
          de: 'q',
          titulo: 'Tu cadena de porqués',
          texto: `Tienes ${completos} de 5 niveles respondidos y ${conEvidencia} con evidencia declarada.\n\n${
            conEvidencia < completos
              ? 'Los niveles sin evidencia son hipótesis. Está bien tenerlas, pero decláralas como tales: un informe que distingue lo comprobado de lo supuesto es más creíble, no menos.'
              : 'Todos los niveles con respuesta tienen evidencia. Ahora aplica la prueba de dos vías: si eliminas la condición que identificaste, ¿el efecto desaparece?'
          }${
            estado.causaRaiz.enunciado.trim()
              ? `\n\nTu causa raíz: "${estado.causaRaiz.enunciado.trim()}". Revisa que esté formulada como una condición del sistema y no como una falla de una persona.`
              : '\n\nTodavía no formulaste la causa raíz.'
          }`,
          repregunta: '¿Tu causa raíz está dentro del alcance de acción del equipo?',
        };
      },

      mejora: (): Mensaje => {
        const antes = entregasTardias.slice(0, 12);
        const despues = entregasTardias.slice(estado.mejora.inicioDespues - 1);
        const c = compareBeforeAfter(antes, despues);
        return {
          de: 'q',
          titulo: 'Tu análisis de mejora',
          texto: `Con el corte en la semana ${estado.mejora.inicioDespues}: de ${pct(c.before.mean)} a ${pct(c.after.mean)}, una reducción de ${pct(Math.abs(c.relativeChange))} (${num(Math.abs(c.absoluteChange))} puntos porcentuales).\n\nLa prueba t de Welch da ${valorP(c.pValue)}, ${c.significant ? 'por debajo de 0.05: la diferencia es mayor que la variación normal del proceso' : 'por encima de 0.05: no puedes descartar que sea variación normal'}.\n\nLa variabilidad también cambió: σ pasó de ${num(c.before.sd)} a ${num(c.after.sd)}. ${
            c.after.sd < c.before.sd
              ? 'Eso importa tanto como el nivel: el proceso no solo mejoró, se volvió más predecible.'
              : 'Cuidado: el nivel bajó pero la dispersión no. Un proceso mejor pero más errático sigue incumpliendo la promesa de forma impredecible.'
          }`,
          repregunta: '¿La carta de control confirma que el nuevo nivel se sostiene, o solo bajó el promedio?',
        };
      },

      hoshin: (): Mensaje => {
        const h = estado.hoshin;
        const kpis = h.kpis.filter((k) => k.trim());
        const inis = h.iniciativas.filter((k) => k.trim());
        const huerfanas = inis.filter((_, i) => !h.cruces.some((c) => c.startsWith(`${i}-`)));
        const sueltos = kpis.filter((_, j) => !h.cruces.some((c) => c.endsWith(`-${j}`)));
        if (!inis.length || !kpis.length) {
          return {
            de: 'q',
            titulo: 'Tu Hoshin',
            texto: 'Todavía no hay suficiente despliegue que revisar. Carga al menos dos indicadores y dos iniciativas en Hoshin Kanri.',
          };
        }
        return {
          de: 'q',
          titulo: 'Tu Hoshin',
          texto: `Tienes ${kpis.length} indicadores, ${inis.length} iniciativas y ${h.cruces.length} cruces marcados.\n\n${
            huerfanas.length ? `Iniciativas sin ningún KPI asociado: ${huerfanas.join(', ')}. Consumen recursos sin mover nada de lo declarado.\n\n` : ''
          }${
            sueltos.length ? `Indicadores que nadie está trabajando: ${sueltos.join(', ')}.\n\n` : ''
          }${!huerfanas.length && !sueltos.length ? 'La matriz está completa: toda iniciativa mueve algo y todo indicador tiene quien lo trabaje.' : ''}`,
          repregunta: '¿La dirección ya mira alguno de esos indicadores, o los estás proponiendo tú?',
        };
      },

      datos: (): Mensaje => {
        const s = stdDev(entregasTardias);
        return {
          de: 'q',
          titulo: 'Los datos del caso',
          texto: `Tienes ${incidencias.length} incidencias con causa, área, turno, costo y horas de retraso, más 24 semanas de seis indicadores.\n\nLa serie de entregas tardías promedia ${pct(mean(entregasTardias))} con σ = ${num(s)}. Puedes descargar todo en CSV desde "Datos del caso" para trabajarlo también en Excel.`,
          repregunta: '¿Qué pregunta quieres responder con esos datos? El gráfico se elige después, no antes.',
        };
      },
    }),
    [estado],
  );

  const acciones = [
    { label: 'Interpretar mi KPI', fn: analisis.kpi },
    { label: 'Analizar mi Pareto', fn: analisis.pareto },
    { label: 'Revisar mis 5 porqués', fn: analisis.porques },
    { label: 'Evaluar mi mejora', fn: analisis.mejora },
    { label: 'Revisar mi Hoshin', fn: analisis.hoshin },
    { label: 'Sobre los datos', fn: analisis.datos },
  ];

  const responder = (texto: string) => {
    const limpio = texto.trim();
    if (!limpio) return;
    const entrada: Mensaje = { de: 'yo', texto: limpio };
    const encontrada = buscarRespuesta(limpio);
    const respuesta: Mensaje = encontrada
      ? { de: 'q', titulo: encontrada.titulo, texto: encontrada.respuesta, repregunta: encontrada.repregunta }
      : {
          de: 'q',
          titulo: 'No tengo eso en mi manual',
          texto:
            'Solo respondo sobre los métodos de este módulo: KPI, Pareto, Ishikawa, 5 porqués, Hoshin Kanri, control estadístico, capacidad, antes/después, auditoría e impacto económico.\n\nPrueba con los botones de análisis: ahí trabajo directamente sobre lo que tú cargaste en la plataforma.',
          repregunta: '¿Qué decisión estás tratando de tomar? Con eso puedo orientarte mejor.',
        };
    setMensajes((m) => [...m, entrada, respuesta]);
    setEntrada('');
  };

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Quality Coach"
        titulo="Pregúntale a Q"
        intro="Q no inventa respuestas: aplica el criterio del módulo y calcula sobre los datos que tú cargaste. Cuando algo no está en su manual, lo dice."
        icono={Bot}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Panel titulo="Conversación">
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {mensajes.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${m.de === 'yo' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                      m.de === 'q'
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                    }`}
                  >
                    {m.de === 'q' ? <Bot size={16} /> : <User size={15} />}
                  </div>
                  <div
                    className={`min-w-0 max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      m.de === 'q'
                        ? 'bg-[hsl(var(--muted)/.6)]'
                        : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    }`}
                  >
                    {m.titulo ? (
                      <div className="ql-mono mb-1 text-[9px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
                        {m.titulo}
                      </div>
                    ) : null}
                    <p className="whitespace-pre-line text-xs leading-5">{m.texto}</p>
                    {m.repregunta ? (
                      <p className="mt-2.5 border-t border-[hsl(var(--border))] pt-2 text-[11px] font-semibold italic leading-4">
                        {m.repregunta}
                      </p>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={finRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              responder(entrada);
            }}
            className="mt-4 flex gap-2"
          >
            <input
              value={entrada}
              data-testid="input-coach"
              onChange={(e) => setEntrada(e.target.value)}
              placeholder="¿Qué gráfico uso para priorizar causas?"
              className="min-w-0 flex-1 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.6)] px-3.5 py-2.5 text-xs outline-none focus:border-[hsl(var(--primary))]"
            />
            <button
              type="submit"
              data-testid="boton-enviar-coach"
              className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition hover:brightness-110"
              aria-label="Enviar"
            >
              <Send size={16} />
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {preguntasSugeridas.map((p) => (
              <Chip key={p} onClick={() => responder(p)}>
                {p}
              </Chip>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel titulo="Análisis de tu trabajo" subtitulo="Q calcula sobre lo que tú cargaste" delay={0.05}>
            <div className="space-y-2">
              {acciones.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  data-testid={`accion-${a.label}`}
                  onClick={() => setMensajes((m) => [...m, { de: 'yo', texto: a.label }, a.fn()])}
                  className="flex w-full items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 py-2.5 text-left text-[11px] font-semibold transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                >
                  <Sparkles size={13} className="shrink-0 text-[hsl(var(--primary))]" />
                  {a.label}
                </button>
              ))}
            </div>
          </Panel>

          <Panel titulo="Cómo funciona Q" delay={0.1}>
            <p className="text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
              Q no es un modelo generativo: es un sistema de reglas que reconoce la intención de tu pregunta y responde
              con el criterio del módulo, más los cálculos hechos sobre los datos del caso y tu propio avance. Funciona
              sin conexión y da siempre la misma respuesta a la misma pregunta — que es lo que se necesita en un aula.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
