/**
 * Mini auditoría del proceso de despacho.
 *
 * Cada ítem entrega la evidencia que el auditor tendría en la mano; el
 * participante debe clasificar y luego contrastar con el criterio del módulo.
 */

export type Clasificacion = 'conforme' | 'observacion' | 'no-conformidad';

export interface Evidencia {
  tipo: 'Documento' | 'Registro' | 'Observación' | 'Entrevista' | 'Indicador' | 'Fotografía';
  detalle: string;
}

export interface ItemAuditoria {
  id: string;
  proceso: string;
  criterio: string;
  pregunta: string;
  evidencias: Evidencia[];
  respuesta: Clasificacion;
  explicacion: string;
  /** Redacción modelo del hallazgo, para comparar con la del participante. */
  hallazgo: string;
}

export const clasificaciones: Array<{
  id: Clasificacion;
  label: string;
  descripcion: string;
  tono: 'ok' | 'alerta' | 'critico';
}> = [
  { id: 'conforme', label: 'Conformidad', descripcion: 'El requisito se cumple y hay evidencia objetiva que lo respalda.', tono: 'ok' },
  { id: 'observacion', label: 'Observación', descripcion: 'El requisito se cumple, pero con una debilidad que puede derivar en incumplimiento.', tono: 'alerta' },
  { id: 'no-conformidad', label: 'No conformidad', descripcion: 'El requisito no se cumple y existe evidencia objetiva de la desviación.', tono: 'critico' },
];

export const itemsAuditoria: ItemAuditoria[] = [
  {
    id: 'aud-1',
    proceso: 'Despacho',
    criterio: 'PR-LOG-04 "Preparación y despacho de pedidos", rev. 3 vigente desde marzo.',
    pregunta: '¿Existe un procedimiento documentado y vigente para la preparación de pedidos?',
    evidencias: [
      { tipo: 'Documento', detalle: 'PR-LOG-04 rev. 3, aprobado y con fecha de revisión dentro del periodo.' },
      { tipo: 'Observación', detalle: 'Copia controlada disponible en el puesto de supervisión del CD.' },
    ],
    respuesta: 'conforme',
    explicacion:
      'Hay documento vigente, aprobado y disponible en el punto de uso. Los tres elementos que exige el criterio están presentes.',
    hallazgo: 'Sin hallazgo. El procedimiento PR-LOG-04 rev. 3 está vigente y disponible en el punto de uso.',
  },
  {
    id: 'aud-2',
    proceso: 'Despacho',
    criterio: 'PR-LOG-04, punto 6.1: el picking se ejecuta según la lista generada por el WMS.',
    pregunta: '¿El personal ejecuta el picking según lo definido en el procedimiento?',
    evidencias: [
      { tipo: 'Observación', detalle: 'Dos de los cuatro operarios observados usan una lista impresa del día anterior.' },
      { tipo: 'Entrevista', detalle: '"Cuando la terminal se traba, imprimimos y seguimos" — operario del turno tarde.' },
      { tipo: 'Registro', detalle: 'Bitácora de incidencias de terminales: 7 eventos en el último mes.' },
    ],
    respuesta: 'no-conformidad',
    explicacion:
      'El procedimiento define una única forma de ejecutar el picking y la observación directa muestra que en la práctica se usa otra, de manera recurrente y sin autorización documentada.',
    hallazgo:
      'No conformidad contra PR-LOG-04 punto 6.1: se observó a 2 de 4 operarios ejecutando picking con lista impresa no controlada, práctica sustentada por 7 eventos de falla de terminal registrados en bitácora.',
  },
  {
    id: 'aud-3',
    proceso: 'Despacho',
    criterio: 'PR-LOG-04, punto 7.2: se registra la causa de toda entrega fuera de fecha.',
    pregunta: '¿Se registra la causa de cada entrega tardía?',
    evidencias: [
      { tipo: 'Registro', detalle: 'Muestra de 20 órdenes tardías: 6 con el campo "causa" vacío.' },
      { tipo: 'Observación', detalle: 'El campo existe en el ERP pero no es obligatorio para cerrar la orden.' },
    ],
    respuesta: 'no-conformidad',
    explicacion:
      'El 30 % de la muestra incumple un requisito explícito del procedimiento. Hay criterio, evidencia objetiva y desviación: es no conformidad, no observación.',
    hallazgo:
      'No conformidad contra PR-LOG-04 punto 7.2: en 6 de 20 órdenes tardías revisadas el campo "causa" está vacío; el campo no es obligatorio en el ERP para cerrar la orden.',
  },
  {
    id: 'aud-4',
    proceso: 'Despacho',
    criterio: 'PR-LOG-04, punto 8.1: revisión semanal del indicador con el equipo.',
    pregunta: '¿El equipo revisa el indicador de entregas con la frecuencia definida?',
    evidencias: [
      { tipo: 'Registro', detalle: 'Actas de reunión semanal completas desde la semana 6; faltan las semanas 3 y 4.' },
      { tipo: 'Indicador', detalle: 'Tablero actualizado al cierre de la semana en curso.' },
      { tipo: 'Entrevista', detalle: 'El supervisor confirma que las semanas faltantes coincidieron con inventario anual.' },
    ],
    respuesta: 'observacion',
    explicacion:
      'El ritual existe, está vigente y produce evidencia; la falla es puntual y justificada. Cumple el requisito con una debilidad: no hay mecanismo de reprogramación cuando se interrumpe.',
    hallazgo:
      'Observación: la revisión semanal se cumple desde la semana 6, con dos ausencias en semanas 3 y 4 sin registro de reprogramación. Se sugiere definir el mecanismo de recuperación de la reunión.',
  },
  {
    id: 'aud-5',
    proceso: 'Despacho',
    criterio: 'PR-LOG-04, punto 8.3: existe un plan de reacción cuando el indicador supera el umbral.',
    pregunta: '¿Existe un plan de reacción documentado ante desviaciones del indicador?',
    evidencias: [
      { tipo: 'Entrevista', detalle: '"Cuando se dispara, avisamos al jefe y él decide" — supervisor de despacho.' },
      { tipo: 'Documento', detalle: 'No se presentó documento de plan de reacción.' },
    ],
    respuesta: 'no-conformidad',
    explicacion:
      'El criterio pide un plan documentado. Una escalación informal que depende del criterio de una persona no es un plan de reacción.',
    hallazgo:
      'No conformidad contra PR-LOG-04 punto 8.3: no existe plan de reacción documentado; la respuesta ante desviación depende de escalación verbal al jefe de área.',
  },
  {
    id: 'aud-6',
    proceso: 'Almacén',
    criterio: 'IT-ALM-02: el maestro de ubicaciones se actualiza dentro de las 24 h de todo relayout.',
    pregunta: '¿El maestro de ubicaciones refleja la posición física real del producto?',
    evidencias: [
      { tipo: 'Registro', detalle: 'Conteo cruzado de 40 SKU: 5 con ubicación distinta a la del sistema.' },
      { tipo: 'Documento', detalle: 'IT-ALM-02 asigna la tarea a "almacén", sin nombrar un rol específico.' },
      { tipo: 'Fotografía', detalle: 'Pasillo C con etiquetas de ubicación antiguas todavía adheridas.' },
    ],
    respuesta: 'no-conformidad',
    explicacion:
      'Hay desviación medida (12.5 % de la muestra) contra un requisito explícito. Además, la instrucción no asigna un responsable nominal: es la causa raíz que el equipo identificó en los 5 porqués.',
    hallazgo:
      'No conformidad contra IT-ALM-02: 5 de 40 SKU verificadas presentan discrepancia entre ubicación física y maestro del WMS. La instrucción no asigna un rol responsable de la actualización.',
  },
];

export const puntosPorAcierto = 15;

/** Ciclo que se enseña al cerrar la auditoría. */
export const cicloHallazgo = [
  { paso: 'Hallazgo', detalle: 'Criterio + evidencia objetiva + desviación, escrito sin adjetivos.' },
  { paso: 'Causa', detalle: 'Por qué el sistema permite la desviación, no quién la cometió.' },
  { paso: 'Acción', detalle: 'Corrección inmediata y acción correctiva sobre la causa, con dueño y fecha.' },
  { paso: 'Seguimiento', detalle: 'Evidencia de que la acción se ejecutó como se comprometió.' },
  { paso: 'Eficacia', detalle: 'Datos posteriores que demuestran que la desviación no reapareció.' },
];
