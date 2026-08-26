import { useMemo, useState } from 'react';
import { Download, FlaskConical, Search } from 'lucide-react';
import { definicionCausas, incidencias, incidenciasCsv, type Incidencia } from '@/data/incidencias';
import { muestraPreparacion, operarios, pedidosMuestra, semanas, series } from '@/data/series';
import { describe, sum } from '@/lib/stats';
import { descargar, num, usd } from '@/lib/formato';
import { Boton, Chip, EncabezadoPagina, Panel, Tile } from '@/components/lab/primitivos';

const columnas: Array<{ key: keyof Incidencia; label: string; numerica?: boolean }> = [
  { key: 'id', label: 'ID' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'semana', label: 'Sem', numerica: true },
  { key: 'cliente', label: 'Cliente' },
  { key: 'causa', label: 'Causa' },
  { key: 'area', label: 'Área' },
  { key: 'turno', label: 'Turno' },
  { key: 'lineas', label: 'Líneas', numerica: true },
  { key: 'retrasoHoras', label: 'Retraso (h)', numerica: true },
  { key: 'costo', label: 'Costo', numerica: true },
  { key: 'operario', label: 'Operario' },
];

function seriesCsv(): string {
  const head = ['Semana', ...series.map((s) => `${s.label} (${s.unidad})`)].join(',');
  const filas = semanas.map((n, i) => [n, ...series.map((s) => s.valores[i])].join(','));
  return [head, ...filas].join('\n');
}

function muestrasCsv(): string {
  const filas = [
    'Dataset,ID,Variable1,Variable2',
    ...muestraPreparacion.map((v, i) => `preparacion_individual,M-${i + 1},${v},`),
    ...operarios.map((o) => `operarios,${o.id},${o.horasCapacitacion},${o.erroresPicking}`),
    ...pedidosMuestra.map((p) => `pedidos,${p.id},${p.lineas},${p.minutos}`),
  ];
  return filas.join('\n');
}

export default function Datos() {
  const [causa, setCausa] = useState<string>('todas');
  const [periodo, setPeriodo] = useState<'todo' | 'antes' | 'despues'>('todo');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<{ key: keyof Incidencia; asc: boolean }>({ key: 'semana', asc: true });

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const base = incidencias.filter(
      (i) =>
        (causa === 'todas' || i.causa === causa) &&
        (periodo === 'todo' || i.periodo === periodo) &&
        (texto === '' ||
          `${i.id} ${i.cliente} ${i.causa} ${i.area} ${i.operario} ${i.turno}`.toLowerCase().includes(texto)),
    );
    return [...base].sort((a, b) => {
      const va = a[orden.key];
      const vb = b[orden.key];
      const comparacion =
        typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return orden.asc ? comparacion : -comparacion;
    });
  }, [causa, periodo, busqueda, orden]);

  const resumenRetraso = useMemo(() => describe(filtradas.map((f) => f.retrasoHoras)), [filtradas]);
  const costoTotal = useMemo(() => sum(filtradas.map((f) => f.costo)), [filtradas]);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Datos del caso"
        titulo="Todo el dataset, abierto"
        intro="Las mismas cifras que usa cada laboratorio, filtrables y descargables. Nada en esta plataforma sale de una caja negra: si un número no cuadra, aquí está el registro que lo produce."
        icono={FlaskConical}
        acciones={
          <>
            <Boton variante="secundario" testId="csv-series" onClick={() => descargar('series-semanales.csv', seriesCsv())}>
              <Download size={14} /> Series
            </Boton>
            <Boton variante="secundario" testId="csv-muestras" onClick={() => descargar('muestras.csv', muestrasCsv())}>
              <Download size={14} /> Muestras
            </Boton>
            <Boton testId="csv-incidencias" onClick={() => descargar('incidencias.csv', incidenciasCsv(filtradas))}>
              <Download size={14} /> Incidencias ({filtradas.length})
            </Boton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Registros en el filtro" valor={filtradas.length} decimales={0} detalle={`de ${incidencias.length}`} />
        <Tile label="Retraso promedio" valor={resumenRetraso.mean} sufijo=" h" detalle={`σ = ${num(resumenRetraso.sd)} h`} />
        <Tile label="Retraso máximo" valor={resumenRetraso.max} sufijo=" h" />
        <Tile label="Costo de no calidad" valor={costoTotal} decimales={0} detalle="acumulado en el filtro" />
      </div>

      <Panel titulo="Registro de incidencias">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <Chip activo={causa === 'todas'} onClick={() => setCausa('todas')}>
              Todas las causas
            </Chip>
            {definicionCausas.map((d) => (
              <Chip key={d.causa} activo={causa === d.causa} onClick={() => setCausa(d.causa)}>
                {d.causa}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(['todo', 'antes', 'despues'] as const).map((p) => (
              <Chip key={p} activo={periodo === p} onClick={() => setPeriodo(p)}>
                {p === 'todo' ? '24 semanas' : p === 'antes' ? 'Antes (S1–S12)' : 'Después (S13–S24)'}
              </Chip>
            ))}
            <label className="ml-auto flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background)/.6)] px-2.5 py-2 sm:flex-none">
              <Search size={13} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
              <input
                value={busqueda}
                data-testid="input-buscar-datos"
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar cliente, operario, área…"
                className="min-w-0 flex-1 bg-transparent text-[11px] outline-none"
              />
            </label>
          </div>
        </div>

        <div className="mt-4 max-h-[520px] overflow-auto">
          <table className="w-full min-w-[760px] text-left text-[11px]">
            <thead className="sticky top-0 bg-[hsl(var(--card))]">
              <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                {columnas.map((c) => (
                  <th key={String(c.key)} className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => setOrden((o) => ({ key: c.key, asc: o.key === c.key ? !o.asc : true }))}
                      className="ql-mono font-bold uppercase tracking-[.08em] transition hover:text-[hsl(var(--primary))]"
                    >
                      {c.label}
                      {orden.key === c.key ? (orden.asc ? ' ↑' : ' ↓') : ''}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((f) => (
                <tr key={f.id} className="border-b border-[hsl(var(--border)/.5)]">
                  <td className="ql-mono px-2 py-1.5">{f.id}</td>
                  <td className="px-2 py-1.5">{f.fecha}</td>
                  <td className="px-2 py-1.5">{f.semana}</td>
                  <td className="px-2 py-1.5">{f.cliente}</td>
                  <td className="px-2 py-1.5 font-semibold">{f.causa}</td>
                  <td className="px-2 py-1.5">{f.area}</td>
                  <td className="px-2 py-1.5">{f.turno}</td>
                  <td className="px-2 py-1.5">{f.lineas}</td>
                  <td className="px-2 py-1.5">{num(f.retrasoHoras)}</td>
                  <td className="px-2 py-1.5">{usd(f.costo)}</td>
                  <td className="ql-mono px-2 py-1.5">{f.operario}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtradas.length === 0 ? (
            <p className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
              Ningún registro coincide con el filtro.
            </p>
          ) : null}
        </div>
      </Panel>

      <Panel titulo="Series semanales" subtitulo="Los seis indicadores del caso, 24 semanas" delay={0.05}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                <th className="ql-mono px-2 py-2 font-bold uppercase tracking-[.08em]">Sem</th>
                {series.map((s) => (
                  <th key={s.id} className="ql-mono px-2 py-2 font-bold uppercase tracking-[.08em]">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {semanas.map((n, i) => (
                <tr
                  key={n}
                  className="border-b border-[hsl(var(--border)/.5)]"
                  style={n === 13 ? { borderTop: '2px solid hsl(var(--accent))' } : undefined}
                >
                  <td className="ql-mono px-2 py-1.5 font-bold">
                    {n}
                    {n === 13 ? <span className="ml-1 text-[9px] text-[hsl(var(--primary))]">◂ intervención</span> : null}
                  </td>
                  {series.map((s) => (
                    <td key={s.id} className="px-2 py-1.5">
                      {num(s.valores[i])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel titulo="Otros datasets" subtitulo="Muestras individuales que usan el histograma y la dispersión" delay={0.1}>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { titulo: 'Tiempo de preparación', n: muestraPreparacion.length, detalle: 'Mediciones individuales en minutos, periodo base. Histograma y capacidad.' },
            { titulo: 'Operarios de almacén', n: operarios.length, detalle: 'Horas de capacitación, errores, líneas por hora y antigüedad. Dispersión y correlación.' },
            { titulo: 'Pedidos muestreados', n: pedidosMuestra.length, detalle: 'Líneas por pedido y minutos de preparación. Regresión lineal.' },
          ].map((d) => (
            <div key={d.titulo} className="rounded-xl border border-[hsl(var(--border))] p-3.5">
              <div className="ql-display text-2xl font-bold text-[hsl(var(--primary))]">{d.n}</div>
              <div className="mt-0.5 text-xs font-bold">{d.titulo}</div>
              <p className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{d.detalle}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
          Todos los datasets se generan con una semilla fija: son idénticos en cualquier dispositivo y sesión, de modo
          que dos equipos que analicen lo mismo deben llegar al mismo número. Si no coinciden, la discusión es sobre el
          método, no sobre los datos.
        </p>
      </Panel>
    </div>
  );
}
