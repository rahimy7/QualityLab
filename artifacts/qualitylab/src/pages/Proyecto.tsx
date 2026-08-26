import { useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { Download, FileCheck2, Printer } from 'lucide-react';
import { economia, empresa, seisEmes } from '@/data/caso';
import { incidencias } from '@/data/incidencias';
import { entregasTardias } from '@/data/series';
import { useProgreso } from '@/store/progreso';
import { compareBeforeAfter, countBy, mean, pareto } from '@/lib/stats';
import { descargar, num, pct, usd, valorP } from '@/lib/formato';
import { Boton, Campo, EncabezadoPagina, Panel } from '@/components/lab/primitivos';

const campos = [
  { id: 'titulo', label: 'Título del proyecto', placeholder: 'Recuperar la confiabilidad de la promesa de entrega' },
  { id: 'contexto', label: 'Contexto del negocio', area: true, placeholder: '¿Por qué este problema importa para la empresa y para el cliente?' },
  { id: 'contramedidas', label: 'Contramedidas propuestas', area: true, placeholder: '¿Qué se hizo o se hará para eliminar la causa raíz?' },
  { id: 'plan', label: 'Plan de acción (qué, quién, cuándo)', area: true, placeholder: '1. Asignar rol responsable del maestro de ubicaciones — Jefe de almacén — semana 2…' },
  { id: 'seguimiento', label: 'Seguimiento y verificación de eficacia', area: true, placeholder: '¿Cómo y cuándo se comprobará que la desviación no reaparece?' },
  { id: 'aprendizaje', label: 'Qué aprendió el equipo', area: true, placeholder: 'Lo que este proyecto nos enseñó sobre nuestro propio proceso…' },
] as const;

export default function Proyecto() {
  const { estado, set, otorgarLogro, puntos } = useProgreso();

  const datos = useMemo(() => {
    const antes = entregasTardias.slice(0, 12);
    const despues = entregasTardias.slice(estado.mejora.inicioDespues - 1);
    const comparacion = compareBeforeAfter(antes, despues);
    const p = pareto(countBy(incidencias, (i) => i.causa));
    const reduccionPuntos = Math.abs(comparacion.absoluteChange);
    const ahorro = (reduccionPuntos / 100) * economia.pedidosPorAno * economia.costoEntregaTardia;
    return {
      comparacion,
      pareto: p,
      reduccionPuntos,
      ahorro,
      roi: ((ahorro - economia.inversionMejora) / economia.inversionMejora) * 100,
    };
  }, [estado.mejora.inicioDespues]);

  const causasIshikawa = seisEmes
    .map((e) => ({ rama: e.label, causas: estado.ishikawa[e.id] ?? [] }))
    .filter((r) => r.causas.length > 0);

  const cadena = estado.porques.filter((p) => p.respuesta.trim());

  const completos = campos.filter((c) => (estado.proyecto[c.id] ?? '').trim().length >= 20).length;
  const listo = completos === campos.length && estado.causaRaiz.enunciado.trim() !== '';

  useEffect(() => {
    if (listo) otorgarLogro('proyecto-cerrado');
  }, [listo, otorgarLogro]);

  const informe = () =>
    [
      `# ${estado.proyecto.titulo || 'Proyecto de mejora'}`,
      `**Empresa:** ${empresa.nombre} · ${empresa.sector}`,
      `**Equipo:** ${estado.perfil.equipoId} · ${estado.perfil.nombre || 'Participante'}`,
      '',
      '## 1. Contexto',
      estado.proyecto.contexto || '—',
      '',
      '## 2. Situación actual',
      `- Entregas tardías (línea base, 12 semanas): ${pct(datos.comparacion.before.mean)} (σ = ${num(datos.comparacion.before.sd)})`,
      `- Incidencias analizadas: ${incidencias.length}`,
      `- Concentración: ${datos.pareto.vitalCount} causas explican ${pct(datos.pareto.vitalShare)}`,
      ...datos.pareto.rows.slice(0, datos.pareto.vitalCount).map((r) => `  - ${r.label}: ${r.count} casos (${num(r.percent)} %)`),
      '',
      '## 3. Meta',
      `${estado.kpi.indicador || 'Indicador'}: de ${estado.kpi.lineaBase || '—'} a ${estado.kpi.meta || '—'} · ${estado.kpi.fecha || 'sin fecha'}`,
      `Fuente: ${estado.kpi.fuente || '—'} · Responsable: ${estado.kpi.responsable || '—'} · Frecuencia: ${estado.kpi.frecuencia || '—'}`,
      '',
      '## 4. Análisis de causas',
      ...causasIshikawa.flatMap((r) => [`### ${r.rama}`, ...r.causas.map((c) => `- ${c.texto}${c.tieneEvidencia ? ' (con evidencia)' : ' (hipótesis)'}`)]),
      '',
      '### Cadena de 5 porqués',
      ...cadena.map((p, i) => `${i + 1}. ${p.respuesta}${p.evidencia ? ` — evidencia: ${p.evidencia}` : ''}`),
      '',
      `**Causa raíz:** ${estado.causaRaiz.enunciado || '—'}`,
      `**Verificación:** ${estado.causaRaiz.tipo || '—'} · ${estado.causaRaiz.evidencia || '—'}`,
      '',
      '## 5. Contramedidas',
      estado.proyecto.contramedidas || '—',
      '',
      '## 6. Plan de acción',
      estado.proyecto.plan || '—',
      '',
      '## 7. Resultados',
      `- Después: ${pct(datos.comparacion.after.mean)} (σ = ${num(datos.comparacion.after.sd)}, n = ${datos.comparacion.after.n})`,
      `- Reducción: ${pct(Math.abs(datos.comparacion.relativeChange))} (${num(datos.reduccionPuntos)} puntos porcentuales)`,
      `- Prueba t de Welch: t = ${num(datos.comparacion.t, 2)}, ${valorP(datos.comparacion.pValue)} → ${datos.comparacion.significant ? 'diferencia significativa' : 'no concluyente'}`,
      `- Impacto económico estimado: ${usd(datos.ahorro)} al año · ROI ${num(datos.roi, 0)} %`,
      '',
      estado.mejora.conclusion || '',
      '',
      '## 8. Seguimiento',
      estado.proyecto.seguimiento || '—',
      '',
      '## 9. Aprendizaje del equipo',
      estado.proyecto.aprendizaje || '—',
      '',
      '---',
      `Generado en QualityLab 360 · ${puntos.total} Quality Points acumulados`,
    ].join('\n');

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Proyecto final"
        titulo="Informe A3 del equipo"
        intro="Todo lo que trabajaste en la plataforma, en una sola página. Las secciones de datos se arman solas con tus análisis; las de criterio las escribes tú, que es justamente lo que la gerencia va a leer."
        icono={FileCheck2}
        acciones={
          <>
            <Boton variante="secundario" testId="boton-imprimir" onClick={() => window.print()}>
              <Printer size={14} /> Imprimir / PDF
            </Boton>
            <Boton
              testId="boton-descargar-informe"
              onClick={() => descargar('informe-a3.md', informe(), 'text/markdown;charset=utf-8;')}
            >
              <Download size={14} /> Descargar informe
            </Boton>
          </>
        }
      />

      <Panel titulo="Secciones de criterio" subtitulo={`${completos} de ${campos.length} completas`}>
        <div className="grid gap-4">
          {campos.map((c) => (
            <Campo
              key={c.id}
              label={c.label}
              area={'area' in c ? c.area : false}
              valor={estado.proyecto[c.id] ?? ''}
              onChange={(v) => set({ proyecto: { ...estado.proyecto, [c.id]: v } })}
              placeholder={c.placeholder}
              testId={`proyecto-${c.id}`}
            />
          ))}
        </div>
      </Panel>

      <Panel titulo="Secciones armadas con tu trabajo" subtitulo="Se actualizan solas: si cambias un análisis, cambia el informe" delay={0.05}>
        <div className="space-y-5 text-xs leading-6">
          <section>
            <h3 className="ql-mono mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
              Situación actual
            </h3>
            <p>
              La línea base de entregas tardías es <strong>{pct(datos.comparacion.before.mean)}</strong> (12 semanas,
              σ = {num(datos.comparacion.before.sd)}). De {incidencias.length} incidencias registradas,{' '}
              {datos.pareto.vitalCount} causas concentran <strong>{pct(datos.pareto.vitalShare)}</strong>:{' '}
              {datos.pareto.rows
                .slice(0, datos.pareto.vitalCount)
                .map((r) => `${r.label} (${num(r.percent)} %)`)
                .join(', ')}
              .
            </p>
          </section>

          <section>
            <h3 className="ql-mono mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
              Indicador y meta
            </h3>
            {estado.kpi.indicador ? (
              <p>
                <strong>{estado.kpi.indicador}</strong> · {estado.kpi.formula || 'fórmula pendiente'} · de{' '}
                {estado.kpi.lineaBase || '—'} a {estado.kpi.meta || '—'} para {estado.kpi.fecha || 'fecha pendiente'}.
                Fuente: {estado.kpi.fuente || '—'}. Responsable: {estado.kpi.responsable || '—'}.
              </p>
            ) : (
              <p className="text-[hsl(var(--muted-foreground))]">
                Sin ficha de indicador.{' '}
                <Link href="/kpi-lab" className="font-bold text-[hsl(var(--primary))] hover:underline">
                  Complétala en KPI Lab
                </Link>
                .
              </p>
            )}
          </section>

          <section>
            <h3 className="ql-mono mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
              Análisis de causas
            </h3>
            {causasIshikawa.length ? (
              <ul className="space-y-1">
                {causasIshikawa.map((r) => (
                  <li key={r.rama}>
                    <strong>{r.rama}:</strong> {r.causas.map((c) => c.texto).join('; ')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[hsl(var(--muted-foreground))]">
                Sin causas registradas.{' '}
                <Link href="/ishikawa" className="font-bold text-[hsl(var(--primary))] hover:underline">
                  Abre el Ishikawa
                </Link>
                .
              </p>
            )}
            {cadena.length ? (
              <ol className="mt-3 space-y-1">
                {cadena.map((p, i) => (
                  <li key={i}>
                    <strong>{i + 1}.</strong> {p.respuesta}
                    {p.evidencia ? (
                      <span className="text-[hsl(var(--muted-foreground))]"> — {p.evidencia}</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : null}
            {estado.causaRaiz.enunciado ? (
              <p className="mt-3 rounded-xl bg-[hsl(var(--accent)/.14)] p-3">
                <strong>Causa raíz:</strong> {estado.causaRaiz.enunciado}
                {estado.causaRaiz.evidencia ? ` · Verificación: ${estado.causaRaiz.evidencia}` : ''}
              </p>
            ) : null}
          </section>

          <section>
            <h3 className="ql-mono mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
              Resultados
            </h3>
            <p>
              El indicador pasó de {pct(datos.comparacion.before.mean)} a{' '}
              <strong>{pct(datos.comparacion.after.mean)}</strong>: una reducción de{' '}
              <strong>{pct(Math.abs(datos.comparacion.relativeChange))}</strong> (
              {num(datos.reduccionPuntos)} puntos porcentuales). La prueba t de Welch da{' '}
              {valorP(datos.comparacion.pValue)},{' '}
              {datos.comparacion.significant
                ? 'lo que descarta que la diferencia sea variación normal del proceso'
                : 'que no permite descartar variación normal'}
              . Impacto estimado: <strong>{usd(datos.ahorro)}</strong> al año, ROI de {num(datos.roi, 0)} % sobre una
              inversión de {usd(economia.inversionMejora)}.
            </p>
            {estado.mejora.conclusion ? <p className="mt-2 italic">«{estado.mejora.conclusion}»</p> : null}
          </section>
        </div>
      </Panel>

      {listo ? (
        <Panel delay={0.1}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="ql-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">
                Proyecto cerrado · +80 QP
              </div>
              <p className="mt-1 text-sm font-semibold">
                Tu A3 está completo. Descárgalo o imprímelo para la presentación final.
              </p>
            </div>
            <Link href="/certificado" data-testid="link-certificado">
              <Boton>Ver mi certificado</Boton>
            </Link>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
