/**
 * Catálogo de laboratorios (pantallas) del módulo. Es la misma lista para todo
 * caso: cambia el contenido pero no la ruta ni la topología del curso.
 */
import {
  Activity,
  BarChart3,
  Bot,
  ClipboardCheck,
  Compass,
  FileCheck2,
  FlaskConical,
  Gauge,
  GitBranch,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  Sliders,
  Target,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface Lab {
  id: string;
  ruta: string;
  titulo: string;
  corto: string;
  descripcion: string;
  icono: LucideIcon;
  grupo: 'Ruta' | 'Laboratorios' | 'Resultados' | 'Facilitación';
  minutos: number;
}

export const labs: Lab[] = [
  { id: 'inicio', ruta: '/', titulo: 'Inicio', corto: 'Inicio', descripcion: 'El encargo, el estado de la empresa y tu progreso en el módulo.', icono: Compass, grupo: 'Ruta', minutos: 5 },
  { id: 'curso', ruta: '/curso', titulo: 'Mi curso', corto: 'Mi curso', descripcion: 'Contenido teórico del módulo, ordenado por sesión y con ejemplos del caso.', icono: GraduationCap, grupo: 'Ruta', minutos: 25 },
  { id: 'misiones', ruta: '/misiones', titulo: 'Misiones', corto: 'Misiones', descripcion: 'Las siete misiones del caso integrador, con puntos y estado.', icono: ListChecks, grupo: 'Ruta', minutos: 5 },
  { id: 'diagnostico', ruta: '/diagnostico', titulo: 'Diagnóstico inicial', corto: 'Diagnóstico', descripcion: 'Vota qué indicador atacar primero y compáralo con la sala.', icono: Target, grupo: 'Laboratorios', minutos: 15 },
  { id: 'kpi', ruta: '/kpi-lab', titulo: 'KPI Lab', corto: 'KPI Lab', descripcion: 'Construye la ficha del indicador y recibe un Quality Score con brechas.', icono: Gauge, grupo: 'Laboratorios', minutos: 40 },
  { id: 'pareto', ruta: '/pareto-lab', titulo: 'Pareto Lab', corto: 'Pareto Lab', descripcion: '148 incidencias reales: prioriza con el 80/20 y descubre el cambio de patrón.', icono: BarChart3, grupo: 'Laboratorios', minutos: 40 },
  { id: 'ishikawa', ruta: '/ishikawa', titulo: 'Ishikawa 6M', corto: 'Ishikawa', descripcion: 'Organiza causas por Método, Mano de obra, Máquina, Material, Medición y Medio ambiente.', icono: GitBranch, grupo: 'Laboratorios', minutos: 30 },
  { id: 'porques', ruta: '/cinco-porques', titulo: '5 Porqués', corto: '5 Porqués', descripcion: 'Baja de síntoma a causa raíz y valida cada paso con evidencia.', icono: HelpCircle, grupo: 'Laboratorios', minutos: 30 },
  { id: 'hoshin', ruta: '/hoshin', titulo: 'Hoshin Kanri', corto: 'Hoshin Kanri', descripcion: 'Conecta estrategia → meta → KPI → iniciativa → responsable y revisa la X-Matrix.', icono: Compass, grupo: 'Laboratorios', minutos: 35 },
  { id: 'estadistica', ruta: '/estadistica', titulo: 'Statistics Lab', corto: 'Estadística', descripcion: 'Tendencia, histograma, dispersión, capacidad y carta de control sobre datos del caso.', icono: Activity, grupo: 'Laboratorios', minutos: 45 },
  { id: 'mejora', ruta: '/mejora', titulo: 'Improvement Lab', corto: 'Antes / Después', descripcion: '¿Realmente mejoramos? Compara periodos, mide la señal y responde con evidencia.', icono: TrendingUp, grupo: 'Laboratorios', minutos: 40 },
  { id: 'auditoria', ruta: '/auditoria', titulo: 'Audit Lab', corto: 'Auditoría', descripcion: 'Clasifica evidencias como conformidad, observación o no conformidad.', icono: ClipboardCheck, grupo: 'Laboratorios', minutos: 35 },
  { id: 'simulador', ruta: '/simulador', titulo: 'Simulador Kaizen', corto: 'Simulador', descripcion: 'Mueve las palancas del proceso y observa el impacto en tiempo, calidad y dinero.', icono: Sliders, grupo: 'Laboratorios', minutos: 25 },
  { id: 'dashboard', ruta: '/dashboard', titulo: 'Dashboard ejecutivo', corto: 'Dashboard', descripcion: 'Sala de control con semáforo, tendencias y cumplimiento de metas.', icono: LayoutDashboard, grupo: 'Resultados', minutos: 15 },
  { id: 'coach', ruta: '/coach', titulo: 'Quality Coach', corto: 'Coach', descripcion: 'Consulta a Q: interpreta tu KPI, elige el gráfico correcto, revisa tu análisis.', icono: Bot, grupo: 'Resultados', minutos: 10 },
  { id: 'proyecto', ruta: '/proyecto', titulo: 'Proyecto final', corto: 'Proyecto', descripcion: 'El informe A3 del equipo, armado con todo lo que trabajaste en la plataforma.', icono: FileCheck2, grupo: 'Resultados', minutos: 40 },
  { id: 'ranking', ruta: '/ranking', titulo: 'Ranking', corto: 'Ranking', descripcion: 'Quality Points por equipo y logros desbloqueados.', icono: Trophy, grupo: 'Resultados', minutos: 5 },
  { id: 'profesor', ruta: '/profesor', titulo: 'Panel del facilitador', corto: 'Facilitador', descripcion: 'Guion de las 10 horas, banco de desafíos en vivo y soluciones del caso.', icono: Users, grupo: 'Facilitación', minutos: 0 },
  { id: 'datos', ruta: '/datos', titulo: 'Datos del caso', corto: 'Datos', descripcion: 'Series semanales e incidencias del caso, filtrables y descargables en CSV.', icono: FlaskConical, grupo: 'Facilitación', minutos: 0 },
];

export function lab(id: string): Lab {
  return labs.find((l) => l.id === id) ?? labs[0];
}

export interface Logro {
  id: string;
  label: string;
  descripcion: string;
  puntos: number;
}

/** Logros: mismos para todos los casos (premian razonamiento, no contenido). */
export const logros: Logro[] = [
  { id: 'kpi-perfecto', label: 'Ficha impecable', descripcion: 'Quality Score de 100 en el KPI Lab.', puntos: 50 },
  { id: 'pareto-corte', label: 'Corte exacto', descripcion: 'Identificaste el bloque vital sin sobrepasarte.', puntos: 40 },
  { id: 'pareto-periodo', label: 'Ojo de detective', descripcion: 'Detectaste que el patrón cambia entre periodos.', puntos: 40 },
  { id: 'ishikawa-completo', label: 'Espina completa', descripcion: 'Al menos una causa en cada una de las 6M.', puntos: 40 },
  { id: 'causa-evidencia', label: 'Con evidencia', descripcion: 'Cada porqué de tu cadena tiene una fuente verificable.', puntos: 50 },
  { id: 'control-especial', label: 'Cazador de señales', descripcion: 'Encontraste la causa especial en la carta de control.', puntos: 50 },
  { id: 'mejora-significativa', label: 'Prueba superada', descripcion: 'Sustentaste la mejora con la prueba estadística.', puntos: 60 },
  { id: 'roi-calculado', label: 'Lenguaje de gerencia', descripcion: 'Tradujiste la mejora a dinero y ROI.', puntos: 40 },
  { id: 'auditoria-limpia', label: 'Auditor confiable', descripcion: 'Clasificaste correctamente los hallazgos de la auditoría.', puntos: 50 },
  { id: 'proyecto-cerrado', label: 'A3 entregado', descripcion: 'Completaste el informe del proyecto final.', puntos: 80 },
  { id: 'entrevista-detective', label: 'Detective de datos', descripcion: 'Detectaste una contradicción entre lo que dice un empleado y los datos.', puntos: 50 },
];

export const puntosLogros = logros.reduce((acc, l) => acc + l.puntos, 0);
