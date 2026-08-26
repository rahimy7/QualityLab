/**
 * Cierre de misión: no se completa con un clic ciego. Muestra los requisitos
 * que el laboratorio verificó y solo entonces habilita los Quality Points.
 */
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Lock, Trophy } from 'lucide-react';
import { misiones } from '@/data/misiones';
import { useProgreso } from '@/store/progreso';
import { tonoColor } from '@/lib/palette';
import { Boton } from './primitivos';

export interface Requisito {
  label: string;
  cumplido: boolean;
}

export function CierreMision({
  clave,
  requisitos,
  siguiente,
}: {
  clave: string;
  requisitos: Requisito[];
  siguiente?: { ruta: string; label: string };
}) {
  const { estado, completarMision } = useProgreso();
  const mision = misiones.find((m) => m.clave === clave);
  if (!mision) return null;

  const completada = estado.misiones.includes(clave);
  const listo = requisitos.every((r) => r.cumplido);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="ql-card rounded-2xl p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{
              backgroundColor: completada ? `${tonoColor.ok}1f` : 'hsl(var(--muted))',
              color: completada ? tonoColor.ok : 'hsl(var(--muted-foreground))',
            }}
          >
            {completada ? <Trophy size={19} /> : <Lock size={18} />}
          </div>
          <div>
            <div className="ql-mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary))]">
              Misión {mision.id} · {mision.kicker}
            </div>
            <h3 className="ql-display mt-0.5 text-lg font-bold">{mision.titulo}</h3>
            <p className="mt-1 max-w-lg text-xs leading-5 text-[hsl(var(--muted-foreground))]">{mision.evidencia}</p>
          </div>
        </div>
        <div className="ql-mono shrink-0 rounded-lg bg-[hsl(var(--accent)/.25)] px-2.5 py-1.5 text-[11px] font-bold text-[hsl(var(--foreground))]">
          +{mision.puntos} QP
        </div>
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {requisitos.map((req) => (
          <li key={req.label} className="flex items-start gap-2 text-xs leading-5">
            <span
              className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full"
              style={{
                backgroundColor: req.cumplido ? tonoColor.ok : 'hsl(var(--muted))',
                color: req.cumplido ? '#fff' : 'hsl(var(--muted-foreground))',
              }}
            >
              {req.cumplido ? <Check size={11} strokeWidth={3} /> : <span className="text-[9px]">·</span>}
            </span>
            <span className={req.cumplido ? '' : 'text-[hsl(var(--muted-foreground))]'}>{req.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Boton
          testId={`completar-${clave}`}
          disabled={!listo || completada}
          onClick={() => completarMision(clave)}
        >
          {completada ? 'Misión completada' : listo ? 'Registrar misión' : 'Faltan requisitos'}
        </Boton>
        {siguiente ? (
          <Link
            href={siguiente.ruta}
            data-testid={`siguiente-${clave}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:underline"
          >
            {siguiente.label} <ArrowRight size={14} />
          </Link>
        ) : null}
      </div>
    </motion.section>
  );
}
