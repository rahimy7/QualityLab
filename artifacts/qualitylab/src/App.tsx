import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { MotionConfig } from 'framer-motion';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProgresoProvider } from '@/store/progreso';
import { NubeProvider } from '@/store/nube';
import { AppShell } from '@/components/shell/AppShell';
import Inicio from '@/pages/Inicio';

/**
 * Solo Inicio viaja en el bundle inicial. El resto se carga al navegar: los
 * participantes entran desde el celular con el wifi del aula y la primera
 * pantalla debe aparecer rápido, aunque el módulo completo pese bastante más.
 */
const Curso = lazy(() => import('@/pages/Curso'));
const Misiones = lazy(() => import('@/pages/Misiones'));
const Diagnostico = lazy(() => import('@/pages/Diagnostico'));
const KpiLab = lazy(() => import('@/pages/KpiLab'));
const ParetoLab = lazy(() => import('@/pages/ParetoLab'));
const Ishikawa = lazy(() => import('@/pages/Ishikawa'));
const CincoPorques = lazy(() => import('@/pages/CincoPorques'));
const Hoshin = lazy(() => import('@/pages/Hoshin'));
const Estadistica = lazy(() => import('@/pages/Estadistica'));
const Mejora = lazy(() => import('@/pages/Mejora'));
const Auditoria = lazy(() => import('@/pages/Auditoria'));
const Simulador = lazy(() => import('@/pages/Simulador'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Coach = lazy(() => import('@/pages/Coach'));
const Proyecto = lazy(() => import('@/pages/Proyecto'));
const Ranking = lazy(() => import('@/pages/Ranking'));
const Certificado = lazy(() => import('@/pages/Certificado'));
const Profesor = lazy(() => import('@/pages/Profesor'));
const Datos = lazy(() => import('@/pages/Datos'));
const NotFound = lazy(() => import('@/pages/not-found'));

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
              <Toaster />
            </NubeProvider>
          </ProgresoProvider>
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
