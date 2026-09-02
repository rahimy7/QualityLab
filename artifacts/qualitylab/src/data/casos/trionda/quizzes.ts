/**
 * Quizzes de Trionda. Estructura idéntica a los otros casos.
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
  /* Diagnóstico */
  {
    id: 'diag-1',
    labId: 'diagnostico',
    enunciado: '¿Cuál de estos enunciados describe un problema y no una solución?',
    opciones: [
      { id: 'a', texto: 'Falta comprar una prensa térmica nueva.', feedback: 'Es una solución cara ya elegida. Si empiezas aquí, cierras el análisis antes de abrirlo.' },
      { id: 'b', texto: 'El 18 % de los balones no supera homologación FIFA a la primera.', feedback: 'Correcto: hecho observable, medible y con línea base.' },
      { id: 'c', texto: 'Los operarios de termosellado están apurados.', feedback: 'Juicio sobre personas: no es verificable.' },
      { id: 'd', texto: 'Necesitamos un mejor proveedor de chip.', feedback: 'Solución elegida sin diagnóstico.' },
    ],
    correcta: 'b',
    puntos: 20,
    cierre: 'Un problema bien planteado contiene el qué, el cuánto y el desde cuándo.',
  },
  {
    id: 'diag-2',
    labId: 'diagnostico',
    contexto: 'Homologación 82 % (meta 96) · Defectos termosellado 9.4 % (meta 2) · Peso fuera rango 6.2 % (meta 1) · Cp circunferencia 0.86 (meta 1.33) · Fallos chip 3.8 % (meta 0.5).',
    enunciado: 'La gerencia quiere atacar primero los fallos del chip porque es la tecnología estrella. ¿Cuál es la objeción técnica más sólida?',
    opciones: [
      { id: 'a', texto: 'El chip solo explica 3.8 % de rechazos; los defectos de termosellado explican 9.4 %. El impacto está en el proceso térmico.', feedback: 'Correcto: prioriza por impacto en el indicador de resultado, no por visibilidad mediática.' },
      { id: 'b', texto: 'El chip es responsabilidad del proveedor, no nuestra.', feedback: 'Puede ser, pero no es lo que el enunciado permite objetar con datos.' },
      { id: 'c', texto: 'Hay que atacar todas las causas a la vez.', feedback: 'Diluye recursos y hace imposible saber cuál acción funcionó.' },
      { id: 'd', texto: 'La brecha más grande siempre debe atacarse primero.', feedback: 'Ese criterio ignora esfuerzo y control del equipo.' },
    ],
    correcta: 'a',
    puntos: 25,
    cierre: 'Priorizar por impacto en el KPI de resultado es más honesto que priorizar por visibilidad.',
  },

  /* KPI */
  {
    id: 'kpi-1',
    labId: 'kpi',
    enunciado: 'De los componentes de una ficha de indicador, ¿cuál falta con más frecuencia?',
    opciones: [
      { id: 'a', texto: 'El nombre del indicador.', feedback: 'Casi nunca falta.' },
      { id: 'b', texto: 'La fuente del dato y quién lo captura.', feedback: 'Correcto. Sin fuente el indicador no es auditable.' },
      { id: 'c', texto: 'La meta.', feedback: 'Suele faltar la fecha, no el valor.' },
      { id: 'd', texto: 'La fórmula.', feedback: 'A veces falta, pero la fuente es el punto ciego más común.' },
    ],
    correcta: 'b',
    puntos: 20,
    cierre: 'Un indicador sin fuente declarada no se puede reproducir seis meses después.',
  },
  {
    id: 'kpi-2',
    labId: 'kpi',
    contexto: 'La homologación pasó de 82 % a 92 %, con meta de 96 %.',
    enunciado: '¿Cuál es la lectura correcta?',
    opciones: [
      { id: 'a', texto: 'La meta se cumplió en un 92 %.', feedback: 'Mezcla el valor con el avance hacia la meta.' },
      { id: 'b', texto: 'Mejoró 10 puntos porcentuales; queda una brecha de 4 puntos; falta ver la tendencia.', feedback: 'Correcto: separa variación, brecha y sostenibilidad.' },
      { id: 'c', texto: 'Mejoró un 10 %.', feedback: 'La variación relativa sería 10 ÷ 82 = 12.2 %. Aquí lo correcto es puntos porcentuales.' },
      { id: 'd', texto: 'El proceso está bajo control.', feedback: 'Nada en el enunciado habla de límites de control.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Punto porcentual ≠ porcentaje de variación. Confundirlos es el error más común.',
  },

  /* Pareto */
  {
    id: 'pareto-1',
    labId: 'pareto',
    contexto: 'Termosellado con burbujas 34.7 % · Peso fuera rango 25.0 % · Circunferencia 19.4 % · Chip no transmite 13.2 % · Absorción 5.6 % · Adhesión 2.1 %.',
    enunciado: '¿Dónde invertirías primero los recursos del equipo?',
    opciones: [
      { id: 'a', texto: 'En las seis causas, con un plan para cada una.', feedback: 'Diluye el esfuerzo.' },
      { id: 'b', texto: 'En termosellado y peso, que juntas concentran 59.7 %.', feedback: 'Correcto: dos frentes concentrados producen más efecto que seis diluidos.' },
      { id: 'c', texto: 'En el chip, porque es la tecnología nueva.', feedback: 'Priorización por visibilidad, no por impacto.' },
      { id: 'd', texto: 'En adhesión, que es la más barata.', feedback: 'Solo mueve 2 % del problema.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'El Pareto dice dónde mirar; la decisión final considera impacto, esfuerzo y control.',
  },
  {
    id: 'pareto-2',
    labId: 'pareto',
    enunciado: 'El Pareto por frecuencia pone al "chip no transmite" en cuarto lugar, pero por costo lo pone segundo. ¿Qué significa?',
    opciones: [
      { id: 'a', texto: 'El análisis está mal hecho.', feedback: 'Ambos pueden estar bien: miden cosas distintas.' },
      { id: 'b', texto: 'El costo por evento de chip es mucho mayor que el de las demás causas.', feedback: 'Correcto: menos eventos pero más caros. El chip cuesta ≈ 3× más que un balón entero.' },
      { id: 'c', texto: 'Hay que usar frecuencia siempre.', feedback: 'La frecuencia es más fácil de contar, no más objetiva.' },
      { id: 'd', texto: 'Los datos están duplicados.', feedback: 'Nada en el enunciado lo sugiere.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Haz Pareto por frecuencia Y por costo. Cuando difieren, aprendiste algo.',
  },

  /* Causa raíz */
  {
    id: 'causa-1',
    labId: 'porques',
    enunciado: '¿Cuál de estas cadenas de porqués está mal construida?',
    opciones: [
      { id: 'a', texto: 'Balón rechazado → burbujas → temperatura irregular → sensor térmico descalibrado hace tres semanas.', feedback: 'Bien construida.' },
      { id: 'b', texto: 'Balón rechazado → el operario no puso atención.', feedback: 'Correcto: juicio sobre personas, cierra el análisis en un solo paso.' },
      { id: 'c', texto: 'Chip no transmite → soldadura fría → temperatura de horno baja → no hay verificación diaria.', feedback: 'Bien construida.' },
      { id: 'd', texto: 'Circunferencia grande → panel de más → troqueladora fuera de tolerancia.', feedback: 'Bien construida.' },
    ],
    correcta: 'b',
    puntos: 20,
    cierre: 'Si termina en "error humano", falta un porqué.',
  },
  {
    id: 'causa-2',
    labId: 'porques',
    enunciado: 'El equipo concluye que la causa raíz es "el sensor térmico se descalibra". ¿Qué evidencia lo demostraría mejor?',
    opciones: [
      { id: 'a', texto: 'Que dos jefes de línea estén de acuerdo.', feedback: 'Consenso no es evidencia.' },
      { id: 'b', texto: 'Comparar la lectura del sensor contra un termómetro patrón durante 8 h.', feedback: 'Correcto: evidencia objetiva, reproducible, directamente ligada a la hipótesis.' },
      { id: 'c', texto: 'Que los defectos hayan bajado tras cambiar el sensor.', feedback: 'Confunde efecto de una acción con prueba de causa.' },
      { id: 'd', texto: 'Que el proveedor del sensor lo confirme.', feedback: 'Opinión de tercero interesado.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Prueba fuerte: si la causa está presente aparece el efecto; si la eliminas, desaparece.',
  },

  /* Hoshin */
  {
    id: 'hoshin-1',
    labId: 'hoshin',
    enunciado: 'En una X-Matrix, ¿qué señal indica un problema de despliegue?',
    opciones: [
      { id: 'a', texto: 'Una iniciativa que no se cruza con ningún KPI.', feedback: 'Correcto: es huérfana; consume recursos sin mover nada declarado.' },
      { id: 'b', texto: 'Un KPI cruzado con dos iniciativas.', feedback: 'Normal y deseable.' },
      { id: 'c', texto: 'Un objetivo con más de una meta.', feedback: 'Habitual, siempre que no se contradigan.' },
      { id: 'd', texto: 'Un responsable con dos iniciativas.', feedback: 'Problema de carga, no de estructura.' },
    ],
    correcta: 'a',
    puntos: 25,
    cierre: 'Se lee buscando filas o columnas vacías.',
  },

  /* Estadística */
  {
    id: 'stat-1',
    labId: 'estadistica',
    enunciado: '¿Cuál es la diferencia entre límites de control y de especificación?',
    opciones: [
      { id: 'a', texto: 'Son lo mismo con distinto nombre.', feedback: 'Es la confusión más costosa del control estadístico.' },
      { id: 'b', texto: 'Los de control salen del proceso; los de especificación del cliente (FIFA).', feedback: 'Correcto.' },
      { id: 'c', texto: 'Los de control siempre son más estrechos.', feedback: 'A veces sí, a veces no.' },
      { id: 'd', texto: 'Los de especificación son ±3σ.', feedback: '±3σ son de control.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Voz del proceso vs. voz del cliente. Cp/Cpk comparan ambos.',
  },
  {
    id: 'stat-2',
    labId: 'estadistica',
    contexto: 'La semana 8 del ciclo de termosellado marca 189.6 s, muy por encima del límite superior de control.',
    enunciado: '¿Cuál es la acción correcta?',
    opciones: [
      { id: 'a', texto: 'Ajustar el estándar hacia arriba.', feedback: 'Trampa del embudo de Deming.' },
      { id: 'b', texto: 'Investigar qué pasó específicamente esa semana.', feedback: 'Correcto: causa especial → evento concreto.' },
      { id: 'c', texto: 'Eliminar el dato porque es atípico.', feedback: 'Destruye la información más valiosa.' },
      { id: 'd', texto: 'Esperar a que se repita.', feedback: 'La regla 1 ya es señal suficiente.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Causa común se rediseña; causa especial se investiga.',
  },

  /* Mejora */
  {
    id: 'mejora-1',
    labId: 'mejora',
    contexto: 'Los defectos de termosellado pasaron de 9.4 % a 2.1 %.',
    enunciado: '¿En qué porcentaje se redujo?',
    opciones: [
      { id: 'a', texto: '7.3 %', feedback: 'Es la diferencia en puntos porcentuales, no la reducción relativa.' },
      { id: 'b', texto: '78 %', feedback: 'Correcto: (2.1 − 9.4) ÷ 9.4 = −0.777.' },
      { id: 'c', texto: '22 %', feedback: 'Es el valor que queda respecto de la base (2.1 ÷ 9.4).' },
      { id: 'd', texto: '2.1 %', feedback: 'Es el valor final, no la variación.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Reducción relativa = (nuevo − base) ÷ base.',
  },

  /* Auditoría */
  {
    id: 'audit-1',
    labId: 'auditoria',
    enunciado: 'El procedimiento exige verificar el sensor térmico cada 24 h. En 8 de 30 turnos revisados no hay registro. ¿Cómo se clasifica?',
    opciones: [
      { id: 'a', texto: 'Conformidad.', feedback: 'La existencia del documento no es evidencia de cumplimiento.' },
      { id: 'b', texto: 'No conformidad: se incumple con evidencia objetiva.', feedback: 'Correcto: hay criterio, evidencia y desviación en 27 % de la muestra.' },
      { id: 'c', texto: 'Observación, porque la mayoría sí registró.', feedback: 'Observación se usa cuando el requisito se cumple con debilidad; aquí no se cumple.' },
      { id: 'd', texto: 'Oportunidad de mejora.', feedback: 'Es recomendación, no reemplaza clasificación.' },
    ],
    correcta: 'b',
    puntos: 25,
    cierre: 'Hallazgo = criterio + evidencia + desviación.',
  },
];

export function preguntasDe(labId: string): Pregunta[] {
  return preguntas.filter((p) => p.labId === labId);
}
