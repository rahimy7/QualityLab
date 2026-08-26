/** Piezas de interfaz de la conexión con la clase. */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CloudOff, LogOut, RefreshCw, Sparkles, Users, Wifi, X } from 'lucide-react';
import { useNube, type EstadoConexion } from '@/store/nube';
import { useProgreso } from '@/store/progreso';
import { tonoColor } from '@/lib/palette';
import { Boton, Panel } from './primitivos';

const aspecto: Record<EstadoConexion, { texto: string; color: string; icono: typeof Wifi }> = {
  'sin-sesion': { texto: 'Solo en este dispositivo', color: 'hsl(var(--muted-foreground))', icono: CloudOff },
  conectando: { texto: 'Conectando…', color: tonoColor.alerta, icono: RefreshCw },
  sincronizado: { texto: 'Guardado en la clase', color: tonoColor.ok, icono: Check },
  guardando: { texto: 'Guardando…', color: tonoColor.alerta, icono: RefreshCw },
  pendiente: { texto: 'Sin conexión · pendiente', color: tonoColor.alerta, icono: CloudOff },
  error: { texto: 'Error de conexión', color: tonoColor.critico, icono: CloudOff },
};

export function ChipConexion() {
  const { conexion, vinculo } = useNube();
  const a = aspecto[conexion];
  const Icono = a.icono;

  return (
    <span
      data-testid="chip-conexion"
      title={vinculo ? `Sesión ${vinculo.codigo} · ${a.texto}` : a.texto}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold"
      style={{ backgroundColor: `${a.color}1f`, color: a.color }}
    >
      <Icono size={12} className={conexion === 'guardando' || conexion === 'conectando' ? 'animate-spin' : ''} />
      <span className="hidden sm:inline">{vinculo ? vinculo.codigo : 'Local'}</span>
    </span>
  );
}

export function PanelAula() {
  const { vinculo, conexion, mensaje, aviso, descartarAviso, ultimaSync, unirse, salir } = useNube();
  const { estado } = useProgreso();
  const [codigo, setCodigo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const a = aspecto[conexion];

  const conectar = async () => {
    setOcupado(true);
    const ok = await unirse(codigo);
    setOcupado(false);
    if (ok) setCodigo('');
  };

  if (vinculo) {
    return (
      <Panel titulo="Conectado a la clase" subtitulo={vinculo.sesionNombre} delay={0.12}>
        {aviso ? (
          <div
            className="mb-4 flex items-start gap-2.5 rounded-xl p-3.5"
            style={{ backgroundColor: `${tonoColor.ok}14` }}
          >
            <Sparkles size={15} className="mt-px shrink-0" style={{ color: tonoColor.ok }} />
            <p className="min-w-0 flex-1 text-[11px] leading-5">{aviso}</p>
            <button
              type="button"
              onClick={descartarAviso}
              data-testid="descartar-aviso"
              className="shrink-0 text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]"
              aria-label="Descartar aviso"
            >
              <X size={14} />
            </button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <span
            className="ql-mono rounded-lg px-3 py-2 text-lg font-bold tracking-[.2em]"
            style={{ backgroundColor: 'hsl(var(--primary) / .12)', color: 'hsl(var(--primary))' }}
          >
            {vinculo.codigo}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold" style={{ color: a.color }}>
              {a.texto}
            </div>
            <p className="mt-0.5 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">
              {mensaje ??
                (ultimaSync
                  ? `Última copia a las ${ultimaSync.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}. Puedes seguir trabajando sin conexión: se envía sola cuando vuelve.`
                  : 'Tu avance se guarda en este dispositivo y se copia a la clase.')}
            </p>
          </div>
          <Boton variante="secundario" onClick={salir} testId="boton-salir-aula">
            <LogOut size={14} /> Desconectar
          </Boton>
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      titulo="Conectar con la clase"
      subtitulo="Opcional. Sin conectar, la plataforma funciona igual pero tu avance vive solo en este dispositivo."
      delay={0.12}
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[160px] flex-1">
          <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[.11em] text-[hsl(var(--muted-foreground))]">
            Código de la sesión
          </span>
          <input
            value={codigo}
            data-testid="input-codigo-sesion"
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void conectar();
            }}
            placeholder="AB3K7P"
            maxLength={12}
            className="ql-mono w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.6)] px-3 py-2.5 text-sm font-bold uppercase tracking-[.2em] outline-none focus:border-[hsl(var(--primary))]"
          />
        </label>
        <Boton onClick={() => void conectar()} disabled={ocupado || codigo.trim().length < 4} testId="boton-unirse-aula">
          <Users size={14} /> {ocupado ? 'Conectando…' : 'Unirme'}
        </Boton>
      </div>

      {mensaje ? (
        <p className="mt-3 text-[11px] leading-4" style={{ color: conexion === 'error' ? tonoColor.critico : undefined }}>
          {mensaje}
        </p>
      ) : null}

      <p className="mt-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
        Al conectarte, tu avance se copia a la sesión con el nombre{' '}
        <strong>{estado.perfil.nombre.trim() || '(sin nombre)'}</strong>. Si cambias de teléfono, vuelve a entrar con el
        mismo código y el mismo nombre para recuperarlo.
      </p>
    </Panel>
  );
}

/** Cuando hay trabajo en el aparato y en el servidor, decide el participante. */
export function DialogoConflicto() {
  const { conflicto, resolverConflicto } = useNube();
  const { puntos, estado } = useProgreso();

  return (
    <AnimatePresence>
      {conflicto ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="ql-card w-full max-w-md rounded-2xl p-6"
          >
            <h2 className="ql-display text-xl font-bold">Tienes avance en los dos lados</h2>
            <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
              Esta sesión ya tenía un avance guardado con tu nombre. Elige cuál conservar: el otro se pierde.
            </p>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                data-testid="conflicto-local"
                onClick={() => resolverConflicto('local')}
                className="rounded-xl border border-[hsl(var(--border))] p-4 text-left transition hover:border-[hsl(var(--primary))]"
              >
                <div className="text-xs font-bold">Seguir con este dispositivo</div>
                <div className="ql-mono mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                  {puntos.total} QP · {estado.misiones.length} misiones
                </div>
              </button>

              <button
                type="button"
                data-testid="conflicto-nube"
                onClick={() => resolverConflicto('nube')}
                className="rounded-xl border border-[hsl(var(--border))] p-4 text-left transition hover:border-[hsl(var(--primary))]"
              >
                <div className="text-xs font-bold">Traer lo guardado en la clase</div>
                <div className="ql-mono mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                  {conflicto.puntos} QP · {conflicto.misiones.length} misiones · guardado{' '}
                  {new Date(conflicto.actualizadoEn).toLocaleString('es-DO', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
