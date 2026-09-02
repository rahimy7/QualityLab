/**
 * Revisión de grupos: qué equipos han trabajado en la nube, cuántos
 * participantes tienen y qué avance han acumulado en cada caso.
 *
 * Los Quality Points se recalculan aquí con las mismas reglas que
 * `store/progreso.tsx` (misiones + ejercicios correctos + logros): lo que se
 * guarda en la nube es el estado del participante, no su puntaje, así que el
 * facilitador siempre ve el puntaje real según el catálogo vigente del caso.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, RefreshCw, Users } from 'lucide-react';
import { equipos } from '@/data/equipos';
import { casosLista } from '@/data/casos';
import { logros } from '@/data/labs';
import { plural } from '@/lib/formato';
import { calcularPuntos, normalizar, puntajeVacio, sumar, type Puntaje } from '@/lib/puntos';
import { Boton, EncabezadoPagina, Panel, Tile } from '@/components/lab/primitivos';

interface ResumenGrupo {
  id: string;
  nombre: string;
  iniciales: string;
  integrantes: number;
  lema: string;
  participantes: number;
  actualizadoEn: string | null;
  porCaso: Record<string, number>;
}

interface AvanceParticipante {
  casoId: string;
  dispositivoId: string;
  nombre: string;
  contenido: Record<string, unknown>;
  actualizadoEn: string;
}

/** Proyección ligera que devuelve `/api/grupos/avances` para toda el aula. */
interface AvanceLigero {
  grupoId: string;
  casoId: string;
  dispositivoId: string;
  nombre: string;
  misiones: string[];
  quiz: Record<string, string>;
  logros: string[];
  actualizadoEn: string;
}

async function fetchGrupos(): Promise<ResumenGrupo[]> {
  const r = await fetch('/api/grupos');
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as ResumenGrupo[];
}

async function fetchAvancesAula(): Promise<AvanceLigero[]> {
  const r = await fetch('/api/grupos/avances');
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as AvanceLigero[];
}

async function fetchAvancesGrupo(grupoId: string, casoId: string | null): Promise<AvanceParticipante[]> {
  const url = casoId ? `/api/grupos/${grupoId}/avances?casoId=${encodeURIComponent(casoId)}` : `/api/grupos/${grupoId}/avances`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as AvanceParticipante[];
}

/** Desglose "M · Q · L" que acompaña al total en la tabla y en las tarjetas. */
function Desglose({ puntaje }: { puntaje: Puntaje }) {
  return (
    <span className="ql-mono text-[10px] font-normal text-[hsl(var(--muted-foreground))]">
      {puntaje.porMisiones} M · {puntaje.porQuiz} Q · {puntaje.porLogros} L
    </span>
  );
}

export default function Grupos() {
  const [grupos, setGrupos] = useState<ResumenGrupo[]>([]);
  const [puntajes, setPuntajes] = useState<Map<string, Puntaje>>(new Map());
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [filtroCaso, setFiltroCaso] = useState<string | null>(null);
  const [avances, setAvances] = useState<AvanceParticipante[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const equipoInfo = useMemo(() => new Map(equipos.map((e) => [e.id, e])), []);
  const casoInfo = useMemo(() => new Map(casosLista.map((c) => [c.id, c])), []);

  const cargarGrupos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [lista, aula] = await Promise.all([fetchGrupos(), fetchAvancesAula()]);
      const acumulado = new Map<string, Puntaje>();
      for (const fila of aula) {
        const puntaje = calcularPuntos(fila, casoInfo.get(fila.casoId));
        acumulado.set(fila.grupoId, sumar(acumulado.get(fila.grupoId) ?? puntajeVacio, puntaje));
      }
      setGrupos(lista);
      setPuntajes(acumulado);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarGrupos();
  }, []);

  const cargarDetalle = useCallback(async () => {
    if (!seleccionado) {
      setAvances([]);
      return;
    }
    setCargando(true);
    try {
      setAvances(await fetchAvancesGrupo(seleccionado, filtroCaso));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCargando(false);
    }
  }, [seleccionado, filtroCaso]);

  useEffect(() => {
    void cargarDetalle();
  }, [cargarDetalle]);

  /** Puntaje de cada fila visible y total del grupo bajo el filtro actual. */
  const detalle = useMemo(() => {
    const filas = avances.map((a) => ({
      avance: a,
      puntaje: calcularPuntos(normalizar(a.contenido), casoInfo.get(a.casoId)),
    }));
    return { filas, total: filas.reduce((acc, f) => sumar(acc, f.puntaje), puntajeVacio) };
  }, [avances, casoInfo]);

  if (seleccionado) {
    const equipo = equipoInfo.get(seleccionado);
    const nombreGrupo = grupos.find((g) => g.id === seleccionado)?.nombre ?? equipo?.nombre ?? seleccionado;
    return (
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() => setSeleccionado(null)}
            className="ql-mono inline-flex items-center gap-1 text-[11px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            data-testid="volver-grupos"
          >
            <ChevronLeft size={12} /> Todos los grupos
          </button>
        </div>
        <EncabezadoPagina
          eyebrow="Revisión de grupo"
          titulo={nombreGrupo}
          intro={`Avance de cada participante del ${nombreGrupo} sobre los casos activos.`}
          icono={Users}
          acciones={
            <Boton
              variante="secundario"
              onClick={() => void Promise.all([cargarGrupos(), cargarDetalle()])}
            >
              <RefreshCw size={13} /> Actualizar
            </Boton>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            label="Quality Points del grupo"
            valor={detalle.total.total}
            decimales={0}
            detalle={`${detalle.total.porMisiones} misiones · ${detalle.total.porQuiz} ejercicios · ${detalle.total.porLogros} logros`}
          />
          <Tile
            label="Misiones completadas"
            valor={detalle.total.misiones}
            decimales={0}
            detalle={`en ${plural(detalle.filas.length, 'entrada registrada', 'entradas registradas')}`}
          />
          <Tile
            label="Ejercicios correctos"
            valor={detalle.total.correctas}
            decimales={0}
            detalle={`de ${plural(detalle.total.respondidas, 'respondido')}`}
            tono={
              detalle.total.respondidas > 0 && detalle.total.correctas / detalle.total.respondidas >= 0.7
                ? 'ok'
                : 'alerta'
            }
          />
          <Tile
            label="Logros desbloqueados"
            valor={detalle.total.logros}
            decimales={0}
            detalle={`de ${logros.length} por participante`}
          />
        </div>

        <Panel titulo="Filtrar por caso">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltroCaso(null)}
              className={`rounded-lg border px-3 py-1.5 text-[11px] ${
                filtroCaso === null
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]'
                  : 'border-[hsl(var(--border))]'
              }`}
            >
              Todos ({avances.length})
            </button>
            {casosLista.map((c) => {
              const activos = avances.filter((a) => a.casoId === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFiltroCaso(c.id)}
                  className={`rounded-lg border px-3 py-1.5 text-[11px] ${
                    filtroCaso === c.id
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]'
                      : 'border-[hsl(var(--border))]'
                  }`}
                >
                  {c.emoji} {c.nombreCorto} · {activos}
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel
          titulo="Participantes"
          subtitulo={plural(avances.length, 'entrada registrada', 'entradas registradas')}
        >
          {cargando ? (
            <div className="text-[12px] text-[hsl(var(--muted-foreground))]">Cargando…</div>
          ) : error ? (
            <div className="text-[12px] text-red-400">{error}</div>
          ) : avances.length === 0 ? (
            <div className="text-[12px] text-[hsl(var(--muted-foreground))]">
              Aún no hay avances registrados para este grupo{filtroCaso ? ' en este caso' : ''}. El participante debe
              activar "Guardar en la nube" desde el Inicio.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">
                    <th className="p-2">Participante</th>
                    <th className="p-2">Caso</th>
                    <th className="p-2 text-right">Misiones</th>
                    <th className="p-2 text-right">Aciertos</th>
                    <th className="p-2 text-right">Logros</th>
                    <th className="p-2 text-right">Puntos</th>
                    <th className="p-2 text-right">Actualizado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {detalle.filas.map(({ avance: a, puntaje }) => {
                    const caso = casoInfo.get(a.casoId);
                    const nMisionesCaso = caso?.misiones.length ?? 0;
                    return (
                      <tr key={`${a.casoId}-${a.dispositivoId}`}>
                        <td className="p-2">
                          <div className="font-semibold">{a.nombre.trim() || '—'}</div>
                          <div className="ql-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                            {a.dispositivoId.slice(0, 8)}
                          </div>
                        </td>
                        <td className="p-2">
                          {caso ? `${caso.emoji} ${caso.nombreCorto}` : a.casoId}
                        </td>
                        <td className="p-2 text-right">
                          {puntaje.misiones} / {nMisionesCaso}
                        </td>
                        <td className="p-2 text-right">
                          {puntaje.correctas} / {puntaje.respondidas}
                        </td>
                        <td className="p-2 text-right">
                          {puntaje.logros} / {logros.length}
                        </td>
                        <td className="p-2 text-right">
                          <div className="font-semibold">{puntaje.total}</div>
                          <Desglose puntaje={puntaje} />
                        </td>
                        <td className="p-2 text-right ql-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                          {new Date(a.actualizadoEn).toLocaleString([], {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Facilitador"
        titulo="Grupos del aula"
        intro="Todos los equipos que han sincronizado avance a la nube. Cada participante trabaja su propia copia; el grupo es la etiqueta que permite revisar el conjunto."
        icono={Users}
        acciones={
          <Boton variante="secundario" onClick={() => void cargarGrupos()}>
            <RefreshCw size={13} /> Actualizar
          </Boton>
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-[12px] text-red-300">{error}</div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {grupos.map((g) => {
          const puntaje = puntajes.get(g.id) ?? puntajeVacio;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSeleccionado(g.id)}
              disabled={g.participantes === 0}
              className={`ql-card group rounded-2xl p-4 text-left transition ${
                g.participantes === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-[hsl(var(--primary)/.5)] hover:shadow-lg'
              }`}
              data-testid={`grupo-${g.id}`}
            >
              <div className="flex items-baseline justify-between">
                <div className="ql-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">
                  {g.iniciales}
                </div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  {plural(g.participantes, 'participante')}
                </div>
              </div>
              <div className="ql-display mt-1 text-lg font-bold">{g.nombre}</div>
              <p className="mt-1 text-[11.5px] italic text-[hsl(var(--muted-foreground))]">"{g.lema}"</p>

              <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-[hsl(var(--border))] pt-2">
                <div>
                  <div className="ql-display text-xl font-bold leading-none">{puntaje.total}</div>
                  <div className="ql-mono text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                    Quality Points
                  </div>
                </div>
                <div className="text-right">
                  <Desglose puntaje={puntaje} />
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {puntaje.misiones} misiones · {puntaje.correctas} aciertos · {puntaje.logros} logros
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {casosLista.map((c) => {
                  const n = g.porCaso[c.id] ?? 0;
                  return (
                    <span
                      key={c.id}
                      className={`ql-mono rounded px-2 py-0.5 text-[10px] ${
                        n > 0
                          ? 'bg-[hsl(var(--primary)/.15)] text-[hsl(var(--primary))]'
                          : 'bg-[hsl(var(--muted)/.5)] text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      {c.emoji} {n}
                    </span>
                  );
                })}
              </div>

              {g.actualizadoEn ? (
                <div className="mt-2 ql-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                  Último: {new Date(g.actualizadoEn).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
              ) : (
                <div className="mt-2 ql-mono text-[10px] text-[hsl(var(--muted-foreground))]">Sin actividad todavía</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
