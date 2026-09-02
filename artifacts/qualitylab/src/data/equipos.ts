/**
 * Equipos de la sala.
 *
 * El catálogo es el mismo que valida el servidor (`esGrupoValido`) y con el que
 * se etiquetan las filas de `grupos_avances`, así que vive en un solo sitio:
 * `lib/db/src/grupos.ts`. Aquí solo se reexporta con el nombre que usa el
 * frontend, para no tener dos listas que se puedan desincronizar.
 */
export { grupos as equipos, esGrupoValido } from '@workspace/db/catalogo';
export type { Grupo as Equipo } from '@workspace/db/catalogo';
