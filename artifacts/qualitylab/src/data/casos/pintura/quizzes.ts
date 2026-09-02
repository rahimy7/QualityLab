/**
 * Banco de ejercicios de opción múltiple para el caso Pinturas del Sur.
 * Misma estructura pedagógica que Andina: retroalimentación por opción,
 * cierre conceptual siempre visible.
 */

export interface Opcion {
  id: string;
  texto: string;
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
  cierre: string;
}

export const preguntas: Pregunta[] = [
  /* ---------------- Diagnóstico ---------------- */
  {
    id: 'diag-1',
    labId: 'diagnostico',
    enunciado: '¿Cuál de estos enunciados describe un problema y no una solución?',
    opciones: [
      { id: 'a', texto: 'Falta comprar un molino de perlas nuevo.', feedback: 'Es una solución ya elegida y cara. Si empiezas aquí, cierras el análisis antes de abrirlo.' },
      { id: 'b', texto: 'El 26 % de los lotes se rechaza en control de calidad a la primera revisión.', feedback: 'Correcto: es un hecho observable, medible y con línea base. De aquí sí se puede investigar.' },
      { id: 'c', texto: 'Los operarios de dispersión están desmotivados.', feedback: 'Juicio sobre personas: no es verificable y bloquea la conversación.' },
      { id: 'd', texto: 'Necesitamos un nuevo LIMS.', feedback: 'Otra solución disfrazada de problema.' },
    ],
    correcta: 'b',
    puntos: 20,
    cierre: 'Un problema bien planteado contiene el qué, el cuánto y el desde cuándo. Si el enunciado nombra la solución, el análisis se vuelve una justificación.',
  },
  {
    id: 'diag-2',
    labId: 'diagnostico',
    contexto: 'Conformidad 74 % (meta 92) · Reprocesos 21 % (meta 8) · Devoluciones 6.4 % (meta 2) · Cp viscosidad 0.72 (meta 1.33) · Productividad 71 % (meta 88).',
    enunciado: 'La gerencia pide atacar primero las devoluciones porque son la cara al cliente. ¿Cuál es la mejor objeción técnica?',
    opciones: [
      { id: 'a', texto: 'Las devoluciones son un indicador de resultado; se mueven al mejorar la conformidad y los reprocesos.', feedback: 'Correcto. Devoluciones es un indicador lagging. Conformidad y reprocesos son las palancas que la planta puede mover directamente.' },
      { id: 'b', texto: 'Las devoluciones son culpa del transporte, no de calidad.', feedback: 'No hay evidencia de eso en los datos.' },
      { id: 'c', texto: 'La brecha más grande siempre debe atacarse primero.', feedback: 'Ese criterio ignora esfuerzo, control del equipo y relaciones causa-efecto.' },
      { id: 'd', texto: 'No hay datos suficientes de devoluciones.', feedback: 'Los datos existen: el problema no es cantidad, es naturaleza del indicador.' },
    ],
    correcta: 'a',
    puntos: 25,
    cierre: 'Distinguir indicadores de resultado (lagging) de indicadores de proceso (leading) es lo que evita proyectos que "miden mucho y mueven poco".',
  },

  /* ---------------- KPI ---------------- */
  {
    id: 'kpi-1',
    labId: 'kpi',
    enunciado: 'De estos componentes de una ficha de indicador, ¿cuál falta con más frecuencia en la práctica?',
    opciones: [
      { id: 'a', texto: 'El nombre del indicador.', feedback: 'Casi nunca falta: es lo primero que se escribe.' },
      { id: 'b', texto: 'La fuente del dato y quién lo captura.', feedback: 'Correcto. Es el componente más omitido: sin fuente declarada el indicador no es auditable.' },
      { id: 'c', texto: 'La meta.', feedback: 'Suele faltar la fecha, pero el valor casi siempre está.' },
      { id: 'd', texto: 'La fórmula.', feedback: 'A veces falta, pero la fuente es el punto ciego más común.' },
    ],
    correcta: 'b',
    puntos: 20,
    cierre: 'Un indicador sin fuente declarada no es auditable: nadie puede reproducir el número seis meses después.',
  },
  {
    id: 'kpi-2',
    labId: 'kpi',
    contexto: 'La conformidad a la primera pasó de 74 % a 82 %, con meta de 92 %.',
    enunciado: '¿Cuál es la lectura correcta?',
    opciones: [
      { id: 'a', texto: 'La meta se cumplió en un 82 %.', feedback: 'Mezcla el valor del indicador con el avance hacia la meta.' },
      { id: 'b', texto: 'Mejoró 8 puntos porcentuales y aún hay una brecha de 10 puntos; falta ver la tendencia.', feedback: 'Correcto: separa variación (8 pp), brecha (10 pp) y advierte que un salto no demuestra sostenibilidad.' },
      { id: 'c', texto: 'Mejoró un 8 %.', feedback: 'La variación relativa sería 8 ÷ 74 = 10.8 %. Aquí lo correcto es hablar de puntos porcentuales.' },
      { id: 'd', texto: 'El proceso está bajo control.', feedback: 'Nada en el enunciado habla de límites de control ni variabilidad.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Punto porcentual mide la diferencia entre dos porcentajes; el porcentaje de variación mide el cambio relativo. Confundirlos es el error más común del módulo.',
  },

  /* ---------------- Pareto ---------------- */
  {
    id: 'pareto-1',
    labId: 'pareto',
    contexto: 'Dispersión insuficiente 38.4 % · Viscosidad fuera de rango 27.4 % · Contaminación de línea 15.8 % · Materia prima fuera de spec 11.6 % · Falla de dosificación 8.2 % · Filtración 2.7 %.',
    enunciado: '¿Dónde invertirías primero los recursos del equipo de mejora?',
    opciones: [
      { id: 'a', texto: 'En las seis causas, con un plan para cada una.', feedback: 'Es lo que hace la mayoría y la razón por la que los planes no avanzan: seis frentes con el mismo equipo.' },
      { id: 'b', texto: 'En las dos primeras, que concentran el 65.8 % de las incidencias.', feedback: 'Correcto. Dos frentes concentrados producen más efecto que seis diluidos.' },
      { id: 'c', texto: 'En filtración, porque es la más barata de resolver.', feedback: 'Optimiza esfuerzo, no resultado: mover el 2.7 % no cambia la percepción del cliente.' },
      { id: 'd', texto: 'En materia prima, porque depende del proveedor y no de nosotros.', feedback: 'Confunde control con impacto. Además, el criterio de compras sí es interno.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'El Pareto no dice qué hacer: dice dónde mirar primero. La decisión sigue siendo del equipo y debe considerar impacto, esfuerzo y control.',
  },
  {
    id: 'pareto-2',
    labId: 'pareto',
    enunciado: 'El Pareto por frecuencia pone a "contaminación de línea" en tercer lugar, pero el Pareto por costo la pone primero. ¿Qué significa?',
    opciones: [
      { id: 'a', texto: 'Uno de los dos análisis está mal hecho.', feedback: 'Ambos pueden estar bien: miden cosas distintas.' },
      { id: 'b', texto: 'El costo por evento de contaminación es mayor que el de las demás causas.', feedback: 'Correcto: menos eventos pero mucho más caros. Es exactamente el caso que justifica hacer los dos Paretos.' },
      { id: 'c', texto: 'Hay que usar siempre la frecuencia porque es más objetiva.', feedback: 'Es más fácil de contar, no más objetiva. A la gerencia le importa el costo.' },
      { id: 'd', texto: 'Los datos están duplicados.', feedback: 'Nada en el enunciado sugiere duplicación.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Haz al menos dos Paretos: frecuencia y costo. Cuando coinciden, la prioridad es indiscutible; cuando difieren, aprendiste algo.',
  },

  /* ---------------- Causa raíz ---------------- */
  {
    id: 'causa-1',
    labId: 'porques',
    enunciado: '¿Cuál de estas cadenas de porqués está mal construida?',
    opciones: [
      { id: 'a', texto: 'Lote rechazado → viscosidad alta → resina cargada en exceso → balanza descalibrada hace dos semanas.', feedback: 'Bien construida: cada paso es observable.' },
      { id: 'b', texto: 'Lote rechazado → el operario no puso atención.', feedback: 'Correcto: salta al juicio sobre las personas. No es verificable y cierra el análisis en un paso.' },
      { id: 'c', texto: 'Reproceso de dispersión → Hegman fuera de spec → tiempo de molienda insuficiente → programa estándar no diferencia pigmentos difíciles.', feedback: 'Bien construida: baja de un hecho a una condición del sistema.' },
      { id: 'd', texto: 'Contaminación de tono → lavado incompleto → no hay checklist obligatorio de cambio de color.', feedback: 'Bien construida: conecta el hecho con una regla ausente.' },
    ],
    correcta: 'b',
    puntos: 20,
    cierre: 'Si una cadena termina en "error humano" o "no puso atención", casi siempre falta un porqué más: ¿qué hace que ese error sea posible o probable?',
  },
  {
    id: 'causa-2',
    labId: 'porques',
    enunciado: 'El equipo concluye que la causa raíz es "el programa de molienda no diferencia pigmentos". ¿Qué evidencia lo demostraría mejor?',
    opciones: [
      { id: 'a', texto: 'Que tres supervisores estén de acuerdo.', feedback: 'Consenso no es evidencia. Tres personas pueden compartir el mismo supuesto.' },
      { id: 'b', texto: 'Comparar tiempo de molienda y ensayo Hegman entre lotes con dióxido de titanio y con negro de humo.', feedback: 'Correcto: evidencia objetiva, reproducible y directamente ligada a la hipótesis.' },
      { id: 'c', texto: 'Que el indicador haya bajado tras capacitar al personal.', feedback: 'Confunde efecto de una acción con prueba de causa.' },
      { id: 'd', texto: 'Que el proveedor del molino lo confirme.', feedback: 'Opinión de un tercero interesado, sin dato del proceso.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'La prueba fuerte de una causa raíz es de dos vías: si la condición está presente aparece el efecto, y si la eliminas el efecto desaparece.',
  },

  /* ---------------- Hoshin ---------------- */
  {
    id: 'hoshin-1',
    labId: 'hoshin',
    enunciado: 'En una X-Matrix, ¿qué señal indica un problema de despliegue?',
    opciones: [
      { id: 'a', texto: 'Una iniciativa que no se cruza con ningún KPI.', feedback: 'Correcto: es una iniciativa huérfana. Consume recursos sin mover nada declarado.' },
      { id: 'b', texto: 'Un KPI que se cruza con dos iniciativas.', feedback: 'Es normal y hasta deseable: varias palancas para el mismo resultado.' },
      { id: 'c', texto: 'Un objetivo con más de una meta.', feedback: 'También es habitual, siempre que las metas no se contradigan.' },
      { id: 'd', texto: 'Un responsable a cargo de dos iniciativas.', feedback: 'Puede ser un problema de carga, no de estructura.' },
    ],
    correcta: 'a',
    puntos: 25,
    cierre: 'La X-Matrix se lee buscando filas o columnas vacías: iniciativas sin KPI, KPI sin iniciativa y metas sin dueño.',
  },

  /* ---------------- Estadística ---------------- */
  {
    id: 'stat-1',
    labId: 'estadistica',
    enunciado: '¿Cuál es la diferencia entre límites de control y límites de especificación?',
    opciones: [
      { id: 'a', texto: 'Son lo mismo con distinto nombre.', feedback: 'Es la confusión más costosa del control estadístico.' },
      { id: 'b', texto: 'Los de control salen del proceso; los de especificación salen del cliente.', feedback: 'Correcto: los de control describen lo que el proceso hace hoy; los de especificación, lo que el cliente necesita. Pueden no coincidir.' },
      { id: 'c', texto: 'Los de control siempre son más estrechos.', feedback: 'A veces sí, a veces no. Cuando son más anchos, el proceso no es capaz.' },
      { id: 'd', texto: 'Los de especificación se calculan con ±3σ.', feedback: 'Los ±3σ son los de control. La especificación la fija el cliente o la norma.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Voz del proceso (límites de control) vs. voz del cliente (especificación). Cp y Cpk son la comparación entre ambas.',
  },
  {
    id: 'stat-2',
    labId: 'estadistica',
    contexto: 'La semana 8 del tiempo de dispersión marca 234.6 min, muy por encima del límite superior de control.',
    enunciado: '¿Cuál es la acción correcta?',
    opciones: [
      { id: 'a', texto: 'Ajustar el estándar hacia arriba.', feedback: 'Reaccionar al ruido cambiando el proceso es la trampa del embudo de Deming: aumenta la variación.' },
      { id: 'b', texto: 'Investigar qué pasó específicamente esa semana.', feedback: 'Correcto: un punto fuera de límites indica causa especial. Se busca el evento concreto.' },
      { id: 'c', texto: 'Eliminar el dato porque es atípico.', feedback: 'Borrar la señal destruye la información más valiosa de la serie.' },
      { id: 'd', texto: 'Esperar a que se repita.', feedback: 'La regla 1 ya es señal suficiente: esperar solo hace que se pierda el rastro del evento.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Causa común se ataca rediseñando el proceso; causa especial se ataca investigando el evento. Confundirlas lleva a intervenir donde no se debe.',
  },
  {
    id: 'stat-3',
    labId: 'estadistica',
    contexto: 'Horas de capacitación y errores de dosificación de 22 operarios muestran r = −0.82.',
    enunciado: '¿Qué se puede afirmar?',
    opciones: [
      { id: 'a', texto: 'La capacitación reduce los errores de dosificación.', feedback: 'Conclusión tentadora, pero la correlación no prueba dirección ni causalidad por sí sola.' },
      { id: 'b', texto: 'Existe una relación inversa fuerte que vale la pena investigar como hipótesis.', feedback: 'Correcto: la correlación identifica una relación a verificar, no una causa demostrada.' },
      { id: 'c', texto: 'El 82 % de los errores se explica por falta de capacitación.', feedback: 'Eso sería r², que aquí es 0.67. Además "se explica" es lenguaje de modelo, no de causa.' },
      { id: 'd', texto: 'No hay relación porque el valor es negativo.', feedback: 'El signo indica dirección, no ausencia de relación.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'r indica fuerza y dirección; r² indica proporción explicada por el modelo. Ninguno demuestra causalidad sin un diseño que la aísle.',
  },

  /* ---------------- Mejora ---------------- */
  {
    id: 'mejora-1',
    labId: 'mejora',
    contexto: 'La tasa de reprocesos pasó de 22 % a 7 %.',
    enunciado: '¿En qué porcentaje se redujo?',
    opciones: [
      { id: 'a', texto: '15 %', feedback: 'Esa es la diferencia en puntos porcentuales (15 pp), no la reducción relativa.' },
      { id: 'b', texto: '68 %', feedback: 'Correcto: (7 − 22) ÷ 22 = −0.682, es decir 68 % de reducción sobre la base.' },
      { id: 'c', texto: '32 %', feedback: 'Ese es el valor que queda respecto de la base (7 ÷ 22), no lo que se redujo.' },
      { id: 'd', texto: '7 %', feedback: 'Es el valor final, no la variación.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Reducción relativa = (nuevo − base) ÷ base. Reportar 15 % en lugar de 68 % subestima el logro por más de un factor de cuatro.',
  },
  {
    id: 'mejora-2',
    labId: 'mejora',
    enunciado: 'Un equipo muestra dos semanas por debajo de la meta y declara el proyecto cerrado. ¿Cuál es la objeción más sólida?',
    opciones: [
      { id: 'a', texto: 'Dos puntos no permiten distinguir mejora sostenida de variación normal.', feedback: 'Correcto: hace falta suficiente historia y verificación en la carta de control.' },
      { id: 'b', texto: 'La meta estaba mal fijada.', feedback: 'Puede ser, pero no es lo que el enunciado permite objetar.' },
      { id: 'c', texto: 'Falta la firma de la gerencia.', feedback: 'Tema administrativo, no de evidencia.' },
      { id: 'd', texto: 'Debieron usar un gráfico de barras.', feedback: 'El tipo de gráfico no es el problema de fondo.' },
    ],
    correcta: 'a',
    puntos: 25,
    cierre: 'La pregunta que cierra un proyecto no es "¿bajó?", sino "¿bajó de forma que el proceso ya no vuelve solo al nivel anterior?".',
  },

  /* ---------------- Auditoría ---------------- */
  {
    id: 'audit-1',
    labId: 'auditoria',
    enunciado: 'El procedimiento exige registrar el tiempo de dispersión de cada lote. En 8 de 30 órdenes revisadas el campo está vacío. ¿Cómo se clasifica?',
    opciones: [
      { id: 'a', texto: 'Conformidad, porque el procedimiento existe.', feedback: 'La existencia del documento no es evidencia de cumplimiento.' },
      { id: 'b', texto: 'No conformidad: se incumple un requisito con evidencia objetiva.', feedback: 'Correcto: hay criterio, evidencia y desviación en el 27 % de la muestra.' },
      { id: 'c', texto: 'Observación, porque la mayoría sí se registró.', feedback: 'La observación se usa cuando el requisito se cumple con debilidad; aquí no se cumple.' },
      { id: 'd', texto: 'Oportunidad de mejora.', feedback: 'Es una recomendación, no reemplaza la clasificación del hallazgo.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Un hallazgo se escribe con tres partes: criterio incumplido, evidencia objetiva y desviación observada. Sin las tres, es una opinión.',
  },
  {
    id: 'audit-2',
    labId: 'auditoria',
    enunciado: '¿Cuándo se cierra correctamente una acción correctiva?',
    opciones: [
      { id: 'a', texto: 'Cuando se implementa la acción comprometida.', feedback: 'Implementar es solo un paso: falta comprobar que el problema no reaparece.' },
      { id: 'b', texto: 'Cuando se verifica, con datos posteriores, que la desviación no reaparece.', feedback: 'Correcto: es la verificación de eficacia, y es lo que distingue un sistema vivo de uno de papel.' },
      { id: 'c', texto: 'Cuando el responsable firma el formato.', feedback: 'La firma documenta, no verifica.' },
      { id: 'd', texto: 'Cuando pasa la siguiente auditoría.', feedback: 'Depende del azar del muestreo.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Hallazgo → causa → acción → seguimiento → eficacia. El paso que casi siempre se salta es el último, y es el único que demuestra que el sistema aprendió.',
  },
];

export function preguntasDe(labId: string): Pregunta[] {
  return preguntas.filter((p) => p.labId === labId);
}

/** Desafíos que el facilitador lanza a la sala. */
export const desafiosEnVivo = preguntas.filter((p) =>
  ['mejora-1', 'kpi-2', 'stat-1', 'pareto-1', 'audit-1', 'causa-1'].includes(p.id),
);
