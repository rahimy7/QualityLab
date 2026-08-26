import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Eye, EyeOff, MonitorPlay, Users } from 'lucide-react';
import { desafiosEnVivo } from '@/data/quizzes';
import { itemsAuditoria } from '@/data/auditoria';
import { incidencias } from '@/data/incidencias';
import { entregasTardias, muestraPreparacion, tiempoPreparacion } from '@/data/series';
import { lab, misiones } from '@/data/misiones';
import { capability, compareBeforeAfter, controlLimits, countBy, mean, nelsonRules, pareto } from '@/lib/stats';
import { num, pct, valorP } from '@/lib/formato';
import { tonoColor } from '@/lib/palette';
import { Chip, EncabezadoPagina, Panel } from '@/components/lab/primitivos';
import { TableroAula } from '@/components/lab/TableroAula';

interface BloqueAgenda {
  bloque: string;
  minutos: number;
  actividad: string;
  /** Pantalla que se proyecta; los recesos no tienen. */
  pantalla?: string;
}

/** Las 10 horas completas, recesos incluidos: 600 minutos de reloj de aula. */
const agenda: BloqueAgenda[] = [
  { bloque: 'Apertura', minutos: 20, actividad: 'Presentar el encargo de la empresa. Formar equipos. Escanear el QR y entrar a la plataforma.', pantalla: 'inicio' },
  { bloque: 'Misión 1', minutos: 40, actividad: 'Votación en vivo del diagnóstico. Proyectar el resultado del grupo y abrir el debate resultado vs. proceso.', pantalla: 'diagnostico' },
  { bloque: 'Teoría 1', minutos: 30, actividad: 'Medir para decidir + anatomía del KPI. Usar "Mi curso" como apoyo, no como clase completa.', pantalla: 'curso' },
  { bloque: 'Receso', minutos: 15, actividad: 'Pausa corta. Buen momento para resolver dudas de acceso a la plataforma.' },
  { bloque: 'Misión 2', minutos: 40, actividad: 'Cada equipo construye su ficha en KPI Lab hasta llegar a 80+ de Quality Score. Comparar dos fichas en pantalla.', pantalla: 'kpi' },
  { bloque: 'Misión 3', minutos: 50, actividad: 'Pareto Lab con las 148 incidencias. Cambiar de frecuencia a costo en vivo y discutir cómo cambia la prioridad.', pantalla: 'pareto' },
  { bloque: 'Pausa larga', minutos: 45, actividad: 'Almuerzo o corte principal de la jornada.' },
  { bloque: 'Misión 4', minutos: 50, actividad: 'Ishikawa por equipos, luego 5 porqués. Insistir en la pregunta de evidencia en cada nivel.', pantalla: 'porques' },
  { bloque: 'Misión 5', minutos: 40, actividad: 'Hoshin Kanri. Pedir que encuentren iniciativas huérfanas en la matriz del equipo vecino.', pantalla: 'hoshin' },
  { bloque: 'Receso', minutos: 15, actividad: 'Pausa corta antes del bloque estadístico, que es el más exigente.' },
  { bloque: 'Teoría 2', minutos: 40, actividad: 'Variabilidad y control. Statistics Lab: mover los intervalos del histograma y leer la carta de control juntos.', pantalla: 'estadistica' },
  { bloque: 'Misión 6', minutos: 50, actividad: 'Improvement Lab. Mover el corte del "después" en vivo: es el momento más potente del módulo.', pantalla: 'mejora' },
  { bloque: 'Misión 7', minutos: 40, actividad: 'Audit Lab. Comparar las clasificaciones de los equipos antes de revelar el criterio.', pantalla: 'auditoria' },
  { bloque: 'Simulador', minutos: 25, actividad: 'Simulador Kaizen y calculadora de impacto. Discutir los límites del modelo.', pantalla: 'simulador' },
  { bloque: 'Proyecto', minutos: 40, actividad: 'Cada equipo arma y descarga su informe A3 con lo que produjo durante el módulo.', pantalla: 'proyecto' },
  { bloque: 'Presentaciones', minutos: 30, actividad: 'Dos equipos presentan su A3. El resto audita el razonamiento, no el resultado.', pantalla: 'proyecto' },
  { bloque: 'Cierre', minutos: 30, actividad: 'Debate integrador, ranking final y entrega de certificados.', pantalla: 'ranking' },
];

function Solucion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] p-3.5">
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-xs font-bold">{titulo}</span>
        <span className="shrink-0 text-[hsl(var(--muted-foreground))]">
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </span>
      </button>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden pt-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]"
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  );
}

export default function Profesor() {
  const [desafio, setDesafio] = useState(desafiosEnVivo[0].id);
  const [revelado, setRevelado] = useState(false);

  const activo = desafiosEnVivo.find((d) => d.id === desafio) ?? desafiosEnVivo[0];
  const totalMinutos = agenda.reduce((acc, a) => acc + a.minutos, 0);

  const paretoCausas = pareto(countBy(incidencias, (i) => i.causa));
  const comparacion = compareBeforeAfter(entregasTardias.slice(0, 12), entregasTardias.slice(15));
  const limitesPrep = controlLimits(tiempoPreparacion);
  const senales = nelsonRules(tiempoPreparacion, limitesPrep);
  const cap = capability(muestraPreparacion, null, 50);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Panel del facilitador"
        titulo="Guion de las 10 horas"
        intro={`Todo lo que necesitas para conducir el módulo: la agenda minuto a minuto (${(totalMinutos / 60).toFixed(1)} h de reloj de aula, recesos incluidos), el banco de desafíos para proyectar y las respuestas del caso. Esta pantalla es solo para ti.`}
        icono={Users}
      />

      <TableroAula />

      <Panel
        titulo="Agenda"
        subtitulo={`${agenda.length} bloques · ${totalMinutos} minutos · ${totalMinutos - agenda.filter((a) => !a.pantalla).reduce((s2, a) => s2 + a.minutos, 0)} min de trabajo efectivo`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                {['Bloque', 'Min', 'Actividad', 'Pantalla'].map((h) => (
                  <th key={h} className="ql-mono px-2 py-2 font-bold uppercase tracking-[.08em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agenda.map((a, i) => (
                <tr
                  key={`${a.bloque}-${i}`}
                  className="border-b border-[hsl(var(--border)/.5)]"
                  style={a.pantalla ? undefined : { opacity: 0.6 }}
                >
                  <td className="px-2 py-2 font-bold">{a.bloque}</td>
                  <td className="ql-mono px-2 py-2">{a.minutos}</td>
                  <td className="px-2 py-2 leading-4 text-[hsl(var(--muted-foreground))]">{a.actividad}</td>
                  <td className="px-2 py-2">
                    {a.pantalla ? (
                      <Link href={lab(a.pantalla).ruta} className="font-bold text-[hsl(var(--primary))] hover:underline">
                        {lab(a.pantalla).corto}
                      </Link>
                    ) : (
                      <span className="text-[hsl(var(--muted-foreground))]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel titulo="Desafío en vivo" subtitulo="Proyecta la pregunta, deja que la sala responda y revela después">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {desafiosEnVivo.map((d) => (
            <Chip
              key={d.id}
              activo={desafio === d.id}
              onClick={() => {
                setDesafio(d.id);
                setRevelado(false);
              }}
            >
              {d.labId}
            </Chip>
          ))}
        </div>

        <div className="rounded-2xl border-2 border-[hsl(var(--primary))] p-6">
          {activo.contexto ? (
            <p className="ql-mono mb-3 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">{activo.contexto}</p>
          ) : null}
          <h3 className="ql-display text-2xl font-bold leading-tight sm:text-3xl">{activo.enunciado}</h3>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {activo.opciones.map((o) => {
              const correcta = o.id === activo.correcta;
              return (
                <div
                  key={o.id}
                  className="rounded-xl border p-3.5"
                  style={{
                    borderColor: revelado && correcta ? tonoColor.ok : 'hsl(var(--border))',
                    backgroundColor: revelado && correcta ? `${tonoColor.ok}12` : undefined,
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="ql-mono grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[hsl(var(--muted))] text-[11px] font-bold uppercase">
                      {o.id}
                    </span>
                    <span className="text-xs font-semibold leading-5">{o.texto}</span>
                  </div>
                  {revelado ? (
                    <p className="mt-2 pl-8.5 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{o.feedback}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="boton-revelar"
              onClick={() => setRevelado((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3.5 py-2.5 text-xs font-bold text-[hsl(var(--primary-foreground))]"
            >
              <MonitorPlay size={14} /> {revelado ? 'Ocultar respuesta' : 'Revelar respuesta'}
            </button>
            {revelado ? (
              <p className="min-w-0 flex-1 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">{activo.cierre}</p>
            ) : null}
          </div>
        </div>
      </Panel>

      <Panel titulo="Clave del caso" subtitulo="Las respuestas que la plataforma valida en cada laboratorio" delay={0.05}>
        <div className="grid gap-2 md:grid-cols-2">
          <Solucion titulo="Misión 1 · ¿Qué atacar primero?">
            Entregas tardías. Es el único indicador que combina alto impacto en el cliente con control real del equipo.
            Satisfacción y reclamos son indicadores de resultado: se mueven como consecuencia. El error típico de la sala
            es votar por la brecha más grande (satisfacción, 18 pp) sin preguntarse quién puede moverla mañana.
          </Solucion>

          <Solucion titulo="Misión 2 · Quality Score">
            Las once reglas verifican contenido, no solo que el campo esté lleno. Las que más se pierden: fuente del dato
            (nadie la escribe), fecha de la meta y umbral de reacción. Buen momento para preguntar "¿quién actúa cuando
            el indicador cruza el umbral, y en cuánto tiempo?".
          </Solucion>

          <Solucion titulo="Misión 3 · Pareto">
            Con las {incidencias.length} incidencias: {paretoCausas.vitalCount} causas explican {pct(paretoCausas.vitalShare)}.
            Orden: {paretoCausas.rows.slice(0, 3).map((r) => `${r.label} ${num(r.percent)} %`).join(' · ')}. Al filtrar
            solo el periodo posterior a la intervención, transporte sube al segundo lugar: ese es el momento de enseñar
            que el Pareto describe el pasado.
          </Solucion>

          <Solucion titulo="Misión 4 · Causa raíz">
            La cadena esperada baja de "entregó tarde" → "salió tarde" → "picking terminó tarde" → "buscó fuera de
            ubicación" → "maestro de ubicaciones desactualizado" → "la instrucción no asigna un rol responsable". La
            plataforma marca en ámbar cualquier respuesta que termine en "error humano" o "falta de compromiso".
          </Solucion>

          <Solucion titulo="Misión 5 · Hoshin">
            La matriz se valida buscando huecos: iniciativa sin KPI e indicador sin iniciativa. Pide que cada equipo
            revise la matriz del equipo vecino: encuentran los huecos ajenos mucho más rápido que los propios.
          </Solucion>

          <Solucion titulo="Misión 6 · ¿Mejoramos?">
            Con corte en S16: de {pct(comparacion.before.mean)} a {pct(comparacion.after.mean)}, reducción de{' '}
            {pct(Math.abs(comparacion.relativeChange))}, {valorP(comparacion.pValue)}. Mover el corte entre S13 y S19
            cambia el resultado varios puntos: úsalo en vivo para enseñar por qué el corte se declara y se justifica.
          </Solucion>

          <Solucion titulo="Statistics Lab · Carta de control">
            El tiempo de preparación tiene línea central {num(limitesPrep.center)} min, LSC {num(limitesPrep.ucl)} y{' '}
            {senales.length} señales. La más clara es el periodo 8 ({num(tiempoPreparacion[7])} min): el WMS estuvo
            caído dos días. El histograma de las {muestraPreparacion.length} mediciones da Cpk = {num(cap.cpk, 2)}{' '}
            contra LSE de 50 min: proceso {cap.verdict}.
          </Solucion>

          <Solucion titulo="Misión 7 · Auditoría">
            Clasificaciones correctas:{' '}
            {itemsAuditoria.map((i, n) => `${n + 1}. ${i.respuesta}`).join(' · ')}. El punto 4 es el más discutido: es
            observación y no no conformidad porque el ritual existe, produce evidencia y la falla fue puntual y
            justificada.
          </Solucion>
        </div>
      </Panel>

      <Panel titulo="Montaje de la sesión" delay={0.1}>
        <ul className="space-y-2.5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          <li>
            <strong className="text-[hsl(var(--foreground))]">Acceso:</strong> genera un QR con la URL de la plataforma
            y proyéctalo. No hay registro ni contraseña: cada participante entra, escribe su nombre y elige equipo.
          </li>
          <li>
            <strong className="text-[hsl(var(--foreground))]">Equipos:</strong> cinco equipos con nombres de referentes
            de calidad. En el selector de la barra superior cada participante elige el suyo; el ranking suma sobre esa
            base.
          </li>
          <li>
            <strong className="text-[hsl(var(--foreground))]">Persistencia:</strong> el avance se guarda en el
            dispositivo de cada participante. Si alguien cambia de teléfono, empieza de cero — avísalo al inicio.
          </li>
          <li>
            <strong className="text-[hsl(var(--foreground))]">Proyección:</strong> usa el Dashboard y el Pareto Lab en
            la pantalla del aula mientras los equipos trabajan en sus celulares. El contraste entre lo que ellos
            concluyen y lo que muestra la pantalla es donde ocurre la discusión.
          </li>
          <li>
            <strong className="text-[hsl(var(--foreground))]">Datos:</strong> el CSV de las {incidencias.length}{' '}
            incidencias se descarga desde "Datos del caso". Útil si quieres que algún equipo trabaje en Excel para
            comparar métodos.
          </li>
          <li>
            <strong className="text-[hsl(var(--foreground))]">Evaluación:</strong> los Quality Points generan
            participación, no calificación. Para evaluar, usa el informe A3 que cada equipo descarga al final: ahí está
            el razonamiento, no el puntaje.
          </li>
        </ul>
      </Panel>

      <Panel titulo="Misiones y sus requisitos" subtitulo="Lo que la plataforma exige antes de otorgar puntos" delay={0.15}>
        <div className="grid gap-2 sm:grid-cols-2">
          {misiones.map((m) => (
            <div key={m.id} className="rounded-xl border border-[hsl(var(--border))] p-3">
              <div className="ql-mono text-[9px] uppercase tracking-[.12em] text-[hsl(var(--primary))]">
                Misión {m.id} · {m.puntos} QP
              </div>
              <div className="mt-1 text-xs font-bold">{m.titulo}</div>
              <p className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{m.evidencia}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
