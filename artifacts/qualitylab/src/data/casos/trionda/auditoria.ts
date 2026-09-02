/**
 * Auditoría del proceso de termosellado y control de homologación FIFA.
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

export const itemsAuditoria: ItemAuditoria[] = [
  {
    id: 'aud-1',
    proceso: 'Termosellado',
    criterio: 'PR-TS-04 "Ciclo térmico de ensamblaje", rev. 5 vigente.',
    pregunta: '¿Existe un procedimiento documentado y vigente para el termosellado?',
    evidencias: [
      { tipo: 'Documento', detalle: 'PR-TS-04 rev. 5 aprobado y con fecha de revisión dentro del periodo.' },
      { tipo: 'Observación', detalle: 'Copia controlada disponible en la sala de prensas.' },
    ],
    respuesta: 'conforme',
    explicacion: 'Documento vigente, aprobado y disponible en el punto de uso.',
    hallazgo: 'Sin hallazgo. PR-TS-04 rev. 5 está vigente y disponible.',
  },
  {
    id: 'aud-2',
    proceso: 'Calidad',
    criterio: 'PR-QC-08 punto 6.4: el sensor térmico se verifica al inicio de cada turno (cada 8 h).',
    pregunta: '¿Se registra la verificación del sensor térmico?',
    evidencias: [
      { tipo: 'Registro', detalle: 'Muestra de 30 turnos: 8 sin registro de verificación.' },
      { tipo: 'Observación', detalle: 'El campo existe pero no es obligatorio para iniciar el turno.' },
    ],
    respuesta: 'no-conformidad',
    explicacion: 'El 27 % de la muestra incumple un requisito explícito, con evidencia objetiva.',
    hallazgo:
      'No conformidad contra PR-QC-08 punto 6.4: en 8 de 30 turnos revisados no hay registro de verificación del sensor térmico. El campo no es obligatorio para iniciar turno.',
  },
  {
    id: 'aud-3',
    proceso: 'Materiales',
    criterio: 'IT-COM-05: toda lámina de poliuretano entrante trae certificado de resistencia y absorción.',
    pregunta: '¿La materia prima cuenta con certificado vigente?',
    evidencias: [
      { tipo: 'Registro', detalle: '25 ingresos revisados: 3 sin certificado de absorción de agua.' },
      { tipo: 'Documento', detalle: 'IT-COM-05 permite recibir "excepcionalmente" sin certificado, sin definir el término.' },
    ],
    respuesta: 'no-conformidad',
    explicacion: 'Hay desviación medida y además un vacío en la instrucción ("excepcionalmente" sin definir).',
    hallazgo:
      'No conformidad contra IT-COM-05: 3 de 25 ingresos sin certificado de absorción. La instrucción no define qué es "excepción".',
  },
  {
    id: 'aud-4',
    proceso: 'Producción',
    criterio: 'PR-TS-04 punto 8.1: revisión semanal del indicador de defectos con el equipo.',
    pregunta: '¿El equipo revisa el indicador con la frecuencia definida?',
    evidencias: [
      { tipo: 'Registro', detalle: 'Actas de reunión desde semana 6; faltan semanas 3 y 4.' },
      { tipo: 'Indicador', detalle: 'Tablero de defectos actualizado al cierre de la semana en curso.' },
      { tipo: 'Entrevista', detalle: 'Supervisor: "esas semanas coincidieron con auditoría FIFA".' },
    ],
    respuesta: 'observacion',
    explicacion: 'El ritual existe y produce evidencia; la falla es puntual y justificada.',
    hallazgo:
      'Observación: la revisión semanal se cumple desde la semana 6, con dos ausencias sin registro de reprogramación.',
  },
  {
    id: 'aud-5',
    proceso: 'Producción',
    criterio: 'PR-TS-04 punto 8.3: plan de reacción documentado cuando la homologación cae bajo 90 %.',
    pregunta: '¿Existe plan de reacción documentado?',
    evidencias: [
      { tipo: 'Entrevista', detalle: '"Cuando cae, avisamos al jefe" — supervisor de termosellado.' },
      { tipo: 'Documento', detalle: 'No se presentó documento.' },
    ],
    respuesta: 'no-conformidad',
    explicacion: 'Escalación verbal no es plan documentado.',
    hallazgo:
      'No conformidad contra PR-TS-04 punto 8.3: no existe plan de reacción documentado; la respuesta depende de escalación verbal.',
  },
  {
    id: 'aud-6',
    proceso: 'Chip electrónico',
    criterio: 'PR-EL-02: el chip se prueba en banco antes del ensamblado (rechazo si falla en 3 lecturas consecutivas).',
    pregunta: '¿La prueba del chip cumple el criterio?',
    evidencias: [
      { tipo: 'Registro', detalle: 'Muestra de 40 chips: 5 aprobados con solo 1 lectura (no 3).' },
      { tipo: 'Observación', detalle: 'Operador: "para no atrasar el ensamble".' },
    ],
    respuesta: 'no-conformidad',
    explicacion: 'El criterio pide 3 lecturas; en 12.5 % de la muestra solo hay 1.',
    hallazgo:
      'No conformidad contra PR-EL-02: 5 de 40 chips aprobados con menos lecturas que las requeridas por el procedimiento.',
  },
];
