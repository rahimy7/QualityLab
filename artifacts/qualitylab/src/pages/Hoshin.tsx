import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Compass, TriangleAlert, Wand2, X } from 'lucide-react';
import { responsables } from '@/data/caso';
import { useProgreso, type Hoshin as HoshinTipo } from '@/store/progreso';
import { tonoColor } from '@/lib/palette';
import { Boton, Campo, EncabezadoPagina, Hallazgo, Panel } from '@/components/lab/primitivos';
import { CoachQ } from '@/components/lab/CoachQ';
import { Teoria } from '@/components/lab/Teoria';
import { Quiz } from '@/components/lab/Quiz';
import { CierreMision } from '@/components/lab/CierreMision';

const ejemplo: HoshinTipo = {
  objetivo: 'Recuperar la confianza del cliente mayorista y detener la pérdida de cuentas clave',
  meta: 'Satisfacción de 72 % a 90 % al cierre del año fiscal',
  kpis: ['% de entregas a tiempo (OTIF)', '% de reclamos sobre pedidos', 'Tiempo de preparación de pedido'],
  iniciativas: [
    'Actualización y gobierno del maestro de ubicaciones',
    'Acuerdo de nivel de servicio con los tres proveedores críticos',
    'Ritual semanal de revisión de la promesa de entrega',
  ],
  responsables: ['Almacén', 'Compras', 'Logística'],
  cruces: ['0-0', '0-2', '1-0', '2-0', '2-1'],
};

function Nivel({
  etiqueta,
  contenido,
  delay,
  destacado,
}: {
  etiqueta: string;
  contenido: string;
  delay: number;
  destacado?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-xl border p-3.5 text-center ${
        destacado
          ? 'border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
          : 'border-[hsl(var(--border))] bg-[hsl(var(--background)/.5)]'
      }`}
    >
      <div
        className={`ql-mono text-[9px] uppercase tracking-[.16em] ${
          destacado ? 'opacity-75' : 'text-[hsl(var(--primary))]'
        }`}
      >
        {etiqueta}
      </div>
      <div className="mt-1 text-xs font-bold leading-5">{contenido || '—'}</div>
    </motion.div>
  );
}

export default function Hoshin() {
  const { estado, set } = useProgreso();
  const h = estado.hoshin;

  const actualizar = (parcial: Partial<HoshinTipo>) => set({ hoshin: { ...h, ...parcial } });

  const kpisLlenos = h.kpis.map((k, i) => ({ k, i })).filter(({ k }) => k.trim() !== '');
  const iniciativasLlenas = h.iniciativas.map((v, i) => ({ v, i })).filter(({ v }) => v.trim() !== '');

  const diagnostico = useMemo(() => {
    const iniciativasHuerfanas = iniciativasLlenas.filter(
      ({ i }) => !h.cruces.some((c) => c.startsWith(`${i}-`)),
    );
    const kpisSinIniciativa = kpisLlenos.filter(({ i }) => !h.cruces.some((c) => c.endsWith(`-${i}`)));
    const sinResponsable = iniciativasLlenas.filter(({ i }) => !h.responsables[i]?.trim());
    return { iniciativasHuerfanas, kpisSinIniciativa, sinResponsable };
  }, [h.cruces, h.responsables, iniciativasLlenas, kpisLlenos]);

  const matrizSana =
    iniciativasLlenas.length >= 2 &&
    kpisLlenos.length >= 2 &&
    diagnostico.iniciativasHuerfanas.length === 0 &&
    diagnostico.kpisSinIniciativa.length === 0 &&
    diagnostico.sinResponsable.length === 0;

  const alternarCruce = (ini: number, kpi: number) => {
    const clave = `${ini}-${kpi}`;
    set((prev) => ({
      hoshin: {
        ...prev.hoshin,
        cruces: prev.hoshin.cruces.includes(clave)
          ? prev.hoshin.cruces.filter((c) => c !== clave)
          : [...prev.hoshin.cruces, clave],
      },
    }));
  };

  const completo = h.objetivo.trim() !== '' && h.meta.trim() !== '';

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Misión 5 · Hoshin Kanri"
        titulo="Alinear el rumbo"
        intro="Una mejora operativa sobrevive cuando está enganchada a un objetivo que a la dirección le importa. Conecta estrategia, meta, indicadores, iniciativas y responsables, y revisa la matriz buscando huecos."
        icono={Compass}
        acciones={
          <Boton variante="secundario" testId="boton-ejemplo-hoshin" onClick={() => actualizar(ejemplo)}>
            <Wand2 size={14} /> Cargar despliegue del caso
          </Boton>
        }
      />

      <CoachQ labId="hoshin" />

      <Panel titulo="La cascada" subtitulo="De la estrategia al responsable, en un solo camino">
        <div className="mx-auto max-w-lg space-y-1">
          <Nivel etiqueta="Objetivo estratégico" contenido={h.objetivo} delay={0.05} destacado />
          <div className="flex justify-center py-0.5">
            <ArrowDown size={15} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <Nivel etiqueta="Meta anual" contenido={h.meta} delay={0.12} />
          <div className="flex justify-center py-0.5">
            <ArrowDown size={15} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <Nivel etiqueta="Indicadores" contenido={kpisLlenos.map(({ k }) => k).join(' · ')} delay={0.19} />
          <div className="flex justify-center py-0.5">
            <ArrowDown size={15} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <Nivel etiqueta="Iniciativas" contenido={iniciativasLlenas.map(({ v }) => v).join(' · ')} delay={0.26} />
          <div className="flex justify-center py-0.5">
            <ArrowDown size={15} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <Nivel etiqueta="Responsables" contenido={h.responsables.filter(Boolean).join(' · ')} delay={0.33} />
        </div>
      </Panel>

      <Panel titulo="Tu despliegue" subtitulo="Traduce el hallazgo de causa raíz en una apuesta con dueño" delay={0.05}>
        <div className="grid gap-4">
          <Campo
            label="Objetivo estratégico"
            valor={h.objetivo}
            onChange={(v) => actualizar({ objetivo: v })}
            placeholder="En lenguaje de negocio, no de proceso"
            testId="hoshin-objetivo"
          />
          <Campo
            label="Meta anual"
            valor={h.meta}
            onChange={(v) => actualizar({ meta: v })}
            placeholder="De X a Y, con fecha"
            testId="hoshin-meta"
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <div className="ql-mono mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
                Indicadores
              </div>
              <div className="space-y-2">
                {h.kpis.map((k, i) => (
                  <input
                    key={i}
                    value={k}
                    data-testid={`hoshin-kpi-${i}`}
                    onChange={(e) => actualizar({ kpis: h.kpis.map((v, j) => (j === i ? e.target.value : v)) })}
                    placeholder={`KPI ${i + 1}`}
                    className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background)/.6)] px-2.5 py-2 text-[11px] outline-none focus:border-[hsl(var(--primary))]"
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="ql-mono mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
                Iniciativas
              </div>
              <div className="space-y-2">
                {h.iniciativas.map((k, i) => (
                  <input
                    key={i}
                    value={k}
                    data-testid={`hoshin-iniciativa-${i}`}
                    onChange={(e) =>
                      actualizar({ iniciativas: h.iniciativas.map((v, j) => (j === i ? e.target.value : v)) })
                    }
                    placeholder={`Iniciativa ${i + 1}`}
                    className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background)/.6)] px-2.5 py-2 text-[11px] outline-none focus:border-[hsl(var(--primary))]"
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="ql-mono mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
                Responsables
              </div>
              <div className="space-y-2">
                {h.responsables.map((r, i) => (
                  <select
                    key={i}
                    value={r}
                    data-testid={`hoshin-responsable-${i}`}
                    onChange={(e) =>
                      actualizar({ responsables: h.responsables.map((v, j) => (j === i ? e.target.value : v)) })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background)/.6)] px-2.5 py-2 text-[11px] outline-none focus:border-[hsl(var(--primary))]"
                  >
                    <option value="">Dueño de la iniciativa {i + 1}…</option>
                    {responsables.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel titulo="X-Matrix" subtitulo="Marca cada cruce donde una iniciativa mueve realmente ese indicador" delay={0.1}>
        <div className="overflow-x-auto">
          <table className="min-w-[520px] border-collapse text-[11px]">
            <thead>
              <tr>
                <th className="w-[220px] p-2" />
                {h.kpis.map((k, i) => (
                  <th key={i} className="p-2 align-bottom">
                    <div className="ql-mono mx-auto h-[110px] w-6 whitespace-nowrap text-left text-[10px] font-bold text-[hsl(var(--muted-foreground))] [writing-mode:vertical-rl]">
                      {k || `KPI ${i + 1}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {h.iniciativas.map((ini, i) => (
                <tr key={i}>
                  <td className="border-t border-[hsl(var(--border))] p-2 text-[11px] font-semibold">
                    {ini || <span className="text-[hsl(var(--muted-foreground))]">Iniciativa {i + 1}</span>}
                  </td>
                  {h.kpis.map((_, j) => {
                    const activo = h.cruces.includes(`${i}-${j}`);
                    return (
                      <td key={j} className="border-t border-[hsl(var(--border))] p-2 text-center">
                        <button
                          type="button"
                          data-testid={`cruce-${i}-${j}`}
                          onClick={() => alternarCruce(i, j)}
                          className="grid h-7 w-7 place-items-center rounded-lg transition"
                          style={{
                            backgroundColor: activo ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                            color: activo ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                          }}
                          aria-label={`Cruce iniciativa ${i + 1} con KPI ${j + 1}`}
                        >
                          {activo ? <X size={13} strokeWidth={3} /> : <span className="text-[10px]">·</span>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 space-y-2">
          {matrizSana ? (
            <Hallazgo titulo="Despliegue coherente">
              Cada iniciativa mueve al menos un indicador declarado, cada indicador tiene una iniciativa que lo trabaja
              y todas tienen dueño. Este es el mapa que se lleva a la revisión de dirección.
            </Hallazgo>
          ) : (
            <>
              {diagnostico.iniciativasHuerfanas.map(({ v, i }) => (
                <div key={`h-${i}`} className="flex items-start gap-2 rounded-xl p-3" style={{ backgroundColor: `${tonoColor.alerta}16` }}>
                  <TriangleAlert size={14} className="mt-px shrink-0" style={{ color: tonoColor.alerta }} />
                  <p className="text-[11px] leading-4">
                    <strong>Iniciativa huérfana:</strong> «{v}» no cruza con ningún KPI. Consume recursos sin mover
                    nada de lo que la dirección está mirando.
                  </p>
                </div>
              ))}
              {diagnostico.kpisSinIniciativa.map(({ k, i }) => (
                <div key={`k-${i}`} className="flex items-start gap-2 rounded-xl p-3" style={{ backgroundColor: `${tonoColor.alerta}16` }}>
                  <TriangleAlert size={14} className="mt-px shrink-0" style={{ color: tonoColor.alerta }} />
                  <p className="text-[11px] leading-4">
                    <strong>Indicador sin iniciativa:</strong> «{k}» se mide, pero nadie lo está trabajando.
                  </p>
                </div>
              ))}
              {diagnostico.sinResponsable.map(({ v, i }) => (
                <div key={`r-${i}`} className="flex items-start gap-2 rounded-xl p-3" style={{ backgroundColor: `${tonoColor.alerta}16` }}>
                  <TriangleAlert size={14} className="mt-px shrink-0" style={{ color: tonoColor.alerta }} />
                  <p className="text-[11px] leading-4">
                    <strong>Sin dueño:</strong> «{v}» no tiene responsable asignado. En la revisión no habrá quién
                    responda por ella.
                  </p>
                </div>
              ))}
              {iniciativasLlenas.length < 2 || kpisLlenos.length < 2 ? (
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  Completa al menos dos indicadores y dos iniciativas para que la matriz tenga algo que revisar.
                </p>
              ) : null}
            </>
          )}
        </div>
      </Panel>

      <Teoria labId="hoshin" />

      <Panel delay={0.15}>
        <Quiz labId="hoshin" titulo="Ponlo a prueba" />
      </Panel>

      <CierreMision
        clave="hoshin"
        requisitos={[
          { label: 'Objetivo estratégico y meta anual definidos', cumplido: completo },
          { label: 'Al menos dos KPI y dos iniciativas', cumplido: kpisLlenos.length >= 2 && iniciativasLlenas.length >= 2 },
          { label: 'Matriz sin iniciativas huérfanas ni KPI sueltos', cumplido: matrizSana },
          { label: 'Respondiste el ejercicio', cumplido: Boolean(estado.quiz['hoshin-1']) },
        ]}
        siguiente={{ ruta: '/estadistica', label: 'Ir a Statistics Lab' }}
      />
    </div>
  );
}
