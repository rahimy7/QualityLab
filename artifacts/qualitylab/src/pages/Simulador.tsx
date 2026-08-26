import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sliders, TriangleAlert } from 'lucide-react';
import { economia } from '@/data/caso';
import { useProgreso, estadoInicial } from '@/store/progreso';
import { num, pct, pp, usd } from '@/lib/formato';
import { tonoColor } from '@/lib/palette';
import { Boton, EncabezadoPagina, Formula, Hallazgo, Panel, Tile } from '@/components/lab/primitivos';
import { BarrasAntesDespues } from '@/components/charts/graficos';
import { CoachQ } from '@/components/lab/CoachQ';
import { Teoria } from '@/components/lab/Teoria';

/**
 * Modelo del proceso de despacho.
 *
 * Es un modelo declarado, no una caja negra: los coeficientes están a la vista
 * para que el participante discuta si son razonables. Esa discusión es el
 * ejercicio; el número por sí solo no enseña nada.
 */
const modelo = {
  preparacionBase: 20, // min de picking cuando las ubicaciones son correctas
  verificacion: 5, // min de control de salida
  reproceso: 18, // min adicionales cuando el pedido debe rearmarse
  gananciaUbicaciones: 0.25, // fracción máxima del picking que ahorra el maestro al día
};

function tiempoCiclo(espera: number, retrabajo: number, ubicaciones: number): number {
  const picking = modelo.preparacionBase * (1 - (ubicaciones / 100) * modelo.gananciaUbicaciones);
  return espera + picking + modelo.verificacion + (retrabajo / 100) * modelo.reproceso;
}

function entregasTardias(tiempo: number, defectos: number, retrabajo: number): number {
  return Math.max(1.5, 0.62 * (tiempo - 35) + 0.9 * defectos + 0.35 * retrabajo);
}

const palancas = [
  {
    id: 'espera' as const,
    label: 'Tiempo de espera antes de picking',
    min: 8,
    max: 24,
    paso: 1,
    unidad: 'min',
    nota: 'Se reduce con la liberación anticipada de órdenes y una regla de prioridad visible.',
  },
  {
    id: 'ubicaciones' as const,
    label: 'Maestro de ubicaciones actualizado',
    min: 0,
    max: 100,
    paso: 5,
    unidad: '%',
    nota: 'Es la causa raíz identificada en los 5 porqués: menos búsqueda, menos tiempo de picking.',
  },
  {
    id: 'retrabajo' as const,
    label: 'Órdenes con retrabajo',
    min: 3,
    max: 16,
    paso: 1,
    unidad: '%',
    nota: 'Cada orden rearmada agrega 18 min al ciclo y consume capacidad del turno.',
  },
  {
    id: 'defectos' as const,
    label: 'Defectos de picking',
    min: 2,
    max: 12,
    paso: 1,
    unidad: '%',
    nota: 'Producto o cantidad equivocada que el cliente detecta después de la entrega.',
  },
];

export default function Simulador() {
  const { estado, set, otorgarLogro } = useProgreso();
  const s = estado.simulador;
  const base = estadoInicial.simulador;

  const actual = useMemo(() => {
    const t = tiempoCiclo(base.espera, base.retrabajo, base.ubicaciones);
    return { tiempo: t, entregas: entregasTardias(t, base.defectos, base.retrabajo) };
  }, [base]);

  const proyeccion = useMemo(() => {
    const t = tiempoCiclo(s.espera, s.retrabajo, s.ubicaciones);
    return { tiempo: t, entregas: entregasTardias(t, s.defectos, s.retrabajo) };
  }, [s]);

  const mejoraTiempo = ((actual.tiempo - proyeccion.tiempo) / actual.tiempo) * 100;
  const reduccionEntregas = actual.entregas - proyeccion.entregas;
  const pedidosEvitados = (reduccionEntregas / 100) * economia.pedidosPorAno;
  const ahorroEntregas = pedidosEvitados * economia.costoEntregaTardia;
  const ahorroRetrabajo =
    ((base.retrabajo - s.retrabajo) / 100) * economia.pedidosPorAno * economia.costoRetrabajo;
  const ahorroTotal = ahorroEntregas + ahorroRetrabajo;
  const roi = ((ahorroTotal - economia.inversionMejora) / economia.inversionMejora) * 100;
  const horasLiberadas = ((actual.tiempo - proyeccion.tiempo) / 60) * economia.pedidosPorAno;

  const palancasMovidas = palancas.filter((p) => s[p.id] !== base[p.id]).length;

  useEffect(() => {
    if (ahorroTotal > 0 && palancasMovidas > 0) otorgarLogro('roi-calculado');
  }, [ahorroTotal, palancasMovidas, otorgarLogro]);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Simulador Kaizen"
        titulo="Mueve las palancas del proceso"
        intro="Un simulador no predice el futuro: hace visibles las relaciones entre variables. Cambia una a la vez y observa qué se mueve y cuánto — mover tres a la vez hace imposible saber cuál funcionó."
        icono={Sliders}
        acciones={
          <Boton variante="secundario" testId="boton-reset-simulador" onClick={() => set({ simulador: base })}>
            <RotateCcw size={14} /> Volver al estado actual
          </Boton>
        }
      />

      <CoachQ labId="simulador" />

      <div className="grid gap-6 lg:grid-cols-[1fr_.85fr]">
        <Panel titulo="Palancas" subtitulo={`${palancasMovidas} de ${palancas.length} modificadas respecto al estado actual`}>
          <div className="space-y-5">
            {palancas.map((p) => {
              const valor = s[p.id];
              const cambiada = valor !== base[p.id];
              return (
                <div key={p.id}>
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs font-bold">{p.label}</span>
                    <span
                      className="ql-mono text-xs font-bold"
                      style={{ color: cambiada ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                    >
                      {valor} {p.unidad}
                      {cambiada ? (
                        <span className="ml-1.5 opacity-70">
                          (actual: {base[p.id]} {p.unidad})
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={p.min}
                    max={p.max}
                    step={p.paso}
                    value={valor}
                    data-testid={`slider-${p.id}`}
                    onChange={(e) => set({ simulador: { ...s, [p.id]: Number(e.target.value) } })}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[hsl(var(--muted))] accent-[hsl(var(--primary))]"
                  />
                  <p className="mt-1.5 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{p.nota}</p>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel titulo="Proyección" subtitulo="Tiempo de ciclo del pedido" delay={0.05}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="ql-mono text-[10px] uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">
                  Actual
                </div>
                <div className="ql-display text-3xl font-bold">{num(actual.tiempo)} min</div>
              </div>
              <motion.div
                key={Math.round(mejoraTiempo * 10)}
                initial={{ scale: 0.94, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="ql-mono text-[10px] uppercase tracking-[.13em]" style={{ color: tonoColor.ok }}>
                  {mejoraTiempo >= 0 ? 'Mejora' : 'Deterioro'}
                </div>
                <div
                  className="ql-display text-2xl font-bold"
                  style={{ color: mejoraTiempo >= 0 ? tonoColor.ok : tonoColor.critico }}
                >
                  {mejoraTiempo >= 0 ? '↓' : '↑'} {num(Math.abs(mejoraTiempo))} %
                </div>
              </motion.div>
              <div className="text-right">
                <div className="ql-mono text-[10px] uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">
                  Proyectado
                </div>
                <div className="ql-display text-3xl font-bold" style={{ color: tonoColor.ok }}>
                  {num(proyeccion.tiempo)} min
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="ql-mono mb-2 text-[10px] uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">
                Entregas tardías proyectadas
              </div>
              <BarrasAntesDespues antes={actual.entregas} despues={proyeccion.entregas} meta={8} altura={180} />
            </div>
          </Panel>

          <Panel titulo="Impacto económico anual" subtitulo="Con los supuestos de la gerencia" delay={0.1}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Tile label="Pedidos tardíos evitados" valor={pedidosEvitados} decimales={0} />
              <Tile label="Horas-hombre liberadas" valor={horasLiberadas} decimales={0} />
              <Tile label="Ahorro anual estimado" valor={ahorroTotal} decimales={0} tono={ahorroTotal > 0 ? 'ok' : 'critico'} />
              <Tile label="ROI del proyecto" valor={roi} sufijo=" %" tono={roi > 0 ? 'ok' : 'critico'} />
            </div>
            <p className="mt-3 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">
              Inversión considerada: {usd(economia.inversionMejora)} · {usd(economia.costoEntregaTardia)} por entrega
              tardía · {usd(economia.costoRetrabajo)} por orden rearmada ·{' '}
              {economia.pedidosPorAno.toLocaleString('es-DO')} pedidos al año.
            </p>
          </Panel>
        </div>
      </div>

      <Panel titulo="El modelo, a la vista" subtitulo="Un simulador sin supuestos declarados es una caja negra" delay={0.15}>
        <div className="grid gap-4 md:grid-cols-2">
          <Formula
            expresion={`ciclo = espera + ${modelo.preparacionBase}·(1 − ubicaciones·${modelo.gananciaUbicaciones}) + ${modelo.verificacion} + retrabajo·${modelo.reproceso}`}
            explicacion="El picking se acorta como máximo un 25 % con el maestro de ubicaciones al día: por encima de eso ya no es un problema de búsqueda sino de capacidad."
          />
          <Formula
            expresion="tardías % = 0.62·(ciclo − 35) + 0.9·defectos + 0.35·retrabajo"
            explicacion="Coeficientes ajustados a las 24 semanas del caso. Reproducen el 19 % de la línea base, pero son una aproximación: fuera del rango observado el modelo deja de ser confiable."
          />
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl p-3.5" style={{ backgroundColor: `${tonoColor.alerta}14` }}>
          <TriangleAlert size={15} className="mt-px shrink-0" style={{ color: tonoColor.alerta }} />
          <p className="text-[11px] leading-5">
            <strong>Lo que un simulador no puede decirte:</strong> si las relaciones que asume son ciertas. Estos
            coeficientes vienen de datos observados en un rango concreto. Extrapolarlos fuera de ese rango —imaginar,
            por ejemplo, un ciclo de 15 minutos— produce números que parecen precisos y no significan nada. Úsalo para
            comparar escenarios, no para prometer resultados.
          </p>
        </div>

        {palancasMovidas > 1 ? (
          <div className="mt-4">
            <Hallazgo titulo="Nota de método">
              Moviste {palancasMovidas} palancas a la vez. La proyección funciona, pero en el proceso real no podrías
              atribuir la mejora a ninguna de ellas. Si vas a implementar, cambia una, mide, y recién entonces cambia
              la siguiente.
            </Hallazgo>
          </div>
        ) : null}
      </Panel>

      <Teoria labId="simulador" />
    </div>
  );
}
