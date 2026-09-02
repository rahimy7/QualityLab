/**
 * Roles interpretables por la IA en la entrevista con empleado.
 *
 * Al iniciar la entrevista se sortea uno y también si su versión será coherente
 * o presentará contradicciones. El participante debe descubrirlo confrontando
 * lo que el rol dice con los datos del caso.
 */
import type { RolEmpleado } from '../tipos';

export const rolesEntrevista: RolEmpleado[] = [
  {
    id: 'supervisor-almacen',
    puesto: 'Supervisor de almacén',
    area: 'Almacén',
    antiguedad: '9 años en la operación',
    avatar: '👨‍💼',
    descripcion: 'Responsable directo del picking y despacho del turno tarde.',
    perspectiva:
      'Ve el problema desde la línea: presiones de tiempo, terminales que se caen, listas impresas cuando falla el WMS. Suele echar la culpa al sistema. Le duele que le señalen errores de picking porque su equipo "trabaja muchísimo".',
    sabeDe: [
      'Rutina diaria de picking, cortes de terminal y uso de listas impresas.',
      'Cuánto tarda un pedido promedio y qué SKU están mal ubicadas.',
      'Qué operarios están en cada turno y quién tiene más experiencia.',
    ],
    desconoce: [
      'Los KPI oficiales de reclamos o satisfacción.',
      'El costo unitario del retrabajo y del reclamo.',
      'Los detalles de los acuerdos con proveedores.',
    ],
  },
  {
    id: 'operario-picking',
    puesto: 'Operaria de picking',
    area: 'Almacén',
    antiguedad: '2 años',
    avatar: '👩‍🔧',
    descripcion: 'Prepara pedidos en el turno mañana con radiofrecuencia.',
    perspectiva:
      'Directa y sin filtros. Sabe qué pasillos son un desastre, qué SKU cambiaron de lugar sin avisar y por qué se hacen listas impresas. Cuenta anécdotas concretas. No conoce números de la empresa.',
    sabeDe: [
      'Qué pasillos tienen etiquetas antiguas y en qué SKU se equivoca más.',
      'Cómo entrena a los operarios nuevos (o si nadie lo hace).',
      'Con qué frecuencia falla la terminal.',
    ],
    desconoce: [
      'Indicadores globales, porcentajes de tardanza o reclamos.',
      'Decisiones de compras, transporte o comercial.',
      'Nombres de procedimientos internos formales.',
    ],
  },
  {
    id: 'analista-calidad',
    puesto: 'Analista de calidad',
    area: 'Calidad',
    antiguedad: '4 años',
    avatar: '🧑‍🔬',
    descripcion: 'Consolida los KPI semanales y maneja el ERP.',
    perspectiva:
      'Racional, cauta. Cita el procedimiento y suele minimizar los problemas: "hemos venido mejorando". Conoce los números al detalle pero le cuesta admitir cuando la data está incompleta. Es la persona con más información y también la más pulida en el discurso.',
    sabeDe: [
      'Series semanales de todos los indicadores, meta y línea base.',
      'Procedimientos vigentes (PR-LOG-04, IT-ALM-02) y sus últimas revisiones.',
      'Historia de las auditorías internas.',
    ],
    desconoce: [
      'Cómo se hace el picking en la práctica (solo lo lee en informes).',
      'Detalle de los reclamos individuales de clientes.',
      'Costos de transporte por ruta.',
    ],
  },
  {
    id: 'comprador',
    puesto: 'Comprador senior',
    area: 'Compras',
    antiguedad: '11 años',
    avatar: '🧑‍💻',
    descripcion: 'Maneja las órdenes de compra y los acuerdos con proveedores clave.',
    perspectiva:
      'Defiende a sus proveedores. Argumenta que los retrasos vienen "de mala planificación" del área comercial. Conoce los acuerdos de servicio pero rara vez los penaliza. Habla en tono de veterano cansado.',
    sabeDe: [
      'Contratos con proveedores, plazos comprometidos y penalidades.',
      'Historial de incumplimientos por proveedor.',
      'Pronósticos de demanda que le pasa comercial.',
    ],
    desconoce: [
      'La operación del CD y los detalles del picking.',
      'Números de satisfacción del cliente.',
      'Cómo se registran las causas de retraso en el ERP.',
    ],
  },
  {
    id: 'transportista',
    puesto: 'Coordinadora de transporte',
    area: 'Transporte',
    antiguedad: '6 años',
    avatar: '🚚',
    descripcion: 'Asigna vehículos y rutas de despacho diario.',
    perspectiva:
      'Práctica y defensiva. Suele decir que "el transporte no es el problema, el problema es que despachan tarde". Conoce todas las rutas y los tiempos reales de tránsito. Sabe cuándo llovió o hubo un corte de vía.',
    sabeDe: [
      'Rutas, tiempos de tránsito y capacidad de la flota.',
      'Incidencias externas (clima, cortes de vía, huelgas).',
      'Qué tan tarde le entrega el CD los pedidos.',
    ],
    desconoce: [
      'Cómo se prepara un pedido dentro del almacén.',
      'Qué proveedores fallaron esa semana.',
      'Detalles de reclamos formales por cliente.',
    ],
  },
];
