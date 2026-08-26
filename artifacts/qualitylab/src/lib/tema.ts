/** Tema claro/oscuro con preferencia persistida y respeto por el sistema. */
import { useCallback, useEffect, useState } from 'react';

const CLAVE = 'qualitylab360.tema';

type Tema = 'claro' | 'oscuro';

function inicial(): Tema {
  if (typeof window === 'undefined') return 'claro';
  const guardado = window.localStorage.getItem(CLAVE);
  if (guardado === 'claro' || guardado === 'oscuro') return guardado;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

export function useTema(): { tema: Tema; alternar: () => void } {
  const [tema, setTema] = useState<Tema>(inicial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro');
    try {
      window.localStorage.setItem(CLAVE, tema);
    } catch {
      // Sin almacenamiento la preferencia solo dura la sesión.
    }
  }, [tema]);

  const alternar = useCallback(() => setTema((t) => (t === 'claro' ? 'oscuro' : 'claro')), []);
  return { tema, alternar };
}
