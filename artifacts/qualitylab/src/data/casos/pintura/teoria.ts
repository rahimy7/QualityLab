/**
 * Contenido teórico para el caso Pinturas del Sur. La estructura es idéntica a
 * la del caso Andina; los ejemplos y cifras vienen de este proceso.
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
    idea: 'Un dato que no cambia una decisión es un costo, no información.',
    definicion:
      'Medir es asignar un valor a una característica del proceso con una regla estable, de modo que dos personas distintas obtengan el mismo resultado.',
    cuando: 'Antes de proponer cualquier mejora: sin línea base no hay forma de demostrar después que algo cambió.',
    pasos: [
      'Define el fenómeno en términos observables (qué cuenta como "lote no conforme").',
      'Fija la unidad de análisis: lote, batch, tanque o pedido.',
      'Establece la fuente del dato y quién lo captura.',
      'Registra la línea base con al menos 12 semanas antes de intervenir.',
      'Acuerda la frecuencia de revisión y el umbral que dispara acción.',
    ],
    errores: [
      'Cambiar la definición del indicador a mitad del periodo.',
      'Medir lo que es fácil de obtener en lugar de lo que explica el problema.',
      'Presentar un promedio sin decir cuántos lotes lo sostienen.',
    ],
    ejemplo:
      'En Pinturas del Sur, "lote conforme a la primera" es todo batch que aprueba color, viscosidad y finura sin ajuste ni reproceso. La fuente es el LIMS y se corta el domingo a medianoche.',
    minutos: 20,
  },
  {
    id: 'kpi',
    labId: 'kpi',
    sesion: 1,
    titulo: 'Anatomía de un KPI',
    idea: 'Un KPI sin meta informa; un KPI con meta permite gestionar.',
    definicion:
      'Un indicador clave de desempeño es una expresión cuantitativa vinculada a un objetivo, con fórmula fija, meta, frecuencia, fuente y responsable.',
    cuando: 'Cuando el equipo necesita saber, sin discutir, si el proceso va bien o mal y quién debe reaccionar.',
    formula: {
      expresion: '% conformidad a la primera = (lotes aprobados sin reproceso ÷ lotes producidos) × 100',
      explicacion:
        'El denominador debe cubrir el mismo periodo y alcance que el numerador. Si cuentas lotes, no mezcles con litros.',
    },
    pasos: [
      'Objetivo: qué comportamiento quieres cambiar.',
      'Indicador: el nombre exacto de lo que se mide.',
      'Fórmula: numerador, denominador y periodo.',
      'Línea base: valor actual con su n.',
      'Meta: valor y fecha.',
      'Frecuencia: cada cuánto se lee y se discute.',
      'Fuente: sistema o registro que entrega el dato.',
      'Responsable: quién actúa cuando el semáforo cambia.',
    ],
    errores: [
      'Indicadores que nadie puede mover con su trabajo diario.',
      'Meta sin fecha: "mejorar la conformidad" no es una meta.',
      'Fuente informal (un Excel personal) que desaparece cuando la persona rota.',
      'Demasiados indicadores: si todo es clave, nada lo es.',
    ],
    ejemplo:
      'Objetivo: recuperar la conformidad de lote. Indicador: % conformidad a la primera. Línea base 74 % (n = 384 lotes, 12 semanas). Meta ≥ 92 % al cierre del semestre. Frecuencia semanal. Fuente LIMS. Responsable jefatura de Calidad.',
    minutos: 35,
  },
  {
    id: 'pareto',
    labId: 'pareto',
    sesion: 2,
    titulo: 'Principio de Pareto',
    idea: 'Pocas causas explican la mayoría del problema; el resto compite por los mismos recursos.',
    definicion:
      'El análisis de Pareto ordena las categorías de mayor a menor frecuencia (o costo) y acumula el porcentaje, para separar los "pocos vitales" de los "muchos triviales".',
    cuando: 'Cuando hay más causas que capacidad de atacarlas y hay que decidir dónde poner el primer equipo.',
    formula: {
      expresion: '% acumulado(i) = Σ frecuencia(1..i) ÷ frecuencia total × 100',
      explicacion:
        'El corte del 80 % es una convención práctica. Lo que importa es identificar el punto donde la curva se aplana.',
    },
    pasos: [
      'Define la unidad de conteo (lotes, horas perdidas, dinero).',
      'Clasifica cada registro en una sola categoría, mutuamente excluyente.',
      'Ordena de mayor a menor y calcula el porcentaje acumulado.',
      'Marca el bloque que alcanza aproximadamente el 80 %.',
      'Repite con otra unidad (costo en vez de frecuencia) y compara.',
    ],
    errores: [
      'Una categoría "Otros" tan grande que esconde el primer lugar.',
      'Priorizar por frecuencia cuando el costo por evento es muy distinto entre categorías.',
      'Olvidar que el Pareto describe el pasado.',
    ],
    ejemplo:
      'De 146 lotes con desviación, dispersión insuficiente (38.4 %) y viscosidad fuera de rango (27.4 %) suman el 65.8 %. Pero al ordenar por costo, contaminación de línea pasa al primer lugar: menos eventos, mucho más caros. Al recalcular con solo los lotes posteriores a la semana 13, materia prima sube al segundo lugar: el patrón cambió.',
    minutos: 35,
  },
  {
    id: 'ishikawa',
    labId: 'ishikawa',
    sesion: 2,
    titulo: 'Diagrama de Ishikawa (6M)',
    idea: 'Ordenar las causas evita que el equipo discuta seis problemas a la vez.',
    definicion:
      'El diagrama causa-efecto agrupa causas posibles de un efecto en Método, Mano de obra, Máquina, Material, Medición y Medio ambiente, para hacer visible dónde se concentra la hipótesis.',
    cuando: 'Después del Pareto, para abrir la categoría prioritaria; antes de los 5 porqués, para no bajar por la rama equivocada.',
    pasos: [
      'Escribe el efecto en términos medibles, no como opinión.',
      'Recorre las 6M con una pregunta guía por rama.',
      'Anota causas, no soluciones ("falta un molino nuevo" es solución).',
      'Marca cuáles tienen evidencia y cuáles son hipótesis.',
      'Selecciona dos o tres para profundizar con 5 porqués.',
    ],
    errores: [
      'Llenar todas las ramas por simetría.',
      'Confundir el diagrama con una votación.',
      'Terminar sin decidir qué causa se va a verificar.',
    ],
    ejemplo:
      'Para "lote no conforme por viscosidad alta", la rama Máquina recoge molino con perlas gastadas; Mano de obra, error en la dosificación de resina; Medición, balanza sin verificación reciente.',
    minutos: 25,
  },
  {
    id: 'porques',
    labId: 'porques',
    sesion: 2,
    titulo: 'Los 5 Porqués y la evidencia',
    idea: 'Hipótesis no es causa comprobada. La pregunta final siempre es: ¿qué evidencia tienes?',
    definicion:
      'Técnica de interrogación sucesiva del síntoma hacia la condición del sistema que lo permite, deteniéndose cuando la respuesta apunta a algo que la organización puede cambiar.',
    cuando: 'Cuando ya sabes qué categoría de causa priorizar y necesitas llegar a una acción con dueño.',
    pasos: [
      'Empieza con un hecho verificable, no con una interpretación.',
      'Cada respuesta debe poder rastrearse a una observación, un registro o una entrevista.',
      'Detente cuando el siguiente porqué salga del alcance del equipo.',
      'Formula la causa raíz como una condición ausente o un mecanismo faltante.',
      'Verifica: si eliminas esa condición, ¿el efecto desaparece?',
    ],
    errores: [
      'Cadenas que terminan en "falta de atención" o "error humano".',
      'Saltar niveles para llegar antes a la conclusión que el equipo ya traía.',
      'No registrar la evidencia de cada paso.',
    ],
    ejemplo:
      'Lote rechazado → viscosidad alta → resina cargada 2 % en exceso → balanza descalibrada desde hace dos semanas → no hay plan de verificación semanal de balanzas. Causa raíz: falta un mecanismo de verificación de balanzas de dosificación con dueño y frecuencia.',
    minutos: 25,
  },
  {
    id: 'hoshin',
    labId: 'hoshin',
    sesion: 3,
    titulo: 'Hoshin Kanri',
    idea: 'Una mejora operativa sobrevive cuando está enganchada a un objetivo que a la dirección le importa.',
    definicion:
      'Método de despliegue estratégico que encadena objetivo de largo plazo → meta anual → indicadores → iniciativas → responsables, y hace visible la relación entre ellos.',
    cuando: 'Al pasar del hallazgo técnico a la asignación de recursos.',
    pasos: [
      'Enuncia el objetivo estratégico en lenguaje de negocio.',
      'Tradúcelo a una meta anual con número y fecha.',
      'Elige los KPI que demuestran avance hacia esa meta.',
      'Define las iniciativas que mueven esos KPI.',
      'Asigna responsable y cadencia de revisión.',
      'Revisa la matriz: toda iniciativa debe conectar con al menos un KPI.',
    ],
    errores: [
      'Iniciativas huérfanas: proyectos activos que no mueven ningún indicador declarado.',
      'KPI sin iniciativa: se mide algo que nadie está trabajando.',
      'Cascada por copia: cada área repite la meta corporativa sin traducirla.',
    ],
    ejemplo:
      'Recuperar la reputación con clientes industriales (devoluciones 6.4 % → 2 %) se despliega en conformidad a la primera ≥ 92 %, Cp de viscosidad ≥ 1.33 y reprocesos ≤ 8 %, sostenidos por tres iniciativas con dueño en Producción, Calidad y Compras.',
    minutos: 30,
  },
  {
    id: 'variabilidad',
    labId: 'estadistica',
    sesion: 3,
    titulo: 'Variabilidad, tendencia y capacidad',
    idea: 'El promedio dice dónde está el proceso; la variabilidad dice si puedes confiar en él.',
    definicion:
      'La variación de causas comunes es la que el proceso produce por su propio diseño; la de causas especiales proviene de algo puntual. La carta de control separa una de otra; Cp y Cpk comparan la voz del proceso con la del cliente.',
    cuando: 'Siempre que se compare un periodo con otro, y antes de reaccionar a un dato aislado.',
    formula: {
      expresion: 'Cp = (USL − LSL) ÷ 6σ  ·  LSC/LIC = X̄ ± 3σ,  con σ = MR̄ ÷ 1.128',
      explicacion:
        'σ se estima con el rango móvil promedio y no con la desviación de toda la serie: así los límites reflejan variación de corto plazo.',
    },
    pasos: [
      'Grafica los datos en orden temporal antes de calcular nada.',
      'Calcula la línea central y los límites de control.',
      'Aplica reglas: punto fuera de límites, nueve del mismo lado, seis en tendencia.',
      'Investiga solo las señales; reaccionar al ruido empeora el proceso.',
      'Compara la voz del proceso con la voz del cliente (Cp, Cpk).',
    ],
    errores: [
      'Usar los límites de especificación como si fueran de control.',
      'Ajustar el proceso ante cada variación (trampa del embudo de Deming).',
      'Calcular límites con una serie que ya incluye la mejora.',
    ],
    ejemplo:
      'Con las 12 semanas base, el tiempo de dispersión promedia 191 min y su LSC es 220 min. La semana 8 marca 234.6 min: causa especial. Ese periodo el molino principal estuvo fuera de servicio y se usó el auxiliar más lento.',
    minutos: 40,
  },
  {
    id: 'mejora',
    labId: 'mejora',
    sesion: 4,
    titulo: '¿La mejora es real?',
    idea: 'Antes vs. después no basta: hay que descartar que la diferencia sea variación normal.',
    definicion:
      'Demostrar una mejora es mostrar que el cambio en el nivel del indicador es mayor que la variación que el proceso producía por sí solo, y que se sostiene en el tiempo.',
    cuando: 'Al cerrar un proyecto, antes de declarar el ahorro y replicar la solución.',
    formula: {
      expresion: '% de reducción = (después − antes) ÷ antes × 100',
      explicacion:
        'Un descenso de 22 % a 7 % es una reducción del 68 %, no de 15 %. Puntos porcentuales y porcentaje de variación no son lo mismo.',
    },
    pasos: [
      'Compara bloques de igual longitud y estacionalidad.',
      'Excluye o marca el periodo de transición.',
      'Reporta media, desviación y n de cada bloque.',
      'Contrasta con una prueba (t de Welch) y su valor p.',
      'Verifica en la carta de control que el nuevo nivel se sostenga.',
    ],
    errores: [
      'Elegir el "antes" en el peor mes del año.',
      'Declarar éxito con tres semanas de datos.',
      'Reportar el % de reducción sin decir sobre qué base se calculó.',
    ],
    ejemplo:
      'Los reprocesos bajan de 21.8 % (12 semanas) a 6.7 % (12 semanas): 69 % de reducción, con diferencia estadísticamente significativa y nuevo nivel estable en la carta de control.',
    minutos: 35,
  },
  {
    id: 'auditoria',
    labId: 'auditoria',
    sesion: 4,
    titulo: 'Auditoría de la mejora',
    idea: 'Auditar no es buscar culpables: es comprobar si el estándar vive cuando nadie mira.',
    definicion:
      'Proceso sistemático de obtener evidencia objetiva y evaluarla contra un criterio, clasificando el resultado como conformidad, observación o no conformidad.',
    cuando: 'Semanas después del cierre del proyecto, cuando el entusiasmo bajó y solo queda el sistema.',
    pasos: [
      'Define el criterio (procedimiento, norma, acuerdo).',
      'Recoge evidencia: documento, registro, observación directa, entrevista.',
      'Clasifica: conformidad, observación o no conformidad.',
      'Redacta el hallazgo con criterio, evidencia y desviación.',
      'Sigue el ciclo hallazgo → causa → acción → seguimiento → eficacia.',
    ],
    errores: [
      'Levantar una no conformidad sin citar el criterio incumplido.',
      'Confundir opinión del auditor con evidencia objetiva.',
      'Cerrar la acción correctiva sin verificar eficacia semanas después.',
    ],
    ejemplo:
      'El procedimiento de dispersión existe y está vigente (conformidad), pero el registro de tiempo de dispersión falta en 8 de 30 órdenes: no conformidad contra el punto 6.4 del propio procedimiento.',
    minutos: 30,
  },
  {
    id: 'impacto',
    labId: 'simulador',
    sesion: 4,
    titulo: 'Traducir la mejora a dinero',
    idea: 'La dirección aprueba proyectos en la moneda que entiende.',
    definicion:
      'El impacto económico convierte la variación del indicador en costo evitado, ingreso protegido o capacidad liberada, y lo compara con la inversión del proyecto.',
    cuando: 'Al presentar el cierre del proyecto y al pedir recursos para replicarlo.',
    formula: {
      expresion: 'ROI = (beneficio anual − inversión) ÷ inversión × 100',
      explicacion:
        'El beneficio debe ser incremental y atribuible: solo cuenta lo que no habría ocurrido sin el proyecto.',
    },
    pasos: [
      'Cuantifica el volumen anual afectado (lotes).',
      'Estima el costo unitario de la falla con datos de la empresa.',
      'Multiplica por la reducción lograda, no por la meta.',
      'Resta la inversión y los costos recurrentes.',
      'Declara los supuestos.',
    ],
    errores: [
      'Contar el mismo ahorro dos veces en dos proyectos.',
      'Usar la meta en lugar del resultado real.',
      'Ignorar el costo de sostener la mejora.',
    ],
    ejemplo:
      'Reducir reprocesos de 21.8 % a 6.7 % sobre 1 150 lotes anuales evita ≈ 174 reprocesos × 640 USD ≈ 111 000 USD al año, contra una inversión de 62 000 USD.',
    minutos: 25,
  },
];

export function teoriaDe(labId: string): BloqueTeoria | undefined {
  return teoria.find((t) => t.labId === labId);
}

export const sesiones = [
  { numero: 1 as const, titulo: 'Sesión 1 · Medir con sentido', horas: 2.5, foco: 'Del síntoma al indicador: definir, medir y establecer línea base.' },
  { numero: 2 as const, titulo: 'Sesión 2 · Analizar la causa', horas: 2.5, foco: 'Pareto, Ishikawa y 5 porqués sobre datos reales del caso.' },
  { numero: 3 as const, titulo: 'Sesión 3 · Alinear y controlar', horas: 2.5, foco: 'Hoshin Kanri y control estadístico del proceso.' },
  { numero: 4 as const, titulo: 'Sesión 4 · Demostrar y sostener', horas: 2.5, foco: 'Antes/después con evidencia, auditoría e impacto económico.' },
];
