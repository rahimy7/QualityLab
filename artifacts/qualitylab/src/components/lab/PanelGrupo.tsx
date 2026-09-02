/**
 * Panel del modo grupo en Inicio.
 *
 * Deja elegir el equipo del participante y activar el auto-guardado en la
 * nube. El avance sigue siendo individual: cada dispositivo su copia, el grupo
 * es la etiqueta que el facilitador usa para revisar.
 */
import { Link } from 'wouter';
import { Cloud, CloudOff, ExternalLink } from 'lucide-react';
import { equipos } from '@/data/equipos';
import { useProgreso } from '@/store/progreso';
import { useSincronizarGrupo } from '@/store/sincroGrupo';

const etiquetas: Record<string, string> = {
  apagado: 'Solo en este dispositivo',
  pendiente: 'Guardando…',
  guardando: 'Guardando…',
  ok: 'Guardado en la nube',
  error: 'Error al guardar',
};

export function PanelGrupo() {
  const { estado, set } = useProgreso();
  const { activo, setActivo, sincro, ultimo, error } = useSincronizarGrupo();
  const equipoActual = equipos.find((e) => e.id === estado.perfil.equipoId) ?? equipos[0];

  const tono = sincro === 'error' ? 'text-red-400' : sincro === 'ok' ? 'text-emerald-400' : 'text-[hsl(var(--muted-foreground))]';

  return (
    <div className="ql-card rounded-2xl p-4 sm:p-5" data-testid="panel-grupo">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="ql-mono text-[10px] uppercase tracking-[.17em] text-[hsl(var(--primary))]">
            Tu grupo · modo aula
          </div>
          <div className="ql-display mt-1 text-lg font-bold">
            {equipoActual.nombre}{' '}
            <span className="ql-mono text-[11px] font-normal text-[hsl(var(--muted-foreground))]">
              {equipoActual.iniciales}
            </span>
          </div>
          <p className="mt-0.5 text-[11.5px] italic text-[hsl(var(--muted-foreground))]">"{equipoActual.lema}"</p>
        </div>
        <Link
          href="/grupos"
          className="ql-mono inline-flex items-center gap-1 text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))] hover:underline"
          data-testid="link-revisar-grupos"
        >
          Ver todos los grupos <ExternalLink size={11} />
        </Link>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-wrap gap-2">
          {equipos.map((e) => {
            const seleccionado = e.id === equipoActual.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => set({ perfil: { ...estado.perfil, equipoId: e.id } })}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] transition ${
                  seleccionado
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)] text-[hsl(var(--foreground))]'
                    : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/.5)]'
                }`}
                data-testid={`selector-grupo-${e.id}`}
              >
                <span className="ql-mono font-semibold">{e.iniciales}</span>
                <span className="ml-1.5 opacity-80">{e.nombre.replace('Equipo ', '')}</span>
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-[11px]" data-testid="toggle-sincro-grupo">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          <span className={activo ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}>
            Guardar en la nube
          </span>
        </label>
      </div>

      <div className={`mt-3 flex flex-wrap items-center gap-2 border-t border-[hsl(var(--border))] pt-2 text-[11px] ${tono}`}>
        {activo ? <Cloud size={13} /> : <CloudOff size={13} />}
        <span>{etiquetas[sincro] ?? 'Solo en este dispositivo'}</span>
        {ultimo && sincro === 'ok' ? (
          <span className="ql-mono text-[10px] text-[hsl(var(--muted-foreground))]">
            · último: {new Date(ultimo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        ) : null}
        {error ? (
          <span className="ql-mono text-[10px] text-red-400" title={error}>
            · {error.slice(0, 50)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
