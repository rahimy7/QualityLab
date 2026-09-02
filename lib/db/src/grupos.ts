/**
 * Catálogo de grupos predefinidos del aula: el participante selecciona un grupo
 * al inicio, su avance se etiqueta con ese id y el facilitador revisa por grupo.
 *
 * Fuente única para cliente y servidor. Se expone como `@workspace/db/catalogo`
 * justamente porque este archivo no importa nada: el frontend puede tomarlo sin
 * arrastrar `pg` ni la conexión a la base, que sí viven en el export raíz.
 */
export interface Grupo {
  id: string;
  nombre: string;
  iniciales: string;
  integrantes: number;
  lema: string;
}

export const grupos: Grupo[] = [
  { id: 'kaizen', nombre: 'Equipo Kaizen', iniciales: 'KZ', integrantes: 4, lema: 'Un poco mejor cada día.' },
  { id: 'sixsigma', nombre: 'Equipo Six Sigma', iniciales: 'SS', integrantes: 4, lema: 'En Dios confiamos; los demás traigan datos.' },
  { id: 'deming', nombre: 'Equipo Deming', iniciales: 'DM', integrantes: 5, lema: 'No basta hacer lo mejor: hay que saber qué hacer.' },
  { id: 'ishikawa', nombre: 'Equipo Ishikawa', iniciales: 'IK', integrantes: 4, lema: 'La calidad empieza y termina en la educación.' },
  { id: 'juran', nombre: 'Equipo Juran', iniciales: 'JR', integrantes: 4, lema: 'Los pocos vitales primero.' },
];

const idSet = new Set(grupos.map((g) => g.id));
export function esGrupoValido(id: string | null | undefined): id is string {
  return !!id && idSet.has(id);
}
