/**
 * Panel de la cuenta en Inicio: quién eres, en qué equipo estás y si tu avance
 * está respaldado. Sustituye a los dos paneles anteriores —el código de sesión
 * y el interruptor de nube—, que pedían al participante decidir cómo guardar
 * algo que ahora se guarda solo.
 */
import { useState } from 'react';
import { Link } from 'wouter';
import { Check, Cloud, CloudOff, ExternalLink, RefreshCw } from 'lucide-react';
import { equipos } from '@/data/equipos';
import { useAuth } from '@/store/auth';
import { useSincroUsuario } from '@/store/sincroUsuario';

const etiquetas: Record<string, string> = {
  pendiente: 'Cambios sin guardar…',
  guardando: 'Guardando…',
  ok: 'Respaldado en tu cuenta',
  error: 'No se pudo guardar',
};

export function PanelCuenta() {
  const { usuario, actualizarPerfil } = useAuth();
  const { sincro, ultimo, error } = useSincroUsuario();
  const [cambiando, setCambiando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);

  if (!usuario) return null;
  const equipoActual = equipos.find((e) => e.id === usuario.grupoId) ?? equipos[0];

  const cambiarEquipo = async (grupoId: string) => {
    if (grupoId === usuario.grupoId) return;
    setCambiando(true);
    setFallo(null);
    try {
      await actualizarPerfil({ grupoId });
    } catch (err) {
      setFallo(err instanceof Error ? err.message : String(err));
    } finally {
      setCambiando(false);
    }
  };

  const tono =
    sincro === 'error' ? 'text-red-400' : sincro === 'ok' ? 'text-emerald-400' : 'text-[hsl(var(--muted-foreground))]';
  const Icono = sincro === 'error' ? CloudOff : sincro === 'ok' ? Check : RefreshCw;

  return (
    <div className="ql-card rounded-2xl p-4 sm:p-5" data-testid="panel-cuenta">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="ql-mono text-[10px] uppercase tracking-[.17em] text-[hsl(var(--primary))]">
            Tu cuenta · {usuario.email}
          </div>
          <div className="ql-display mt-1 text-lg font-bold">
            {usuario.nombre}{' '}
            <span className="ql-mono text-[11px] font-normal text-[hsl(var(--muted-foreground))]">
              {equipoActual.nombre}
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

      <div className="mt-3">
        <span className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
          Cambiar de equipo
        </span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {equipos.map((e) => (
            <button
              key={e.id}
              type="button"
              disabled={cambiando}
              onClick={() => void cambiarEquipo(e.id)}
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] transition disabled:opacity-50 ${
                e.id === equipoActual.id
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)] text-[hsl(var(--foreground))]'
                  : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/.5)]'
              }`}
              data-testid={`selector-grupo-${e.id}`}
            >
              <span className="ql-mono font-semibold">{e.iniciales}</span>
              <span className="ml-1.5 opacity-80">{e.nombre.replace('Equipo ', '')}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        className={`mt-3 flex flex-wrap items-center gap-2 border-t border-[hsl(var(--border))] pt-2 text-[11px] ${tono}`}
      >
        {sincro === 'ok' ? <Cloud size={13} /> : <Icono size={13} />}
        <span>{etiquetas[sincro] ?? 'Respaldado en tu cuenta'}</span>
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
        {fallo ? <span className="ql-mono text-[10px] text-red-400">· {fallo}</span> : null}
      </div>
    </div>
  );
}
