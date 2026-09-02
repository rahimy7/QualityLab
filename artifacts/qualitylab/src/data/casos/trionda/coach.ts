/**
 * Coach del caso Trionda.
 */

export interface EntradaConocimiento {
  id: string;
  claves: string[];
  titulo: string;
  respuesta: string;
  repregunta: string;
}

export const baseConocimiento: EntradaConocimiento[] = [
  {
    id: 'grafico',
    claves: ['que grafico', 'qué gráfico', 'tipo de grafico', 'visualizacion', 'visualización'],
    titulo: 'Elegir el gráfico correcto',
    respuesta:
      'La pregunta define el gráfico:\n\n• Tendencia → cómo evoluciona homologación semana a semana.\n• Pareto → dónde priorizar entre tipos de defecto.\n• Histograma → cómo se distribuye la circunferencia o el peso.\n• Dispersión → si horas de capacitación explican los errores.\n• Carta de control → si el ciclo térmico es estable o hay causa especial.\n\nSi no sabes qué preguntar, el gráfico no te salva.',
    repregunta: '¿Qué decisión vas a tomar con ese gráfico?',
  },
  {
    id: 'kpi-interpretar',
    claves: ['interpretar kpi', 'mi indicador', 'brecha', 'puntos porcentuales'],
    titulo: 'Interpretar un indicador',
    respuesta:
      'Léelo en cuatro capas: nivel (brecha vs meta), variación (vs periodo anterior), tendencia (6-12 lecturas) y estabilidad (dentro de límites de control).',
    repregunta: '¿Tu lectura cambia si miras las últimas 12 semanas en vez de la última?',
  },
  {
    id: 'pareto',
    claves: ['pareto', '80/20', 'priorizar', 'prioridad'],
    titulo: 'Usar Pareto para priorizar',
    respuesta:
      'Ordena categorías por frecuencia (o costo) y acumula porcentaje. En Trionda, el chip aparece bajo en frecuencia pero alto en costo. Haz siempre los dos Paretos.',
    repregunta: '¿Qué pasa con tu prioridad si ordenas por costo en vez de por número?',
  },
  {
    id: 'causa-raiz',
    claves: ['causa raiz', 'causa raíz', '5 porque', 'ishikawa'],
    titulo: 'Llegar a una causa raíz defendible',
    respuesta:
      'Debe ser: condición del sistema, dentro del alcance del equipo, y eliminarla debe eliminar el efecto. Si tu cadena termina en "el operario no puso atención", falta un porqué.',
    repregunta: '¿Qué evidencia tienes? ¿Registro, observación o solo opinión?',
  },
  {
    id: 'mejora',
    claves: ['mejoramos', 'antes y despues', 'demostrar mejora', 'significativa', 'valor p'],
    titulo: 'Demostrar que la mejora es real',
    respuesta:
      'Bloques comparables + media/σ/n + prueba estadística + carta de control que muestre el nuevo nivel sostenido. Dos semanas buenas no bastan.',
    repregunta: '¿Tu "antes" incluye la peor semana? Puede ser regresión a la media.',
  },
  {
    id: 'control',
    claves: ['control', 'limites', 'lsc', 'lic', 'causa especial', 'cp', 'cpk', 'capacidad'],
    titulo: 'Leer carta de control y capacidad',
    respuesta:
      'Los límites (X̄ ± 3σ) describen lo que hace el proceso; Cp compara la voz del proceso contra la del cliente (FIFA). Cp ≥ 1.33 es meta industrial. Cp = 0.86 significa que casi 4 % sale fuera de spec aunque esté centrado.',
    repregunta: '¿Estás mirando límites de control o de especificación FIFA?',
  },
  {
    id: 'hoshin',
    claves: ['hoshin', 'estrategia', 'x-matrix', 'despliegue'],
    titulo: 'Conectar la mejora con la estrategia',
    respuesta:
      'Objetivo estratégico → meta anual → KPI → iniciativa → responsable. Buscar iniciativas huérfanas (sin KPI) y KPI sin iniciativa.',
    repregunta: '¿Tu iniciativa mueve algún KPI que la gerencia ya mira?',
  },
  {
    id: 'auditoria',
    claves: ['auditoria', 'auditoría', 'hallazgo', 'no conformidad', 'evidencia objetiva'],
    titulo: 'Redactar un hallazgo',
    respuesta:
      'Tres partes: criterio incumplido + evidencia objetiva + desviación. "El operario debería registrar mejor" no es un hallazgo. "8 de 30 turnos sin registro de verificación del sensor térmico, contraviniendo el punto 6.4 del PR-QC-08" sí.',
    repregunta: '¿Tu hallazgo cita el punto exacto del procedimiento?',
  },
];

export function buscarRespuesta(consulta: string): EntradaConocimiento | null {
  const texto = consulta.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let mejor: { entrada: EntradaConocimiento; puntaje: number } | null = null;
  for (const entrada of baseConocimiento) {
    let puntaje = 0;
    for (const clave of entrada.claves) {
      const k = clave.normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (texto.includes(k)) puntaje += k.length;
    }
    if (puntaje > 0 && (!mejor || puntaje > mejor.puntaje)) mejor = { entrada, puntaje };
  }
  return mejor ? mejor.entrada : null;
}

export const preguntasSugeridas = [
  '¿Qué gráfico uso para ver si el ciclo de termosellado es estable?',
  '¿Cómo interpreto una brecha de 4 puntos porcentuales en homologación?',
  '¿Cuándo tiene sentido usar Cp vs Cpk para circunferencia?',
  '¿Cómo redacto un hallazgo de auditoría contra un procedimiento?',
];

export const frasesQ: Record<string, string[]> = {
  diagnostico: [
    'Antes de elegir, pregúntate cuál indicador puede mover tu equipo con su trabajo de mañana.',
    'La brecha más grande no siempre es la primera prioridad. Impacto y control también cuentan.',
  ],
  kpi: [
    'Un KPI sin meta solamente informa; con meta permite gestionar.',
    'Si nadie puede reproducir tu número en seis meses, no era un indicador: era una diapositiva.',
  ],
  pareto: [
    '¿Estás seguro de atacar las seis causas a la vez?',
    'Si "Otros" es tu tercera categoría, ábrela antes de concluir.',
  ],
  ishikawa: [
    'Anota causas, no soluciones. "Falta una prensa nueva" ya es solución elegida.',
    'No llenes las seis ramas por simetría: una rama vacía también informa.',
  ],
  porques: [
    '¿Tienes evidencia o solo opinión?',
    'Si termina en "error humano", te falta un porqué.',
  ],
  hoshin: [
    'Una iniciativa que no cruza ningún KPI es huérfana.',
    'Cascada no es copiar la meta: es traducirla a tu proceso.',
  ],
  estadistica: [
    'Una reducción no significa que el proceso esté bajo control.',
    'Cp mide qué tan bien cabe tu proceso en la especificación FIFA. Cpk además penaliza descentrado.',
  ],
  mejora: [
    '¿Tenemos una mejora o tuvimos dos semanas buenas?',
    'Reportar 7 puntos cuando fue 78 % de reducción subestima tu propio trabajo.',
  ],
  auditoria: [
    'Auditar no es buscar culpables: es comprobar si el estándar vive cuando nadie mira.',
    'Un hallazgo sin criterio citado es una opinión.',
  ],
  simulador: [
    'Mover tres palancas a la vez hace imposible saber cuál funcionó.',
    'Ahorro que no puedes rastrear a línea de costo se declara como beneficio cualitativo.',
  ],
};
