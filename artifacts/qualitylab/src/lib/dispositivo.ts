/**
 * Identidad del aparato, sin cuentas ni contraseñas.
 *
 * Se genera una vez y vive en localStorage. Es lo que permite que el
 * participante entre con un QR y siga trabajando; para recuperar el avance en
 * otro teléfono basta el código de la sesión y su nombre.
 */
const CLAVE = 'qualitylab360.dispositivo';

function nuevoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `disp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function idDispositivo(): string {
  try {
    const guardado = window.localStorage.getItem(CLAVE);
    if (guardado && guardado.length >= 8) return guardado;
    const id = nuevoId();
    window.localStorage.setItem(CLAVE, id);
    return id;
  } catch {
    // Modo privado: el id dura la sesión y el avance no se podrá recuperar.
    return nuevoId();
  }
}
