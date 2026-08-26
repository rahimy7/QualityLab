/** Equipos de la sala. Los puntos de la sala son referencia; los del equipo
 *  propio se calculan con el avance real del participante. */
export interface Equipo {
  id: string;
  nombre: string;
  iniciales: string;
  puntosBase: number;
  integrantes: number;
  lema: string;
}

export const equipos: Equipo[] = [
  { id: 'kaizen', nombre: 'Equipo Kaizen', iniciales: 'KZ', puntosBase: 620, integrantes: 4, lema: 'Un poco mejor cada día.' },
  { id: 'sixsigma', nombre: 'Equipo Six Sigma', iniciales: 'SS', puntosBase: 585, integrantes: 4, lema: 'En Dios confiamos; los demás traigan datos.' },
  { id: 'deming', nombre: 'Equipo Deming', iniciales: 'DM', puntosBase: 540, integrantes: 5, lema: 'No basta hacer lo mejor: hay que saber qué hacer.' },
  { id: 'ishikawa', nombre: 'Equipo Ishikawa', iniciales: 'IK', puntosBase: 495, integrantes: 4, lema: 'La calidad empieza y termina en la educación.' },
  { id: 'juran', nombre: 'Equipo Juran', iniciales: 'JR', puntosBase: 470, integrantes: 4, lema: 'Los pocos vitales primero.' },
];
