/** Estado del respaldo automático en la cabecera. */
import { Check, CloudOff, RefreshCw } from 'lucide-react';
import { tonoColor } from '@/lib/palette';
import { useSincroUsuario, type EstadoSincro } from '@/store/sincroUsuario';

const aspecto: Record<EstadoSincro, { texto: string; color: string; icono: typeof Check }> = {
  ok: { texto: 'Guardado en tu cuenta', color: tonoColor.ok, icono: Check },
  guardando: { texto: 'Guardando…', color: tonoColor.alerta, icono: RefreshCw },
  pendiente: { texto: 'Cambios sin guardar', color: tonoColor.alerta, icono: RefreshCw },
  error: { texto: 'No se pudo guardar', color: tonoColor.critico, icono: CloudOff },
};

export function ChipSincro() {
  const { sincro, error } = useSincroUsuario();
  const a = aspecto[sincro];
  const Icono = a.icono;

  return (
    <span
      data-testid="chip-sincro"
      title={error ? `${a.texto} · ${error}` : a.texto}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold"
      style={{ backgroundColor: `${a.color}1f`, color: a.color }}
    >
      <Icono size={12} className={sincro === 'guardando' ? 'animate-spin' : ''} />
      <span className="hidden sm:inline">{sincro === 'ok' ? 'Guardado' : a.texto}</span>
    </span>
  );
}
