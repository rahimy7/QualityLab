import { useMemo, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Compass,
  Flag,
  Gauge,
  Grid2X2,
  HelpCircle,
  History,
  LayoutDashboard,
  Lightbulb,
  Menu,
  MessageCircle,
  Pencil,
  RotateCcw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Link, Route, Switch, Router as WouterRouter, useLocation } from "wouter";

const queryClient = new QueryClient();

type MissionStatus = "completed" | "active" | "locked";
type AuditStatus = "ok" | "partial" | "missing";

type Mission = { id: number; title: string; kicker: string; points: number; status: MissionStatus; summary: string };

const missionSeed: Mission[] = [
  { id: 1, title: "Leer el terreno", kicker: "Diagnóstico", points: 80, status: "completed", summary: "El síntoma no es la causa." },
  { id: 2, title: "Medir lo importante", kicker: "KPI", points: 100, status: "active", summary: "Diseñar un tablero que mueva decisiones." },
  { id: 3, title: "Encontrar el patrón", kicker: "Pareto", points: 120, status: "locked", summary: "Pocas causas explican la mayoría del dolor." },
  { id: 4, title: "Llegar a la raíz", kicker: "5 porqués", points: 120, status: "locked", summary: "Preguntar hasta que la evidencia responda." },
  { id: 5, title: "Alinear el rumbo", kicker: "Hoshin Kanri", points: 140, status: "locked", summary: "Convertir la causa en una apuesta compartida." },
  { id: 6, title: "Probar el cambio", kicker: "Antes / Después", points: 140, status: "locked", summary: "La mejora se demuestra en el tiempo." },
  { id: 7, title: "Cerrar el ciclo", kicker: "Auditoría", points: 180, status: "locked", summary: "Sostener lo que el equipo aprendió." },
];

const baselineMetrics = [
  { label: "Satisfacción", value: "72%", change: "−4.1 pts", icon: Users, tone: "teal", context: "vs. trimestre anterior" },
  { label: "Entregas tardías", value: "19%", change: "+6.8 pts", icon: Clock3, tone: "coral", context: "últimas 12 semanas" },
  { label: "Reclamos", value: "8.7%", change: "+2.3 pts", icon: MessageCircle, tone: "amber", context: "sobre pedidos" },
  { label: "Retrabajos", value: "12%", change: "+3.9 pts", icon: RotateCcw, tone: "blue", context: "de las órdenes" },
  { label: "Productividad", value: "78%", change: "−7.4 pts", icon: Gauge, tone: "violet", context: "meta: 86%" },
];

const diagnosticOptions = [
  { id: "promesa", title: "La promesa comercial está desconectada", detail: "Ventas ofrece tiempos que operaciones no puede sostener.", votes: 4, color: "coral" },
  { id: "prioridad", title: "No existe una prioridad operativa común", detail: "Cada área optimiza una parte y el cliente recibe el costo.", votes: 9, color: "teal" },
  { id: "proveedores", title: "La variabilidad viene de proveedores", detail: "Entradas inestables fuerzan urgencias y retrabajo.", votes: 3, color: "blue" },
  { id: "sistema", title: "Faltan datos para decidir a tiempo", detail: "El equipo reacciona a reclamos, no a señales tempranas.", votes: 2, color: "amber" },
];

const paretoSeed = [
  { cause: "Información incompleta al liberar orden", percent: 34, color: "#e27361" },
  { cause: "Cambio de prioridad durante producción", percent: 26, color: "#f4bd45" },
  { cause: "Espera por aprobación de calidad", percent: 18, color: "#2c9189" },
  { cause: "Material no disponible", percent: 13, color: "#6697a8" },
  { cause: "Otros", percent: 9, color: "#a7a6b1" },
];

const weekSeries = [21, 19, 22, 20, 18, 17, 19, 16, 15, 14, 12, 11];
const auditSeed = [
  { q: "La orden tiene requisitos completos antes de planificar", status: "ok" as AuditStatus, note: "Muestra: 18 / 20 órdenes" },
  { q: "Existe una señal visible para cambios de prioridad", status: "partial" as AuditStatus, note: "Señal informal, sin registro" },
  { q: "El responsable de liberar conoce su tiempo objetivo", status: "ok" as AuditStatus, note: "Validado en entrevista" },
  { q: "Se registra la causa de cada entrega tardía", status: "missing" as AuditStatus, note: "No hay campo obligatorio" },
  { q: "El equipo revisa el indicador semanalmente", status: "ok" as AuditStatus, note: "Ritual activo desde semana 6" },
];

const teamsSeed = [
  { name: "Norte 3", initials: "N3", points: 518, trend: "+42", color: "teal" },
  { name: "Línea Clara", initials: "LC", points: 476, trend: "+28", color: "coral" },
  { name: "Punto Cero", initials: "PC", points: 421, trend: "+51", color: "blue" },
  { name: "Kaizen 24", initials: "K2", points: 394, trend: "+17", color: "amber" },
];

function App() {
  const [missions, setMissions] = useState(missionSeed);
  const [selectedTeam, setSelectedTeam] = useState("Norte 3");
  const [participantMode, setParticipantMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vote, setVote] = useState("prioridad");
  const [voted, setVoted] = useState(false);
  const [kpi, setKpi] = useState<Record<string, string>>({ objective: "Recuperar la confiabilidad de entrega", indicator: "OTIF — entregas completas y a tiempo", formula: "Pedidos OTIF / pedidos totales × 100", baseline: "81", target: "93", frequency: "Semanal", owner: "Líder de operaciones", source: "ERP + tablero de despacho" });
  const [kpiSaved, setKpiSaved] = useState(false);
  const [paretoSelected, setParetoSelected] = useState(0);
  const [whyRows, setWhyRows] = useState([
    ["¿Por qué caen las entregas a tiempo?", "19% de las órdenes llega después de la promesa."],
    ["¿Por qué se entregan tarde?", "Las órdenes cambian de prioridad cuando ya están en producción."],
    ["¿Por qué cambia la prioridad?", "Ventas y operaciones usan criterios distintos para urgencias."],
    ["¿Por qué no comparten criterio?", "No existe una definición de prioridad acordada y visible."],
    ["¿Por qué no existe esa definición?", "El proceso creció sin un dueño transversal de la promesa."],
  ]);
  const [rootCause, setRootCause] = useState("Ausencia de un dueño transversal y una regla visible para priorizar pedidos.");
  const [hoshin, setHoshin] = useState<Record<string, string>>({ objective: "Hacer confiable la promesa al cliente", target: "93% OTIF al cierre del ciclo", kpis: "OTIF semanal; tiempo de liberación; cambios de prioridad", projects: "Ritual de promesa + señal de prioridad en tablero", owners: "Operaciones · Calidad · Comercial" });
  const [hoshinSaved, setHoshinSaved] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [audits, setAudits] = useState(auditSeed);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    { from: "bot", text: "Soy tu copiloto de calidad. Pregúntame por un indicador, un gráfico o la siguiente decisión." },
    { from: "bot", text: "Pista: cuando comparas semanas, una línea te ayuda a ver tendencia; un Pareto te ayuda a elegir dónde intervenir." },
  ]);

  const completed = missions.filter((m) => m.status === "completed").length;
  const totalPoints = missions.filter((m) => m.status === "completed").reduce((sum, m) => sum + m.points, 0);
  const answerAssistant = () => {
    const input = assistantInput.trim();
    if (!input) return;
    const lower = input.toLowerCase();
    let response = "Busca primero el comportamiento en el tiempo. Si la pregunta es “cuándo”, usa una línea; si es “qué explica más”, usa Pareto.";
    if (lower.includes("pareto") || lower.includes("causa")) response = "El Pareto ordena causas de mayor a menor. Aquí, la información incompleta y los cambios de prioridad explican el 60%: son el foco de la primera intervención.";
    if (lower.includes("kpi") || lower.includes("indicador")) response = "Un buen KPI tiene fórmula, línea base, meta, frecuencia, dueño y fuente. Si falta uno, todavía no puede gobernar una conversación.";
    if (lower.includes("tendencia") || lower.includes("gráfico")) response = "Para entregas tardías elige una línea: muestra la caída de 21% a 11% en 12 semanas y hace visible si el cambio se sostiene.";
    setAssistantMessages((messages) => [...messages, { from: "user", text: input }, { from: "bot", text: response }]);
    setAssistantInput("");
  };
  const completeMission = (id: number) => {
    setMissions((items) => items.map((m, index) => m.id === id ? { ...m, status: "completed" } : index === id ? { ...m, status: "active" } : m));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="ql-app ql-noise">
            {!participantMode && <Sidebar missions={missions} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
            <div className={participantMode ? "min-h-[100dvh]" : "md:pl-[256px]"}>
              <Topbar selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} onMenu={() => setSidebarOpen(true)} participantMode={participantMode} setParticipantMode={setParticipantMode} />
              <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
                <ErrorBoundary resetKey={location.pathname}>
                  <Switch>
                    <Route path="/" component={() => <Dashboard missions={missions} completed={completed} totalPoints={totalPoints} selectTeam={selectedTeam} />} />
                    <Route path="/mission/1" component={() => <MissionPage mission={missions[0]} missions={missions} onComplete={completeMission}><MissionOne vote={vote} setVote={setVote} voted={voted} setVoted={setVoted} /></MissionPage>} />
                    <Route path="/mission/2" component={() => <MissionPage mission={missions[1]} missions={missions} onComplete={completeMission}><MissionTwo kpi={kpi} setKpi={setKpi} saved={kpiSaved} setSaved={setKpiSaved} /></MissionPage>} />
                    <Route path="/mission/3" component={() => <MissionPage mission={missions[2]} missions={missions} onComplete={completeMission}><MissionThree selected={paretoSelected} setSelected={setParetoSelected} /></MissionPage>} />
                    <Route path="/mission/4" component={() => <MissionPage mission={missions[3]} missions={missions} onComplete={completeMission}><MissionFour rows={whyRows} setRows={setWhyRows} rootCause={rootCause} setRootCause={setRootCause} /></MissionPage>} />
                    <Route path="/mission/5" component={() => <MissionPage mission={missions[4]} missions={missions} onComplete={completeMission}><MissionFive form={hoshin} setForm={setHoshin} saved={hoshinSaved} setSaved={setHoshinSaved} /></MissionPage>} />
                    <Route path="/mission/6" component={() => <MissionPage mission={missions[5]} missions={missions} onComplete={completeMission}><MissionSix analyzed={analyzed} setAnalyzed={setAnalyzed} /></MissionPage>} />
                    <Route path="/mission/7" component={() => <MissionPage mission={missions[6]} missions={missions} onComplete={completeMission}><MissionSeven audits={audits} setAudits={setAudits} messages={assistantMessages} input={assistantInput} setInput={setAssistantInput} answer={answerAssistant} teams={teamsSeed} /></MissionPage>} />
                    <Route component={NotFound} />
                  </Switch>
                </ErrorBoundary>
              </main>
            </div>
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function Sidebar({ missions, open, onClose }: { missions: Mission[]; open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  return (
    <>
      {open && <button data-testid="button-close-sidebar" className="fixed inset-0 z-30 bg-[#14212d]/35 md:hidden" onClick={onClose} aria-label="Cerrar navegación" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex h-[84px] items-center justify-between border-b border-white/10 px-6">
          <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><Compass size={20} strokeWidth={2.5} /></span>
            <span><span className="block font-extrabold tracking-[-.04em]">Quality<span className="text-[hsl(var(--accent))]">Lab</span></span><span className="ql-mono text-[9px] uppercase tracking-[.18em] text-white/45">operaciones reales</span></span>
          </Link>
          <button data-testid="button-close-mobile-nav" onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 md:hidden"><X size={18} /></button>
        </div>
        <div className="px-4 pt-7">
          <div className="ql-mono mb-3 px-3 text-[10px] uppercase tracking-[.18em] text-white/35">Sala de control</div>
          <Link href="/" data-testid="link-dashboard" className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${location === "/" ? "bg-white/10 text-[hsl(var(--accent))]" : "text-white/65 hover:bg-white/5 hover:text-white"}`}><LayoutDashboard size={17} /> Dashboard <span className="ml-auto rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">HQ</span></Link>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-7">
          <div className="ql-mono mb-3 px-3 text-[10px] uppercase tracking-[.18em] text-white/35">Las 7 misiones</div>
          <nav className="space-y-1">
            {missions.map((mission) => {
              const active = location === `/mission/${mission.id}`;
              return <Link href={`/mission/${mission.id}`} key={mission.id} data-testid={`link-mission-${mission.id}`} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${active ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]" : "text-white/60 hover:bg-white/5 hover:text-white"} ${mission.status === "locked" ? "opacity-60" : ""}`}>
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold ${active ? "bg-black/10" : mission.status === "completed" ? "bg-[hsl(var(--primary))] text-[hsl(var(--accent))]" : "bg-white/10"}`}>{mission.status === "completed" ? <Check size={14} /> : mission.id}</span>
                <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">{mission.title}</span>
                <span className={`ql-mono text-[9px] ${active ? "text-black/55" : "text-white/35"}`}>{mission.points}</span>
              </Link>;
            })}
          </nav>
        </div>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--accent))] text-xs font-extrabold text-[hsl(var(--accent-foreground))]">MR</div>
            <div className="min-w-0"><div className="truncate text-xs font-bold">Mariana Ríos</div><div className="ql-mono text-[9px] text-white/40">FACILITADORA</div></div>
            <button data-testid="button-settings" className="ml-auto text-white/40 hover:text-white" onClick={() => window.alert("Preferencias locales listas para personalizar.")}><Settings2 size={15} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ selectedTeam, setSelectedTeam, onMenu, participantMode, setParticipantMode }: { selectedTeam: string; setSelectedTeam: (value: string) => void; onMenu: () => void; participantMode: boolean; setParticipantMode: (value: boolean) => void }) {
  return <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] px-4 backdrop-blur-md sm:px-6 lg:px-10">
    <div className="flex items-center gap-3">
      <button data-testid="button-open-sidebar" onClick={onMenu} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 md:hidden"><Menu size={18} /></button>
      <div className="hidden items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] sm:flex"><span className="ql-mono text-[10px] uppercase tracking-[.16em]">Cohorte 04</span><span>/</span><span>Marzo — Junio 2025</span></div>
      {participantMode && <span className="rounded-full bg-[hsl(var(--accent)/.28)] px-3 py-1 text-[11px] font-bold text-[hsl(var(--primary))]">Vista participante</span>}
    </div>
    <div className="flex items-center gap-2 sm:gap-3">
      <label className="relative hidden sm:block"><span className="sr-only">Seleccionar equipo</span><select data-testid="select-team" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="appearance-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2.5 pl-3 pr-9 text-xs font-bold outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/.3)]"><option>Norte 3</option><option>Línea Clara</option><option>Punto Cero</option><option>Kaizen 24</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5 text-[hsl(var(--muted-foreground))]" /></label>
      <button data-testid="button-search" onClick={() => window.alert("Búsqueda rápida: prueba con “OTIF” o “prioridad”.")} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><Search size={17} /></button>
      <button data-testid="button-notifications" onClick={() => window.alert("No hay alertas nuevas.")} className="relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><Bell size={17} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /></button>
      <button data-testid="button-toggle-mode" onClick={() => setParticipantMode(!participantMode)} className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-2.5 py-2.5 text-[11px] font-bold text-[hsl(var(--primary-foreground))] transition hover:opacity-90 sm:px-3"><Users size={15} /><span className="hidden sm:inline">{participantMode ? "Modo facilitador" : "Modo participante"}</span></button>
    </div>
  </header>;
}

function Dashboard({ missions, completed, totalPoints, selectTeam }: { missions: Mission[]; completed: number; totalPoints: number; selectTeam: string }) {
  return <div className="space-y-7">
    <section className="ql-grid ql-card ql-enter relative overflow-hidden rounded-2xl p-6 sm:p-9">
      <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-[28px] border-[hsl(var(--accent)/.17)]" /><div className="absolute -right-2 -top-12 h-36 w-36 rounded-full border border-[hsl(var(--accent)/.35)]" />
      <div className="relative max-w-3xl"><div className="mb-4 flex flex-wrap items-center gap-2"><span className="ql-mono rounded-md bg-[hsl(var(--primary))] px-2.5 py-1 text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary-foreground))]">Caso activo · QL-042</span><span className="ql-mono rounded-md border border-[hsl(var(--border))] px-2.5 py-1 text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Equipo {selectTeam}</span></div>
        <h1 className="ql-display max-w-3xl text-4xl font-bold leading-[.98] text-[hsl(var(--foreground))] sm:text-6xl">La promesa se está<br /><span className="text-[hsl(var(--primary))]">rompiendo.</span></h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:text-[15px]">En 12 semanas, <strong className="text-[hsl(var(--foreground))]">Cobalto Industrial</strong> perdió 3 cuentas clave. Su equipo tiene 7 misiones para encontrar la señal, probar una hipótesis y recuperar la confianza del cliente.</p>
        <div className="mt-7 flex flex-wrap items-center gap-3"><Link href={`/mission/${Math.min(completed + 1, 7)}`} data-testid="link-continue-mission" className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:-translate-y-0.5"><span>{completed === 0 ? "Comenzar misión" : "Continuar misión"}</span><ArrowRight size={15} /></Link><button data-testid="button-case-brief" onClick={() => window.alert("Brief: Cobalto Industrial fabrica componentes para automatización. La caída afecta entregas, reclamos y renovación de contratos.")} className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.6)] px-4 py-3 text-xs font-bold hover:bg-[hsl(var(--card))]"><BookOpen size={15} /> Ver brief del caso</button></div>
      </div>
    </section>
    <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
      <section className="ql-card ql-enter-2 rounded-2xl p-5 sm:p-6"><div className="mb-5 flex items-start justify-between"><div><div className="ql-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">Situación actual</div><h2 className="ql-display mt-1 text-2xl font-bold">La señal en una mirada</h2></div><span className="rounded-lg bg-[hsl(var(--accent)/.22)] px-2.5 py-1 text-[10px] font-bold text-[hsl(var(--primary))]">Actualizado hace 4 min</span></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{baselineMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div>
        <div className="mt-5 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-4"><div className="h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-700" style={{ width: `${(completed / 7) * 100}%` }} /></div><span className="ql-mono text-[11px] font-medium">{completed}/07 cerradas</span></div>
      </section>
      <section className="ql-card ql-enter-3 rounded-2xl p-5 sm:p-6"><div className="flex items-center justify-between"><div><div className="ql-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">Puntos de calidad</div><div className="ql-display mt-1 text-4xl font-bold">{totalPoints}<span className="ml-1 text-lg text-[hsl(var(--muted-foreground))]">QP</span></div></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--accent)/.22)] text-[hsl(var(--primary))]"><Trophy size={23} /></div></div><div className="mt-5 space-y-3 text-xs"><div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Ritmo del equipo</span><strong>En foco</strong></div><div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">Siguiente hito</span><strong className="text-[hsl(var(--primary))]">Misión {Math.min(completed + 1, 7)}</strong></div></div><Link href="/mission/7" data-testid="link-ranking-dashboard" className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4 text-xs font-bold text-[hsl(var(--primary))]">Ver ranking de equipos <ArrowRight size={14} /></Link></section>
    </div>
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <MissionRail missions={missions} />
      <ActivityFeed />
    </div>
    <AssistantPreview />
  </div>;
}

function MetricCard({ label, value, change, icon: Icon, tone, context }: { label: string; value: string; change: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; tone: string; context: string }) {
  const styles: Record<string, string> = { teal: "bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]", coral: "bg-[#e27361]/10 text-[#bd5548]", amber: "bg-[#f4bd45]/20 text-[#9c7314]", blue: "bg-[#6697a8]/15 text-[#477384]", violet: "bg-[#a7a6b1]/20 text-[#6d6a79]" };
  return <div data-testid={`metric-${label.toLowerCase().replaceAll(" ", "-")}`} className="min-w-0 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.5)] p-3"><div className={`mb-3 grid h-7 w-7 place-items-center rounded-lg ${styles[tone]}`}><Icon size={14} /></div><div className="ql-mono truncate text-[10px] uppercase tracking-[-.03em] text-[hsl(var(--muted-foreground))]">{label}</div><div className="ql-display mt-1 text-[25px] font-bold">{value}</div><div className={`ql-mono mt-1 text-[9px] font-medium ${tone === "coral" ? "text-[#bd5548]" : "text-[hsl(var(--primary))]"}`}>{change}</div><div className="mt-1 truncate text-[9px] text-[hsl(var(--muted-foreground))]">{context}</div></div>;
}

function MissionRail({ missions }: { missions: Mission[] }) {
  return <section className="ql-card rounded-2xl p-5 sm:p-6"><div className="mb-5 flex items-start justify-between"><div><div className="ql-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">Ruta de resolución</div><h2 className="ql-display mt-1 text-2xl font-bold">Siete movimientos</h2></div><span className="ql-mono text-[10px] text-[hsl(var(--muted-foreground))]">80 min estimados</span></div><div className="relative space-y-1 before:absolute before:bottom-5 before:left-[17px] before:top-5 before:w-px before:bg-[hsl(var(--border))]">{missions.map((mission) => <Link href={`/mission/${mission.id}`} key={mission.id} data-testid={`card-mission-${mission.id}`} className="group relative flex items-center gap-3 rounded-xl p-2 transition hover:bg-[hsl(var(--muted)/.55)]"><span className={`z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${mission.status === "completed" ? "bg-[hsl(var(--primary))] text-white" : mission.status === "active" ? "border-2 border-[hsl(var(--accent))] bg-[hsl(var(--card))] text-[hsl(var(--primary))]" : "border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]"}`}>{mission.status === "completed" ? <Check size={13} /> : mission.id}</span><span className="min-w-0 flex-1"><span className="block text-xs font-bold">{mission.title}</span><span className="block truncate text-[10px] text-[hsl(var(--muted-foreground))]">{mission.summary}</span></span><span className={`ql-mono text-[10px] ${mission.status === "active" ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"}`}>{mission.points} QP</span><ArrowRight size={13} className="text-[hsl(var(--muted-foreground))] transition group-hover:translate-x-1" /></Link>)}</div></section>;
}

function ActivityFeed() {
  return <section className="ql-card rounded-2xl p-5 sm:p-6"><div className="mb-5 flex items-start justify-between"><div><div className="ql-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">Actividad del grupo</div><h2 className="ql-display mt-1 text-2xl font-bold">La sala se mueve</h2></div><button data-testid="button-refresh-activity" onClick={() => window.alert("Actividad sincronizada con el estado local.")} className="rounded-lg border border-[hsl(var(--border))] p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><History size={15} /></button></div><div className="space-y-5">{[{ initials: "LC", text: "Línea Clara cerró la hipótesis del Pareto", time: "hace 8 min", color: "coral" }, { initials: "PC", text: "Punto Cero añadió evidencia al 5.º porqué", time: "hace 19 min", color: "blue" }, { initials: "N3", text: "Norte 3 alcanzó 500 Quality Points", time: "hace 31 min", color: "teal" }, { initials: "K2", text: "Kaizen 24 inició la misión de auditoría", time: "hace 44 min", color: "amber" }].map((item, i) => <div className="flex items-center gap-3" key={item.initials}><div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${item.color === "coral" ? "bg-[#e27361]/15 text-[#bd5548]" : item.color === "blue" ? "bg-[#6697a8]/15 text-[#477384]" : item.color === "amber" ? "bg-[#f4bd45]/25 text-[#9c7314]" : "bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]"}`}>{item.initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{item.text}</p><p className="ql-mono mt-0.5 text-[9px] text-[hsl(var(--muted-foreground))]">{item.time}</p></div>{i === 0 && <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />}</div>)}</div><button data-testid="button-open-activity" onClick={() => window.alert("Mostrando las últimas 24 horas de actividad.")} className="mt-6 w-full rounded-xl border border-[hsl(var(--border))] py-2.5 text-xs font-bold hover:bg-[hsl(var(--muted))]">Ver toda la actividad</button></section>;
}

function AssistantPreview() {
  return <section className="rounded-2xl bg-[hsl(var(--primary))] p-5 text-white sm:flex sm:items-center sm:justify-between sm:p-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><Bot size={20} /></div><div><div className="ql-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--accent))]">Copiloto de calidad</div><p className="mt-1 text-sm font-semibold">“Un dato aislado describe. Una serie en el tiempo explica.”</p></div></div><Link href="/mission/7" data-testid="link-open-assistant" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold hover:bg-white/15 sm:mt-0">Preguntar al asistente <ArrowRight size={14} /></Link></section>;
}

function MissionPage({ mission, missions, children, onComplete }: { mission: Mission; missions: Mission[]; children: ReactNode; onComplete: (id: number) => void }) {
  const previous = mission.id > 1 ? missions[mission.id - 2] : null;
  return <div className="ql-enter space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/" data-testid="link-back-dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"><ArrowLeft size={15} /> Dashboard</Link><div className="flex items-center gap-2"><span className="ql-mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Misión {mission.id} / 07</span><span className="h-1 w-1 rounded-full bg-[hsl(var(--accent))]" /><span className="text-xs text-[hsl(var(--muted-foreground))]">{mission.points} Quality Points</span></div></div>
    <div className="grid gap-6 lg:grid-cols-[.33fr_1fr]"><aside className="ql-card h-fit rounded-2xl p-5 lg:sticky lg:top-[96px]"><div className="mb-5 flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--accent)/.3)] text-lg font-extrabold text-[hsl(var(--primary))]">0{mission.id}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${mission.status === "completed" ? "bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]" : mission.status === "active" ? "bg-[hsl(var(--accent)/.32)] text-[hsl(var(--foreground))]" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>{mission.status === "completed" ? "Completada" : mission.status === "active" ? "En curso" : "Siguiente"}</span></div><div className="ql-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">{mission.kicker}</div><h1 className="ql-display mt-2 text-3xl font-bold leading-[1.05]">{mission.title}</h1><p className="mt-4 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{mission.summary} En esta sala, la respuesta debe poder defenderse con evidencia.</p><div className="mt-6 border-t border-[hsl(var(--border))] pt-5"><div className="mb-2 flex justify-between text-[10px] font-bold"><span>Tu recorrido</span><span className="ql-mono text-[hsl(var(--primary))]">{mission.id - 1}/7</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${((mission.id - 1) / 7) * 100}%` }} /></div>{previous && <Link href={`/mission/${previous.id}`} data-testid="link-previous-mission" className="mt-5 flex items-center gap-2 text-[11px] font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"><ArrowLeft size={13} /> Revisar misión anterior</Link>}</div></aside><section className="min-w-0">{children}<div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-5"><Link href="/" data-testid="link-save-exit" className="inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))]"><Save size={14} /> Guardado localmente</Link><div className="flex items-center gap-2">{mission.id > 1 && <Link href={`/mission/${mission.id - 1}`} data-testid="link-mission-back" className="rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-xs font-bold hover:bg-[hsl(var(--muted))]">Atrás</Link>}{mission.id < 7 ? <Link href={`/mission/${mission.id + 1}`} data-testid="link-mission-next" onClick={() => onComplete(mission.id)} className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-bold text-white hover:opacity-90">Guardar y continuar <ArrowRight size={14} /></Link> : <button data-testid="button-finish-program" onClick={() => { onComplete(mission.id); window.alert("Ciclo completado. El aprendizaje quedó registrado en esta sesión."); }} className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-bold text-white hover:opacity-90">Cerrar ciclo <CheckCircle2 size={14} /></button>}</div></div></section></div>
  </div>;
}

function MissionOne({ vote, setVote, voted, setVoted }: { vote: string; setVote: (value: string) => void; voted: boolean; setVoted: (value: boolean) => void }) {
  const totalVotes = diagnosticOptions.reduce((s, item) => s + item.votes, 0);
  return <div className="space-y-5"><MissionHeader eyebrow="Pulso del equipo · 01" title="¿Qué está rompiendo la promesa?" intro="Antes de correr a la solución, toma posición. El diagnóstico del grupo se construye con argumentos, no con jerarquía." icon={Target} /><div className="ql-card rounded-2xl p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><div><h2 className="ql-display text-xl font-bold">Vota el diagnóstico que defenderías</h2><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Una opción por equipo · {totalVotes} votos en la sala</p></div><span className="ql-mono rounded-lg bg-[hsl(var(--muted))] px-2.5 py-1.5 text-[10px]">DECISIÓN 01</span></div><div className="grid gap-3">{diagnosticOptions.map((option) => <label key={option.id} data-testid={`option-diagnostic-${option.id}`} className={`group flex cursor-pointer gap-3 rounded-xl border p-4 transition ${vote === option.id ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)]" : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/.5)]"}`}><input type="radio" name="diagnostic" value={option.id} checked={vote === option.id} onChange={(e) => { setVote(e.target.value); setVoted(false); }} className="mt-1 accent-[hsl(var(--primary))]" /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2 text-sm font-bold">{option.title}{voted && <span className="ql-mono text-[10px] text-[hsl(var(--primary))]">{Math.round((option.votes / totalVotes) * 100)}%</span>}</span><span className="mt-1 block text-xs leading-5 text-[hsl(var(--muted-foreground))]">{option.detail}</span>{voted && <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><span className="block h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${(option.votes / totalVotes) * 100}%` }} /></span>}</span></label>)}</div><button data-testid="button-submit-diagnostic" onClick={() => setVoted(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-white hover:opacity-90">{voted ? "Voto registrado" : "Revelar resultado del grupo"} <ArrowRight size={14} /></button></div><Insight text={voted ? "El grupo ve un patrón: 50% apunta a la falta de prioridad común. El consenso no es la verdad, pero sí una hipótesis de trabajo." : "El facilitador verá el resultado agregado cuando todos los equipos hayan tomado posición."} /></div>;
}

function MissionTwo({ kpi, setKpi, saved, setSaved }: { kpi: Record<string, string>; setKpi: (value: Record<string, string>) => void; saved: boolean; setSaved: (value: boolean) => void }) {
  const required = ["objective", "indicator", "formula", "baseline", "target", "frequency", "owner", "source"];
  const complete = required.filter((key) => kpi[key].trim()).length;
  const score = Math.round((complete / required.length) * 70 + (Number(kpi.target) > Number(kpi.baseline) ? 30 : 0));
  const update = (key: string, value: string) => { setKpi({ ...kpi, [key]: value }); setSaved(false); };
  return <div className="space-y-5"><MissionHeader eyebrow="Instrumentación · 02" title="Medir lo importante" intro="Un KPI no es un número decorativo. Es un acuerdo de comportamiento: qué observamos, quién responde y cuándo actuamos." icon={Gauge} /><div className="grid gap-5 xl:grid-cols-[1fr_.34fr]"><div className="ql-card rounded-2xl p-5 sm:p-7"><div className="mb-6 flex items-center justify-between"><div><h2 className="ql-display text-xl font-bold">Ficha del indicador</h2><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Completa los 8 componentes para activar el score.</p></div><span className="ql-mono text-[10px] text-[hsl(var(--primary))]">{complete}/08 componentes</span></div><div className="grid gap-4 sm:grid-cols-2">{required.map((key) => <Field key={key} label={key === "objective" ? "Objetivo" : key === "indicator" ? "Indicador" : key === "formula" ? "Fórmula" : key === "baseline" ? "Línea base (%)" : key === "target" ? "Meta (%)" : key === "frequency" ? "Frecuencia" : key === "owner" ? "Dueño" : "Fuente"} value={kpi[key]} onChange={(value) => update(key, value)} wide={key === "objective" || key === "indicator" || key === "formula"} />)}</div><div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[hsl(var(--border))] pt-5"><button data-testid="button-save-kpi" onClick={() => setSaved(complete === 8 && Number(kpi.target) > Number(kpi.baseline))} className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-white hover:opacity-90"><Save size={14} /> Guardar ficha</button>{saved && <span data-testid="status-kpi-saved" className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))]"><CheckCircle2 size={15} /> Score validado y guardado</span>}{complete === 8 && Number(kpi.target) <= Number(kpi.baseline) && <span className="text-xs font-semibold text-[#bd5548]">La meta debe mejorar la línea base.</span>}</div></div><div className="ql-card h-fit rounded-2xl bg-[hsl(var(--primary))] p-5 text-white sm:p-6"><div className="ql-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--accent))]">Quality Score</div><div className="ql-display mt-3 text-6xl font-bold">{score}<span className="text-2xl text-white/50">/100</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[hsl(var(--accent))] transition-all duration-500" style={{ width: `${score}%` }} /></div><div className="mt-5 space-y-3 border-t border-white/15 pt-4 text-xs"><div className="flex justify-between"><span className="text-white/60">Componentes</span><strong>{complete}/8</strong></div><div className="flex justify-between"><span className="text-white/60">Dirección de la meta</span><strong>{Number(kpi.target) > Number(kpi.baseline) ? "Correcta" : "Revisar"}</strong></div><p className="pt-2 leading-5 text-white/65">La precisión del indicador define la precisión de la conversación.</p></div></div></div><Insight text="Regla de oro: si dos personas calculan el KPI y obtienen respuestas distintas, todavía no es un KPI operativo." /></div>;
}

function Field({ label, value, onChange, wide }: { label: string; value: string; onChange: (value: string) => void; wide?: boolean }) {
  return <label className={wide ? "sm:col-span-2" : ""}><span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[.11em] text-[hsl(var(--muted-foreground))]">{label}</span><input data-testid={`input-kpi-${label.toLowerCase().replaceAll(" ", "-")}`} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.55)] px-3 py-3 text-xs font-semibold outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.13)]" /></label>;
}

function MissionThree({ selected, setSelected }: { selected: number; setSelected: (value: number) => void }) {
  const cumulative = paretoSeed.map((item, i) => paretoSeed.slice(0, i + 1).reduce((sum, value) => sum + value.percent, 0));
  return <div className="space-y-5"><MissionHeader eyebrow="Análisis de datos · 03" title="Encontrar el patrón" intro="No todas las causas pesan igual. Ordena la evidencia y elige el punto donde una intervención puede cambiar la historia." icon={BarChart3} /><div className="ql-card rounded-2xl p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="ql-display text-xl font-bold">Pareto de entregas tardías</h2><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">N = 146 órdenes con desviación · periodo de 12 semanas</p></div><span className="ql-mono rounded-lg bg-[hsl(var(--muted))] px-2.5 py-1.5 text-[10px]">NÚCLEO 80/20</span></div><div className="mt-7 space-y-3">{paretoSeed.map((item, index) => <button key={item.cause} data-testid={`button-pareto-cause-${index}`} onClick={() => setSelected(index)} className={`group flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${selected === index ? "bg-[hsl(var(--primary)/.06)]" : "hover:bg-[hsl(var(--muted)/.55)]"}`}><span className="ql-mono w-4 text-right text-[10px] text-[hsl(var(--muted-foreground))]">{index + 1}</span><span className="w-[170px] shrink-0 truncate text-xs font-bold sm:w-[235px]">{item.cause}</span><span className="relative h-8 flex-1 overflow-hidden rounded-lg bg-[hsl(var(--muted))]"><span className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500" style={{ width: `${item.percent * 2.2}%`, background: item.color }} /><span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-white drop-shadow-sm">{item.percent}%</span></span><span className="ql-mono w-9 text-right text-[10px] text-[hsl(var(--muted-foreground))]">{cumulative[index]}%</span></button>)}</div><div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4 text-[10px] text-[hsl(var(--muted-foreground))]"><span>0%</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#f4bd45]" /> acumulado</span><span>100%</span></div></div><div className="grid gap-4 sm:grid-cols-[1.4fr_.6fr]"><div className="rounded-2xl border border-[hsl(var(--accent)/.55)] bg-[hsl(var(--accent)/.13)] p-5"><div className="mb-2 flex items-center gap-2 text-[hsl(var(--primary))]"><Sparkles size={16} /><span className="ql-mono text-[10px] font-bold uppercase tracking-[.13em]">Hallazgo destacado</span></div><p className="text-sm font-bold leading-6">Las dos primeras causas explican el <span className="text-[hsl(var(--primary))]">60% del retraso</span>. El sistema no necesita cinco proyectos: necesita una regla de prioridad que todos puedan ver.</p></div><div className="ql-card rounded-2xl p-5"><div className="ql-mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary))]">Tu selección</div><div className="mt-2 text-sm font-bold">{paretoSeed[selected].cause}</div><div className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">Causa {selected + 1} · {paretoSeed[selected].percent}% del total</div></div></div></div>;
}

function MissionFour({ rows, setRows, rootCause, setRootCause }: { rows: string[][]; setRows: (value: string[][]) => void; rootCause: string; setRootCause: (value: string) => void }) {
  return <div className="space-y-5"><MissionHeader eyebrow="Pensamiento causal · 04" title="Llegar a la raíz" intro="Un buen porqué abre una puerta a la acción. Añade evidencia en cada paso y no confundas el síntoma con la causa raíz." icon={HelpCircle} /><div className="ql-card rounded-2xl p-5 sm:p-7"><div className="mb-6 flex items-center justify-between"><div><h2 className="ql-display text-xl font-bold">Cadena de 5 porqués</h2><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Cada respuesta debe poder rastrearse a una observación.</p></div><span className="ql-mono rounded-lg bg-[hsl(var(--muted))] px-2.5 py-1.5 text-[10px]">EVIDENCIA ACTIVA</span></div><div className="space-y-3">{rows.map((row, index) => <div className="grid gap-2 sm:grid-cols-[32px_1fr_1.2fr]" key={index}><div className="grid h-7 w-7 place-items-center rounded-lg bg-[hsl(var(--primary))] text-[10px] font-bold text-white">{index + 1}</div><input data-testid={`input-why-question-${index + 1}`} value={row[0]} onChange={(e) => { const copy = rows.map((r) => [...r]); copy[index][0] = e.target.value; setRows(copy); }} className="rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.5)] px-3 py-2.5 text-xs font-bold outline-none focus:border-[hsl(var(--primary))]" /><input data-testid={`input-why-evidence-${index + 1}`} value={row[1]} onChange={(e) => { const copy = rows.map((r) => [...r]); copy[index][1] = e.target.value; setRows(copy); }} className="rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.5)] px-3 py-2.5 text-xs outline-none focus:border-[hsl(var(--primary))]" /></div>)}</div><div className="mt-6 rounded-2xl border-2 border-dashed border-[hsl(var(--accent)/.7)] bg-[hsl(var(--accent)/.1)] p-4 sm:p-5"><div className="mb-2 flex items-center gap-2 text-[hsl(var(--primary))]"><Flag size={16} /><span className="ql-mono text-[10px] font-bold uppercase tracking-[.13em]">Causa raíz propuesta</span></div><textarea data-testid="textarea-root-cause" value={rootCause} onChange={(e) => setRootCause(e.target.value)} rows={2} className="w-full resize-none bg-transparent text-sm font-bold leading-6 outline-none" /><div className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">Criterio: si la eliminas, el problema deja de repetirse.</div></div></div><Insight text="La evidencia evita que el análisis sea una opinión elegante. Elige el porqué más profundo que todavía puedas controlar." /></div>;
}

function MissionFive({ form, setForm, saved, setSaved }: { form: Record<string, string>; setForm: (value: Record<string, string>) => void; saved: boolean; setSaved: (value: boolean) => void }) {
  const update = (key: string, value: string) => { setForm({ ...form, [key]: value }); setSaved(false); };
  return <div className="space-y-5"><MissionHeader eyebrow="Despliegue estratégico · 05" title="Alinear el rumbo" intro="La estrategia entra al piso cuando objetivo, métrica, proyecto y dueño caben en el mismo mapa." icon={Grid2X2} /><div className="ql-card rounded-2xl p-5 sm:p-7"><div className="mb-7 flex items-center justify-between"><div><h2 className="ql-display text-xl font-bold">Hoshin Kanri · mapa de una página</h2><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Edita los acuerdos del equipo y mira cómo se conectan.</p></div><button data-testid="button-reset-hoshin" onClick={() => { setForm({ objective: "Hacer confiable la promesa al cliente", target: "93% OTIF al cierre del ciclo", kpis: "OTIF semanal; tiempo de liberación; cambios de prioridad", projects: "Ritual de promesa + señal de prioridad en tablero", owners: "Operaciones · Calidad · Comercial" }); setSaved(false); }} className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"><RotateCcw size={15} /></button></div><div className="grid gap-3 md:grid-cols-5">{[["objective", "Norte"], ["target", "Meta"], ["kpis", "Señales"], ["projects", "Proyectos"], ["owners", "Dueños"]].map(([key, label], i) => <div key={key} className="relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.5)] p-4 md:before:absolute md:before:-right-3 md:before:top-1/2 md:before:z-10 md:before:h-px md:before:w-3 md:before:bg-[hsl(var(--accent))] last:md:before:hidden"><div className="mb-4 flex items-center justify-between"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[hsl(var(--accent)/.3)] text-[hsl(var(--primary))] text-[10px] font-extrabold">0{i + 1}</span><Pencil size={13} className="text-[hsl(var(--muted-foreground))]" /></div><div className="ql-mono mb-2 text-[10px] uppercase tracking-[.13em] text-[hsl(var(--primary))]">{label}</div><textarea data-testid={`textarea-hoshin-${key}`} value={form[key]} onChange={(e) => update(key, e.target.value)} rows={4} className="w-full resize-none bg-transparent text-xs font-bold leading-5 outline-none" /></div>)}</div><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-5"><div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" /> Mapa conectado · 5 acuerdos visibles</div><button data-testid="button-save-hoshin" onClick={() => setSaved(true)} className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-white hover:opacity-90"><Save size={14} /> Guardar mapa</button></div>{saved && <div data-testid="status-hoshin-saved" className="mt-4 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary)/.1)] p-3 text-xs font-bold text-[hsl(var(--primary))]"><CheckCircle2 size={15} /> El mapa quedó guardado para la conversación de piso.</div>}</div><Insight text="Hoshin no es un documento anual: es la forma en que una decisión se vuelve visible para cinco áreas distintas." /></div>;
}

function MissionSix({ analyzed, setAnalyzed }: { analyzed: boolean; setAnalyzed: (value: boolean) => void }) {
  const average = weekSeries.reduce((a, b) => a + b, 0) / weekSeries.length;
  const first = weekSeries.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
  const last = weekSeries.slice(-4).reduce((a, b) => a + b, 0) / 4;
  const max = Math.max(...weekSeries);
  const min = Math.min(...weekSeries);
  return <div className="space-y-5"><MissionHeader eyebrow="Validación · 06" title="Probar el cambio" intro="La mejora no se anuncia: se observa. Compara bloques equivalentes y busca una señal que no dependa de un día afortunado." icon={TrendingDown} /><div className="ql-card rounded-2xl p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="ql-display text-xl font-bold">Entregas tardías · 12 semanas</h2><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Intervención desplegada en semana 6 · porcentaje semanal</p></div><div className="flex items-center gap-2"><span className="flex items-center gap-1.5 text-[10px] font-bold"><span className="h-2 w-2 rounded-full bg-[#e27361]" /> Antes</span><span className="flex items-center gap-1.5 text-[10px] font-bold"><span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" /> Después</span></div></div><div className="relative mt-8 h-[240px] border-b border-l border-[hsl(var(--border))] pl-2 pt-2"><div className="absolute inset-x-0 top-0 flex justify-between text-[9px] text-[hsl(var(--muted-foreground))]"><span>25%</span><span>20%</span><span>15%</span><span>10%</span><span>5%</span></div><div className="absolute inset-x-3 bottom-0 top-7 flex items-end justify-between gap-1 sm:gap-3">{weekSeries.map((value, i) => <div className="group flex h-full flex-1 flex-col items-center justify-end gap-2" key={i}><div className={`relative w-full max-w-9 rounded-t-md transition-all duration-700 ${i < 6 ? "bg-[#e27361]/75" : "bg-[hsl(var(--primary))]"}`} style={{ height: `${(value / 25) * 100}%` }}><span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-0 transition group-hover:opacity-100">{value}%</span></div><span className="ql-mono text-[8px] text-[hsl(var(--muted-foreground))]">S{i + 1}</span></div>)}</div><div className="absolute bottom-7 left-1/2 top-7 border-l border-dashed border-[hsl(var(--accent))]" /><span className="absolute bottom-10 left-[51%] rounded bg-[hsl(var(--accent))] px-2 py-1 text-[9px] font-bold">Intervención</span></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Promedio", `${average.toFixed(1)}%`], ["Antes", `${first.toFixed(1)}%`], ["Después", `${last.toFixed(1)}%`], ["Rango", `${min}–${max}%`]].map(([label, value]) => <div key={label} className="rounded-xl bg-[hsl(var(--muted)/.55)] p-3"><div className="ql-mono text-[9px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">{label}</div><div className="ql-display mt-1 text-xl font-bold">{value}</div></div>)}</div><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-5"><p className="text-xs text-[hsl(var(--muted-foreground))]">La caída entre bloques es de <strong className="text-[hsl(var(--primary))]">{(first - last).toFixed(1)} puntos</strong>.</p><button data-testid="button-analyze-series" onClick={() => setAnalyzed(true)} className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-white hover:opacity-90"><Activity size={14} /> {analyzed ? "Análisis validado" : "Validar análisis"}</button></div></div>{analyzed && <div data-testid="status-series-analyzed" className="rounded-2xl border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.08)] p-5"><div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"><TrendingDown size={17} /> La intervención muestra señal consistente</div><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">El promedio cae semana a semana y el rango se estrecha. No prueba causalidad por sí sola, pero sí justifica sostener el cambio y medirlo en auditoría.</p></div>}</div>;
}

function MissionSeven({ audits, setAudits, messages, input, setInput, answer, teams }: { audits: typeof auditSeed; setAudits: (value: typeof auditSeed) => void; messages: { from: string; text: string }[]; input: string; setInput: (value: string) => void; answer: () => void; teams: typeof teamsSeed }) {
  const score = Math.round(audits.reduce((sum, audit) => sum + (audit.status === "ok" ? 100 : audit.status === "partial" ? 50 : 0), 0) / audits.length);
  const classification = score >= 85 ? "Sostenible" : score >= 60 ? "En observación" : "Crítico";
  const cycleStatus: AuditStatus[] = ["ok", "partial", "missing"];
  return <div className="space-y-5"><MissionHeader eyebrow="Control y aprendizaje · 07" title="Cerrar el ciclo" intro="Auditar no es buscar culpables. Es comprobar si el nuevo estándar vive cuando la sala deja de mirar." icon={ShieldCheck} /><div className="grid gap-5 xl:grid-cols-[1fr_.66fr]"><div className="ql-card rounded-2xl p-5 sm:p-7"><div className="mb-6 flex items-center justify-between"><div><h2 className="ql-display text-xl font-bold">Auditoría de sostén</h2><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Selecciona el estado que describe la evidencia de hoy.</p></div><div className="text-right"><div className="ql-display text-3xl font-bold text-[hsl(var(--primary))]">{score}%</div><div className="ql-mono text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{classification}</div></div></div><div className="space-y-2">{audits.map((audit, index) => <div key={audit.q} className="rounded-xl border border-[hsl(var(--border))] p-3 sm:flex sm:items-center sm:gap-3"><div className="flex flex-1 items-start gap-3"><span className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg ${audit.status === "ok" ? "bg-[hsl(var(--primary)/.13)] text-[hsl(var(--primary))]" : audit.status === "partial" ? "bg-[hsl(var(--accent)/.3)] text-[#9c7314]" : "bg-[#e27361]/12 text-[#bd5548]"}`}>{audit.status === "ok" ? <Check size={13} /> : audit.status === "partial" ? <Clock3 size={13} /> : <X size={13} />}</span><div><p className="text-xs font-bold leading-5">{audit.q}</p><p className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">{audit.note}</p></div></div><div className="mt-3 flex gap-1 sm:mt-0">{cycleStatus.map((status) => <button key={status} data-testid={`button-audit-${index}-${status}`} onClick={() => setAudits(audits.map((item, i) => i === index ? { ...item, status } : item))} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${audit.status === status ? status === "ok" ? "bg-[hsl(var(--primary))] text-white" : status === "partial" ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]" : "bg-[#e27361] text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]"}`}>{status === "ok" ? "Cumple" : status === "partial" ? "Parcial" : "Falta"}</button>)}</div></div>)}</div><div className="mt-5 flex items-center gap-2 rounded-xl bg-[hsl(var(--muted)/.5)] p-3 text-xs text-[hsl(var(--muted-foreground))]"><ClipboardCheck size={16} className="shrink-0 text-[hsl(var(--primary))]" /> Cumplimiento calculado con 100 / 50 / 0 puntos por evidencia.</div></div><div className="space-y-5"><div className="ql-card rounded-2xl p-5"><div className="mb-4 flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[hsl(var(--primary))] text-white"><Bot size={18} /></div><div><div className="ql-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">Asistente de calidad</div><div className="text-sm font-bold">Pregunta, interpreta, decide</div></div></div><div className="max-h-[250px] space-y-3 overflow-y-auto rounded-xl bg-[hsl(var(--muted)/.5)] p-3">{messages.map((message, index) => <div key={index} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[90%] rounded-xl px-3 py-2 text-[11px] leading-5 ${message.from === "user" ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"}`}>{message.text}</div></div>)}</div><div className="mt-3 flex gap-2"><input data-testid="input-assistant" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") answer(); }} placeholder="Ej. ¿qué gráfico uso?" className="min-w-0 flex-1 rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2.5 text-xs outline-none focus:border-[hsl(var(--primary))]" /><button data-testid="button-ask-assistant" onClick={answer} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--primary))] text-white hover:opacity-90"><ArrowRight size={15} /></button></div></div><Ranking teams={teams} /></div></div></div>;
}

function Ranking({ teams }: { teams: typeof teamsSeed }) {
  return <div className="ql-card rounded-2xl p-5"><div className="mb-5 flex items-center justify-between"><div><div className="ql-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">Marcador de la sala</div><h3 className="ql-display mt-1 text-xl font-bold">Ranking Quality Points</h3></div><Trophy size={19} className="text-[hsl(var(--accent-foreground))] fill-[hsl(var(--accent))]" /></div><div className="space-y-2">{teams.map((team, index) => <div data-testid={`row-team-${index + 1}`} key={team.name} className={`flex items-center gap-3 rounded-xl p-2.5 ${index === 0 ? "bg-[hsl(var(--accent)/.18)]" : ""}`}><span className="ql-mono w-4 text-center text-[10px] font-bold text-[hsl(var(--muted-foreground))]">{String(index + 1).padStart(2, "0")}</span><div className={`grid h-8 w-8 place-items-center rounded-full text-[10px] font-extrabold ${team.color === "coral" ? "bg-[#e27361]/15 text-[#bd5548]" : team.color === "blue" ? "bg-[#6697a8]/15 text-[#477384]" : team.color === "amber" ? "bg-[#f4bd45]/25 text-[#9c7314]" : "bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]"}`}>{team.initials}</div><span className="flex-1 text-xs font-bold">{team.name}</span><span className="ql-mono text-[10px] text-[hsl(var(--primary))]">{team.trend}</span><strong className="ql-mono text-xs">{team.points}</strong></div>)}</div></div>;
}

function MissionHeader({ eyebrow, title, intro, icon: Icon }: { eyebrow: string; title: string; intro: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }) {
  return <div className="flex items-start gap-4"><div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))] text-white sm:grid"><Icon size={21} /></div><div><div className="ql-mono text-[10px] uppercase tracking-[.17em] text-[hsl(var(--primary))]">{eyebrow}</div><h1 className="ql-display mt-1 text-4xl font-bold leading-[1.02] sm:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{intro}</p></div></div>;
}

function Insight({ text }: { text: string }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.12)] p-4"><Lightbulb size={17} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" /><div><div className="ql-mono text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">Nota del facilitador</div><p className="mt-1 text-xs leading-5 text-[hsl(var(--foreground))]">{text}</p></div></div>;
}

function NotFound() {
  return <div className="grid min-h-[60vh] place-items-center"><div className="text-center"><div className="ql-mono text-xs text-[hsl(var(--primary))]">ERROR 404</div><h1 className="ql-display mt-2 text-4xl font-bold">Esta sala no existe.</h1><Link href="/" data-testid="link-not-found-home" className="mt-5 inline-flex rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-white">Volver al dashboard</Link></div></div>;
}

export default App;