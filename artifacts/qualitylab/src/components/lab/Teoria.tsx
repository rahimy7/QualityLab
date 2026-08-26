/** Bloque teórico plegable que acompaña a cada laboratorio. */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronDown } from 'lucide-react';
import { teoriaDe, type BloqueTeoria } from '@/data/teoria';
import { Formula, ListaSeca } from './primitivos';

export function ContenidoTeoria({ bloque }: { bloque: BloqueTeoria }) {
  return (
    <div className="space-y-5">
      <p className="text-sm font-semibold leading-6 text-[hsl(var(--foreground))]">{bloque.definicion}</p>

      <div>
        <h4 className="ql-mono mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
          Cuándo se usa
        </h4>
        <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">{bloque.cuando}</p>
      </div>

      {bloque.formula ? (
        <div>
          <h4 className="ql-mono mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
            Fórmula
          </h4>
          <Formula expresion={bloque.formula.expresion} explicacion={bloque.formula.explicacion} />
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <h4 className="ql-mono mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
            Cómo se hace
          </h4>
          <ol className="space-y-2">
            {bloque.pasos.map((paso, i) => (
              <li key={i} className="flex gap-2.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                <span className="ql-mono mt-px grid h-4 w-4 shrink-0 place-items-center rounded bg-[hsl(var(--primary)/.14)] text-[9px] font-bold text-[hsl(var(--primary))]">
                  {i + 1}
                </span>
                <span>{paso}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h4 className="ql-mono mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[#d1523f]">
            Errores frecuentes
          </h4>
          <ListaSeca items={bloque.errores} tono="error" />
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)] p-3.5">
        <div className="ql-mono mb-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">
          En el caso
        </div>
        <p className="text-xs leading-5">{bloque.ejemplo}</p>
      </div>
    </div>
  );
}

export function Teoria({ labId, abiertoInicial = false }: { labId: string; abiertoInicial?: boolean }) {
  const bloque = teoriaDe(labId);
  const [abierto, setAbierto] = useState(abiertoInicial);
  if (!bloque) return null;

  return (
    <section className="ql-card overflow-hidden rounded-2xl">
      <button
        type="button"
        data-testid={`teoria-${labId}`}
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]">
            <BookOpen size={17} />
          </div>
          <div>
            <div className="ql-mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary))]">
              Marco conceptual · {bloque.minutos} min
            </div>
            <h3 className="ql-display mt-0.5 text-lg font-bold">{bloque.titulo}</h3>
            <p className="mt-1 max-w-xl text-xs leading-5 text-[hsl(var(--muted-foreground))]">{bloque.idea}</p>
          </div>
        </div>
        <motion.span animate={{ rotate: abierto ? 180 : 0 }} className="shrink-0 text-[hsl(var(--muted-foreground))]">
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {abierto ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-[hsl(var(--border))] p-5 pt-5">
              <ContenidoTeoria bloque={bloque} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
