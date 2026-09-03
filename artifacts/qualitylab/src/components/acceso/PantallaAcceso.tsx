/**
 * Puerta de entrada: crear cuenta o iniciar sesión.
 *
 * El registro pide el equipo desde el principio porque el módulo se trabaja en
 * grupo: dejarlo para después significa que el facilitador ve gente suelta que
 * no sabe dónde ubicar.
 */
import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { equipos } from '@/data/equipos';
import { useAuth } from '@/store/auth';

type Modo = 'entrar' | 'registro';

export function PantallaAcceso() {
  const { entrar, registrar } = useAuth();
  const [modo, setModo] = useState<Modo>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [grupoId, setGrupoId] = useState(equipos[0].id);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      if (modo === 'entrar') await entrar(email, password);
      else await registrar({ email, password, nombre, grupoId });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setEnviando(false);
    }
  };

  const claseCampo =
    'w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))]';

  return (
    <div className="grid min-h-screen place-items-center bg-[hsl(var(--background))] p-4">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <div className="ql-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">
            QualityLab 360
          </div>
          <h1 className="ql-display mt-2 text-3xl font-bold">Laboratorio de mejora continua</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Tu cuenta guarda el avance en el servidor: puedes seguir desde otro dispositivo y no se pierde
            al limpiar el navegador.
          </p>
        </div>

        <div className="ql-card rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex gap-1 rounded-xl bg-[hsl(var(--muted)/.5)] p-1">
            {(
              [
                { id: 'entrar', label: 'Entrar', icono: LogIn },
                { id: 'registro', label: 'Crear cuenta', icono: UserPlus },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setModo(t.id);
                  setError(null);
                }}
                data-testid={`tab-${t.id}`}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition ${
                  modo === t.id
                    ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
                    : 'text-[hsl(var(--muted-foreground))]'
                }`}
              >
                <t.icono size={13} /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} className="space-y-3.5">
            {modo === 'registro' ? (
              <label className="block">
                <span className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                  Tu nombre
                </span>
                <input
                  className={`mt-1 ${claseCampo}`}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Como quieres que te vea el facilitador"
                  autoComplete="name"
                  required
                  data-testid="campo-nombre"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                Correo
              </span>
              <input
                className={`mt-1 ${claseCampo}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                required
                data-testid="campo-email"
              />
            </label>

            <label className="block">
              <span className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                Contraseña
              </span>
              <input
                className={`mt-1 ${claseCampo}`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={modo === 'registro' ? 'Mínimo 8 caracteres' : '••••••••'}
                autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
                required
                data-testid="campo-password"
              />
            </label>

            {modo === 'registro' ? (
              <div>
                <span className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                  Tu equipo
                </span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {equipos.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setGrupoId(e.id)}
                      data-testid={`equipo-${e.id}`}
                      className={`rounded-lg border px-2.5 py-1.5 text-[11px] transition ${
                        grupoId === e.id
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]'
                          : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/.5)]'
                      }`}
                    >
                      <span className="ql-mono font-semibold">{e.iniciales}</span>
                      <span className="ml-1.5 opacity-80">{e.nombre.replace('Equipo ', '')}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[10.5px] text-[hsl(var(--muted-foreground))]">
                  Lo puedes cambiar después desde tu perfil.
                </p>
              </div>
            ) : null}

            {error ? (
              <div
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-400"
                data-testid="error-acceso"
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={enviando}
              data-testid="boton-enviar"
              className="w-full rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90 disabled:opacity-50"
            >
              {enviando ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : 'Crear cuenta y empezar'}
            </button>
          </form>
        </div>

        <p className="mt-4 flex items-start gap-1.5 px-2 text-[10.5px] leading-4 text-[hsl(var(--muted-foreground))]">
          <ShieldCheck size={13} className="mt-px shrink-0" />
          La contraseña se guarda cifrada y nunca sale del servidor. El correo solo sirve para reconocer tu
          cuenta: no se envían mensajes.
        </p>
      </motion.div>
    </div>
  );
}
