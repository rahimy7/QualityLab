/**
 * Paleta de gráficos leída desde las variables CSS del tema.
 *
 * Los atributos de presentación SVG no resuelven `var(--x)`, así que se leen
 * los valores computados y se vuelven a leer cuando cambia el tema.
 */
import { useEffect, useState } from 'react';

export interface Paleta {
  series: string[];
  primary: string;
  accent: string;
  destructive: string;
  foreground: string;
  muted: string;
  border: string;
  grid: string;
  ok: string;
  alerta: string;
  critico: string;
}

const RESPALDO: Paleta = {
  series: ['#2c9189', '#f4bd45', '#e27361', '#6697a8', '#a07fc0'],
  primary: '#2c9189',
  accent: '#f4bd45',
  destructive: '#c94f3d',
  foreground: '#1c2028',
  muted: '#6b7280',
  border: '#dcd9d0',
  grid: 'rgba(120,120,120,0.18)',
  ok: '#2c9189',
  alerta: '#e0a020',
  critico: '#c94f3d',
};

function hsl(estilo: CSSStyleDeclaration, nombre: string, respaldo: string): string {
  const valor = estilo.getPropertyValue(nombre).trim();
  return valor ? `hsl(${valor})` : respaldo;
}

function leer(): Paleta {
  if (typeof window === 'undefined') return RESPALDO;
  const estilo = getComputedStyle(document.documentElement);
  const series = [1, 2, 3, 4, 5].map((n, i) => hsl(estilo, `--chart-${n}`, RESPALDO.series[i]));
  return {
    series,
    primary: hsl(estilo, '--primary', RESPALDO.primary),
    accent: hsl(estilo, '--accent', RESPALDO.accent),
    destructive: hsl(estilo, '--destructive', RESPALDO.destructive),
    foreground: hsl(estilo, '--foreground', RESPALDO.foreground),
    muted: hsl(estilo, '--muted-foreground', RESPALDO.muted),
    border: hsl(estilo, '--border', RESPALDO.border),
    grid: hsl(estilo, '--border', RESPALDO.border),
    // Semáforo fijo: verde/ámbar/rojo deben significar lo mismo en ambos temas.
    ok: '#2f9e6e',
    alerta: '#e0a020',
    critico: '#d1523f',
  };
}

export function usePaleta(): Paleta {
  const [paleta, setPaleta] = useState<Paleta>(leer);

  useEffect(() => {
    const actualizar = () => setPaleta(leer());
    actualizar();
    const observer = new MutationObserver(actualizar);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return paleta;
}

export const tonoColor: Record<'ok' | 'alerta' | 'critico', string> = {
  ok: '#2f9e6e',
  alerta: '#e0a020',
  critico: '#d1523f',
};
