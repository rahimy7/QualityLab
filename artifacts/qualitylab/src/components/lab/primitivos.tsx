/** Piezas de interfaz compartidas por todos los laboratorios. */
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { Lightbulb, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducirMovimiento } from '@/lib/movimiento';
import { tonoColor } from '@/lib/palette';
import type { Tono } from '@/data/caso';

/* ------------------------------ Encabezados ----------------------------- */

export function EncabezadoPagina({
  eyebrow,
  titulo,
  intro,
  icono: Icono,
  acciones,
}: {
  eyebrow: string;
  titulo: string;
  intro: string;
  icono: LucideIcon;
  acciones?: ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-wrap items-start justify-between gap-4"
    >
      <div className="flex items-start gap-4">
        <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] sm:grid">
          <Icono size={21} />
        </div>
        <div>
          <div className="ql-mono text-[10px] uppercase tracking-[.17em] text-[hsl(var(--primary))]">{eyebrow}</div>
          <h1 className="ql-display mt-1 text-3xl font-bold leading-[1.05] sm:text-4xl">{titulo}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{intro}</p>
        </div>
      </div>
      {acciones ? <div className="flex flex-wrap items-center gap-2">{acciones}</div> : null}
    </motion.header>
  );
}

export function Panel({
  titulo,
  subtitulo,
  acciones,
  children,
  className,
  delay = 0,
}: {
  titulo?: string;
  subtitulo?: string;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn('ql-card rounded-2xl p-5 sm:p-6', className)}
    >
      {titulo ? (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="ql-display text-xl font-bold leading-tight">{titulo}</h2>
            {subtitulo ? (
              <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{subtitulo}</p>
            ) : null}
          </div>
          {/* Sin shrink-0: en móvil estas acciones suelen ser filas de chips que
              deben poder envolverse en el ancho disponible. */}
          {acciones ? <div className="flex min-w-0 flex-wrap gap-2">{acciones}</div> : null}
        </div>
      ) : null}
      {children}
    </motion.section>
  );
}

/* -------------------------------- Números -------------------------------- */

/** Contador animado: sube desde 0 al montar, como pide el guion de clase. */
export function Contador({
  valor,
  decimales = 1,
  sufijo = '',
  prefijo = '',
  className,
}: {
  valor: number;
  decimales?: number;
  sufijo?: string;
  prefijo?: string;
  className?: string;
}) {
  const animar = !useReducirMovimiento();
  const motionValue = useMotionValue(animar ? 0 : valor);
  const spring = useSpring(motionValue, animar ? { stiffness: 90, damping: 20, mass: 0.6 } : { duration: 0 });
  const texto = useTransform(spring, (v) =>
    `${prefijo}${v.toLocaleString('es-DO', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    })}${sufijo}`,
  );

  useEffect(() => {
    motionValue.set(valor);
  }, [valor, motionValue]);

  return <motion.span className={className}>{texto}</motion.span>;
}

export function Tile({
  label,
  valor,
  detalle,
  tono,
  icono: Icono,
  decimales = 1,
  sufijo = '',
}: {
  label: string;
  valor: number;
  detalle?: string;
  tono?: Tono;
  icono?: LucideIcon;
  decimales?: number;
  sufijo?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.5)] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="ql-mono min-w-0 truncate text-[10px] uppercase tracking-[-.02em] text-[hsl(var(--muted-foreground))]">
          {label}
        </div>
        {Icono ? <Icono size={14} className="shrink-0 text-[hsl(var(--muted-foreground))]" /> : null}
      </div>
      <div
        className="ql-display mt-1.5 text-[26px] font-bold leading-none"
        style={tono ? { color: tonoColor[tono] } : undefined}
      >
        <Contador valor={valor} decimales={decimales} sufijo={sufijo} />
      </div>
      {detalle ? (
        <div className="mt-1.5 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">{detalle}</div>
      ) : null}
    </div>
  );
}

/* -------------------------------- Semáforo ------------------------------- */

export function Semaforo({ tono, etiqueta, size = 'md' }: { tono: Tono; etiqueta: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
      )}
      style={{ backgroundColor: `${tonoColor[tono]}1f`, color: tonoColor[tono] }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tonoColor[tono] }} />
      {etiqueta}
    </span>
  );
}

export function Chip({
  children,
  activo,
  onClick,
  className,
}: {
  children: ReactNode;
  activo?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition',
        activo
          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]'
          : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]',
        onClick ? 'hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]' : '',
        className,
      )}
    >
      {children}
    </Comp>
  );
}

/* ------------------------------ Formularios ------------------------------ */

export function Campo({
  label,
  valor,
  onChange,
  placeholder,
  ayuda,
  area,
  tipo = 'text',
  opciones,
  className,
  testId,
}: {
  label: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  ayuda?: string;
  area?: boolean;
  tipo?: string;
  opciones?: string[];
  className?: string;
  testId?: string;
}) {
  const base =
    'w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background)/.6)] px-3 py-2.5 text-xs font-medium outline-none transition placeholder:text-[hsl(var(--muted-foreground)/.7)] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.18)]';

  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[.11em] text-[hsl(var(--muted-foreground))]">
        {label}
      </span>
      {opciones ? (
        <select data-testid={testId} value={valor} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="">Seleccionar…</option>
          {opciones.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : area ? (
        <textarea
          data-testid={testId}
          value={valor}
          rows={3}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(base, 'resize-y leading-5')}
        />
      ) : (
        <input
          data-testid={testId}
          type={tipo}
          value={valor}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
      {ayuda ? <span className="mt-1 block text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{ayuda}</span> : null}
    </label>
  );
}

export function Boton({
  children,
  onClick,
  variante = 'primario',
  disabled,
  className,
  testId,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: 'primario' | 'secundario' | 'fantasma';
  disabled?: boolean;
  className?: string;
  testId?: string;
  type?: 'button' | 'submit';
}) {
  const estilos = {
    primario:
      'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-110 disabled:opacity-45',
    secundario:
      'border border-[hsl(var(--border))] bg-[hsl(var(--background)/.6)] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] disabled:opacity-45',
    fantasma: 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] disabled:opacity-45',
  } as const;

  return (
    <button
      type={type}
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed',
        estilos[variante],
        className,
      )}
    >
      {children}
    </button>
  );
}

/* -------------------------------- Avisos --------------------------------- */

export function Hallazgo({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.12)] p-4"
    >
      <Lightbulb size={17} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />
      <div className="min-w-0">
        <div className="ql-mono text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
          {titulo ?? 'Hallazgo automático'}
        </div>
        <div className="mt-1 text-xs leading-5 text-[hsl(var(--foreground))]">{children}</div>
      </div>
    </motion.div>
  );
}

export function Formula({ expresion, explicacion }: { expresion: string; explicacion?: string }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)] p-3.5">
      <code className="ql-mono block text-[12px] font-semibold leading-5 text-[hsl(var(--foreground))]">
        {expresion}
      </code>
      {explicacion ? (
        <p className="mt-2 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">{explicacion}</p>
      ) : null}
    </div>
  );
}

export function ListaSeca({ items, tono = 'neutro' }: { items: string[]; tono?: 'neutro' | 'error' }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          <span
            className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: tono === 'error' ? tonoColor.critico : 'hsl(var(--primary))' }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
