import { createRoot } from 'react-dom/client';

import { ErrorBoundary } from '@/components/error-boundary';
import { esErrorDeModulo, recuperarDeVersionVieja, registrarServiceWorker } from '@/lib/pwa';

import './index.css';

const container = document.getElementById('root')!;
const root = createRoot(container, {
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
});

function pintarError(err: unknown): void {
  const mensaje = err instanceof Error ? err.message : String(err);
  root.render(
    <div className="grid min-h-screen place-items-center bg-black text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-[10px] uppercase tracking-[.2em] text-red-400">Error al iniciar</div>
        <h1 className="mt-2 text-2xl font-bold">No pudimos cargar los casos</h1>
        <p className="mt-3 text-sm text-white/70">
          La API (<code>/api/casos</code>) no respondió. Asegúrate de que el servidor esté corriendo y que la base de
          datos esté disponible.
        </p>
        <div className="mt-3 rounded-md bg-black/50 px-3 py-2 text-left font-mono text-[11px] text-red-300">
          {mensaje}
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
        >
          Reintentar
        </button>
      </div>
    </div>,
  );
}

async function arrancar(): Promise<void> {
  try {
    const { default: App } = await import('./App');
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
    );
    registrarServiceWorker();
  } catch (err) {
    // Un bundle de otra versión se recupera solo; un fallo de la API se muestra.
    if (esErrorDeModulo(err) && (await recuperarDeVersionVieja())) return;
    pintarError(err);
  }
}

void arrancar();
