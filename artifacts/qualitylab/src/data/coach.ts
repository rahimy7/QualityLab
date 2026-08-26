/**
 * Quality Coach "Q": copiloto de mejora continua.
 *
 * Funciona sin conexión ni clave de API. En lugar de generar texto libre,
 * reconoce la intención por palabras clave y responde con el criterio del
 * módulo, siempre citando la regla que aplica. Cuando la pregunta se refiere a
 * los datos del caso, la respuesta se calcula con los datos reales.
 */

export interface EntradaConocimiento {
  id: string;
  claves: string[];
  titulo: string;
  respuesta: string;
  /** Preguntas de seguimiento que empujan al participante un paso más. */
  repregunta: string;
}

export const baseConocimiento: EntradaConocimiento[] = [
  {
    id: 'grafico',
    claves: ['que grafico', 'qué gráfico', 'cual grafico', 'cuál gráfico', 'tipo de grafico', 'visualizacion', 'visualización', 'grafico uso', 'que tipo de grafico'],
    titulo: 'Elegir el gráfico correcto',
    respuesta:
      'La pregunta define el gráfico:\n\n• Tendencia (línea) → cómo evoluciona el indicador en el tiempo.\n• Pareto (barras + acumulado) → dónde priorizar entre categorías.\n• Histograma → cómo se distribuye una variable y si tiene cola.\n• Dispersión → si dos variables se mueven juntas.\n• Carta de control → si el proceso es estable o hay causa especial.\n• Barras comparadas → antes vs. después de un mismo indicador.\n\nSi no sabes qué preguntar, el gráfico no te va a salvar.',
    repregunta: '¿Qué decisión vas a tomar con ese gráfico? Esa respuesta suele elegirlo sola.',
  },
  {
    id: 'kpi-interpretar',
    claves: ['interpretar kpi', 'interpreto', 'mi indicador', 'mi kpi', 'brecha', 'punto porcentual', 'puntos porcentuales'],
    titulo: 'Interpretar un indicador',
    respuesta:
      'Léelo en cuatro capas:\n\n1. Nivel — dónde está hoy respecto a la meta (la brecha, en puntos porcentuales).\n2. Variación — cuánto cambió respecto al periodo anterior, y si es relativa o en puntos.\n3. Tendencia — hacia dónde va en las últimas 6 a 12 lecturas.\n4. Estabilidad — si la variación cabe dentro de los límites de control.\n\nUn indicador que mejora pero cuya variabilidad crece no está mejorando: se está volviendo impredecible.',
    repregunta: '¿Tu lectura cambia si miras las últimas 12 semanas en vez de la última?',
  },
  {
    id: 'pareto',
    claves: ['pareto', '80/20', '80 20', 'priorizar', 'prioridad', 'pocos vitales'],
    titulo: 'Usar Pareto para priorizar',
    respuesta:
      'El Pareto ordena categorías por frecuencia (o costo) y acumula el porcentaje. El bloque que llega a ~80 % son los pocos vitales.\n\nTres advertencias que casi siempre hacen falta:\n• Una categoría "Otros" grande esconde el verdadero primer lugar. Ábrela.\n• Haz el Pareto por frecuencia y por costo. Si difieren, aprendiste algo.\n• El Pareto describe el pasado. Si el proceso cambió, recalcúlalo por periodo.',
    repregunta: '¿Qué pasa con tu prioridad si ordenas por costo en vez de por número de casos?',
  },
  {
    id: 'causa-raiz',
    claves: ['causa raiz', 'causa raíz', '5 porque', '5 porqué', 'cinco porque', 'porques', 'ishikawa', 'espina'],
    titulo: 'Llegar a una causa raíz defendible',
    respuesta:
      'Una causa raíz útil cumple tres condiciones:\n\n• Es una condición del sistema, no una falla de una persona.\n• Está dentro del alcance de acción del equipo.\n• Si la eliminas, el efecto desaparece.\n\nSi tu cadena termina en "falta de compromiso" o "error humano", falta al menos un porqué: ¿qué hace que ese error sea posible o probable?',
    repregunta: '¿Qué evidencia tienes de esa causa? ¿Un registro, una observación o una opinión?',
  },
  {
    id: 'mejora',
    claves: ['mejoramos', 'realmente mejoro', 'antes y despues', 'antes vs', 'demostrar mejora', 'significativa', 'valor p', 'p value'],
    titulo: 'Demostrar que la mejora es real',
    respuesta:
      'Antes vs. después no basta. Necesitas cuatro cosas:\n\n1. Bloques comparables — misma longitud, sin mezclar el periodo de transición.\n2. Media y desviación de cada bloque, con su n.\n3. Una prueba estadística (t de Welch) y su valor p.\n4. La carta de control mostrando que el nuevo nivel se sostiene.\n\nSi solo tienes dos semanas buenas, tienes dos semanas buenas.',
    repregunta: '¿Tu "antes" incluye el peor mes del año? Si es así, parte de la mejora es regresión a la media.',
  },
  {
    id: 'control',
    claves: ['control', 'limites', 'límites', 'lsc', 'lic', 'causa especial', 'causa comun', 'causa común', 'spc', 'estable'],
    titulo: 'Leer una carta de control',
    respuesta:
      'Los límites (X̄ ± 3σ, con σ = MR̄/1.128) describen lo que el proceso hace por sí solo.\n\n• Punto fuera de límites → causa especial: investiga ese evento concreto.\n• Nueve puntos del mismo lado → el proceso se desplazó.\n• Seis subiendo o bajando → tendencia sostenida.\n• Dos de tres más allá de 2σ → señal temprana.\n\nDentro de los límites y sin patrón: es ruido. Reaccionar al ruido aumenta la variación.',
    repregunta: '¿Estás mirando límites de control o límites de especificación? No son lo mismo.',
  },
  {
    id: 'hoshin',
    claves: ['hoshin', 'estrategia', 'x-matrix', 'x matrix', 'despliegue', 'alinear'],
    titulo: 'Conectar la mejora con la estrategia',
    respuesta:
      'Hoshin Kanri encadena: objetivo estratégico → meta anual → KPI → iniciativa → responsable.\n\nRevisa la matriz buscando huecos:\n• Iniciativa sin KPI → consume recursos sin mover nada declarado.\n• KPI sin iniciativa → se mide algo que nadie está trabajando.\n• Meta sin responsable → nadie va a responder por ella en la revisión.',
    repregunta: '¿Tu iniciativa mueve algún KPI que la dirección ya esté mirando?',
  },
  {
    id: 'auditoria',
    claves: ['auditoria', 'auditoría', 'hallazgo', 'no conformidad', 'conformidad', 'observacion', 'evidencia objetiva'],
    titulo: 'Redactar un hallazgo',
    respuesta:
      'Un hallazgo tiene siempre tres partes:\n\n• Criterio — qué requisito, con su referencia exacta.\n• Evidencia — qué viste, cuántos casos, de qué muestra.\n• Desviación — en qué difiere lo observado del criterio.\n\nConformidad: cumple. Observación: cumple con debilidad. No conformidad: no cumple, con evidencia. Sin las tres partes es una opinión, y una opinión no se puede cerrar.',
    repregunta: '¿Podrías escribir tu hallazgo sin usar un solo adjetivo?',
  },
  {
    id: 'roi',
    claves: ['roi', 'ahorro', 'dinero', 'impacto economico', 'impacto económico', 'costo', 'beneficio'],
    titulo: 'Traducir la mejora a dinero',
    respuesta:
      'ROI = (beneficio anual − inversión) ÷ inversión × 100.\n\nPara que el número sea auditable:\n• Usa el resultado real, no la meta.\n• Multiplica por el volumen anual afectado.\n• Cuenta solo el beneficio incremental y atribuible.\n• Declara los supuestos junto al número.\n\nUn ahorro sin supuestos visibles se desarma en la primera pregunta del CFO.',
    repregunta: '¿Puedes rastrear ese ahorro hasta una línea concreta del estado de resultados?',
  },
  {
    id: 'variabilidad',
    claves: ['desviacion', 'desviación', 'variabilidad', 'promedio', 'media', 'dispersion', 'dispersión', 'sigma'],
    titulo: 'Promedio y variabilidad',
    respuesta:
      'El promedio dice dónde está el proceso. La desviación estándar dice cuánto puedes confiar en ese promedio.\n\nDos procesos con la misma media y distinta desviación son procesos distintos: el de mayor dispersión incumple la meta con más frecuencia aunque el promedio la cumpla.\n\nUsa el coeficiente de variación (σ ÷ media × 100) para comparar la dispersión de indicadores en unidades diferentes.',
    repregunta: '¿Tu promedio mejoró o simplemente se estabilizó la variación?',
  },
  {
    id: 'correlacion',
    claves: ['correlacion', 'correlación', 'causalidad', 'r cuadrado', 'r2', 'relacion entre'],
    titulo: 'Correlación no es causalidad',
    respuesta:
      'r mide fuerza y dirección de una relación lineal (−1 a 1). r² indica qué proporción de la variación explica el modelo.\n\nUna correlación fuerte es una hipótesis, no una prueba. Antes de afirmar causa, verifica: ¿hay una explicación mecánica plausible?, ¿el orden temporal es el correcto?, ¿podría haber una tercera variable moviendo a las dos?',
    repregunta: '¿Qué tercera variable podría explicar esa relación sin que una cause la otra?',
  },
];

/** Preguntas sugeridas: aparecen como botones y evitan el "no sé qué preguntar". */
export const preguntasSugeridas = [
  '¿Qué gráfico debería usar?',
  '¿Cómo interpreto mi KPI?',
  'Analiza mi Pareto',
  'Ayúdame con los 5 porqués',
  '¿Realmente mejoramos?',
  '¿Cómo leo la carta de control?',
  'Revisa mi Hoshin',
  '¿Cómo calculo el ROI?',
];

export function buscarRespuesta(consulta: string): EntradaConocimiento | null {
  const texto = consulta
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

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

/** Intervenciones de Q dentro de cada laboratorio: incomodan en el buen sentido. */
export const frasesQ: Record<string, string[]> = {
  diagnostico: [
    'Antes de elegir, pregúntate cuál de estos indicadores puede mover tu equipo con su trabajo de mañana.',
    'La brecha más grande no siempre es la primera prioridad. El impacto sobre el cliente y el control del equipo también cuentan.',
  ],
  kpi: [
    'Un KPI sin meta solamente informa. Un KPI con meta permite gestionar.',
    'Si nadie puede reproducir tu número en seis meses, no era un indicador: era una diapositiva.',
  ],
  pareto: [
    '¿Estás seguro de que deberías atacar las seis causas a la vez?',
    'Si tu categoría "Otros" es la tercera más grande, ábrela antes de concluir.',
  ],
  ishikawa: [
    'Anota causas, no soluciones. "Falta capacitación" ya es una solución elegida.',
    'No llenes las seis ramas por simetría: una rama vacía también informa.',
  ],
  porques: [
    '¿Tienes evidencia o solamente una opinión?',
    'Si tu cadena termina en "error humano", te falta un porqué.',
  ],
  hoshin: [
    'Una iniciativa que no cruza ningún KPI es una iniciativa huérfana.',
    'La cascada no es copiar la meta corporativa: es traducirla a tu proceso.',
  ],
  estadistica: [
    'Una reducción no significa necesariamente que el proceso esté bajo control.',
    'Los límites de control salen del proceso; la especificación sale del cliente. No los mezcles.',
  ],
  mejora: [
    '¿Tenemos una mejora o simplemente tuvimos dos semanas buenas?',
    'Reportar 3 % cuando la reducción fue 37.5 % subestima tu propio trabajo por un factor de doce.',
  ],
  auditoria: [
    'Auditar no es buscar culpables: es comprobar si el estándar vive cuando nadie mira.',
    'Un hallazgo sin criterio citado es una opinión con formato de auditoría.',
  ],
  simulador: [
    'Mover tres palancas a la vez hace imposible saber cuál funcionó.',
    'El ahorro que no puedes rastrear a una línea de costo se declara como beneficio cualitativo.',
  ],
};
