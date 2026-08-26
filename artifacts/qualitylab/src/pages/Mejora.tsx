import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';
import { economia } from '@/data/caso';
import { entregasTardias, semanas } from '@/data/series';
import { useProgreso } from '@/store/progreso';
import { num, pct, usd, valorP } from '@/lib/formato';
import { tonoColor } from '@/lib/palette';
import { compareBeforeAfter, controlLimits, mean, nelsonRules } from '@/lib/stats';
import { Campo, EncabezadoPagina, Formula, Hallazgo, Panel, Tile } from '@/components/lab/primitivos';
import { BarrasAntesDespues, CartaControl, GraficoTendencia } from '@/components/charts/graficos';
import { CoachQ } from '@/components/lab/CoachQ';
import { Teoria } from '@/components/lab/Teoria';
import { Quiz } from '@/components/lab/Quiz';
import { CierreMision } from '@/components/lab/CierreMision';

const META = 8;

export default function Mejora() {
  const { estado, set, otorgarLogro, quitarLogro } = useProgreso();
  const inicio = estado.mejora.inicioDespues;

  const antes = useMemo(() => entregasTardias.slice(0, 12), []);
  const despues = useMemo(() => entregasTardias.slice(inicio - 1), [inicio]);
  const transicion = useMemo(() => entregasTardias.slice(12, inicio - 1), [inicio]);

  const comparacion = useMemo(() => compareBeforeAfter(antes, despues), [antes, despues]);
  const reduccionRelativa = Math.abs(comparacion.relativeChange);
  const reduccionPuntos = Math.abs(comparacion.absoluteChange);

  const limitesAntes = useMemo(() => controlLimits(antes), [antes]);
  const senalesTotales = useMemo(
    () => nelsonRules(entregasTardias, controlLimits(entregasTardias)),
    [],
  );

  // Impacto económico con el resultado real, no con la meta.
  const pedidosEvitados = (reduccionPuntos / 100) * economia.pedidosPorAno;
  const ahorro = pedidosEvitados * economia.costoEntregaTardia;
  const roi = ((ahorro - economia.inversionMejora) / economia.inversionMejora) * 100;

  const conclusionLista = estado.mejora.conclusion.trim().length >= 60;

  useEffect(() => {
    if (comparacion.significant && conclusionLista) otorgarLogro('mejora-significativa');
    else quitarLogro('mejora-significativa');
  }, [comparacion.significant, conclusionLista, otorgarLogro, quitarLogro]);

  const nuevoNivelEstable = mean(despues.slice(-6)) < limitesAntes.lcl;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Misión 6 · Improvement Lab"
        titulo="¿Realmente mejoramos?"
        intro="Las entregas tardías bajaron. La pregunta no es esa: la pregunta es si el proceso cambió de nivel o si tuvimos dos semanas buenas. Aquí lo demuestras con datos, no con entusiasmo."
        icono={TrendingDown}
      />

      <CoachQ labId="mejora" />

      <Panel titulo="Antes y después" subtitulo="Promedio de cada bloque · meta ≤ 8 %">
        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <BarrasAntesDespues
              antes={comparacion.before.mean}
              despues={comparacion.after.mean}
              meta={META}
              altura={230}
            />
          </div>
          <div className="text-center lg:text-left">
            <div className="ql-mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">
              Reducción del problema
            </div>
            <motion.div
              key={reduccionRelativa}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ql-display text-6xl font-bold leading-none"
              style={{ color: tonoColor.ok }}
            >
              ↓ {num(reduccionRelativa)} %
            </motion.div>
            <p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
              De {pct(comparacion.before.mean)} a {pct(comparacion.after.mean)}. Eso es{' '}
              <strong>{num(reduccionPuntos)} puntos porcentuales</strong> de diferencia y{' '}
              <strong>{num(reduccionRelativa)} % de reducción</strong> sobre la base. No son lo mismo, y confundirlos es
              el error de reporte más común del módulo.
            </p>
            <div className="mt-4">
              <Formula expresion="% de reducción = (después − antes) ÷ antes × 100" />
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        titulo="Ejercicio · ¿desde cuándo empieza el después?"
        subtitulo="La intervención se desplegó en la semana 13, pero el proceso tardó en estabilizarse"
        delay={0.05}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
            El bloque "después" empieza en la semana
          </span>
          <input
            type="range"
            min={13}
            max={19}
            value={inicio}
            data-testid="slider-inicio-despues"
            onChange={(e) => set({ mejora: { ...estado.mejora, inicioDespues: Number(e.target.value) } })}
            className="h-1.5 w-44 cursor-pointer appearance-none rounded-full bg-[hsl(var(--muted))] accent-[hsl(var(--primary))]"
          />
          <span className="ql-mono text-sm font-bold text-[hsl(var(--primary))]">S{inicio}</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Antes (n = 12)" valor={comparacion.before.mean} sufijo=" %" detalle={`σ = ${num(comparacion.before.sd)}`} />
          <Tile
            label={`Después (n = ${comparacion.after.n})`}
            valor={comparacion.after.mean}
            sufijo=" %"
            detalle={`σ = ${num(comparacion.after.sd)}`}
            tono="ok"
          />
          <Tile label="Reducción relativa" valor={reduccionRelativa} sufijo=" %" tono="ok" />
          <Tile
            label="Semanas excluidas"
            valor={transicion.length}
            decimales={0}
            detalle={transicion.length ? 'Periodo de transición' : 'Ninguna'}
          />
        </div>

        <div className="mt-4">
          <Hallazgo titulo="Lo que revela mover el corte">
            Con el corte en S{inicio}, la reducción es {pct(reduccionRelativa)}. Si incluyes las semanas de transición
            (S13–S15), el resultado se ve peor de lo que el proceso realmente logró; si empiezas demasiado tarde,
            estarás eligiendo tus mejores semanas. La regla honesta: declara el corte, di por qué lo elegiste y muestra
            el periodo excluido en el gráfico.
          </Hallazgo>
        </div>
      </Panel>

      <Panel titulo="Las 24 semanas completas" subtitulo="Ningún promedio reemplaza a mirar la serie en orden" delay={0.1}>
        <GraficoTendencia
          valores={entregasTardias}
          etiquetas={semanas.map((n) => `S${n}`)}
          meta={META}
          unidad="%"
          nombre="Entregas tardías"
          intervencion={13}
          suavizado
          altura={310}
        />
      </Panel>

      <Panel
        titulo="La prueba estadística"
        subtitulo="t de Welch para dos muestras independientes, α = 0.05"
        delay={0.15}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Estadístico t" valor={comparacion.t} decimales={2} />
          <Tile label="Grados de libertad" valor={comparacion.df} decimales={1} />
          <Tile
            label="Valor p"
            valor={comparacion.pValue}
            decimales={4}
            tono={comparacion.significant ? 'ok' : 'alerta'}
          />
          <Tile
            label="d de Cohen"
            valor={Math.abs(comparacion.cohensD)}
            decimales={2}
            detalle={Math.abs(comparacion.cohensD) >= 0.8 ? 'Efecto grande' : 'Efecto moderado'}
          />
        </div>

        <div className="mt-4 space-y-3">
          <Formula
            expresion="t = (X̄después − X̄antes) ÷ √(s²a/na + s²d/nd)"
            explicacion="Welch no asume varianzas iguales, que es lo habitual cuando un proceso mejora y además se estabiliza: la dispersión del después suele ser menor."
          />
          <Hallazgo titulo={comparacion.significant ? 'Diferencia significativa' : 'Diferencia no concluyente'}>
            {comparacion.significant ? (
              <>
                {valorP(comparacion.pValue)}, por debajo de 0.05: la diferencia entre bloques es mayor que la que la
                variación normal del proceso podría producir por azar. Con d = {num(Math.abs(comparacion.cohensD), 2)},
                el tamaño del efecto además es sustantivo, no solo estadístico.
              </>
            ) : (
              <>
                {valorP(comparacion.pValue)}: con estos bloques no se puede descartar que la diferencia sea variación
                normal. Necesitas más periodos o un cambio mayor antes de declarar la mejora.
              </>
            )}
          </Hallazgo>
        </div>
      </Panel>

      <Panel titulo="La confirmación en la carta de control" subtitulo="Un nuevo nivel se ve como un desplazamiento sostenido" delay={0.2}>
        <CartaControl
          valores={entregasTardias}
          etiquetas={semanas.map((n) => String(n))}
          unidad="%"
          altura={300}
        />
        <div className="mt-4 space-y-3">
          <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            Los límites del periodo base eran {num(limitesAntes.lcl)} – {num(limitesAntes.ucl)} %. El promedio de las
            últimas 6 semanas es {pct(mean(despues.slice(-6)))}
            {nuevoNivelEstable
              ? ', por debajo del límite inferior anterior: el proceso ya no es el mismo, cambió de nivel.'
              : ', todavía dentro del rango del proceso anterior.'}{' '}
            Las reglas detectan {senalesTotales.length} señales en la serie completa, lo que confirma que hubo un cambio
            estructural y no una racha.
          </p>
          <Hallazgo titulo="La advertencia importante">
            Calcular los límites con la serie completa mezcla dos procesos distintos: el de antes y el de después. Para
            controlar el proceso mejorado hay que recalcular los límites usando solo los datos posteriores a la
            estabilización. Los límites de la serie mezclada sirven para <em>demostrar</em> el cambio, no para
            <em> gestionar</em> el nuevo estado.
          </Hallazgo>
        </div>
      </Panel>

      <Panel titulo="Traducción al lenguaje de la gerencia" subtitulo="Con el resultado real, no con la meta" delay={0.25}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Pedidos tardíos evitados / año" valor={pedidosEvitados} decimales={0} />
          <Tile label="Costo evitado / año" valor={ahorro} decimales={0} detalle={`${usd(economia.costoEntregaTardia)} por pedido tardío`} />
          <Tile label="Inversión del proyecto" valor={economia.inversionMejora} decimales={0} />
          <Tile label="ROI" valor={roi} sufijo=" %" tono={roi > 0 ? 'ok' : 'critico'} />
        </div>
        <p className="mt-4 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
          Supuestos declarados: {economia.pedidosPorAno.toLocaleString('es-DO')} pedidos anuales,{' '}
          {usd(economia.costoEntregaTardia)} de costo por entrega tardía (flete urgente, reproceso y crédito), reducción
          de {num(reduccionPuntos)} pp sostenida durante doce meses. Sin estos supuestos escritos junto al número, el
          ahorro no es auditable.
        </p>
      </Panel>

      <Panel titulo="Tu conclusión" subtitulo="Esto es lo que presentarías a la gerencia" delay={0.3}>
        <Campo
          label="¿Podemos afirmar que el proceso mejoró? Sustenta con las cuatro evidencias"
          area
          valor={estado.mejora.conclusion}
          onChange={(v) => set({ mejora: { ...estado.mejora, conclusion: v } })}
          placeholder="El proceso pasó de X a Y (reducción de Z %), con una diferencia significativa (p = …), un nuevo nivel confirmado en la carta de control y una variabilidad que bajó de … a …"
          ayuda={`${estado.mejora.conclusion.trim().length}/60 caracteres mínimos. Menciona nivel, variabilidad, prueba estadística y estabilidad.`}
          testId="input-conclusion-mejora"
        />
      </Panel>

      <Teoria labId="mejora" />

      <Panel delay={0.35}>
        <Quiz labId="mejora" titulo="Ponlo a prueba" />
      </Panel>

      <CierreMision
        clave="mejora"
        requisitos={[
          { label: 'Elegiste y justificaste el corte del "después"', cumplido: inicio > 13 || estado.mejora.conclusion.trim().length > 0 },
          { label: 'La diferencia resultó estadísticamente significativa', cumplido: comparacion.significant },
          { label: 'Escribiste la conclusión con evidencia', cumplido: conclusionLista },
          { label: 'Respondiste los ejercicios', cumplido: Boolean(estado.quiz['mejora-1'] && estado.quiz['mejora-2']) },
        ]}
        siguiente={{ ruta: '/auditoria', label: 'Ir a Audit Lab' }}
      />
    </div>
  );
}
