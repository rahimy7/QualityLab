/**
 * Preferencia de movimiento reducido del sistema.
 *
 * Recharts anima por JavaScript, así que no basta con neutralizar las
 * animaciones CSS: hay que desactivarlas explícitamente. Si no, quien tenga
 * activada la preferencia ve el gráfico congelado en su estado inicial —es
 * decir, vacío— en lugar de verlo dibujado de una vez.
 */
import { useEffect, useState } from 'react';

const CONSULTA = '(prefers-reduced-motion: reduce)';

export function useReducirMovimiento(): boolean {
  const [reducir, setReducir] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(CONSULTA).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(CONSULTA);
    const alCambiar = () => setReducir(mq.matches);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);

  return reducir;
}
