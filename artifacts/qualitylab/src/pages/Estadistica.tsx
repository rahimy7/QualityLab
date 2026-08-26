import { useEffect, useMemo, useState } from 'react';
import { Activity, Check, Target } from 'lucide-react';
import { muestraPreparacion, operarios, pedidosMuestra, semanas, series, serie } from '@/data/series';
import { useProgreso } from '@/store/progreso';
import { num, pct } from '@/lib/formato';
import { tonoColor } from '@/lib/palette';
import {
  capability,
  controlLimits,
  describe,
  linearRegression,
  nelsonRules,
  sturgesBins,
  trendSlope,
} from '@/lib/stats';
import { Chip, EncabezadoPagina, Formula, Hallazgo, Panel, Tile } from '@/components/lab/primitivos';
import { CartaControl, GraficoDispersion, GraficoTendencia, Histograma } from '@/components/charts/graficos';
import { CoachQ } from '@/components/lab/CoachQ';
import { Teoria } from '@/components/lab/Teoria';
import { Quiz } from '@/components/lab/Quiz';

type Vista = 'tendencia' | 'distribucion' | 'relacion' | 'control';

const vistas: Array<{ id: Vista; label: string; pregunta: string }> = [
  { id: 'tendencia', label: 'Tendencia', pregunta: '¿Cómo evoluciona en el tiempo?' },
  { id: 'distribucion', label: 'Distribución', pregunta: '¿Cómo se reparten los valores?' },
  { id: 'relacion', label: 'Relación', pregunta: '¿Se mueven juntas dos variables?' },
  { id: 'control', label: 'Control', pregunta: '¿El proceso es estable?' },
];

const relaciones = [
  {
    id: 'capacitacion',
    titulo: 'Horas de capacitación vs. errores de picking',
    x: 'Horas de capacitación',
    y: 'Errores en el periodo',
    puntos: operarios.map((o) => ({ x: o.horasCapacitacion, y: o.erroresPicking, id: o.id })),
    nota: 'Relación inversa: a más horas, menos errores. Es una hipótesis fuerte, no una causa demostrada.',
  },
  {
    id: 'antiguedad',
    titulo: 'Antigüedad vs. errores de picking',
    x: 'Antigüedad (meses)',
    y: 'Errores en el periodo',
    puntos: operarios.map((o) => ({ x: o.antiguedadMeses, y: o.erroresPicking, id: o.id })),
    nota: 'Relación débil: la experiencia por sí sola no explica el desempeño. Contrastarla evita conclusiones fáciles.',
  },
  {
    id: 'lineas',
    titulo: 'Líneas por pedido vs. tiempo de preparación',
    x: 'Líneas del pedido',
    y: 'Minutos de preparación',
    puntos: pedidosMuestra.map((p) => ({ x: p.lineas, y: p.minutos, id: p.id })),
    nota: 'Relación positiva y casi lineal: el tamaño del pedido explica buena parte del tiempo. Útil para normalizar el indicador.',
  },
];

export default function Estadistica() {
  const { estado, set, otorgarLogro } = useProgreso();
  const [vista, setVista] = useState<Vista>('tendencia');
  const [serieId, setSerieId] = useState('entregas');
  const [relacionId, setRelacionId] = useState('capacitacion');
  const [bins, setBins] = useState(sturgesBins(muestraPreparacion.length));
  // Los límites se calculan sobre el periodo base: una serie que ya incluye la
  // mejora mezcla dos procesos distintos y los límites dejan de significar nada.
  const [ventana, setVentana] = useState<'base' | 'completa'>('base');

  const s = serie(serieId);
  const resumen = useMemo(() => describe(s.valores), [s]);
  const pendiente = useMemo(() => trendSlope(s.valores), [s]);

  const muestra = muestraPreparacion;
  const resumenMuestra = useMemo(() => describe(muestra), [muestra]);
  const cap = useMemo(() => capability(muestra, null, 50), [muestra]);

  const relacion = relaciones.find((r) => r.id === relacionId) ?? relaciones[0];
  const reg = useMemo(() => linearRegression(relacion.puntos), [relacion]);

  const serieControl = serie(estado.control.serieId);
  const valoresControl = useMemo(
    () => (ventana === 'base' ? serieControl.valores.slice(0, 12) : serieControl.valores),
    [serieControl, ventana],
  );
  const limites = useMemo(() => controlLimits(valoresControl), [valoresControl]);
  const violaciones = useMemo(() => nelsonRules(valoresControl, limites), [valoresControl, limites]);
  const indicesSenal = useMemo(() => [...new Set(violaciones.map((v) => v.index))], [violaciones]);
  const marcados = estado.control.puntosMarcados;

  const acertoSenal =
    indicesSenal.length > 0 &&
    marcados.length > 0 &&
    indicesSenal.every((i) => marcados.includes(i)) &&
    marcados.every((i) => indicesSenal.includes(i));

  useEffect(() => {
    if (acertoSenal) otorgarLogro('control-especial');
  }, [acertoSenal, otorgarLogro]);

  const marcar = (indice: number) => {
    set((prev) => ({
      control: {
        ...prev.control,
        puntosMarcados: prev.control.puntosMarcados.includes(indice)
          ? prev.control.puntosMarcados.filter((i) => i !== indice)
          : [...prev.control.puntosMarcados, indice],
      },
    }));
  };

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Statistics Lab"
        titulo="Que la estadística tenga sentido"
        intro="Cuatro preguntas, cuatro gráficos. El objetivo no es calcular: es saber qué gráfico responde la pregunta que tienes delante, y qué no puedes concluir con él."
        icono={Activity}
      />

      <CoachQ labId="estadistica" />

      <div className="flex flex-wrap gap-1.5">
        {vistas.map((v) => (
          <Chip key={v.id} activo={vista === v.id} onClick={() => setVista(v.id)}>
            {v.label}
          </Chip>
        ))}
      </div>

      {vista === 'tendencia' ? (
        <>
          <Panel
            titulo="Tendencia"
            subtitulo={vistas[0].pregunta}
            acciones={
              <div className="flex flex-wrap gap-1.5">
                {series.map((op) => (
                  <Chip key={op.id} activo={serieId === op.id} onClick={() => setSerieId(op.id)}>
                    {op.label}
                  </Chip>
                ))}
              </div>
            }
          >
            <p className="mb-4 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{s.descripcion}</p>
            <GraficoTendencia
              valores={s.valores}
              etiquetas={semanas.map((n) => `S${n}`)}
              meta={s.meta}
              unidad={s.unidad}
              nombre={s.label}
              intervencion={13}
              suavizado
              altura={310}
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Tile label="Promedio 24 semanas" valor={resumen.mean} sufijo={` ${s.unidad}`} />
              <Tile label="Desviación estándar" valor={resumen.sd} sufijo={` ${s.unidad}`} />
              <Tile label="Coef. de variación" valor={resumen.cv} sufijo=" %" />
              <Tile label="Cambio por semana" valor={pendiente} sufijo={` ${s.unidad}`} decimales={2} />
            </div>
            <div className="mt-4">
              <Hallazgo>
                La serie promedia {num(resumen.mean)} {s.unidad} con una desviación de {num(resumen.sd)} y una pendiente
                de {num(pendiente, 2)} {s.unidad} por semana. La media móvil de 3 periodos (línea punteada) es lo que se
                debe leer para hablar de tendencia: el dato semanal aislado incluye ruido que no es información.
              </Hallazgo>
            </div>
          </Panel>
        </>
      ) : null}

      {vista === 'distribucion' ? (
        <>
          <Panel
            titulo="Histograma del tiempo de preparación"
            subtitulo={`${muestra.length} mediciones individuales del periodo base · ${vistas[1].pregunta}`}
            acciones={
              <div className="flex items-center gap-2">
                <span className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                  Intervalos
                </span>
                <input
                  type="range"
                  min={4}
                  max={14}
                  value={bins}
                  onChange={(e) => setBins(Number(e.target.value))}
                  data-testid="slider-bins"
                  className="h-1.5 w-28 cursor-pointer appearance-none rounded-full bg-[hsl(var(--muted))] accent-[hsl(var(--primary))]"
                />
                <span className="ql-mono text-xs font-bold text-[hsl(var(--primary))]">{bins}</span>
              </div>
            }
          >
            <Histograma valores={muestra} bins={bins} especificacion={50} unidad="min" altura={300} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Tile label="Media" valor={resumenMuestra.mean} sufijo=" min" />
              <Tile label="Mediana" valor={resumenMuestra.median} sufijo=" min" />
              <Tile label="Desviación" valor={resumenMuestra.sd} sufijo=" min" />
              <Tile
                label="Cpk (LSE 50 min)"
                valor={cap.cpk}
                decimales={2}
                tono={cap.cpk >= 1.33 ? 'ok' : cap.cpk >= 1 ? 'alerta' : 'critico'}
                detalle={`Proceso ${cap.verdict}`}
              />
            </div>
            <div className="mt-4 space-y-3">
              <Formula
                expresion="Cpk = mín[(LSE − X̄) ÷ 3σ, (X̄ − LIE) ÷ 3σ]"
                explicacion="Compara la distancia a la especificación con la dispersión del proceso. Cpk ≥ 1.33 se considera capaz; por debajo de 1.0 el proceso genera fuera de especificación de forma habitual."
              />
              <Hallazgo>
                La media es {num(resumenMuestra.mean)} min y la mediana {num(resumenMuestra.median)} min. Que la media
                sea mayor delata la cola derecha: un grupo de pedidos tarda mucho más que el resto. Ese grupo —no el
                promedio— es donde está el problema, y es exactamente lo que un reporte de "tiempo promedio" esconde.
              </Hallazgo>
            </div>
          </Panel>
        </>
      ) : null}

      {vista === 'relacion' ? (
        <Panel
          titulo="Dispersión y correlación"
          subtitulo={vistas[2].pregunta}
          acciones={
            <div className="flex flex-wrap gap-1.5">
              {relaciones.map((r) => (
                <Chip key={r.id} activo={relacionId === r.id} onClick={() => setRelacionId(r.id)}>
                  {r.titulo.split(' vs. ')[0]}
                </Chip>
              ))}
            </div>
          }
        >
          <h3 className="mb-3 text-sm font-bold">{relacion.titulo}</h3>
          <GraficoDispersion puntos={relacion.puntos} etiquetaX={relacion.x} etiquetaY={relacion.y} altura={330} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Tile label="Coeficiente r" valor={reg.r} decimales={3} detalle={`Relación ${reg.strength}`} />
            <Tile label="r²" valor={reg.r2} decimales={3} detalle="Variación explicada por el modelo" />
            <Tile label="Pendiente" valor={reg.slope} decimales={3} detalle="Cambio en Y por unidad de X" />
            <Tile label="Observaciones" valor={relacion.puntos.length} decimales={0} />
          </div>
          <div className="mt-4">
            <Hallazgo>
              r = {num(reg.r, 3)} indica una relación {reg.strength}. El modelo explica{' '}
              {pct(reg.r2 * 100)} de la variación. {relacion.nota} Antes de afirmar causa pregúntate tres cosas: ¿hay
              un mecanismo plausible?, ¿el orden temporal es el correcto?, ¿podría una tercera variable mover a las dos?
            </Hallazgo>
          </div>
        </Panel>
      ) : null}

      {vista === 'control' ? (
        <>
          <Panel
            titulo="Carta de control de individuales"
            subtitulo={`${vistas[3].pregunta} · toca los puntos que consideres causa especial`}
            acciones={
              <div className="flex flex-wrap gap-1.5">
                {series.slice(0, 3).map((op) => (
                  <Chip
                    key={op.id}
                    activo={estado.control.serieId === op.id}
                    onClick={() => set({ control: { serieId: op.id, puntosMarcados: [] } })}
                  >
                    {op.label}
                  </Chip>
                ))}
              </div>
            }
          >
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <Chip
                activo={ventana === 'base'}
                onClick={() => {
                  setVentana('base');
                  set({ control: { ...estado.control, puntosMarcados: [] } });
                }}
              >
                Periodo base (S1–S12)
              </Chip>
              <Chip
                activo={ventana === 'completa'}
                onClick={() => {
                  setVentana('completa');
                  set({ control: { ...estado.control, puntosMarcados: [] } });
                }}
              >
                Serie completa (S1–S24)
              </Chip>
              <span className="ql-mono ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">
                {violaciones.length} {violaciones.length === 1 ? 'señal' : 'señales'}
              </span>
            </div>

            <CartaControl
              valores={valoresControl}
              etiquetas={semanas.slice(0, valoresControl.length).map((n) => String(n))}
              unidad={serieControl.unidad}
              marcados={marcados}
              alMarcar={marcar}
              altura={330}
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Tile label="Línea central" valor={limites.center} sufijo={` ${serieControl.unidad}`} />
              <Tile label="Límite superior" valor={limites.ucl} sufijo={` ${serieControl.unidad}`} tono="critico" />
              <Tile label="Límite inferior" valor={limites.lcl} sufijo={` ${serieControl.unidad}`} tono="critico" />
              <Tile label="σ estimada (MR̄/1.128)" valor={limites.sigma} decimales={2} />
            </div>

            <div className="mt-4 space-y-3">
              <Formula
                expresion="LSC / LIC = X̄ ± 3σ,  σ = MR̄ ÷ 1.128"
                explicacion="σ se estima con el rango móvil promedio y no con la desviación de toda la serie: si usaras la desviación total, la propia tendencia que quieres detectar inflaría los límites y los haría inútiles."
              />

              <p className="text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
                {ventana === 'base'
                  ? 'Los límites se calculan solo con las 12 semanas previas a la intervención. Es lo correcto: una serie que ya incluye la mejora mezcla dos procesos distintos y los límites quedan inflados por la propia tendencia que quieres detectar.'
                  : 'Con la serie completa, las reglas se disparan una y otra vez — y tienen razón: el proceso cambió de nivel a mitad del periodo. Esta vista sirve para demostrar el cambio, no para gestionar el proceso nuevo. Para eso hay que recalcular los límites con los datos posteriores a la estabilización.'}
              </p>

              {violaciones.length > 0 ? (
                <div className="space-y-2">
                  {[...new Map(violaciones.map((v) => [`${v.index}-${v.rule}`, v])).values()].map((v) => (
                    <div
                      key={`${v.index}-${v.rule}`}
                      className="flex items-start gap-2.5 rounded-xl p-3"
                      style={{ backgroundColor: `${tonoColor.critico}12` }}
                    >
                      <Target size={14} className="mt-px shrink-0" style={{ color: tonoColor.critico }} />
                      <p className="text-[11px] leading-4">
                        <strong>Periodo {v.index + 1} · regla {v.rule}:</strong> {v.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
                  No hay señales: toda la variación cabe dentro de los límites y no aparece ningún patrón. El proceso es
                  estable, lo que no significa que sea bueno — significa que es predecible.
                </p>
              )}

              {marcados.length > 0 ? (
                <div
                  className="flex items-start gap-2.5 rounded-xl border p-3.5"
                  style={{
                    borderColor: `${acertoSenal ? tonoColor.ok : tonoColor.alerta}55`,
                    backgroundColor: `${acertoSenal ? tonoColor.ok : tonoColor.alerta}12`,
                  }}
                >
                  <Check size={15} className="mt-px shrink-0" style={{ color: acertoSenal ? tonoColor.ok : tonoColor.alerta }} />
                  <p className="text-[11px] leading-5">
                    {acertoSenal ? (
                      <>
                        <strong style={{ color: tonoColor.ok }}>Cazador de señales · +50 QP.</strong> Marcaste
                        exactamente{' '}
                        {indicesSenal.length === 1
                          ? 'el punto con señal'
                          : `los ${indicesSenal.length} puntos con señal`}{' '}
                        ({indicesSenal.map((i) => `periodo ${i + 1}`).join(', ')}). En el caso, el periodo 8 son los
                        dos días en que el WMS estuvo caído y el picking se hizo con listas impresas: causa especial,
                        no mala suerte.
                      </>
                    ) : (
                      <>
                        Tu selección no coincide con las señales detectadas por las reglas. Recuerda: un punto alto
                        dentro de los límites es ruido, no señal. Reaccionar al ruido aumenta la variación.
                      </>
                    )}
                  </p>
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel titulo="Voz del proceso vs. voz del cliente" delay={0.05}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[hsl(var(--border))] p-4">
                <div className="ql-mono mb-2 text-[10px] uppercase tracking-[.13em] text-[hsl(var(--primary))]">
                  Límites de control
                </div>
                <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                  Salen de los datos del propio proceso: describen lo que hace hoy, con sus causas comunes. En la
                  ventana seleccionada: {num(limites.lcl)} – {num(limites.ucl)} {serieControl.unidad}.
                </p>
              </div>
              <div className="rounded-xl border border-[hsl(var(--border))] p-4">
                <div className="ql-mono mb-2 text-[10px] uppercase tracking-[.13em] text-[hsl(var(--primary))]">
                  Límites de especificación
                </div>
                <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                  Los fija el cliente o la norma: describen lo que se necesita. Aquí, meta {serieControl.meta}{' '}
                  {serieControl.unidad}. Si el proceso es estable pero fuera de especificación, no hay que "controlar
                  más": hay que rediseñar.
                </p>
              </div>
            </div>
          </Panel>
        </>
      ) : null}

      <Teoria labId="estadistica" />

      <Panel delay={0.1}>
        <Quiz labId="estadistica" titulo="Ponlo a prueba" />
      </Panel>
    </div>
  );
}
