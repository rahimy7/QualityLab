/**
 * Banco de ejercicios de opción múltiple.
 *
 * Cada pregunta trae retroalimentación por opción: el objetivo no es calificar,
 * es que el participante entienda por qué su respuesta era o no correcta.
 */

export interface Opcion {
  id: string;
  texto: string;
  /** Por qué esta opción es correcta o dónde está el razonamiento equivocado. */
  feedback: string;
}

export interface Pregunta {
  id: string;
  labId: string;
  enunciado: string;
  contexto?: string;
  opciones: Opcion[];
  correcta: string;
  puntos: number;
  /** Cierre conceptual que se muestra siempre, se acierte o no. */
  cierre: string;
}

export const preguntas: Pregunta[] = [
  /* ---------------- Diagnóstico ---------------- */
  {
    id: 'diag-1',
    labId: 'diagnostico',
    enunciado: '¿Cuál de estos enunciados describe un problema y no una solución?',
    opciones: [
      { id: 'a', texto: 'Falta capacitar al personal de picking.', feedback: 'Es una solución ya elegida. Si empiezas aquí, cierras el análisis antes de abrirlo.' },
      { id: 'b', texto: 'El 19 % de los pedidos se entrega después de la fecha comprometida.', feedback: 'Correcto: es un hecho observable, medible y con línea base. De aquí sí se puede investigar.' },
      { id: 'c', texto: 'Necesitamos un nuevo sistema de gestión de almacén.', feedback: 'Otra solución disfrazada de problema, y además cara.' },
      { id: 'd', texto: 'El área de logística no está comprometida.', feedback: 'Es un juicio sobre personas: no es verificable y bloquea la conversación.' },
    ],
    correcta: 'b',
    puntos: 20,
    cierre:
      'Un problema bien planteado contiene el qué, el cuánto y el desde cuándo. Si el enunciado ya nombra la solución, el análisis se vuelve una justificación.',
  },
  {
    id: 'diag-2',
    labId: 'diagnostico',
    contexto:
      'Satisfacción 72 % (meta 90) · Entregas tardías 19 % (meta 8) · Reclamos 8.7 % (meta 3) · Retrabajos 12 % (meta 5) · Productividad 78 % (meta 86).',
    enunciado:
      'La gerencia pide atacar primero la satisfacción del cliente porque es la brecha más grande. ¿Cuál es la mejor objeción técnica?',
    opciones: [
      { id: 'a', texto: 'La satisfacción es un indicador de resultado; se mueve al mejorar las causas operativas.', feedback: 'Correcto. Satisfacción es un indicador de resultado (lagging). Entregas y reclamos son las palancas que el equipo puede mover directamente.' },
      { id: 'b', texto: 'La satisfacción es subjetiva y por eso no debe medirse.', feedback: 'Sí debe medirse: es la voz del cliente. El punto no es descartarla, es entender que no se ataca en forma directa.' },
      { id: 'c', texto: 'La brecha más grande siempre debe atacarse primero.', feedback: 'Ese criterio ignora el esfuerzo, el control del equipo y la relación causa-efecto entre indicadores.' },
      { id: 'd', texto: 'No hay suficientes datos de satisfacción.', feedback: 'Hay 412 respuestas: el problema no es la cantidad de datos, es la naturaleza del indicador.' },
    ],
    correcta: 'a',
    puntos: 25,
    cierre:
      'Distinguir indicadores de resultado (lagging) de indicadores de proceso (leading) es lo que evita proyectos que "miden mucho y mueven poco".',
  },

  /* ---------------- KPI ---------------- */
  {
    id: 'kpi-1',
    labId: 'kpi',
    enunciado: 'De estos cuatro componentes, ¿cuál falta con más frecuencia en las fichas reales de indicador?',
    opciones: [
      { id: 'a', texto: 'El nombre del indicador.', feedback: 'Casi nunca falta: es lo primero que se escribe.' },
      { id: 'b', texto: 'La fuente del dato y quién lo captura.', feedback: 'Correcto. Es el componente que más se omite y el que hace que el indicador muera cuando la persona que lo llevaba cambia de puesto.' },
      { id: 'c', texto: 'La meta.', feedback: 'Suele faltar la fecha de la meta, pero el valor casi siempre está.' },
      { id: 'd', texto: 'La fórmula.', feedback: 'Falta a veces, pero la fuente es el punto ciego más común.' },
    ],
    correcta: 'b',
    puntos: 20,
    cierre:
      'Un indicador sin fuente declarada no es auditable: nadie puede reproducir el número seis meses después.',
  },
  {
    id: 'kpi-2',
    labId: 'kpi',
    contexto: 'Un indicador de entregas pasó de 91 % a 94 %, con meta de 97 %.',
    enunciado: '¿Cuál es la lectura correcta?',
    opciones: [
      { id: 'a', texto: 'La meta se cumplió en un 97 %.', feedback: 'Mezcla el valor del indicador con el avance hacia la meta. Son dos cosas distintas.' },
      { id: 'b', texto: 'Mejoró 3 puntos porcentuales y aún hay una brecha de 3 puntos; falta ver la tendencia.', feedback: 'Correcto: separa la variación (3 pp), la brecha (3 pp) y advierte que un solo salto no demuestra sostenibilidad.' },
      { id: 'c', texto: 'Mejoró un 3 %.', feedback: 'La variación relativa sería 3 ÷ 91 = 3.3 %. Y en todo caso "3 puntos porcentuales" es lo correcto aquí.' },
      { id: 'd', texto: 'El proceso está bajo control.', feedback: 'Nada en el enunciado habla de límites de control ni de variabilidad.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre:
      'Punto porcentual mide la diferencia entre dos porcentajes; el porcentaje de variación mide el cambio relativo. Confundirlos es el error de interpretación más común del módulo.',
  },

  /* ---------------- Pareto ---------------- */
  {
    id: 'pareto-1',
    labId: 'pareto',
    contexto:
      'Retraso de proveedor 37.8 % · Error de picking 25.7 % · Transporte 18.2 % · Documentación 10.1 % · Cambio de prioridad 4.7 % · Falla de equipo 3.4 %.',
    enunciado: '¿Dónde invertirías primero los recursos del equipo de mejora?',
    opciones: [
      { id: 'a', texto: 'En las seis causas, con un plan para cada una.', feedback: 'Es lo que hace la mayoría y es la razón por la que los planes de acción no avanzan: seis frentes con el mismo equipo.' },
      { id: 'b', texto: 'En las dos primeras, que concentran el 63.5 % de las incidencias.', feedback: 'Correcto. Dos frentes concentrados producen más efecto que seis diluidos.' },
      { id: 'c', texto: 'En falla de equipo, porque es la más barata de resolver.', feedback: 'Optimiza el esfuerzo, no el resultado: mover el 3.4 % no cambia la percepción del cliente.' },
      { id: 'd', texto: 'En documentación, porque depende solo de nosotros.', feedback: 'Criterio de control, no de impacto. Es un buen argumento secundario, no el principal.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre:
      'El Pareto no dice qué hacer: dice dónde mirar primero. La decisión sigue siendo del equipo y debe considerar impacto, esfuerzo y control.',
  },
  {
    id: 'pareto-2',
    labId: 'pareto',
    enunciado:
      'El Pareto por frecuencia pone a "error de picking" en segundo lugar, pero el Pareto por costo lo pone primero. ¿Qué significa?',
    opciones: [
      { id: 'a', texto: 'Uno de los dos análisis está mal hecho.', feedback: 'Ambos pueden estar bien: miden cosas distintas.' },
      { id: 'b', texto: 'El costo por evento de picking es mayor que el de las demás causas.', feedback: 'Correcto: menos eventos pero más caros cada uno. Es exactamente el caso que justifica hacer los dos Paretos.' },
      { id: 'c', texto: 'Hay que usar siempre la frecuencia porque es más objetiva.', feedback: 'La frecuencia es más fácil de contar, no más objetiva. Y a la gerencia le importa el costo.' },
      { id: 'd', texto: 'Los datos están duplicados.', feedback: 'No hay nada en el enunciado que sugiera duplicación.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre:
      'Haz siempre al menos dos Paretos: frecuencia y costo (u horas perdidas). Cuando coinciden, la prioridad es indiscutible; cuando difieren, aprendiste algo.',
  },

  /* ---------------- Causa raíz ---------------- */
  {
    id: 'causa-1',
    labId: 'porques',
    enunciado: '¿Cuál de estas cadenas de porqués está mal construida?',
    opciones: [
      { id: 'a', texto: 'Salió tarde → el picking terminó tarde → el operario buscó producto fuera de ubicación.', feedback: 'Bien construida: cada paso es observable.' },
      { id: 'b', texto: 'Salió tarde → el personal no está comprometido.', feedback: 'Correcto: salta al juicio sobre las personas. No es verificable y cierra el análisis en un solo paso.' },
      { id: 'c', texto: 'El maestro de ubicaciones está desactualizado → nadie tiene asignada su actualización.', feedback: 'Bien construida: baja de un hecho a una condición del sistema.' },
      { id: 'd', texto: 'El proveedor entregó tarde → el acuerdo de servicio no define penalidad.', feedback: 'Bien construida: conecta el hecho con una regla ausente.' },
    ],
    correcta: 'b',
    puntos: 20,
    cierre:
      'Si una cadena de porqués termina en "error humano" o "falta de compromiso", casi siempre falta un porqué más: ¿qué hace que ese error sea posible o probable?',
  },
  {
    id: 'causa-2',
    labId: 'porques',
    enunciado:
      'El equipo concluye que la causa raíz es "el maestro de ubicaciones no se actualiza". ¿Qué evidencia lo demostraría mejor?',
    opciones: [
      { id: 'a', texto: 'Que tres supervisores estén de acuerdo.', feedback: 'Consenso no es evidencia. Tres personas pueden compartir el mismo supuesto equivocado.' },
      { id: 'b', texto: 'Comparar las ubicaciones del sistema contra el conteo físico en las SKU implicadas.', feedback: 'Correcto: es evidencia objetiva, reproducible y directamente ligada a la hipótesis.' },
      { id: 'c', texto: 'Que el indicador haya bajado después de capacitar al personal.', feedback: 'Confunde el efecto de una acción con la prueba de la causa: pudieron cambiar varias cosas a la vez.' },
      { id: 'd', texto: 'Que el proveedor del WMS lo confirme.', feedback: 'Opinión de un tercero interesado, sin dato del proceso.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre:
      'La prueba fuerte de una causa raíz es de dos vías: si la condición está presente aparece el efecto, y si la eliminas el efecto desaparece.',
  },

  /* ---------------- Hoshin ---------------- */
  {
    id: 'hoshin-1',
    labId: 'hoshin',
    enunciado: 'En una X-Matrix, ¿qué señal indica que el despliegue tiene un problema?',
    opciones: [
      { id: 'a', texto: 'Una iniciativa que no se cruza con ningún KPI.', feedback: 'Correcto: es una iniciativa huérfana. Consume recursos sin mover nada de lo declarado.' },
      { id: 'b', texto: 'Un KPI que se cruza con dos iniciativas.', feedback: 'Es normal y hasta deseable: varias palancas para el mismo resultado.' },
      { id: 'c', texto: 'Un objetivo con más de una meta.', feedback: 'También es habitual, siempre que las metas no se contradigan.' },
      { id: 'd', texto: 'Un responsable a cargo de dos iniciativas.', feedback: 'Puede ser un problema de carga, pero no de estructura del despliegue.' },
    ],
    correcta: 'a',
    puntos: 25,
    cierre:
      'La X-Matrix se lee buscando filas o columnas vacías: iniciativas sin KPI, KPI sin iniciativa y metas sin dueño.',
  },

  /* ---------------- Estadística ---------------- */
  {
    id: 'stat-1',
    labId: 'estadistica',
    enunciado: '¿Cuál es la diferencia entre límites de control y límites de especificación?',
    opciones: [
      { id: 'a', texto: 'Son lo mismo, con distinto nombre.', feedback: 'Es la confusión más costosa del control estadístico.' },
      { id: 'b', texto: 'Los de control salen del proceso; los de especificación salen del cliente.', feedback: 'Correcto: los de control describen lo que el proceso hace hoy; los de especificación, lo que el cliente necesita. Pueden no coincidir.' },
      { id: 'c', texto: 'Los de control siempre son más estrechos.', feedback: 'A veces sí, a veces no. Cuando los de control son más anchos, el proceso no es capaz.' },
      { id: 'd', texto: 'Los de especificación se calculan con ±3σ.', feedback: 'Los ±3σ son los de control. La especificación la fija el cliente o la norma.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre:
      'Voz del proceso (límites de control) vs. voz del cliente (especificación). La capacidad, Cp y Cpk, es justamente la comparación entre ambas.',
  },
  {
    id: 'stat-2',
    labId: 'estadistica',
    contexto: 'La semana 8 del tiempo de preparación marca 61.3 min, por encima del límite superior de control.',
    enunciado: '¿Cuál es la acción correcta?',
    opciones: [
      { id: 'a', texto: 'Ajustar el estándar de tiempo hacia arriba.', feedback: 'Reaccionar al ruido cambiando el proceso es la trampa del embudo de Deming: aumenta la variación.' },
      { id: 'b', texto: 'Investigar qué pasó específicamente esa semana.', feedback: 'Correcto: un punto fuera de límites indica causa especial. Se busca el evento concreto, no se ajusta el proceso.' },
      { id: 'c', texto: 'Eliminar el dato porque es atípico.', feedback: 'Borrar la señal destruye justamente la información más valiosa de la serie.' },
      { id: 'd', texto: 'Esperar a que se repita para decidir.', feedback: 'La regla 1 ya es señal suficiente: esperar solo hace que se pierda el rastro del evento.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre:
      'Causa común se ataca rediseñando el proceso; causa especial se ataca investigando el evento. Confundirlas lleva a intervenir donde no se debe.',
  },
  {
    id: 'stat-3',
    labId: 'estadistica',
    contexto: 'Horas de capacitación y errores de picking de 24 operarios muestran r = −0.86.',
    enunciado: '¿Qué se puede afirmar?',
    opciones: [
      { id: 'a', texto: 'La capacitación reduce los errores de picking.', feedback: 'Es la conclusión tentadora, pero la correlación no prueba dirección ni causalidad por sí sola.' },
      { id: 'b', texto: 'Existe una relación inversa fuerte que vale la pena investigar como hipótesis.', feedback: 'Correcto: la correlación identifica una relación a verificar, no una causa demostrada.' },
      { id: 'c', texto: 'El 86 % de los errores se explica por la falta de capacitación.', feedback: 'Eso sería r², que aquí es 0.74, y aun así "se explica" es lenguaje de modelo, no de causa.' },
      { id: 'd', texto: 'No hay relación porque el valor es negativo.', feedback: 'El signo indica dirección, no ausencia de relación.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre:
      'r indica fuerza y dirección; r² indica proporción de variación explicada por el modelo. Ninguno de los dos demuestra causalidad sin un diseño que la aísle.',
  },

  /* ---------------- Mejora ---------------- */
  {
    id: 'mejora-1',
    labId: 'mejora',
    contexto: 'La tasa de reclamos pasó de 8 % a 5 %.',
    enunciado: '¿En qué porcentaje se redujo?',
    opciones: [
      { id: 'a', texto: '3 %', feedback: 'Esa es la diferencia en puntos porcentuales (3 pp), no la reducción relativa.' },
      { id: 'b', texto: '37.5 %', feedback: 'Correcto: (5 − 8) ÷ 8 = −0.375, es decir 37.5 % de reducción sobre la base.' },
      { id: 'c', texto: '62.5 %', feedback: 'Ese es el valor que queda respecto de la base (5 ÷ 8), no lo que se redujo.' },
      { id: 'd', texto: '5 %', feedback: 'Es el valor final, no la variación.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre:
      'Reducción relativa = (nuevo − base) ÷ base. Reportar 3 % en lugar de 37.5 % subestima el logro por un factor de doce.',
  },
  {
    id: 'mejora-2',
    labId: 'mejora',
    enunciado:
      'Un equipo muestra dos semanas por debajo de la meta y declara el proyecto cerrado. ¿Cuál es la objeción más sólida?',
    opciones: [
      { id: 'a', texto: 'Dos puntos no permiten distinguir una mejora sostenida de la variación normal del proceso.', feedback: 'Correcto: hace falta suficiente historia para separar señal de ruido, y verificar el nuevo nivel en la carta de control.' },
      { id: 'b', texto: 'La meta estaba mal fijada.', feedback: 'Puede ser, pero no es lo que el enunciado permite objetar.' },
      { id: 'c', texto: 'Falta la firma de la gerencia.', feedback: 'Es un tema administrativo, no de evidencia.' },
      { id: 'd', texto: 'Debieron usar un gráfico de barras.', feedback: 'El tipo de gráfico no es el problema de fondo aquí.' },
    ],
    correcta: 'a',
    puntos: 25,
    cierre:
      'La pregunta que cierra un proyecto no es "¿bajó?", sino "¿bajó de forma que el proceso ya no vuelve solo al nivel anterior?".',
  },

  /* ---------------- Auditoría ---------------- */
  {
    id: 'audit-1',
    labId: 'auditoria',
    enunciado:
      'El procedimiento exige registrar la causa de cada entrega tardía. En 6 de 20 órdenes revisadas el campo está vacío. ¿Cómo se clasifica?',
    opciones: [
      { id: 'a', texto: 'Conformidad, porque el procedimiento existe.', feedback: 'La existencia del documento no es evidencia de cumplimiento.' },
      { id: 'b', texto: 'No conformidad: se incumple un requisito del propio procedimiento, con evidencia objetiva.', feedback: 'Correcto: hay criterio (el procedimiento), evidencia (6 de 20 registros vacíos) y desviación.' },
      { id: 'c', texto: 'Observación, porque la mayoría sí se registró.', feedback: 'La observación se usa cuando el requisito se cumple pero con debilidad; aquí el requisito no se cumple en el 30 % de la muestra.' },
      { id: 'd', texto: 'Oportunidad de mejora, porque el campo podría ser automático.', feedback: 'Esa es una recomendación válida, pero no reemplaza la clasificación del hallazgo.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre:
      'Un hallazgo se escribe siempre con tres partes: criterio incumplido, evidencia objetiva y desviación observada. Sin las tres, es una opinión.',
  },
  {
    id: 'audit-2',
    labId: 'auditoria',
    enunciado: '¿Cuándo se cierra correctamente una acción correctiva?',
    opciones: [
      { id: 'a', texto: 'Cuando se implementa la acción comprometida.', feedback: 'Implementar es solo un paso: falta comprobar que el problema no reaparece.' },
      { id: 'b', texto: 'Cuando se verifica, con datos posteriores, que la desviación no reaparece.', feedback: 'Correcto: eso es verificación de eficacia, y es lo que distingue un sistema vivo de uno de papel.' },
      { id: 'c', texto: 'Cuando el responsable firma el formato.', feedback: 'La firma documenta, no verifica.' },
      { id: 'd', texto: 'Cuando pasa la siguiente auditoría.', feedback: 'Depende del azar del muestreo, no de una verificación deliberada.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre:
      'Hallazgo → causa → acción → seguimiento → eficacia. El paso que casi siempre se salta es el último, y es el único que demuestra que el sistema aprendió.',
  },
];

export function preguntasDe(labId: string): Pregunta[] {
  return preguntas.filter((p) => p.labId === labId);
}

/** Desafíos que el facilitador lanza a la sala desde el panel del profesor. */
export const desafiosEnVivo = preguntas.filter((p) =>
  ['mejora-1', 'kpi-2', 'stat-1', 'pareto-1', 'audit-1', 'causa-1'].includes(p.id),
);
