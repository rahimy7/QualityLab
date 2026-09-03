import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation } from 'wouter';
import { MotionConfig } from 'framer-motion';
import { ErrorBoundary } from '@/components/error-boundary';
import { esErrorDeModulo, recuperarDeVersionVieja } from '@/lib/pwa';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProgresoProvider, type EstadoApp } from '@/store/progreso';
import { SincroUsuarioProvider } from '@/store/sincroUsuario';
import { AuthProvider, useAuth, type Usuario } from '@/store/auth';
import { PantallaAcceso } from '@/components/acceso/PantallaAcceso';
import { casoActivoId } from '@/data/casos';
import { AppShell } from '@/components/shell/AppShell';
import Inicio from '@/pages/Inicio';

/**
 * Solo Inicio viaja en el bundle inicial. El resto se carga al navegar: los
 * participantes entran desde el celular con el wifi del aula y la primera
 * pantalla debe aparecer rápido, aunque el módulo completo pese bastante más.
 *
 * Ese mismo troceado tiene un costo: un despliegue nuevo borra los chunks del
 * anterior, así que una pestaña que quedó abierta pide archivos que ya no
 * existen y la pantalla se queda vacía. `perezoso` lo detecta, limpia lo que
 * guardó la versión vieja y recarga una sola vez.
 */
function perezoso<T extends ComponentType<any>>(cargar: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await cargar();
    } catch (err) {
      if (esErrorDeModulo(err) && (await recuperarDeVersionVieja())) {
        // La recarga ya va en camino: no resolvemos, para no pintar un error
        // que el participante vería parpadear un instante.
        await new Promise<never>(() => {});
      }
      throw err;
    }
  });
}

const Curso = perezoso(() => import('@/pages/Curso'));
const Misiones = perezoso(() => import('@/pages/Misiones'));
const Diagnostico = perezoso(() => import('@/pages/Diagnostico'));
const KpiLab = perezoso(() => import('@/pages/KpiLab'));
const ParetoLab = perezoso(() => import('@/pages/ParetoLab'));
const Ishikawa = perezoso(() => import('@/pages/Ishikawa'));
const CincoPorques = perezoso(() => import('@/pages/CincoPorques'));
const Hoshin = perezoso(() => import('@/pages/Hoshin'));
const Estadistica = perezoso(() => import('@/pages/Estadistica'));
const Mejora = perezoso(() => import('@/pages/Mejora'));
const Auditoria = perezoso(() => import('@/pages/Auditoria'));
const Simulador = perezoso(() => import('@/pages/Simulador'));
const Dashboard = perezoso(() => import('@/pages/Dashboard'));
const Coach = perezoso(() => import('@/pages/Coach'));
const Proyecto = perezoso(() => import('@/pages/Proyecto'));
const Ranking = perezoso(() => import('@/pages/Ranking'));
const Certificado = perezoso(() => import('@/pages/Certificado'));
const Profesor = perezoso(() => import('@/pages/Profesor'));
const Datos = perezoso(() => import('@/pages/Datos'));
const Grupos = perezoso(() => import('@/pages/Grupos'));
const NotFound = perezoso(() => import('@/pages/not-found'));

const queryClient = new QueryClient();

function Cargando() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))]" />
        <p className="ql-mono mt-4 text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">
          Abriendo laboratorio
        </p>
      </div>
    </div>
  );
}

/**
 * Carga el avance de la cuenta antes de montar la app.
 *
 * Sin esta espera, el participante vería un instante su avance local (o vacío)
 * y luego un salto cuando llegara el del servidor; peor aún, ese estado
 * intermedio se sincronizaría de vuelta y pisaría lo bueno.
 */
function SesionDeTrabajo({ usuario }: { usuario: Usuario }) {
  const [inicial, setInicial] = useState<Partial<EstadoApp> | null | undefined>(undefined);

  useEffect(() => {
    let vivo = true;
    fetch(`/api/mi-avance?casoId=${encodeURIComponent(casoActivoId)}`)
      .then(async (r) => (r.status === 204 || !r.ok ? null : ((await r.json()) as { contenido: Partial<EstadoApp> })))
      .then((d) => {
        if (vivo) setInicial(d?.contenido ?? null);
      })
      .catch(() => {
        // Sin red se arranca con lo que haya en el navegador y se sube después.
        if (vivo) setInicial(null);
      });
    return () => {
      vivo = false;
    };
  }, [usuario.id]);

  if (inicial === undefined) return <Cargando />;

  return (
    <ProgresoProvider usuario={{ id: usuario.id, nombre: usuario.nombre, grupoId: usuario.grupoId }} inicial={inicial}>
      <SincroUsuarioProvider>
        <AppShell>
          <ErrorBoundary>
            <Suspense fallback={<Cargando />}>
              <Switch>
                <Route path="/" component={Inicio} />
                <Route path="/curso" component={Curso} />
                <Route path="/misiones" component={Misiones} />
                <Route path="/diagnostico" component={Diagnostico} />
                <Route path="/kpi-lab" component={KpiLab} />
                <Route path="/pareto-lab" component={ParetoLab} />
                <Route path="/ishikawa" component={Ishikawa} />
                <Route path="/cinco-porques" component={CincoPorques} />
                <Route path="/hoshin" component={Hoshin} />
                <Route path="/estadistica" component={Estadistica} />
                <Route path="/mejora" component={Mejora} />
                <Route path="/auditoria" component={Auditoria} />
                <Route path="/simulador" component={Simulador} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/coach" component={Coach} />
                <Route path="/proyecto" component={Proyecto} />
                <Route path="/ranking" component={Ranking} />
                <Route path="/certificado" component={Certificado} />
                <Route path="/profesor" component={Profesor} />
                <Route path="/datos" component={Datos} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </ErrorBoundary>
        </AppShell>
      </SincroUsuarioProvider>
    </ProgresoProvider>
  );
}

/**
 * Muro de acceso. La revisión por grupo queda fuera a propósito: es la pantalla
 * del facilitador, que la abre para proyectarla sin tener cuenta de aula.
 */
function Puerta() {
  const { usuario, comprobando } = useAuth();
  const [ruta] = useLocation();

  if (ruta === '/grupos') {
    return (
      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <ErrorBoundary>
          <Suspense fallback={<Cargando />}>
            <Grupos />
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  }

  if (comprobando) return <Cargando />;
  if (!usuario) return <PantallaAcceso />;
  return <SesionDeTrabajo usuario={usuario} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          <AuthProvider>
            <Puerta />
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
