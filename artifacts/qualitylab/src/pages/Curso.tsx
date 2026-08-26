import { useState } from 'react';
import { Link } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, GraduationCap } from 'lucide-react';
import { sesiones, teoria } from '@/data/teoria';
import { lab } from '@/data/misiones';
import { EncabezadoPagina, Panel } from '@/components/lab/primitivos';
import { ContenidoTeoria } from '@/components/lab/Teoria';

export default function Curso() {
  const [abierto, setAbierto] = useState<string | null>(teoria[0].id);
  const horas = teoria.reduce((acc, t) => acc + t.minutos, 0) / 60;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Mi curso"
        titulo="Métodos de análisis y medición de la mejora continua"
        intro={`Diez bloques conceptuales repartidos en cuatro sesiones. Cada uno se practica en el laboratorio correspondiente: aproximadamente ${horas.toFixed(1)} horas de contenido y el resto del módulo en la plataforma.`}
        icono={GraduationCap}
      />

      {sesiones.map((sesion, si) => {
        const bloques = teoria.filter((t) => t.sesion === sesion.numero);
        return (
          <Panel key={sesion.numero} titulo={sesion.titulo} subtitulo={`${sesion.foco} · ${sesion.horas} h`} delay={si * 0.05}>
            <div className="space-y-2">
              {bloques.map((bloque) => {
                const activo = abierto === bloque.id;
                const l = lab(bloque.labId);
                return (
                  <div key={bloque.id} className="overflow-hidden rounded-xl border border-[hsl(var(--border))]">
                    <button
                      type="button"
                      data-testid={`curso-${bloque.id}`}
                      onClick={() => setAbierto(activo ? null : bloque.id)}
                      className="flex w-full items-start justify-between gap-4 p-4 text-left"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold">{bloque.titulo}</h3>
                          <span className="ql-mono text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                            {bloque.minutos} min
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">{bloque.idea}</p>
                      </div>
                      <motion.span animate={{ rotate: activo ? 180 : 0 }} className="shrink-0 text-[hsl(var(--muted-foreground))]">
                        <ChevronDown size={16} />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {activo ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-[hsl(var(--border))] p-4">
                            <ContenidoTeoria bloque={bloque} />
                            <Link
                              href={l.ruta}
                              data-testid={`curso-practicar-${bloque.id}`}
                              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:underline"
                            >
                              Practicarlo en {l.titulo} <ArrowRight size={13} />
                            </Link>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
