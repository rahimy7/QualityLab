import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { indicadoresBase, semaforo } from '@/data/caso';
import type { CriteriosIndicador, IndicadorBase } from '@/data/casos/tipos';
import { votosIniciales } from '@/data/series';
import { useProgreso } from '@/store/progreso';
import { num, pct, pp } from '@/lib/formato';
import { usePaleta } from '@/lib/palette';
import { Boton, Campo, EncabezadoPagina, Hallazgo, Panel, Semaforo } from '@/components/lab/primitivos';
import { CoachQ } from '@/components/lab/CoachQ';
import { Teoria } from '@/components/lab/Teoria';
import { Quiz } from '@/components/lab/Quiz';
import { CierreMision } from '@/components/lab/CierreMision';

/**
 * Criterios que el participante debe sopesar antes de elegir prioridad.
 *
 * Lo correcto es que cada caso traiga los suyos en `indicador.criterios`; este
 * mapa es el respaldo del caso Andina, que se escribió antes de que existieran
 * los demás casos. Un indicador sin criterios se pinta sin las barras: la
 * votación sigue funcionando, que es lo que la misión pide.
 */
const criteriosAndina: Record<string, CriteriosIndicador> = {
  satisfaccion: { impacto: 5, control: 1, esfuerzo: 5, tipo: 'resultado' },
  entregas: { impacto: 5, control: 4, esfuerzo: 3, tipo: 'proceso' },
  reclamos: { impacto: 4, control: 2, esfuerzo: 4, tipo: 'resultado' },
  retrabajos: { impacto: 3, control: 5, esfuerzo: 2, tipo: 'proceso' },
  productividad: { impacto: 3, control: 4, esfuerzo: 3, tipo: 'proceso' },
};

function Barra({ valor, color }: { valor: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className="h-1.5 w-3 rounded-sm"
          style={{ backgroundColor: n <= valor ? color : 'hsl(var(--muted))' }}
        />
      ))}
    </div>
  );
}

export default function Diagnostico() {
  const { estado, set } = useProgreso();
  const p = usePaleta();

  const votos = useMemo(() => {
    const base = { ...votosIniciales };
    if (estado.voto) base[estado.voto] = (base[estado.voto] ?? 0) + 1;
    return base;
  }, [estado.voto]);

  const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);
  const lider = Object.entries(votos).sort((a, b) => b[1] - a[1])[0];
  const argumentoListo = estado.argumentoVoto.trim().length >= 40;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Misión 1 · Diagnóstico"
        titulo="¿Qué atacarías primero?"
        intro="Cinco indicadores en rojo y un solo equipo de mejora. La decisión no es cuál duele más, sino dónde una intervención puede cambiar la historia con los recursos que tienes."
        icono={Target}
      />

      <CoachQ labId="diagnostico" />

      <Panel titulo="Vota tu prioridad" subtitulo={`Una opción por participante · ${totalVotos} votos en la sala`}>
        <div className="space-y-2.5">
          {indicadoresBase.map((ind) => {
            const s = semaforo(ind.valor, ind.meta, ind.menorEsMejor);
            const c: CriteriosIndicador | undefined =
              (ind as IndicadorBase).criterios ?? criteriosAndina[ind.id];
            const porcentaje = totalVotos ? ((votos[ind.id] ?? 0) / totalVotos) * 100 : 0;
            const elegido = estado.voto === ind.id;

            return (
              <button
                key={ind.id}
                type="button"
                data-testid={`voto-${ind.id}`}
                onClick={() => set({ voto: ind.id })}
                className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition ${
                  elegido
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.07)]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.6)]'
                }`}
              >
                {estado.voto ? (
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentaje}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-y-0 left-0 bg-[hsl(var(--primary)/.07)]"
                  />
                ) : null}

                <div className="relative flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold">{ind.label}</span>
                      <Semaforo tono={s.tono} etiqueta={`${num(ind.valor)}${ind.unidad}`} size="sm" />
                      {c ? (
                        <span className="ql-mono text-[10px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">
                          {c.tipo === 'resultado' ? 'indicador de resultado' : 'indicador de proceso'}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">
                      {ind.contexto} · brecha de {num(s.brecha)} pp contra la meta · fuente: {ind.fuente}
                    </p>
                    {c ? (
                      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
                        {[
                          { label: 'Impacto en el cliente', valor: c.impacto, color: p.series[0] },
                          { label: 'Control del equipo', valor: c.control, color: p.series[1] },
                          { label: 'Esfuerzo requerido', valor: c.esfuerzo, color: p.series[3] },
                        ].map((crit) => (
                          <span key={crit.label} className="flex items-center gap-1.5">
                            <span className="ql-mono text-[9px] uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                              {crit.label}
                            </span>
                            <Barra valor={crit.valor} color={crit.color} />
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {estado.voto ? (
                    <span className="ql-mono shrink-0 text-sm font-bold text-[hsl(var(--primary))]">
                      {num(porcentaje, 0)}%
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {estado.voto ? (
          <div className="mt-5 space-y-4">
            <Hallazgo titulo="Resultado de la sala">
              La opción más votada es <strong>{indicadoresBase.find((i) => i.id === lider[0])?.label}</strong> con{' '}
              {num((lider[1] / totalVotos) * 100, 0)} % de los votos. Ahora la pregunta importante: ¿el grupo votó por el
              indicador con más brecha, o por el que su trabajo puede mover?
            </Hallazgo>

            <Campo
              label="Defiende tu elección en dos líneas"
              area
              valor={estado.argumentoVoto}
              onChange={(v) => set({ argumentoVoto: v })}
              placeholder="Elegiría… porque el impacto en el cliente es… y el equipo puede moverlo mediante…"
              ayuda={`${estado.argumentoVoto.trim().length}/40 caracteres mínimos. Un argumento sin criterio explícito es una opinión.`}
              testId="input-argumento"
            />
          </div>
        ) : (
          <p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">
            Elige una opción para ver cómo votó el resto de la sala.
          </p>
        )}
      </Panel>

      <Panel titulo="Lo que revela la comparación" delay={0.05}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[hsl(var(--border))] p-4">
            <div className="ql-mono mb-2 text-[10px] uppercase tracking-[.13em] text-[hsl(var(--primary))]">
              Indicadores de resultado
            </div>
            <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
              Satisfacción y reclamos miden lo que el cliente percibe <em>después</em>. Son la razón del proyecto, pero
              nadie puede "hacer" satisfacción: se mueven cuando cambian las causas operativas.
            </p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] p-4">
            <div className="ql-mono mb-2 text-[10px] uppercase tracking-[.13em] text-[hsl(var(--primary))]">
              Indicadores de proceso
            </div>
            <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
              Entregas tardías, retrabajos y productividad describen cómo trabaja la operación. El equipo sí puede
              moverlos directamente, y al hacerlo arrastran a los de resultado.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5">
          Con {pct(19, 0)} de entregas tardías y una brecha de {pp(11)} contra la meta, entregas es el indicador de
          proceso con mayor impacto sobre el cliente y con control real del equipo. Es el que este módulo va a seguir
          hasta el final.
        </p>
      </Panel>

      <Teoria labId="diagnostico" />

      <Panel delay={0.1}>
        <Quiz labId="diagnostico" titulo="Antes de avanzar" />
      </Panel>

      <CierreMision
        clave="diagnostico"
        requisitos={[
          { label: 'Votaste una prioridad', cumplido: Boolean(estado.voto) },
          { label: 'Escribiste el argumento que la sostiene', cumplido: argumentoListo },
          { label: 'Respondiste los dos ejercicios', cumplido: Boolean(estado.quiz['diag-1'] && estado.quiz['diag-2']) },
        ]}
        siguiente={{ ruta: '/kpi-lab', label: 'Ir a KPI Lab' }}
      />
    </div>
  );
}
