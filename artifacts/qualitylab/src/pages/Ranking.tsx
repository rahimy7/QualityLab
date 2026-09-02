import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudOff, Medal, Trophy } from 'lucide-react';
import { equipos } from '@/data/equipos';
import { casosLista } from '@/data/casos';
import { logros, misiones, puntosPosibles } from '@/data/misiones';
import { preguntas } from '@/data/quizzes';
import { useProgreso } from '@/store/progreso';
import { idDispositivo } from '@/lib/dispositivo';
import { plural } from '@/lib/formato';
import { calcularPuntos, puntajeVacio, sumar, type Puntaje } from '@/lib/puntos';
import { tonoColor } from '@/lib/palette';
import { EncabezadoPagina, Panel, Tile } from '@/components/lab/primitivos';

/** Fila ligera de `/api/grupos/avances`: lo mínimo para puntuar. */
interface AvanceAula {
  grupoId: string;
  casoId: string;
  dispositivoId: string;
  misiones: string[];
  quiz: Record<string, string>;
  logros: string[];
}

export default function Ranking() {
  const { estado, puntos } = useProgreso();
  const [aula, setAula] = useState<AvanceAula[] | null>(null);
  const [errorAula, setErrorAula] = useState<string | null>(null);

  // El marcador sale del avance que los equipos sincronizaron a la nube.
  useEffect(() => {
    let vivo = true;
    fetch('/api/grupos/avances')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((datos: AvanceAula[]) => {
        if (vivo) setAula(datos);
      })
      .catch((err) => {
        if (vivo) setErrorAula(err instanceof Error ? err.message : String(err));
      });
    return () => {
      vivo = false;
    };
  }, []);

  const casoInfo = useMemo(() => new Map(casosLista.map((c) => [c.id, c])), []);

  const tabla = useMemo(() => {
    const propio = estado.perfil.equipoId;
    const mio = idDispositivo();
    const acumulado = new Map<string, Puntaje>();
    const dispositivos = new Map<string, Set<string>>();

    for (const fila of aula ?? []) {
      // Mi propia fila se ignora: mi avance entra desde el estado local, que va
      // por delante de lo último que alcanzó a sincronizar. Así cuento una vez.
      if (fila.dispositivoId === mio) continue;
      acumulado.set(
        fila.grupoId,
        sumar(acumulado.get(fila.grupoId) ?? puntajeVacio, calcularPuntos(fila, casoInfo.get(fila.casoId))),
      );
      const gente = dispositivos.get(fila.grupoId) ?? new Set<string>();
      gente.add(fila.dispositivoId);
      dispositivos.set(fila.grupoId, gente);
    }

    return equipos
      .map((e) => {
        const esPropio = e.id === propio;
        return {
          ...e,
          total: (acumulado.get(e.id)?.total ?? 0) + (esPropio ? puntos.total : 0),
          participantes: (dispositivos.get(e.id)?.size ?? 0) + (esPropio ? 1 : 0),
          esPropio,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [aula, casoInfo, estado.perfil.equipoId, puntos.total]);

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
          valor={puntos.correctas}
          decimales={0}
          detalle={`de ${puntos.respondidas} respondidos · ${preguntas.length} en total`}
          tono={puntos.respondidas > 0 && puntos.correctas / puntos.respondidas >= 0.7 ? 'ok' : 'alerta'}
        />
        <Tile label="Logros desbloqueados" valor={estado.logros.length} decimales={0} detalle={`de ${logros.length}`} />
      </div>

      <Panel
        titulo="Equipos"
        subtitulo={
          errorAula
            ? 'Sin conexión con el aula: solo se muestra tu avance de este dispositivo.'
            : aula === null
              ? 'Consultando el avance del aula…'
              : 'Puntos reales de quienes guardan en la nube; tu equipo suma además tu avance de este dispositivo.'
        }
      >
        {errorAula ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] px-3 py-2 text-[11px] text-[hsl(var(--muted-foreground))]">
            <CloudOff size={13} /> No se pudo consultar el aula ({errorAula}).
          </div>
        ) : null}
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
                  {plural(e.participantes, 'participante')}
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
