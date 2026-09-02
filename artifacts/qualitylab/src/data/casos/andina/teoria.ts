/**
 * Contenido teórico del módulo "Métodos de Análisis y Medición de la Mejora
 * Continua". Cada bloque se muestra dentro del laboratorio correspondiente y,
 * agrupado por sesión, en la pantalla "Mi curso".
 */

export interface BloqueTeoria {
  id: string;
  labId: string;
  sesion: 1 | 2 | 3 | 4;
  titulo: string;
  idea: string;
  /** Definición operativa: qué es, en una frase que se pueda usar en el aula. */
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
    cuando:
      'Antes de proponer cualquier mejora: sin línea base no hay forma de demostrar después que algo cambió.',
    pasos: [
      'Define el fenómeno en términos observables (qué cuenta como "entrega tardía").',
      'Fija la unidad de análisis: pedido, línea, cliente, orden de compra.',
      'Establece la fuente del dato y quién lo captura.',
      'Registra la línea base con al menos 12 periodos antes de intervenir.',
      'Acuerda la frecuencia de revisión y el umbral que dispara una acción.',
    ],
    errores: [
      'Cambiar la definición del indicador a mitad del periodo: la serie deja de ser comparable.',
      'Medir lo que es fácil de obtener en lugar de lo que explica el problema.',
      'Presentar un promedio sin decir cuántos datos lo sostienen.',
    ],
    ejemplo:
      'En Distribuidora Andina, "entrega tardía" es todo pedido cuya recepción firmada ocurre después de la fecha comprometida en la nota de venta. La fuente es el ERP y se corta cada domingo a medianoche.',
    minutos: 20,
  },
  {
    id: 'kpi',
    labId: 'kpi',
    sesion: 1,
    titulo: 'Anatomía de un KPI',
    idea: 'Un KPI sin meta informa; un KPI con meta permite gestionar.',
    definicion:
      'Un indicador clave de desempeño es una expresión cuantitativa vinculada a un objetivo, con una fórmula fija, una meta, una frecuencia, una fuente y un responsable.',
    cuando:
      'Cuando el equipo necesita saber, sin discutir, si el proceso va bien o mal y quién debe reaccionar.',
    formula: {
      expresion: '% entregas tardías = (entregas tardías ÷ total de entregas) × 100',
      explicacion:
        'El denominador debe cubrir el mismo periodo y el mismo alcance que el numerador. Si el numerador cuenta pedidos, el denominador cuenta pedidos, nunca líneas.',
    },
    pasos: [
      'Objetivo: qué comportamiento quieres cambiar.',
      'Indicador: el nombre exacto de lo que se mide.',
      'Fórmula: numerador, denominador y periodo.',
      'Línea base: el valor actual, con su n.',
      'Meta: valor y fecha, no una aspiración vaga.',
      'Frecuencia: cada cuánto se lee y se discute.',
      'Fuente: el sistema o registro que entrega el dato.',
      'Responsable: quién actúa cuando el semáforo cambia.',
    ],
    errores: [
      'Indicadores que nadie puede mover con su trabajo diario.',
      'Meta sin fecha: "mejorar la satisfacción" no es una meta.',
      'Fuente informal (un Excel personal) que desaparece cuando la persona cambia de puesto.',
      'Demasiados indicadores: si todo es clave, nada lo es.',
    ],
    ejemplo:
      'Objetivo: recuperar la confiabilidad de entrega. Indicador: % de entregas tardías. Línea base 19 % (n = 780 pedidos, 12 semanas). Meta ≤ 8 % al cierre del semestre. Frecuencia semanal. Fuente ERP. Responsable: jefatura de Logística.',
    minutos: 35,
  },
  {
    id: 'pareto',
    labId: 'pareto',
    sesion: 2,
    titulo: 'Principio de Pareto',
    idea: 'Pocas causas explican la mayoría del problema; el resto compite por los mismos recursos.',
    definicion:
      'El análisis de Pareto ordena las categorías de un problema de mayor a menor frecuencia (o costo) y acumula su porcentaje, para separar los "pocos vitales" de los "muchos triviales".',
    cuando:
      'Cuando hay más causas que capacidad de atacarlas y hay que decidir dónde poner el primer equipo.',
    formula: {
      expresion: '% acumulado(i) = Σ frecuencia(1..i) ÷ frecuencia total × 100',
      explicacion:
        'El corte del 80 % es una convención práctica, no una ley. Lo que importa es identificar el punto donde la curva se aplana.',
    },
    pasos: [
      'Define la unidad de conteo (incidencias, horas perdidas, dinero).',
      'Clasifica cada registro en una sola categoría, mutuamente excluyente.',
      'Ordena de mayor a menor y calcula el porcentaje acumulado.',
      'Marca el bloque que alcanza aproximadamente el 80 %.',
      'Repite el Pareto con otra unidad (costo en vez de frecuencia) y compara.',
    ],
    errores: [
      'Una categoría "Otros" tan grande que esconde el verdadero primer lugar.',
      'Priorizar por frecuencia cuando el costo por evento es muy distinto entre categorías.',
      'Olvidar que el Pareto describe el pasado: si el proceso cambió, hay que recalcularlo.',
    ],
    ejemplo:
      'De 148 incidencias, retraso de proveedor (37.8 %) y error de picking (25.7 %) suman el 63.5 %. Pero al ordenar por costo de no calidad el picking pasa al primer lugar: menos casos, mucho más caros cada uno. Y al recalcular solo con las 36 incidencias posteriores a la intervención, transporte sube al segundo lugar: el patrón cambió y la prioridad también.',
    minutos: 35,
  },
  {
    id: 'ishikawa',
    labId: 'ishikawa',
    sesion: 2,
    titulo: 'Diagrama de Ishikawa (6M)',
    idea: 'Ordenar las causas evita que el equipo discuta seis problemas a la vez.',
    definicion:
      'El diagrama causa-efecto agrupa las causas posibles de un efecto en categorías —Método, Mano de obra, Máquina, Material, Medición y Medio ambiente— para hacer visible dónde se concentra la hipótesis del equipo.',
    cuando:
      'Después del Pareto, para abrir la categoría prioritaria; antes de los 5 porqués, para no bajar por la rama equivocada.',
    pasos: [
      'Escribe el efecto en términos medibles, no como opinión.',
      'Recorre las 6M con una pregunta guía por rama.',
      'Anota causas, no soluciones disfrazadas ("falta capacitación" es solución; "el operario desconoce la ubicación nueva" es causa).',
      'Marca cuáles tienen evidencia y cuáles son solo hipótesis.',
      'Selecciona dos o tres para profundizar con 5 porqués.',
    ],
    errores: [
      'Llenar todas las ramas por simetría, aunque no haya nada real que poner.',
      'Confundir el diagrama con una votación: la cantidad de notas en una rama no prueba nada.',
      'Terminar el ejercicio sin decidir qué causa se va a verificar.',
    ],
    ejemplo:
      'Para "pedido entregado tarde", la rama Material recoge el retraso de proveedor; Mano de obra, el error de picking; Medición, la ausencia de un campo obligatorio de causa en el ERP.',
    minutos: 25,
  },
  {
    id: 'porques',
    labId: 'porques',
    sesion: 2,
    titulo: 'Los 5 Porqués y la evidencia',
    idea: 'Hipótesis no es causa comprobada. La pregunta final siempre es: ¿qué evidencia tienes?',
    definicion:
      'Técnica de interrogación sucesiva que va del síntoma observable hacia la condición del sistema que lo permite, deteniéndose cuando la respuesta apunta a algo que la organización puede cambiar.',
    cuando:
      'Cuando ya sabes qué categoría de causa priorizar y necesitas llegar a una acción con dueño.',
    pasos: [
      'Empieza con un hecho verificable, no con una interpretación.',
      'Cada respuesta debe poder rastrearse a una observación, un registro o una entrevista.',
      'Detente cuando el siguiente porqué salga del alcance del equipo.',
      'Formula la causa raíz como una condición ausente o un mecanismo faltante.',
      'Verifica: si eliminas esa condición, ¿el efecto desaparece?',
    ],
    errores: [
      'Cadenas que terminan en "falta de compromiso" o "error humano": eso cierra la conversación en lugar de abrirla.',
      'Saltar niveles para llegar antes a la conclusión que el equipo ya traía.',
      'No registrar la evidencia de cada paso: al mes nadie recuerda de dónde salió.',
    ],
    ejemplo:
      'Pedido tarde → salió tarde del CD → el picking terminó después de la hora → el operario buscó producto fuera de su ubicación → el maestro de ubicaciones no se actualizó tras el relayout → no existe un responsable de actualizarlo. Causa raíz: falta un mecanismo de actualización del maestro de ubicaciones con dueño asignado.',
    minutos: 25,
  },
  {
    id: 'hoshin',
    labId: 'hoshin',
    sesion: 3,
    titulo: 'Hoshin Kanri',
    idea: 'Una mejora operativa sobrevive cuando está enganchada a un objetivo que a la dirección le importa.',
    definicion:
      'Método de despliegue estratégico que encadena objetivo de largo plazo → meta anual → indicadores → iniciativas → responsables, y hace visible la relación entre ellos en una X-Matrix.',
    cuando:
      'Al pasar del hallazgo técnico a la asignación de recursos: es el puente entre el piso y la gerencia.',
    pasos: [
      'Enuncia el objetivo estratégico en lenguaje de negocio.',
      'Tradúcelo a una meta anual con número y fecha.',
      'Elige los KPI que demuestran avance hacia esa meta.',
      'Define las iniciativas que mueven esos KPI.',
      'Asigna un responsable por iniciativa y una cadencia de revisión.',
      'Revisa la matriz: toda iniciativa debe conectar con al menos un KPI y toda meta con al menos una iniciativa.',
    ],
    errores: [
      'Iniciativas huérfanas: proyectos activos que no mueven ningún indicador declarado.',
      'KPI sin iniciativa: se mide algo que nadie está trabajando.',
      'Cascada por copia: cada área repite la meta corporativa sin traducirla a su proceso.',
    ],
    ejemplo:
      'Incrementar la satisfacción del cliente (72 % → 90 %) se despliega en OTIF ≥ 92 %, reclamos ≤ 3 % y tiempo de respuesta ≤ 4 h, sostenidos por tres iniciativas con dueño en Logística, Almacén y Comercial.',
    minutos: 30,
  },
  {
    id: 'variabilidad',
    labId: 'estadistica',
    sesion: 3,
    titulo: 'Variabilidad, tendencia y control',
    idea: 'El promedio dice dónde está el proceso; la variabilidad dice si puedes confiar en él.',
    definicion:
      'La variación de causas comunes es la que el proceso produce por su propio diseño; la de causas especiales proviene de algo ajeno y puntual. La carta de control separa una de otra.',
    cuando:
      'Siempre que se compare un periodo con otro, y antes de reaccionar a un dato aislado.',
    formula: {
      expresion: 'LSC / LIC = X̄ ± 3σ,  con σ = MR̄ ÷ 1.128',
      explicacion:
        'σ se estima con el rango móvil promedio y no con la desviación de toda la serie: así los límites reflejan la variación de corto plazo y no quedan inflados por la tendencia que se quiere detectar.',
    },
    pasos: [
      'Grafica los datos en orden temporal antes de calcular nada.',
      'Calcula la línea central y los límites de control con el rango móvil.',
      'Aplica las reglas: punto fuera de límites, nueve del mismo lado, seis en tendencia, dos de tres más allá de 2σ.',
      'Investiga solo las señales: reaccionar al ruido empeora el proceso.',
      'Compara la voz del proceso (límites) con la voz del cliente (especificación).',
    ],
    errores: [
      'Usar los límites de especificación como si fueran límites de control.',
      'Ajustar el proceso ante cada variación: es la trampa del experimento del embudo de Deming.',
      'Calcular límites con una serie que ya incluye la mejora: mezcla dos procesos distintos.',
    ],
    ejemplo:
      'Con las 12 semanas del periodo base, el tiempo de preparación promedia 47.6 min y su LSC es 59.3 min. La semana 8 marca 61.3 min: causa especial, no mala suerte. Ese periodo el WMS estuvo caído dos días y el picking se hizo con listas impresas.',
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
    cuando:
      'Al cerrar un proyecto, antes de declarar el ahorro y de replicar la solución en otras áreas.',
    formula: {
      expresion: '% de reducción = (después − antes) ÷ antes × 100',
      explicacion:
        'Un descenso de 19 % a 7.6 % es una reducción del 60 %, no de 11.4 %. Puntos porcentuales y porcentaje de variación no son lo mismo, y confundirlos infla o desinfla el resultado.',
    },
    pasos: [
      'Compara bloques de igual longitud y estacionalidad.',
      'Excluye o marca el periodo de transición.',
      'Reporta media, desviación y n de cada bloque.',
      'Contrasta con una prueba (t de Welch) y reporta el valor p.',
      'Verifica en la carta de control que el nuevo nivel se sostenga.',
    ],
    errores: [
      'Elegir el "antes" en el peor mes del año: eso no es mejora, es regresión a la media.',
      'Declarar éxito con tres semanas de datos.',
      'Reportar el % de reducción sin decir sobre qué base se calculó.',
    ],
    ejemplo:
      'Las entregas tardías bajan de 18.6 % (12 semanas) a 7.2 % (12 semanas): 61.3 % de reducción, con una diferencia estadísticamente significativa y un nuevo nivel estable en la carta de control.',
    minutos: 35,
  },
  {
    id: 'auditoria',
    labId: 'auditoria',
    sesion: 4,
    titulo: 'Auditoría de la mejora',
    idea: 'Auditar no es buscar culpables: es comprobar si el nuevo estándar vive cuando nadie mira.',
    definicion:
      'Proceso sistemático de obtener evidencia objetiva y evaluarla contra un criterio, clasificando el resultado como conformidad, observación o no conformidad.',
    cuando:
      'Semanas después del cierre del proyecto, cuando el entusiasmo bajó y solo queda el sistema.',
    pasos: [
      'Define el criterio (procedimiento, norma, acuerdo de servicio).',
      'Recoge evidencia: documento, registro, observación directa, entrevista.',
      'Clasifica: conformidad si cumple; observación si cumple con debilidad; no conformidad si incumple el criterio.',
      'Redacta el hallazgo con criterio, evidencia y desviación.',
      'Sigue el ciclo hallazgo → causa → acción → seguimiento → verificación de eficacia.',
    ],
    errores: [
      'Levantar una no conformidad sin citar el criterio incumplido.',
      'Confundir opinión del auditor con evidencia objetiva.',
      'Cerrar la acción correctiva sin verificar eficacia semanas después.',
    ],
    ejemplo:
      'El procedimiento de despacho existe y está vigente (conformidad), pero el registro de causa de retraso está vacío en 6 de 20 órdenes: no conformidad contra el punto 7.2 del propio procedimiento.',
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
        'El beneficio debe ser incremental y atribuible: solo cuenta lo que no habría ocurrido sin el proyecto. Si no puedes rastrear el ahorro a una línea de costo, decláralo como beneficio cualitativo.',
    },
    pasos: [
      'Cuantifica el volumen anual afectado.',
      'Estima el costo unitario de la falla con datos de la empresa.',
      'Multiplica por la reducción lograda, no por la meta.',
      'Resta la inversión y los costos recurrentes.',
      'Declara los supuestos: sin supuestos visibles, el número no es auditable.',
    ],
    errores: [
      'Contar el mismo ahorro dos veces en dos proyectos distintos.',
      'Usar la meta en lugar del resultado real.',
      'Ignorar el costo de sostener la mejora (capacitación, mantenimiento del sistema).',
    ],
    ejemplo:
      'Reducir entregas tardías de 18.6 % (media de las 12 semanas base) a 7.2 % sobre 24 800 pedidos anuales evita ≈ 2 827 entregas tardías × 42 USD ≈ 118 700 USD al año, contra una inversión de 46 500 USD.',
    minutos: 25,
  },
];

export function teoriaDe(labId: string): BloqueTeoria | undefined {
  return teoria.find((t) => t.labId === labId);
}

export const sesiones = [
  {
    numero: 1 as const,
    titulo: 'Sesión 1 · Medir con sentido',
    horas: 2.5,
    foco: 'Del síntoma al indicador: definir, medir y establecer línea base.',
  },
  {
    numero: 2 as const,
    titulo: 'Sesión 2 · Analizar la causa',
    horas: 2.5,
    foco: 'Pareto, Ishikawa y 5 porqués sobre datos reales del caso.',
  },
  {
    numero: 3 as const,
    titulo: 'Sesión 3 · Alinear y controlar',
    horas: 2.5,
    foco: 'Hoshin Kanri y control estadístico del proceso.',
  },
  {
    numero: 4 as const,
    titulo: 'Sesión 4 · Demostrar y sostener',
    horas: 2.5,
    foco: 'Antes/después con evidencia, auditoría, impacto económico y cierre.',
  },
];
