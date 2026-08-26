/** Q, el coach del módulo: interviene con la pregunta incómoda del momento. */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, RefreshCw } from 'lucide-react';
import { frasesQ } from '@/data/coach';

export function CoachQ({ labId, nota }: { labId: string; nota?: string }) {
  const frases = frasesQ[labId] ?? [];
  const [indice, setIndice] = useState(0);
  const texto = nota ?? frases[indice % Math.max(frases.length, 1)];
  if (!texto) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-[hsl(var(--primary))] p-4 text-[hsl(var(--primary-foreground))]">
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
      >
        <Bot size={18} />
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className="ql-mono text-[10px] uppercase tracking-[.15em] opacity-75">Q · Coach de mejora continua</div>
        <AnimatePresence mode="wait">
          <motion.p
            key={texto}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1 text-sm font-semibold leading-6"
          >
            {texto}
          </motion.p>
        </AnimatePresence>
      </div>
      {!nota && frases.length > 1 ? (
        <button
          type="button"
          data-testid="boton-coach-siguiente"
          onClick={() => setIndice((i) => i + 1)}
          className="shrink-0 rounded-lg p-1.5 opacity-70 transition hover:opacity-100"
          aria-label="Otra intervención de Q"
        >
          <RefreshCw size={15} />
        </button>
      ) : null}
    </div>
  );
}
