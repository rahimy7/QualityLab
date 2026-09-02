/**
 * Mini auditoría del proceso de dispersión y ajuste final. Cada ítem entrega
 * la evidencia que el auditor tendría en la mano; el participante debe
 * clasificar y contrastar con el criterio del módulo.
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
  hallazgo: string;
}

export const clasificaciones: Array<{
  id: Clasificacion;
  label: string;
  descripcion: string;
  tono: 'ok' | 'alerta' | 'critico';
}> = [
  { id: 'conforme', label: 'Conformidad', descripcion: 'El requisito se cumple y hay evidencia objetiva.', tono: 'ok' },
  { id: 'observacion', label: 'Observación', descripcion: 'Se cumple con una debilidad que puede derivar en incumplimiento.', tono: 'alerta' },
  { id: 'no-conformidad', label: 'No conformidad', descripcion: 'El requisito no se cumple y existe evidencia objetiva de la desviación.', tono: 'critico' },
];

export const itemsAuditoria: ItemAuditoria[] = [
  {
    id: 'aud-1',
    proceso: 'Producción',
    criterio: 'PR-PRO-02 "Dispersión y ajuste de viscosidad", rev. 4 vigente.',
    pregunta: '¿Existe un procedimiento documentado y vigente para la dispersión?',
    evidencias: [
      { tipo: 'Documento', detalle: 'PR-PRO-02 rev. 4 aprobado y con fecha de revisión dentro del periodo.' },
      { tipo: 'Observación', detalle: 'Copia controlada disponible en el tablero de la sala de dispersión.' },
    ],
    respuesta: 'conforme',
    explicacion:
      'Hay documento vigente, aprobado y disponible en el punto de uso. Los tres elementos que exige el criterio están presentes.',
    hallazgo: 'Sin hallazgo. PR-PRO-02 rev. 4 está vigente y disponible en el punto de uso.',
  },
  {
    id: 'aud-2',
    proceso: 'Producción',
    criterio: 'PR-PRO-02 punto 6.4: el operador registra el tiempo de dispersión al cierre de cada lote.',
    pregunta: '¿Se registra el tiempo de dispersión en cada orden de trabajo?',
    evidencias: [
      { tipo: 'Registro', detalle: 'Muestra de 30 órdenes: 8 con el campo "tiempo de dispersión" vacío.' },
      { tipo: 'Observación', detalle: 'El campo existe en el MES pero no es obligatorio para cerrar la orden.' },
    ],
    respuesta: 'no-conformidad',
    explicacion:
      'El 27 % de la muestra incumple un requisito explícito del propio procedimiento, con evidencia objetiva.',
    hallazgo:
      'No conformidad contra PR-PRO-02 punto 6.4: en 8 de 30 órdenes revisadas el campo "tiempo de dispersión" está vacío. El campo no es obligatorio en el MES para cerrar la orden.',
  },
  {
    id: 'aud-3',
    proceso: 'Calidad',
    criterio: 'IT-CAL-05: el ensayo Hegman se realiza dos veces por lote (mitad y fin de dispersión).',
    pregunta: '¿El ensayo de finura Hegman se ejecuta según el procedimiento?',
    evidencias: [
      { tipo: 'Observación', detalle: 'En 3 de 6 lotes observados solo se realizó el ensayo al final de la dispersión.' },
      { tipo: 'Entrevista', detalle: '"Cuando estamos apurados solo hacemos el final" — operario turno tarde.' },
      { tipo: 'Registro', detalle: 'Bitácora de calidad muestra un promedio de 1.4 ensayos por lote la última semana.' },
    ],
    respuesta: 'no-conformidad',
    explicacion:
      'Existe un procedimiento que define dos ensayos por lote y la observación directa muestra que en la práctica se hace uno, de manera recurrente y sin autorización documentada.',
    hallazgo:
      'No conformidad contra IT-CAL-05: en 3 de 6 lotes observados se omitió el ensayo Hegman intermedio; el promedio semanal de ensayos por lote es 1.4 en lugar de 2.',
  },
  {
    id: 'aud-4',
    proceso: 'Producción',
    criterio: 'PR-PRO-02 punto 8.1: revisión semanal del indicador de reprocesos con el equipo.',
    pregunta: '¿El equipo revisa el indicador con la frecuencia definida?',
    evidencias: [
      { tipo: 'Registro', detalle: 'Actas de reunión desde semana 6; faltan semanas 3 y 4.' },
      { tipo: 'Indicador', detalle: 'Tablero de reprocesos actualizado al cierre de la semana en curso.' },
      { tipo: 'Entrevista', detalle: 'Supervisor confirma que las semanas faltantes coincidieron con la parada anual.' },
    ],
    respuesta: 'observacion',
    explicacion:
      'El ritual existe, está vigente y produce evidencia; la falla es puntual y justificada. Cumple con una debilidad: no hay mecanismo de reprogramación cuando se interrumpe.',
    hallazgo:
      'Observación: la revisión semanal se cumple desde la semana 6, con dos ausencias en semanas 3 y 4 sin registro de reprogramación. Se sugiere definir mecanismo de recuperación.',
  },
  {
    id: 'aud-5',
    proceso: 'Producción',
    criterio: 'PR-PRO-02 punto 8.3: plan de reacción documentado cuando la conformidad cae bajo 85 %.',
    pregunta: '¿Existe un plan de reacción documentado ante desviaciones del indicador?',
    evidencias: [
      { tipo: 'Entrevista', detalle: '"Cuando se dispara, avisamos al jefe y él decide" — supervisor de producción.' },
      { tipo: 'Documento', detalle: 'No se presentó documento de plan de reacción.' },
    ],
    respuesta: 'no-conformidad',
    explicacion:
      'El criterio pide plan documentado. Una escalación informal que depende del criterio de una persona no es un plan de reacción.',
    hallazgo:
      'No conformidad contra PR-PRO-02 punto 8.3: no existe plan de reacción documentado; la respuesta ante desviación depende de escalación verbal.',
  },
  {
    id: 'aud-6',
    proceso: 'Recepción',
    criterio: 'IT-COM-03: toda materia prima entrante debe traer certificado de análisis del proveedor.',
    pregunta: '¿La materia prima recibida cuenta con certificado de análisis vigente?',
    evidencias: [
      { tipo: 'Registro', detalle: 'Revisión de 25 ingresos: 4 lotes sin certificado adjunto.' },
      { tipo: 'Documento', detalle: 'IT-COM-03 permite recibir sin certificado "en casos excepcionales", sin definir el término.' },
      { tipo: 'Fotografía', detalle: 'Almacén de resinas con 2 tambores sin etiqueta de aprobación.' },
    ],
    respuesta: 'no-conformidad',
    explicacion:
      'Hay desviación medida (16 % de la muestra) contra un requisito. Además, la instrucción tiene un vacío ("casos excepcionales" sin definir): es también un problema de sistema.',
    hallazgo:
      'No conformidad contra IT-COM-03: 4 de 25 ingresos verificados no cuentan con certificado de análisis. La instrucción no define qué es un "caso excepcional".',
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
