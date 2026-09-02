/**
 * Quality Coach para el caso Pinturas del Sur.
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
    claves: ['que grafico', 'qué gráfico', 'cual grafico', 'cuál gráfico', 'tipo de grafico', 'visualizacion', 'visualización', 'que tipo de grafico'],
    titulo: 'Elegir el gráfico correcto',
    respuesta:
      'La pregunta define el gráfico:\n\n• Tendencia (línea) → cómo evoluciona el indicador en el tiempo.\n• Pareto (barras + acumulado) → dónde priorizar entre causas.\n• Histograma → cómo se distribuye la viscosidad o el tiempo de dispersión.\n• Dispersión → si dos variables se mueven juntas (horas de capacitación vs errores).\n• Carta de control → si el proceso es estable o hay causa especial.\n• Barras comparadas → antes vs. después de la intervención.\n\nSi no sabes qué preguntar, el gráfico no te va a salvar.',
    repregunta: '¿Qué decisión vas a tomar con ese gráfico? Esa respuesta suele elegirlo sola.',
  },
  {
    id: 'kpi-interpretar',
    claves: ['interpretar kpi', 'interpreto', 'mi indicador', 'mi kpi', 'brecha', 'punto porcentual', 'puntos porcentuales'],
    titulo: 'Interpretar un indicador',
    respuesta:
      'Léelo en cuatro capas:\n\n1. Nivel — dónde está hoy respecto a la meta (la brecha, en puntos porcentuales).\n2. Variación — cuánto cambió respecto al periodo anterior.\n3. Tendencia — hacia dónde va en las últimas 6 a 12 lecturas.\n4. Estabilidad — si la variación cabe dentro de los límites de control.\n\nUn indicador que mejora pero cuya variabilidad crece no está mejorando: se está volviendo impredecible.',
    repregunta: '¿Tu lectura cambia si miras las últimas 12 semanas en vez de la última?',
  },
  {
    id: 'pareto',
    claves: ['pareto', '80/20', '80 20', 'priorizar', 'prioridad', 'pocos vitales'],
    titulo: 'Usar Pareto para priorizar',
    respuesta:
      'El Pareto ordena categorías por frecuencia (o costo) y acumula el porcentaje. El bloque que llega a ~80 % son los pocos vitales.\n\nTres advertencias:\n• Una categoría "Otros" grande esconde el primer lugar. Ábrela.\n• Haz el Pareto por frecuencia y por costo. Si difieren, aprendiste algo (contaminación de línea es el ejemplo clásico: pocos eventos, muy caros).\n• El Pareto describe el pasado. Si el proceso cambió, recalcúlalo por periodo.',
    repregunta: '¿Qué pasa con tu prioridad si ordenas por costo en vez de por número de lotes?',
  },
  {
    id: 'causa-raiz',
    claves: ['causa raiz', 'causa raíz', '5 porque', '5 porqué', 'cinco porque', 'porques', 'ishikawa', 'espina'],
    titulo: 'Llegar a una causa raíz defendible',
    respuesta:
      'Una causa raíz útil cumple tres condiciones:\n\n• Es una condición del sistema, no una falla de una persona.\n• Está dentro del alcance de acción del equipo.\n• Si la eliminas, el efecto desaparece.\n\nSi tu cadena termina en "el operario no puso atención", falta un porqué: ¿qué hace que ese error sea posible o probable? Balanza descalibrada, procedimiento ambiguo, presión de tiempo.',
    repregunta: '¿Qué evidencia tienes de esa causa? ¿Un registro del LIMS, una observación en piso o una opinión?',
  },
  {
    id: 'mejora',
    claves: ['mejoramos', 'realmente mejoro', 'antes y despues', 'antes vs', 'demostrar mejora', 'significativa', 'valor p', 'p value'],
    titulo: 'Demostrar que la mejora es real',
    respuesta:
      'Antes vs. después no basta. Necesitas:\n\n1. Bloques comparables — misma longitud, sin mezclar el periodo de transición.\n2. Media y desviación de cada bloque, con su n.\n3. Una prueba estadística (t de Welch) y su valor p.\n4. La carta de control mostrando que el nuevo nivel se sostiene.\n\nSi solo tienes dos semanas buenas, tienes dos semanas buenas.',
    repregunta: '¿Tu "antes" incluye el peor mes del año? Si es así, parte de la mejora es regresión a la media.',
  },
  {
    id: 'control',
    claves: ['control', 'limites', 'límites', 'lsc', 'lic', 'causa especial', 'causa comun', 'causa común', 'spc', 'estable', 'cp', 'cpk', 'capacidad'],
    titulo: 'Leer una carta de control y la capacidad',
    respuesta:
      'Los límites (X̄ ± 3σ, con σ = MR̄/1.128) describen lo que el proceso hace por sí solo. La capacidad (Cp) compara la voz del proceso contra la voz del cliente.\n\n• Punto fuera de límites → causa especial: investiga ese lote.\n• Nueve puntos del mismo lado → el proceso se desplazó.\n• Cp < 1 → el proceso no cabe dentro de la especificación aunque esté centrado.\n\nCp ≥ 1.33 es la meta industrial habitual. Un Cp de 0.72 significa que casi 5 % de los lotes salen fuera de spec incluso con el proceso centrado.',
    repregunta: '¿Estás mirando límites de control o límites de especificación? No son lo mismo.',
  },
  {
    id: 'hoshin',
    claves: ['hoshin', 'estrategia', 'x-matrix', 'x matrix', 'despliegue', 'alinear'],
    titulo: 'Conectar la mejora con la estrategia',
    respuesta:
      'Hoshin Kanri encadena: objetivo estratégico → meta anual → KPI → iniciativa → responsable.\n\nRevisa la matriz buscando huecos:\n• Iniciativa sin KPI → consume recursos sin mover nada declarado.\n• KPI sin iniciativa → se mide algo que nadie está trabajando.\n• Meta sin responsable → nadie va a responder en la revisión.',
    repregunta: '¿Tu iniciativa mueve algún KPI que la dirección ya esté mirando?',
  },
  {
    id: 'auditoria',
    claves: ['auditoria', 'auditoría', 'hallazgo', 'no conformidad', 'conformidad', 'observacion', 'evidencia objetiva'],
    titulo: 'Redactar un hallazgo',
    respuesta:
      'Un hallazgo se redacta con tres partes:\n\n1. Criterio incumplido (procedimiento, norma o acuerdo).\n2. Evidencia objetiva (registro, muestra, ensayo, foto).\n3. Desviación observada.\n\n"El operario debería registrar mejor" no es un hallazgo: es una opinión. "8 de 30 órdenes carecen del tiempo de dispersión registrado, contraviniendo el punto 6.4 del PR-PRO-02" sí lo es.',
    repregunta: '¿Tu hallazgo cita el punto exacto del procedimiento incumplido?',
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
  '¿Qué gráfico uso para ver si la viscosidad es estable?',
  '¿Cómo interpreto una brecha de 10 puntos porcentuales?',
  '¿Cuándo tiene sentido usar Cp en vez de Cpk?',
  '¿Cómo redacto un hallazgo de auditoría?',
];

/** Intervenciones de Q dentro de cada laboratorio. */
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
    'Anota causas, no soluciones. "Falta un molino nuevo" ya es una solución elegida.',
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
    'Cp mide qué tan bien cabe tu proceso en la especificación. Cpk además penaliza descentrado.',
  ],
  mejora: [
    '¿Tenemos una mejora o simplemente tuvimos dos semanas buenas?',
    'Reportar 15 % cuando la reducción fue 68 % subestima tu propio trabajo por casi un factor de cinco.',
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
