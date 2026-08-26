import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, CircleCheck, Clock3, ListChecks, Lock } from 'lucide-react';
import { lab, logros, misiones, puntosPosibles } from '@/data/misiones';
import { useProgreso } from '@/store/progreso';
import { tonoColor } from '@/lib/palette';
import { EncabezadoPagina, Panel } from '@/components/lab/primitivos';

export default function Misiones() {
  const { estado, puntos, avance } = useProgreso();
  const minutos = misiones.reduce((acc, m) => acc + m.minutos, 0);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="La ruta del caso"
        titulo="Siete misiones"
        intro={`Todas trabajan sobre la misma empresa y los mismos datos. No hay atajos: cada misión usa lo que produjo la anterior. Tiempo estimado total: ${Math.round(minutos / 60)} horas de laboratorio.`}
        icono={ListChecks}
      />

      <Panel>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="ql-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
              Avance
            </div>
            <div className="ql-display text-4xl font-bold text-[hsl(var(--primary))]">{avance} %</div>
          </div>
          <div className="min-w-[180px] flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
              <motion.div
                className="h-full rounded-full bg-[hsl(var(--primary))]"
                initial={{ width: 0 }}
                animate={{ width: `${avance}%` }}
                transition={{ duration: 0.7 }}
              />
            </div>
            <div className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">
              {puntos.total} de {puntosPosibles} Quality Points · {puntos.porMisiones} por misiones,{' '}
              {puntos.porQuiz} por ejercicios, {puntos.porLogros} por logros
            </div>
          </div>
        </div>
      </Panel>

      <div className="space-y-3">
        {misiones.map((m, i) => {
          const hecha = estado.misiones.includes(m.clave);
          const anterior = i === 0 || estado.misiones.includes(misiones[i - 1].clave);
          const l = lab(m.labId);
          const Icono = l.icono;

          return (
            <motion.div
              key={m.id}
              id={m.clave}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="ql-card rounded-2xl p-5"
              style={hecha ? { borderColor: `${tonoColor.ok}66` } : undefined}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                  style={{
                    backgroundColor: hecha ? `${tonoColor.ok}1a` : 'hsl(var(--primary) / .1)',
                    color: hecha ? tonoColor.ok : 'hsl(var(--primary))',
                  }}
                >
                  {hecha ? <CircleCheck size={22} /> : <Icono size={20} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="ql-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">
                      Misión {m.id} · {m.kicker}
                    </span>
                    {!anterior && !hecha ? (
                      <span className="ql-mono inline-flex items-center gap-1 rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[9px] font-bold uppercase text-[hsl(var(--muted-foreground))]">
                        <Lock size={9} /> requiere la anterior
                      </span>
                    ) : null}
                  </div>
                  <h3 className="ql-display mt-1 text-xl font-bold">{m.titulo}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{m.reto}</p>
                  <p className="mt-2 text-[11px] leading-4">
                    <span className="font-bold">Al terminar:</span> {m.evidencia}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="ql-mono rounded-lg bg-[hsl(var(--accent)/.25)] px-2.5 py-1 text-[11px] font-bold">
                    {m.puntos} QP
                  </span>
                  <span className="ql-mono inline-flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                    <Clock3 size={11} /> {m.minutos} min
                  </span>
                  <Link
                    href={l.ruta}
                    data-testid={`abrir-mision-${m.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:underline"
                  >
                    {hecha ? 'Revisar' : 'Abrir'} <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Panel titulo="Logros" subtitulo="Se desbloquean por razonamiento fino, no por terminar la pantalla" delay={0.1}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {logros.map((l) => {
            const tiene = estado.logros.includes(l.id);
            return (
              <div
                key={l.id}
                className="rounded-xl border p-3"
                style={{
                  borderColor: tiene ? `${tonoColor.ok}66` : 'hsl(var(--border))',
                  backgroundColor: tiene ? `${tonoColor.ok}0e` : undefined,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold">{l.label}</span>
                  <span
                    className="ql-mono shrink-0 text-[10px] font-bold"
                    style={{ color: tiene ? tonoColor.ok : 'hsl(var(--muted-foreground))' }}
                  >
                    +{l.puntos}
                  </span>
                </div>
                <p className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{l.descripcion}</p>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
