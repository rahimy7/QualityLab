/**
 * Teoría del caso Trionda. Mismos 10 bloques, ejemplos del proceso del balón.
 */

export interface BloqueTeoria {
  id: string;
  labId: string;
  sesion: 1 | 2 | 3 | 4;
  titulo: string;
  idea: string;
  definicion: string;
  cuando: string;
  formula?: { expresion: string; explicacion: string };
  pasos: string[];
  errores: string[];
  ejemplo: string;
  minutos: number;
}

export const teoria: BloqueTeoria[] = [
  {
    id: 'medicion',
    labId: 'diagnostico',
    sesion: 1,
    titulo: 'Medir para decidir',
    idea: 'Un dato que no cambia una decisión es costo, no información.',
    definicion: 'Asignar un valor a una característica del proceso con una regla estable.',
    cuando: 'Antes de proponer cualquier mejora: sin línea base no hay forma de demostrar cambio.',
    pasos: [
      'Define el fenómeno en términos observables (qué cuenta como "balón no homologable").',
      'Fija la unidad: balón, panel o lote.',
      'Establece fuente y quién captura.',
      'Registra línea base con al menos 12 semanas.',
      'Acuerda frecuencia y umbral de reacción.',
    ],
    errores: [
      'Cambiar la definición a mitad del periodo.',
      'Medir lo que es fácil en vez de lo que explica.',
      'Presentar un promedio sin decir cuántos balones lo sostienen.',
    ],
    ejemplo: 'En Trionda, "balón homologable" es el que supera peso, circunferencia, absorción, rebote y chip. Fuente: sistema de control de calidad, corte semanal.',
    minutos: 20,
  },
  {
    id: 'kpi',
    labId: 'kpi',
    sesion: 1,
    titulo: 'Anatomía de un KPI',
    idea: 'Un KPI sin meta informa; con meta permite gestionar.',
    definicion: 'Expresión cuantitativa con objetivo, fórmula, meta, frecuencia, fuente y responsable.',
    cuando: 'Cuando el equipo necesita saber, sin discutir, si el proceso va bien.',
    formula: {
      expresion: '% homologación = (balones aprobados sin reproceso ÷ balones producidos) × 100',
      explicacion: 'El denominador cubre el mismo periodo que el numerador. No mezcles balones con lotes.',
    },
    pasos: [
      'Objetivo, indicador, fórmula, línea base, meta, frecuencia, fuente, responsable.',
    ],
    errores: [
      'Meta sin fecha.',
      'Fuente informal (Excel personal).',
      'Demasiados indicadores.',
    ],
    ejemplo: 'Objetivo: recuperar homologación a la primera. Indicador: % de balones homologables. Línea base 82 % (n = 3 720 balones, 12 semanas). Meta ≥ 96 %. Frecuencia semanal. Fuente: sistema de QC.',
    minutos: 30,
  },
  {
    id: 'pareto',
    labId: 'pareto',
    sesion: 2,
    titulo: 'Principio de Pareto',
    idea: 'Pocas causas explican la mayoría del problema.',
    definicion: 'Ordena categorías de mayor a menor frecuencia (o costo) y acumula porcentaje.',
    cuando: 'Cuando hay más causas que capacidad y hay que decidir dónde poner al primer equipo.',
    formula: {
      expresion: '% acumulado(i) = Σ frecuencia(1..i) ÷ frecuencia total × 100',
      explicacion: 'El 80 % es convención práctica, no ley.',
    },
    pasos: [
      'Define unidad de conteo (balones, minutos perdidos, USD).',
      'Clasifica en categoría única.',
      'Ordena y calcula acumulado.',
      'Marca el bloque que llega al 80 %.',
      'Repite con otra unidad (costo).',
    ],
    errores: [
      '"Otros" muy grande esconde el primer lugar.',
      'Priorizar por frecuencia cuando el costo por evento difiere mucho.',
    ],
    ejemplo: 'De 144 balones no conformes, termosellado (34.7 %) y peso (25 %) suman 59.7 %. Por costo el chip sube al segundo lugar: menos eventos, mucho más caros.',
    minutos: 30,
  },
  {
    id: 'ishikawa',
    labId: 'ishikawa',
    sesion: 2,
    titulo: 'Ishikawa (6M)',
    idea: 'Ordenar las causas evita discutir seis problemas a la vez.',
    definicion: 'Agrupa causas en Método, Mano de obra, Máquina, Material, Medición, Medio.',
    cuando: 'Después del Pareto; antes de los 5 porqués.',
    pasos: [
      'Efecto medible.',
      'Recorre las 6M con pregunta guía.',
      'Causas, no soluciones ("falta prensa nueva" es solución).',
      'Marca hipótesis vs evidencia.',
      'Selecciona 2-3 para profundizar.',
    ],
    errores: [
      'Llenar todas las ramas por simetría.',
      'Confundir con votación.',
    ],
    ejemplo: 'Para "burbujas en termosellado": Máquina → sensor térmico descalibrado; Método → ciclo estándar único para todos los pigmentos; Medición → termómetro no verificado semanalmente.',
    minutos: 25,
  },
  {
    id: 'porques',
    labId: 'porques',
    sesion: 2,
    titulo: 'Los 5 Porqués',
    idea: 'Hipótesis no es causa comprobada.',
    definicion: 'Interrogación sucesiva del síntoma a la condición del sistema.',
    cuando: 'Cuando sabes qué categoría priorizar y necesitas una acción con dueño.',
    pasos: [
      'Empieza con hecho verificable.',
      'Cada respuesta rastreable a observación/registro/entrevista.',
      'Detente cuando salga del alcance.',
      'Formula como condición ausente.',
      'Verifica: si eliminas la condición, ¿desaparece el efecto?',
    ],
    errores: [
      'Terminar en "error humano".',
      'Saltar niveles para llegar a la conclusión que ya traías.',
    ],
    ejemplo: 'Balón rechazado → burbujas → temperatura irregular → sensor descalibrado → no hay plan de verificación semanal. Causa raíz: falta mecanismo de verificación del sensor con dueño y frecuencia.',
    minutos: 25,
  },
  {
    id: 'hoshin',
    labId: 'hoshin',
    sesion: 3,
    titulo: 'Hoshin Kanri',
    idea: 'Una mejora operativa sobrevive cuando engancha con un objetivo estratégico.',
    definicion: 'Encadena objetivo → meta anual → KPI → iniciativa → responsable.',
    cuando: 'Al pasar del hallazgo técnico a la asignación de recursos.',
    pasos: [
      'Objetivo estratégico en lenguaje de negocio.',
      'Meta anual con número y fecha.',
      'KPI que demuestran avance.',
      'Iniciativas que mueven los KPI.',
      'Responsable + cadencia.',
      'Revisar matriz: iniciativas huérfanas, KPI sin iniciativa.',
    ],
    errores: [
      'Iniciativas huérfanas.',
      'KPI sin iniciativa.',
      'Cascada por copia.',
    ],
    ejemplo: 'Cumplir con FIFA (homologación 82 % → 96 %) se despliega en defectos termosellado ≤ 2 %, Cp circunferencia ≥ 1.33 y fallos chip ≤ 0.5 %, sostenidos por tres iniciativas con dueño en Producción, Calidad y Electrónica.',
    minutos: 30,
  },
  {
    id: 'variabilidad',
    labId: 'estadistica',
    sesion: 3,
    titulo: 'Variabilidad, tendencia y capacidad',
    idea: 'El promedio dice dónde está; la variabilidad, si puedes confiar.',
    definicion: 'Causas comunes (proceso) vs causas especiales (evento). Carta de control separa; Cp/Cpk comparan con la especificación.',
    cuando: 'Al comparar periodos y antes de reaccionar a un dato aislado.',
    formula: {
      expresion: 'Cp = (USL − LSL) ÷ 6σ  ·  LSC/LIC = X̄ ± 3σ',
      explicacion: 'σ estimado con rango móvil (MR̄/1.128) refleja variación de corto plazo.',
    },
    pasos: [
      'Grafica en orden temporal antes de calcular nada.',
      'Línea central y límites con rango móvil.',
      'Aplica reglas de Nelson.',
      'Investiga solo señales.',
      'Compara voz del proceso vs voz del cliente (FIFA).',
    ],
    errores: [
      'Usar límites de especificación como si fueran de control.',
      'Ajustar el proceso ante cada variación.',
    ],
    ejemplo: 'Con 12 semanas base, el ciclo de termosellado promedia 167 s con LSC 192 s. La semana 8 marca 189.6 s: causa especial. Esa semana el sensor térmico falló y se termosellaba con ciclo manual.',
    minutos: 40,
  },
  {
    id: 'mejora',
    labId: 'mejora',
    sesion: 4,
    titulo: '¿La mejora es real?',
    idea: 'Antes vs. después no basta: hay que descartar variación normal.',
    definicion: 'Mostrar que el cambio de nivel es mayor que la variación previa y se sostiene.',
    cuando: 'Al cerrar un proyecto, antes de declarar ahorro y replicar.',
    formula: {
      expresion: '% reducción = (después − antes) ÷ antes × 100',
      explicacion: '9.4 % a 2.1 % es 78 % de reducción, no 7.3.',
    },
    pasos: [
      'Bloques comparables.',
      'Excluye periodo de transición.',
      'Media, σ, n de cada bloque.',
      'Prueba t de Welch + valor p.',
      'Verifica sostenibilidad en carta de control.',
    ],
    errores: [
      '"Antes" en el peor mes del año.',
      'Éxito con 3 semanas.',
      '% reducción sin base declarada.',
    ],
    ejemplo: 'Defectos de termosellado bajan de 9.4 % (12 semanas) a 2.1 % (12 semanas): 78 % de reducción, diferencia estadísticamente significativa y nuevo nivel estable.',
    minutos: 35,
  },
  {
    id: 'auditoria',
    labId: 'auditoria',
    sesion: 4,
    titulo: 'Auditoría de la mejora',
    idea: 'Auditar no es buscar culpables: es comprobar que el estándar vive cuando nadie mira.',
    definicion: 'Proceso sistemático de evidencia objetiva contra criterio, clasificado como conformidad, observación o no conformidad.',
    cuando: 'Semanas después del cierre, cuando el entusiasmo bajó.',
    pasos: [
      'Define criterio.',
      'Recoge evidencia: documento, registro, observación, entrevista.',
      'Clasifica.',
      'Redacta hallazgo con criterio + evidencia + desviación.',
      'Sigue ciclo hallazgo → causa → acción → seguimiento → eficacia.',
    ],
    errores: [
      'No conformidad sin citar criterio.',
      'Opinión como evidencia.',
      'Cerrar acción sin verificar eficacia.',
    ],
    ejemplo: 'PR-TS-04 vigente (conformidad), pero registro de verificación del sensor falta en 8 de 30 turnos: no conformidad contra el punto 6.4.',
    minutos: 30,
  },
  {
    id: 'impacto',
    labId: 'simulador',
    sesion: 4,
    titulo: 'Traducir la mejora a dinero',
    idea: 'La dirección aprueba proyectos en la moneda que entiende.',
    definicion: 'Convertir la variación del KPI en costo evitado, ingreso protegido o capacidad liberada.',
    cuando: 'Al presentar cierre y al pedir recursos para replicar.',
    formula: {
      expresion: 'ROI = (beneficio anual − inversión) ÷ inversión × 100',
      explicacion: 'Solo cuenta el beneficio incremental y atribuible.',
    },
    pasos: [
      'Volumen anual afectado (balones).',
      'Costo unitario de la falla.',
      'Multiplica por la reducción real (no la meta).',
      'Resta inversión y costos recurrentes.',
      'Declara supuestos.',
    ],
    errores: [
      'Contar el mismo ahorro en dos proyectos.',
      'Usar la meta en vez del resultado.',
      'Ignorar el costo de sostener.',
    ],
    ejemplo: 'Reducir defectos termosellado de 9.4 % a 2.1 % sobre 260 000 balones/año evita ≈ 19 000 rechazos × 74 USD ≈ 1.4 M USD/año, contra una inversión de 84 000 USD.',
    minutos: 25,
  },
];

export function teoriaDe(labId: string): BloqueTeoria | undefined {
  return teoria.find((t) => t.labId === labId);
}
