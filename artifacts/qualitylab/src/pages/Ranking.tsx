import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Medal, Trophy } from 'lucide-react';
import { equipos } from '@/data/equipos';
import { logros, misiones, puntosPosibles } from '@/data/misiones';
import { preguntas } from '@/data/quizzes';
import { useProgreso } from '@/store/progreso';
import { tonoColor } from '@/lib/palette';
import { EncabezadoPagina, Panel, Tile } from '@/components/lab/primitivos';

export default function Ranking() {
  const { estado, puntos } = useProgreso();

  const tabla = useMemo(() => {
    const propio = estado.perfil.equipoId;
    return equipos
      .map((e) => ({
        ...e,
        // El equipo del participante suma sus puntos reales sobre la base de la sala.
        total: e.id === propio ? e.puntosBase + puntos.total : e.puntosBase,
        esPropio: e.id === propio,
      }))
      .sort((a, b) => b.total - a.total);
  }, [estado.perfil.equipoId, puntos.total]);

  const aciertos = preguntas.filter((p) => estado.quiz[p.id] === p.correcta).length;
  const respondidas = preguntas.filter((p) => estado.quiz[p.id]).length;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Marcador de la sala"
        titulo="Ranking Quality Points"
        intro="Los puntos no califican el módulo: generan participación y hacen visible qué equipos están razonando con evidencia. El ranking se mueve en vivo mientras la sala trabaja."
        icono={Trophy}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Tus Quality Points" valor={puntos.total} decimales={0} detalle={`de ${puntosPosibles} posibles`} />
        <Tile label="Misiones completadas" valor={estado.misiones.length} decimales={0} detalle={`de ${misiones.length}`} />
        <Tile
          label="Ejercicios correctos"
          valor={aciertos}
          decimales={0}
          detalle={`de ${respondidas} respondidos · ${preguntas.length} en total`}
          tono={respondidas > 0 && aciertos / respondidas >= 0.7 ? 'ok' : 'alerta'}
        />
        <Tile label="Logros desbloqueados" valor={estado.logros.length} decimales={0} detalle={`de ${logros.length}`} />
      </div>

      <Panel titulo="Equipos" subtitulo="Tu equipo suma tus puntos reales; el resto muestra el avance de la sala">
        <div className="space-y-2">
          {tabla.map((e, i) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-xl border p-3.5"
              style={{
                borderColor: e.esPropio ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                backgroundColor: e.esPropio ? 'hsl(var(--primary) / .06)' : undefined,
              }}
            >
              <span
                className="ql-mono grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold"
                style={{
                  backgroundColor: i === 0 ? `${tonoColor.alerta}26` : 'hsl(var(--muted))',
                  color: i === 0 ? tonoColor.alerta : 'hsl(var(--muted-foreground))',
                }}
              >
                {i < 3 ? <Medal size={16} /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold">{e.nombre}</span>
                  {e.esPropio ? (
                    <span className="ql-mono rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[9px] font-bold uppercase text-[hsl(var(--primary-foreground))]">
                      tu equipo
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] italic leading-4 text-[hsl(var(--muted-foreground))]">{e.lema}</p>
              </div>
              <div className="shrink-0 text-right">
                <div className="ql-display text-xl font-bold text-[hsl(var(--primary))]">{e.total}</div>
                <div className="ql-mono text-[9px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">
                  {e.integrantes} integrantes
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Panel>

      <Panel titulo="Tus logros" delay={0.05}>
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
                  opacity: tiene ? 1 : 0.6,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold">{l.label}</span>
                  <span className="ql-mono shrink-0 text-[10px] font-bold" style={{ color: tiene ? tonoColor.ok : undefined }}>
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
