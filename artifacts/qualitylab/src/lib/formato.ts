/** Formateo consistente para toda la plataforma (es-DO, punto decimal). */

export function num(valor: number, decimales = 1): string {
  if (!Number.isFinite(valor)) return '—';
  return valor.toLocaleString('es-DO', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

export function pct(valor: number, decimales = 1): string {
  return `${num(valor, decimales)} %`;
}

/** Puntos porcentuales: la unidad correcta para la diferencia entre dos %. */
export function pp(valor: number, decimales = 1): string {
  const signo = valor > 0 ? '+' : '';
  return `${signo}${num(valor, decimales)} pp`;
}

export function usd(valor: number, decimales = 0): string {
  return valor.toLocaleString('es-DO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/**
 * Pluralización en español. El plural se pasa completo cuando la frase lleva
 * adjetivo ("entrada registrada" → "entradas registradas") y no basta con
 * añadir una -s al final.
 */
export function plural(n: number, singular: string, formaPlural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : formaPlural}`;
}

export function valorP(p: number): string {
  if (p < 0.001) return 'p < 0.001';
  return `p = ${num(p, 3)}`;
}

/** Descarga un archivo generado en el navegador, sin servidor. */
export function descargar(nombre: string, contenido: string, tipo = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([`﻿${contenido}`], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
