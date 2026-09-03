import { lazy, Suspense, type ComponentType } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { MotionConfig } from 'framer-motion';
import { ErrorBoundary } from '@/components/error-boundary';
import { esErrorDeModulo, recuperarDeVersionVieja } from '@/lib/pwa';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProgresoProvider } from '@/store/progreso';
import { NubeProvider } from '@/store/nube';
import { SincroGrupoProvider } from '@/store/sincroGrupo';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          {/* NubeProvider va dentro de ProgresoProvider: la sincronización lee
              el avance local y puede reemplazarlo al restaurar desde la clase. */}
          <ProgresoProvider>
            <NubeProvider>
              {/* El auto-guardado por grupo se monta en la raíz para que siga
                  enviando mientras el participante trabaja en los laboratorios,
                  no solo mientras mira el panel de Inicio. */}
              <SincroGrupoProvider>
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
                        <Route path="/grupos" component={Grupos} />
                        <Route component={NotFound} />
                      </Switch>
                    </Suspense>
                  </ErrorBoundary>
                </AppShell>
              </SincroGrupoProvider>
              <Toaster />
            </NubeProvider>
          </ProgresoProvider>
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
