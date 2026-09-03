/**
 * Cuenta del participante.
 *
 * La sesión vive en una cookie httpOnly que pone el servidor, así que aquí no
 * se guarda ningún token: al arrancar se pregunta "¿quién soy?" y el navegador
 * adjunta la cookie solo. Eso evita tener credenciales en localStorage, donde
 * cualquier script de la página podría leerlas.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  grupoId: string;
}

export interface DatosRegistro {
  email: string;
  password: string;
  nombre: string;
  grupoId: string;
}

interface Contexto {
  usuario: Usuario | null;
  /** true mientras se comprueba si ya había sesión abierta. */
  comprobando: boolean;
  registrar: (datos: DatosRegistro) => Promise<void>;
  entrar: (email: string, password: string) => Promise<void>;
  salir: () => Promise<void>;
  actualizarPerfil: (datos: { nombre?: string; grupoId?: string }) => Promise<void>;
}

const AuthContext = createContext<Contexto | null>(null);

/** Convierte la respuesta de error de la API en algo que se pueda mostrar. */
async function fallo(r: Response): Promise<Error> {
  try {
    const cuerpo = (await r.json()) as { mensaje?: string };
    if (cuerpo.mensaje) return new Error(cuerpo.mensaje);
  } catch {
    // Respuesta sin JSON: nos quedamos con el código.
  }
  return new Error(`No se pudo completar la operación (HTTP ${r.status})`);
}

async function pedir<T>(ruta: string, opciones: RequestInit): Promise<T> {
  const r = await fetch(ruta, { headers: { 'content-type': 'application/json' }, ...opciones });
  if (!r.ok) throw await fallo(r);
  return (await r.json()) as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [comprobando, setComprobando] = useState(true);

  useEffect(() => {
    let vivo = true;
    fetch('/api/auth/yo')
      .then(async (r) => (r.status === 204 ? null : ((await r.json()) as Usuario)))
      .then((u) => {
        if (vivo) setUsuario(u);
      })
      .catch(() => {
        // Sin red no hay forma de saber quién es: se pide entrar de nuevo.
        if (vivo) setUsuario(null);
      })
      .finally(() => {
        if (vivo) setComprobando(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  const registrar = useCallback(async (datos: DatosRegistro) => {
    setUsuario(await pedir<Usuario>('/api/auth/registro', { method: 'POST', body: JSON.stringify(datos) }));
  }, []);

  const entrar = useCallback(async (email: string, password: string) => {
    setUsuario(
      await pedir<Usuario>('/api/auth/entrar', { method: 'POST', body: JSON.stringify({ email, password }) }),
    );
  }, []);

  const salir = useCallback(async () => {
    try {
      await fetch('/api/auth/salir', { method: 'POST' });
    } finally {
      setUsuario(null);
    }
  }, []);

  const actualizarPerfil = useCallback(async (datos: { nombre?: string; grupoId?: string }) => {
    setUsuario(await pedir<Usuario>('/api/auth/perfil', { method: 'PATCH', body: JSON.stringify(datos) }));
  }, []);

  const valor = useMemo(
    () => ({ usuario, comprobando, registrar, entrar, salir, actualizarPerfil }),
    [usuario, comprobando, registrar, entrar, salir, actualizarPerfil],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): Contexto {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
