/**
 * Hash de contraseñas con scrypt, que viene en Node y no añade dependencias
 * nativas al despliegue.
 *
 * El formato guardado incluye los parámetros de coste: si en el futuro se
 * suben, las contraseñas viejas siguen verificándose con los suyos.
 */
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derivar = promisify(scrypt) as (
  clave: string,
  sal: Buffer,
  largo: number,
  opciones: { N: number; r: number; p: number },
) => Promise<Buffer>;

const COSTE = { N: 16384, r: 8, p: 1 };
const LARGO = 64;

export async function hashearPassword(password: string): Promise<string> {
  const sal = randomBytes(16);
  const hash = await derivar(password, sal, LARGO, COSTE);
  return `scrypt$${COSTE.N}$${COSTE.r}$${COSTE.p}$${sal.toString('hex')}$${hash.toString('hex')}`;
}

export async function verificarPassword(password: string, guardado: string): Promise<boolean> {
  const partes = guardado.split('$');
  if (partes.length !== 6 || partes[0] !== 'scrypt') return false;
  const [, n, r, p, salHex, hashHex] = partes;
  try {
    const esperado = Buffer.from(hashHex, 'hex');
    const calculado = await derivar(password, Buffer.from(salHex, 'hex'), esperado.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    // Comparación en tiempo constante: comparar con === filtra información
    // sobre cuántos bytes coinciden.
    return calculado.length === esperado.length && timingSafeEqual(calculado, esperado);
  } catch {
    return false;
  }
}
