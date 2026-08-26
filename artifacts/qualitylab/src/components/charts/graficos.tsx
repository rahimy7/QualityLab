/**
 * Gráficos del módulo.
 *
 * Cada uno corresponde a una pregunta distinta: tendencia (¿cómo evoluciona?),
 * Pareto (¿dónde priorizo?), histograma (¿cómo se distribuye?), dispersión
 * (¿se mueven juntas?) y carta de control (¿es estable?).
 */
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import { usePaleta } from '@/lib/palette';
import { useReducirMovimiento } from '@/lib/movimiento';
import { num } from '@/lib/formato';
import {
  controlLimits,
  histogram,
  linearRegression,
  movingAverage,
  nelsonRules,
  pareto,
  type ParetoRow,
} from '@/lib/stats';

interface FilaTooltip {
  etiqueta: string;
  valor: string;
  color?: string;
}

function Caja({ titulo, filas }: { titulo: string; filas: FilaTooltip[] }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] px-3 py-2 shadow-lg">
      <div className="ql-mono mb-1 text-[10px] font-bold uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">
        {titulo}
      </div>
      {filas.map((f) => (
        <div key={f.etiqueta} className="flex items-center gap-2 text-[11px] leading-5">
          {f.color ? <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} /> : null}
          <span className="text-[hsl(var(--muted-foreground))]">{f.etiqueta}</span>
          <span className="ml-auto font-bold">{f.valor}</span>
        </div>
      ))}
    </div>
  );
}

const ejeComun = {
  tick: { fontSize: 10 },
  tickLine: false,
  axisLine: false,
};

/* ------------------------------- Pareto --------------------------------- */

export function GraficoPareto({
  datos,
  corte = 80,
  unidad = 'casos',
  alSeleccionar,
  seleccionadas = [],
  altura = 300,
}: {
  datos: Array<{ label: string; count: number }>;
  corte?: number;
  unidad?: string;
  alSeleccionar?: (label: string) => void;
  seleccionadas?: string[];
  altura?: number;
}) {
  const p = usePaleta();
  const animar = !useReducirMovimiento();
  const { rows } = useMemo(() => pareto(datos, corte), [datos, corte]);

  const data = rows.map((r) => ({
    ...r,
    corto: r.label.length > 16 ? `${r.label.slice(0, 15)}…` : r.label,
  }));

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <ComposedChart data={data} margin={{ top: 12, right: 42, bottom: 4, left: -18 }}>
        <CartesianGrid stroke={p.grid} vertical={false} />
        <XAxis dataKey="corto" {...ejeComun} interval={0} angle={-18} textAnchor="end" height={54} />
        <YAxis yAxisId="izq" {...ejeComun} />
        <YAxis yAxisId="der" orientation="right" domain={[0, 100]} unit="%" {...ejeComun} />
        <Tooltip
          cursor={{ fill: p.grid, opacity: 0.25 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const row = payload[0].payload as ParetoRow;
            return (
              <Caja
                titulo={row.label}
                filas={[
                  { etiqueta: unidad, valor: num(row.count, 0), color: p.series[0] },
                  { etiqueta: 'Del total', valor: `${num(row.percent)} %` },
                  { etiqueta: 'Acumulado', valor: `${num(row.cumulative)} %`, color: p.series[1] },
                ]}
              />
            );
          }}
        />
        <ReferenceLine
          yAxisId="der"
          y={corte}
          stroke={p.destructive}
          strokeDasharray="4 4"
          label={{ value: `${corte} %`, fontSize: 10, fill: p.destructive, position: 'right' }}
        />
        <Bar
          yAxisId="izq"
          dataKey="count"
          radius={[5, 5, 0, 0]}
          isAnimationActive={animar}
          animationDuration={800}
          onClick={(entry: { label?: string }) => entry.label && alSeleccionar?.(entry.label)}
          cursor={alSeleccionar ? 'pointer' : undefined}
        >
          {data.map((row) => (
            <Cell
              key={row.label}
              fill={row.vital ? p.series[0] : p.muted}
              fillOpacity={seleccionadas.length === 0 || seleccionadas.includes(row.label) ? 1 : 0.35}
              stroke={seleccionadas.includes(row.label) ? p.accent : 'none'}
              strokeWidth={2}
            />
          ))}
        </Bar>
        <Line
          yAxisId="der"
          type="monotone"
          dataKey="cumulative"
          stroke={p.series[1]}
          strokeWidth={2.5}
          dot={{ r: 3.5, fill: p.series[1], strokeWidth: 0 }}
          isAnimationActive={animar}
          animationDuration={1100}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------ Tendencia -------------------------------- */

export function GraficoTendencia({
  valores,
  etiquetas,
  meta,
  unidad = '%',
  nombre = 'Valor',
  intervencion,
  suavizado = false,
  altura = 280,
}: {
  valores: number[];
  etiquetas?: string[];
  meta?: number;
  unidad?: string;
  nombre?: string;
  /** Índice (base 1) donde se desplegó la intervención. */
  intervencion?: number;
  suavizado?: boolean;
  altura?: number;
}) {
  const p = usePaleta();
  const animar = !useReducirMovimiento();
  const media = movingAverage(valores, 3);
  const data = valores.map((v, i) => ({
    x: etiquetas?.[i] ?? `S${i + 1}`,
    valor: v,
    media: media[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <ComposedChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: -20 }}>
        <CartesianGrid stroke={p.grid} vertical={false} />
        <XAxis dataKey="x" {...ejeComun} interval="preserveStartEnd" minTickGap={16} />
        <YAxis {...ejeComun} domain={['auto', 'auto']} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const punto = payload[0].payload as { valor: number; media: number | null };
            return (
              <Caja
                titulo={String(label)}
                filas={[
                  { etiqueta: nombre, valor: `${num(punto.valor)} ${unidad}`, color: p.series[0] },
                  ...(suavizado && punto.media !== null
                    ? [{ etiqueta: 'Media móvil (3)', valor: `${num(punto.media)} ${unidad}`, color: p.series[3] }]
                    : []),
                ]}
              />
            );
          }}
        />
        {intervencion ? (
          <ReferenceLine
            x={etiquetas?.[intervencion - 1] ?? `S${intervencion}`}
            stroke={p.accent}
            strokeWidth={2}
            label={{ value: 'Intervención', fontSize: 10, fill: p.muted, position: 'insideTopRight' }}
          />
        ) : null}
        {meta !== undefined ? (
          <ReferenceLine
            y={meta}
            stroke={p.ok}
            strokeDasharray="5 4"
            label={{ value: `Meta ${meta}${unidad}`, fontSize: 10, fill: p.ok, position: 'insideBottomLeft' }}
          />
        ) : null}
        <Line
          type="monotone"
          dataKey="valor"
          stroke={p.series[0]}
          strokeWidth={2.5}
          dot={{ r: 2.5, fill: p.series[0], strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={animar}
          animationDuration={1200}
        />
        {suavizado ? (
          <Line
            type="monotone"
            dataKey="media"
            stroke={p.series[3]}
            strokeWidth={1.8}
            strokeDasharray="4 3"
            dot={false}
            connectNulls
            isAnimationActive={animar}
          animationDuration={1400}
          />
        ) : null}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* ---------------------------- Carta de control --------------------------- */

export function CartaControl({
  valores,
  etiquetas,
  unidad = '',
  marcados = [],
  alMarcar,
  altura = 300,
}: {
  valores: number[];
  etiquetas?: string[];
  unidad?: string;
  /** Índices que el participante señaló como causa especial. */
  marcados?: number[];
  alMarcar?: (indice: number) => void;
  altura?: number;
}) {
  const p = usePaleta();
  const animar = !useReducirMovimiento();
  const limites = useMemo(() => controlLimits(valores), [valores]);
  const violaciones = useMemo(() => nelsonRules(valores, limites), [valores, limites]);
  const indicesConSenal = new Set(violaciones.map((v) => v.index));

  const data = valores.map((v, i) => ({
    x: etiquetas?.[i] ?? `${i + 1}`,
    valor: v,
    indice: i,
  }));

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <ComposedChart data={data} margin={{ top: 16, right: 46, bottom: 0, left: -20 }}>
        <CartesianGrid stroke={p.grid} vertical={false} />
        <XAxis dataKey="x" {...ejeComun} interval="preserveStartEnd" minTickGap={12} />
        <YAxis {...ejeComun} domain={['auto', 'auto']} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const punto = payload[0].payload as { valor: number; indice: number };
            const senal = violaciones.filter((v) => v.index === punto.indice);
            return (
              <Caja
                titulo={`Periodo ${label}`}
                filas={[
                  { etiqueta: 'Valor', valor: `${num(punto.valor)} ${unidad}`, color: p.series[0] },
                  { etiqueta: 'Línea central', valor: num(limites.center) },
                  ...(senal.length
                    ? [{ etiqueta: `Regla ${senal[0].rule}`, valor: 'señal', color: p.destructive }]
                    : []),
                ]}
              />
            );
          }}
        />
        <ReferenceArea
          y1={limites.center - limites.sigma}
          y2={limites.center + limites.sigma}
          fill={p.series[0]}
          fillOpacity={0.06}
        />
        <ReferenceLine
          y={limites.ucl}
          stroke={p.destructive}
          strokeDasharray="5 4"
          label={{ value: 'LSC', fontSize: 10, fill: p.destructive, position: 'right' }}
        />
        <ReferenceLine
          y={limites.center}
          stroke={p.muted}
          label={{ value: 'X̄', fontSize: 10, fill: p.muted, position: 'right' }}
        />
        <ReferenceLine
          y={limites.lcl}
          stroke={p.destructive}
          strokeDasharray="5 4"
          label={{ value: 'LIC', fontSize: 10, fill: p.destructive, position: 'right' }}
        />
        <Line
          type="linear"
          dataKey="valor"
          stroke={p.series[0]}
          strokeWidth={2}
          isAnimationActive={animar}
          animationDuration={1200}
          activeDot={{ r: 6 }}
          dot={(props: { cx?: number; cy?: number; index?: number }) => {
            const i = props.index ?? 0;
            const senal = indicesConSenal.has(i);
            const marcado = marcados.includes(i);
            return (
              <circle
                key={i}
                cx={props.cx}
                cy={props.cy}
                r={senal ? 5.5 : 3}
                fill={senal ? p.destructive : p.series[0]}
                stroke={marcado ? p.accent : 'none'}
                strokeWidth={marcado ? 3 : 0}
                style={{ cursor: alMarcar ? 'pointer' : undefined }}
                onClick={() => alMarcar?.(i)}
              />
            );
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------ Histograma ------------------------------- */

export function Histograma({
  valores,
  bins,
  especificacion,
  unidad = '',
  altura = 280,
}: {
  valores: number[];
  bins?: number;
  especificacion?: number;
  unidad?: string;
  altura?: number;
}) {
  const p = usePaleta();
  const animar = !useReducirMovimiento();
  const data = useMemo(() => histogram(valores, bins), [valores, bins]);

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: -22 }}>
        <CartesianGrid stroke={p.grid} vertical={false} />
        <XAxis dataKey="label" {...ejeComun} interval={0} angle={-22} textAnchor="end" height={48} />
        <YAxis {...ejeComun} />
        <Tooltip
          cursor={{ fill: p.grid, opacity: 0.25 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const bin = payload[0].payload as { label: string; count: number };
            return (
              <Caja
                titulo={`${bin.label} ${unidad}`}
                filas={[
                  { etiqueta: 'Frecuencia', valor: num(bin.count, 0), color: p.series[0] },
                  { etiqueta: 'Del total', valor: `${num((bin.count / valores.length) * 100)} %` },
                ]}
              />
            );
          }}
        />
        {especificacion !== undefined ? (
          <ReferenceLine
            x={data.find((b) => especificacion >= b.from && especificacion <= b.to)?.label}
            stroke={p.destructive}
            strokeWidth={2}
            label={{ value: 'LSE', fontSize: 10, fill: p.destructive, position: 'top' }}
          />
        ) : null}
        <Bar dataKey="count" radius={[5, 5, 0, 0]} isAnimationActive={animar}
          animationDuration={900}>
          {data.map((bin) => (
            <Cell
              key={bin.label}
              fill={especificacion !== undefined && bin.from >= especificacion ? p.destructive : p.series[0]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------ Dispersión ------------------------------- */

export function GraficoDispersion({
  puntos,
  etiquetaX,
  etiquetaY,
  altura = 300,
}: {
  puntos: Array<{ x: number; y: number; id?: string }>;
  etiquetaX: string;
  etiquetaY: string;
  altura?: number;
}) {
  const p = usePaleta();
  const animar = !useReducirMovimiento();
  const reg = useMemo(() => linearRegression(puntos), [puntos]);
  const xs = puntos.map((q) => q.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const linea = [
    { x: minX, y: reg.intercept + reg.slope * minX },
    { x: maxX, y: reg.intercept + reg.slope * maxX },
  ];

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <ScatterChart margin={{ top: 12, right: 18, bottom: 18, left: -14 }}>
        <CartesianGrid stroke={p.grid} />
        <XAxis
          type="number"
          dataKey="x"
          name={etiquetaX}
          domain={['dataMin - 2', 'dataMax + 2']}
          {...ejeComun}
          label={{ value: etiquetaX, position: 'insideBottom', offset: -12, fontSize: 10, fill: p.muted }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={etiquetaY}
          domain={['dataMin - 2', 'dataMax + 2']}
          {...ejeComun}
          label={{ value: etiquetaY, angle: -90, position: 'insideLeft', offset: 18, fontSize: 10, fill: p.muted }}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const punto = payload[0].payload as { x: number; y: number; id?: string };
            return (
              <Caja
                titulo={punto.id ?? 'Observación'}
                filas={[
                  { etiqueta: etiquetaX, valor: num(punto.x) },
                  { etiqueta: etiquetaY, valor: num(punto.y) },
                ]}
              />
            );
          }}
        />
        <Scatter data={puntos} fill={p.series[0]} fillOpacity={0.75} isAnimationActive={animar}
          animationDuration={800} />
        <Scatter data={linea} line={{ stroke: p.series[2], strokeWidth: 2 }} shape={() => <g />} legendType="none" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/* -------------------------------- Medidor -------------------------------- */

/** Semáforo tipo velocímetro: la aguja anima desde cero hasta el valor. */
export function Medidor({
  valor,
  meta,
  minimo = 0,
  maximo,
  unidad = '%',
  menorEsMejor = true,
  color,
}: {
  valor: number;
  meta: number;
  minimo?: number;
  maximo: number;
  unidad?: string;
  menorEsMejor?: boolean;
  color: string;
}) {
  const p = usePaleta();
  const animar = !useReducirMovimiento();
  const rango = maximo - minimo || 1;
  const fraccion = Math.min(1, Math.max(0, (valor - minimo) / rango));
  const fraccionMeta = Math.min(1, Math.max(0, (meta - minimo) / rango));
  const angulo = -90 + fraccion * 180;
  const anguloMeta = -90 + fraccionMeta * 180;

  const R = 74;
  const arco = (desde: number, hasta: number) => {
    const punto = (frac: number) => {
      const a = (Math.PI * (frac - 0.5)) / 1;
      return [100 + R * Math.sin(a * 1), 92 - R * Math.cos(a)];
    };
    const [x1, y1] = punto(desde);
    const [x2, y2] = punto(hasta);
    return `M ${x1} ${y1} A ${R} ${R} 0 ${hasta - desde > 0.5 ? 1 : 0} 1 ${x2} ${y2}`;
  };

  // El valor se dibuja debajo del arco: dentro, la aguja lo tapa en valores bajos.
  return (
    <svg viewBox="0 0 200 138" className="w-full max-w-[260px]">
      <path d={arco(0, 1)} fill="none" stroke={p.grid} strokeWidth={13} strokeLinecap="round" />
      <motion.path
        d={arco(0, Math.max(fraccion, 0.001))}
        fill="none"
        stroke={color}
        strokeWidth={13}
        strokeLinecap="round"
        initial={{ pathLength: animar ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: animar ? 1.1 : 0, ease: [0.16, 1, 0.3, 1] }}
      />
      <line
        x1={100}
        y1={92}
        x2={100 + (R + 8) * Math.sin((anguloMeta * Math.PI) / 180)}
        y2={92 - (R + 8) * Math.cos((anguloMeta * Math.PI) / 180)}
        stroke={p.ok}
        strokeWidth={2}
        strokeDasharray="3 2"
      />
      <motion.line
        x1={100}
        y1={92}
        x2={100 + (R - 16) * Math.sin((angulo * Math.PI) / 180)}
        y2={92 - (R - 16) * Math.cos((angulo * Math.PI) / 180)}
        stroke={p.foreground}
        strokeWidth={3}
        strokeLinecap="round"
        initial={{ opacity: animar ? 0 : 1 }}
        animate={{ opacity: 1 }}
        transition={{ delay: animar ? 0.6 : 0 }}
      />
      <circle cx={100} cy={92} r={5} fill={p.foreground} />
      <text x={100} y={120} textAnchor="middle" fontSize={24} fontWeight={700} fill={color}>
        {num(valor)}
        {unidad}
      </text>
      <text x={100} y={134} textAnchor="middle" fontSize={9} fill={p.muted}>
        meta {menorEsMejor ? '≤' : '≥'} {num(meta)}
        {unidad}
      </text>
    </svg>
  );
}

/* --------------------------- Antes vs. después --------------------------- */

export function BarrasAntesDespues({
  antes,
  despues,
  unidad = '%',
  meta,
  altura = 220,
}: {
  antes: number;
  despues: number;
  unidad?: string;
  meta?: number;
  altura?: number;
}) {
  const p = usePaleta();
  const animar = !useReducirMovimiento();
  const data = [
    { etapa: 'Antes', valor: antes, color: p.critico },
    { etapa: 'Después', valor: despues, color: meta !== undefined && despues <= meta ? p.ok : p.alerta },
  ];

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={data} margin={{ top: 20, right: 16, bottom: 0, left: -22 }}>
        <CartesianGrid stroke={p.grid} vertical={false} />
        <XAxis dataKey="etapa" {...ejeComun} />
        <YAxis {...ejeComun} />
        <Tooltip
          cursor={{ fill: p.grid, opacity: 0.25 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as { etapa: string; valor: number };
            return <Caja titulo={d.etapa} filas={[{ etiqueta: 'Promedio', valor: `${num(d.valor)} ${unidad}` }]} />;
          }}
        />
        {meta !== undefined ? <ReferenceLine y={meta} stroke={p.ok} strokeDasharray="5 4" /> : null}
        <Bar dataKey="valor" radius={[6, 6, 0, 0]} isAnimationActive={animar}
          animationDuration={900} barSize={64}>
          {data.map((d) => (
            <Cell key={d.etapa} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
