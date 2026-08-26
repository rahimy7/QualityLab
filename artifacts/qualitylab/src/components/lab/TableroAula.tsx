/**
 * Panel de sesión del facilitador: crear el aula y ver su avance en vivo.
 *
 * El tablero se refresca solo cada pocos segundos. No es tiempo real estricto
 * y no hace falta que lo sea: en un aula, cinco segundos de retraso no cambian
 * ninguna decisión, y el sondeo sobrevive a un wifi inestable mejor que un
 * socket abierto.
 */
import { useEffect, useMemo, useState } from 'react';
import { crearSesion, getObtenerTableroQueryKey, useObtenerTablero } from '@workspace/api-client-react';
import { Copy, MonitorPlay, Plus, RefreshCw, Users } from 'lucide-react';
import { equipos } from '@/data/equipos';
import { misiones } from '@/data/misiones';
import { preguntas } from '@/data/quizzes';
import { num, pct } from '@/lib/formato';
import { tonoColor } from '@/lib/palette';
import { Boton, Campo, Panel, Tile } from './primitivos';

const CLAVE = 'qualitylab360.facilitador';

function leerCodigo(): string {
  try {
    return window.localStorage.getItem(CLAVE) ?? '';
  } catch {
    return '';
  }
}

function guardarCodigo(codigo: string): void {
  try {
    if (codigo) window.localStorage.setItem(CLAVE, codigo);
    else window.localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento el código dura lo que la pestaña.
  }
}

function CrearSesion({ alCrear }: { alCrear: (codigo: string) => void }) {
  const [nombre, setNombre] = useState('');
  const [facilitador, setFacilitador] = useState('');
  const [codigoManual, setCodigoManual] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async () => {
    setOcupado(true);
    setError(null);
    try {
      const sesion = await crearSesion({ nombre: nombre.trim() || 'Sesión sin nombre', facilitador: facilitador.trim() || undefined });
      guardarCodigo(sesion.codigo);
      alCrear(sesion.codigo);
    } catch {
      setError('No se pudo crear la sesión. Comprueba que el servidor de la plataforma esté en marcha.');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Panel titulo="Abrir una sesión de clase" subtitulo="Genera el código que el aula usará para conectarse">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Nombre del grupo" valor={nombre} onChange={setNombre} placeholder="Diplomado Calidad · Grupo A" testId="input-nombre-sesion" />
        <Campo label="Facilitador" valor={facilitador} onChange={setFacilitador} placeholder="Tu nombre" testId="input-facilitador" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Boton onClick={() => void crear()} disabled={ocupado} testId="boton-crear-sesion">
          <Plus size={14} /> {ocupado ? 'Creando…' : 'Crear sesión'}
        </Boton>
        <span className="text-[11px] text-[hsl(var(--muted-foreground))]">o</span>
        <input
          value={codigoManual}
          data-testid="input-retomar-codigo"
          onChange={(e) => setCodigoManual(e.target.value.toUpperCase())}
          placeholder="Retomar código"
          className="ql-mono w-[150px] rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.6)] px-3 py-2.5 text-xs font-bold uppercase tracking-[.16em] outline-none focus:border-[hsl(var(--primary))]"
        />
        <Boton
          variante="secundario"
          disabled={codigoManual.trim().length < 4}
          onClick={() => {
            guardarCodigo(codigoManual.trim());
            alCrear(codigoManual.trim());
          }}
          testId="boton-retomar-sesion"
        >
          Retomar
        </Boton>
      </div>
      {error ? <p className="mt-3 text-[11px]" style={{ color: tonoColor.critico }}>{error}</p> : null}
    </Panel>
  );
}

export function TableroAula() {
  const [codigo, setCodigo] = useState<string>(() => (typeof window === 'undefined' ? '' : leerCodigo()));
  const [copiado, setCopiado] = useState(false);

  const { data, isLoading, isError, refetch, dataUpdatedAt } = useObtenerTablero(codigo, {
    query: {
      queryKey: getObtenerTableroQueryKey(codigo),
      enabled: codigo.length >= 4,
      refetchInterval: 5000,
      retry: 1,
    },
  });

  const enlace = useMemo(() => {
    if (typeof window === 'undefined' || !codigo) return '';
    return `${window.location.origin}/?sesion=${codigo}`;
  }, [codigo]);

  useEffect(() => {
    if (!copiado) return undefined;
    const id = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(id);
  }, [copiado]);

  if (!codigo) return <CrearSesion alCrear={setCodigo} />;

  if (isError) {
    return (
      <Panel titulo="No se pudo cargar la sesión" subtitulo={`Código ${codigo}`}>
        <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          O el código ya no existe, o el servidor de la plataforma no está respondiendo. El aula puede seguir
          trabajando: cada participante conserva su avance en su dispositivo.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Boton variante="secundario" onClick={() => void refetch()}>
            <RefreshCw size={14} /> Reintentar
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => {
              guardarCodigo('');
              setCodigo('');
            }}
          >
            Abrir otra sesión
          </Boton>
        </div>
      </Panel>
    );
  }

  const filas = data?.filas ?? [];
  const resumen = data?.resumen;

  // Desempeño por pregunta, con el enunciado real para poder leerlo en clase.
  const porPregunta = (data?.preguntas ?? [])
    .map((p) => ({ ...p, pregunta: preguntas.find((q) => q.id === p.preguntaId) }))
    .filter((p) => p.pregunta)
    .sort((a, b) => a.correctas / a.respondidas - b.correctas / b.respondidas);

  // Marcador por equipo: es lo que se proyecta en la pantalla del aula.
  const porEquipo = equipos
    .map((e) => {
      const suyas = filas.filter((f) => f.equipoId === e.id);
      return {
        ...e,
        integrantes: suyas.length,
        puntos: suyas.reduce((acc, f) => acc + f.puntos, 0),
      };
    })
    .filter((e) => e.integrantes > 0)
    .sort((a, b) => b.puntos - a.puntos);

  return (
    <div className="space-y-6">
      <Panel
        titulo={data?.sesion.nombre ?? 'Sesión'}
        subtitulo={
          dataUpdatedAt
            ? `Actualizado a las ${new Date(dataUpdatedAt).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · se refresca solo cada 5 s`
            : 'Cargando…'
        }
        acciones={
          <Boton
            variante="secundario"
            onClick={() => {
              guardarCodigo('');
              setCodigo('');
            }}
            testId="boton-cerrar-sesion-facilitador"
          >
            Abrir otra sesión
          </Boton>
        }
      >
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="ql-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
              Código del aula
            </div>
            <div className="ql-display text-5xl font-bold tracking-[.14em] text-[hsl(var(--primary))]">{codigo}</div>
          </div>
          <div className="min-w-[220px] flex-1">
            <div className="ql-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
              Enlace para el QR
            </div>
            <div className="mt-1 flex items-center gap-2">
              <code className="ql-mono min-w-0 flex-1 truncate rounded-lg bg-[hsl(var(--muted)/.5)] px-2.5 py-2 text-[11px]">
                {enlace}
              </code>
              <Boton
                variante="secundario"
                testId="boton-copiar-enlace"
                onClick={() => {
                  void navigator.clipboard?.writeText(enlace);
                  setCopiado(true);
                }}
              >
                <Copy size={13} /> {copiado ? 'Copiado' : 'Copiar'}
              </Boton>
            </div>
            <p className="mt-1.5 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">
              Quien abra este enlace se une a la sesión sin teclear el código.
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Participantes" valor={resumen?.participantes ?? 0} decimales={0} icono={Users} />
        <Tile
          label="Activos (5 min)"
          valor={resumen?.activosUltimos5Min ?? 0}
          decimales={0}
          tono={(resumen?.activosUltimos5Min ?? 0) > 0 ? 'ok' : 'alerta'}
        />
        <Tile label="Puntos promedio" valor={resumen?.puntosPromedio ?? 0} decimales={0} />
        <Tile label="Misiones completadas" valor={resumen?.misionesCompletadas ?? 0} decimales={0} />
      </div>

      {porEquipo.length > 0 ? (
        <Panel titulo="Marcador por equipo" subtitulo="Proyéctalo en la pantalla del aula" delay={0.05}>
          <div className="space-y-2">
            {porEquipo.map((e, i) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] p-3">
                <span className="ql-mono grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[hsl(var(--muted))] text-xs font-bold">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{e.nombre}</span>
                <span className="ql-mono shrink-0 text-[10px] text-[hsl(var(--muted-foreground))]">
                  {e.integrantes} conectados
                </span>
                <span className="ql-display shrink-0 text-xl font-bold text-[hsl(var(--primary))]">{e.puntos}</span>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel titulo="Participantes" subtitulo={`${filas.length} en la sesión`} delay={0.1}>
        {isLoading ? (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Cargando el aula…</p>
        ) : filas.length === 0 ? (
          <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            Todavía no se ha conectado nadie. Comparte el código <strong>{codigo}</strong> o el enlace de arriba.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  {['Participante', 'Equipo', 'QP', 'Misiones', 'Ejercicios', 'Última señal'].map((h) => (
                    <th key={h} className="ql-mono px-2 py-2 font-bold uppercase tracking-[.08em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => {
                  const activo = Date.now() - new Date(f.vistoEn).getTime() < 5 * 60 * 1000;
                  return (
                    <tr key={f.participanteId} className="border-b border-[hsl(var(--border)/.5)]">
                      <td className="px-2 py-2">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: activo ? tonoColor.ok : 'hsl(var(--muted-foreground))' }}
                          />
                          <span className="font-semibold">{f.nombre}</span>
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[hsl(var(--muted-foreground))]">
                        {equipos.find((e) => e.id === f.equipoId)?.nombre ?? f.equipoId}
                      </td>
                      <td className="ql-mono px-2 py-2 font-bold">{f.puntos}</td>
                      <td className="px-2 py-2">
                        {f.misiones.length}/{misiones.length}
                      </td>
                      <td className="px-2 py-2">
                        {f.aciertos}/{f.respondidas}
                      </td>
                      <td className="px-2 py-2 text-[hsl(var(--muted-foreground))]">
                        {new Date(f.vistoEn).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {porPregunta.length > 0 ? (
        <Panel
          titulo="Qué entendió el aula"
          subtitulo="Ordenado de peor a mejor: lo de arriba es lo que conviene retomar"
          delay={0.15}
        >
          <div className="space-y-2.5">
            {porPregunta.map((p) => {
              const acierto = (p.correctas / p.respondidas) * 100;
              const color = acierto >= 70 ? tonoColor.ok : acierto >= 40 ? tonoColor.alerta : tonoColor.critico;
              return (
                <div key={p.preguntaId} className="rounded-xl border border-[hsl(var(--border))] p-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 text-xs font-semibold leading-5">{p.pregunta?.enunciado}</p>
                    <span className="ql-mono shrink-0 text-sm font-bold" style={{ color }}>
                      {num(acierto, 0)} %
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <div className="h-full rounded-full" style={{ width: `${acierto}%`, backgroundColor: color }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                    <span>
                      {p.correctas} de {p.respondidas} correctas
                    </span>
                    {p.pregunta?.opciones.map((o) => {
                      const n = p.opciones[o.id] ?? 0;
                      if (n === 0) return null;
                      const esCorrecta = o.id === p.pregunta?.correcta;
                      return (
                        <span key={o.id} style={esCorrecta ? { color: tonoColor.ok, fontWeight: 700 } : undefined}>
                          {o.id.toUpperCase()}: {n} ({pct((n / p.respondidas) * 100, 0)})
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 flex items-start gap-2 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">
            <MonitorPlay size={13} className="mt-px shrink-0 text-[hsl(var(--primary))]" />
            Proyecta la pregunta con peor porcentaje desde el banco de desafíos y deja que la sala la discuta antes de
            revelar la respuesta.
          </p>
        </Panel>
      ) : null}
    </div>
  );
}
