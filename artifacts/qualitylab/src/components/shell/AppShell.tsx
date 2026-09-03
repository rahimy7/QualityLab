/** Armazón: barra superior, navegación lateral y contenedor de páginas. */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, LogOut, Menu, Moon, RotateCcw, Sun, Trophy, X } from 'lucide-react';
import { labs, misiones, puntosPosibles } from '@/data/misiones';
import { equipos } from '@/data/equipos';
import { useProgreso } from '@/store/progreso';
import { useAuth } from '@/store/auth';
import { useTema } from '@/lib/tema';
import { ChipSincro } from '@/components/lab/ChipSincro';
import { cn } from '@/lib/utils';

const grupos = ['Ruta', 'Laboratorios', 'Resultados', 'Facilitación'] as const;

function Navegacion({ alNavegar }: { alNavegar?: () => void }) {
  const [ruta] = useLocation();
  const { estado } = useProgreso();

  return (
    <nav className="space-y-6 pb-8">
      {grupos.map((grupo) => (
        <div key={grupo}>
          <div className="ql-mono mb-2 px-3 text-[9px] font-bold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">
            {grupo}
          </div>
          <div className="space-y-0.5">
            {labs
              .filter((l) => l.grupo === grupo)
              .map((l) => {
                const activo = ruta === l.ruta;
                const mision = misiones.find((m) => m.labId === l.id);
                const hecha = mision ? estado.misiones.includes(mision.clave) : false;
                const Icono = l.icono;
                return (
                  <Link
                    key={l.id}
                    href={l.ruta}
                    onClick={alNavegar}
                    data-testid={`nav-${l.id}`}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition',
                      activo
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/.6)] hover:text-[hsl(var(--foreground))]',
                    )}
                  >
                    <Icono size={15} className="shrink-0" />
                    <span className="min-w-0 truncate">{l.corto}</span>
                    {hecha ? (
                      <span
                        className={cn(
                          'ml-auto h-1.5 w-1.5 shrink-0 rounded-full',
                          activo ? 'bg-[hsl(var(--accent))]' : 'bg-[#2f9e6e]',
                        )}
                      />
                    ) : null}
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function ResumenProgreso() {
  const { puntos, avance, estado } = useProgreso();
  const equipo = equipos.find((e) => e.id === estado.perfil.equipoId) ?? equipos[0];

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.5)] p-3.5">
      <div className="flex items-center justify-between">
        <div className="ql-mono text-[9px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">
          {equipo.nombre}
        </div>
        <Trophy size={13} className="text-[hsl(var(--accent-foreground))]" />
      </div>
      <div className="ql-display mt-1 text-2xl font-bold text-[hsl(var(--primary))]">
        {puntos.total}
        <span className="ml-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">/ {puntosPosibles} QP</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <motion.div
          className="h-full rounded-full bg-[hsl(var(--primary))]"
          initial={{ width: 0 }}
          animate={{ width: `${avance}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="mt-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
        {avance}% de la ruta · {estado.misiones.length}/{misiones.length} misiones
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const [ruta] = useLocation();
  const { tema, alternar } = useTema();
  const { puntos, reiniciar } = useProgreso();
  const { usuario, salir } = useAuth();
  const equipoActual = equipos.find((e) => e.id === usuario?.grupoId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setAbierto(false);
  }, [ruta]);

  return (
    <div className="ql-app ql-grid ql-noise">
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.88)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4">
          <button
            type="button"
            data-testid="boton-menu"
            onClick={() => setAbierto(true)}
            className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))] lg:hidden"
            aria-label="Abrir navegación"
          >
            <Menu size={18} />
          </button>

          <Link href="/" data-testid="link-inicio" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[hsl(var(--primary))] text-sm font-extrabold text-[hsl(var(--primary-foreground))]">
              Q
            </span>
            <span className="hidden sm:block">
              <span className="ql-display block text-sm font-bold leading-none">QualityLab 360</span>
              <span className="ql-mono block text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                Laboratorio de mejora continua
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <span
              className="hidden rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-[11px] font-semibold sm:block"
              title={`${usuario?.email ?? ''} · ${equipoActual?.nombre ?? ''}`}
              data-testid="chip-cuenta"
            >
              {usuario?.nombre ?? '—'}
              <span className="ql-mono ml-1.5 text-[10px] font-normal text-[hsl(var(--muted-foreground))]">
                {equipoActual?.iniciales ?? ''}
              </span>
            </span>

            <span className="ql-mono rounded-lg bg-[hsl(var(--accent)/.28)] px-2.5 py-1.5 text-[11px] font-bold">
              {puntos.total} QP
            </span>

            <ChipSincro />

            <Link
              href="/coach"
              data-testid="link-coach"
              className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--primary))]"
              aria-label="Abrir Quality Coach"
            >
              <Bot size={17} />
            </Link>

            <button
              type="button"
              data-testid="boton-tema"
              onClick={alternar}
              className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]"
              aria-label="Cambiar tema"
            >
              {tema === 'claro' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            <button
              type="button"
              data-testid="boton-salir"
              onClick={() => void salir()}
              className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6">
        <aside className="hidden w-[228px] shrink-0 lg:block">
          <div className="sticky top-[76px] space-y-4">
            <ResumenProgreso />
            <Navegacion />
            <button
              type="button"
              data-testid="boton-reiniciar"
              onClick={() => {
                if (window.confirm('Se borrará tu avance del módulo, también en el servidor. ¿Continuar?')) reiniciar();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[#d1523f]"
            >
              <RotateCcw size={14} /> Reiniciar mi avance
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>

      <AnimatePresence>
        {abierto ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAbierto(false)}
              className="fixed inset-0 z-40 bg-black/45 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-[272px] overflow-y-auto border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="ql-display text-sm font-bold">QualityLab 360</span>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))]"
                  aria-label="Cerrar navegación"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="mb-4">
                <ResumenProgreso />
              </div>
              <Navegacion alNavegar={() => setAbierto(false)} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
