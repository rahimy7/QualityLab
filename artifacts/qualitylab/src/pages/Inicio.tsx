import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Building2, Compass, Download, PlayCircle, QrCode, Sparkles } from 'lucide-react';
import { empresa, indicadoresBase, semaforo } from '@/data/caso';
import { misiones, puntosPosibles } from '@/data/misiones';
import { incidencias, incidenciasCsv } from '@/data/incidencias';
import { casoActivo, casosLista, cambiarCaso } from '@/data/casos';
import { useProgreso } from '@/store/progreso';
import { descargar, pp } from '@/lib/formato';
import { Boton, Campo, Contador, Panel, Semaforo } from '@/components/lab/primitivos';
import { CoachQ } from '@/components/lab/CoachQ';
import { PanelCuenta } from '@/components/lab/PanelCuenta';
import { FuenteDeDatos } from '@/components/lab/FuenteDeDatos';
import { EntrevistaEmpleado } from '@/components/lab/EntrevistaEmpleado';

const flujo = ['Datos', 'Análisis', 'Causa', 'Mejora', 'Control'];

function Flujo() {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {flujo.map((paso, i) => (
        <motion.div
          key={paso}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.12, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <span className="ql-mono rounded-lg border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.08)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[hsl(var(--primary))]">
            {paso}
          </span>
          {i < flujo.length - 1 ? <ArrowRight size={13} className="text-[hsl(var(--muted-foreground))]" /> : null}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Selector de caso: se elige una vez al empezar el módulo. Cambiar de caso
 * persiste la elección y recarga la app, para que todas las pantallas trabajen
 * sobre el mismo dataset (indicadores, series, incidencias, quizzes, teoría…).
 */
function SelectorDeCaso() {
  return (
    <div className="ql-card rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="ql-mono text-[10px] uppercase tracking-[.17em] text-[hsl(var(--primary))]">
            Caso del aula
          </div>
          <div className="ql-display mt-1 text-lg font-bold">Elige la empresa a intervenir</div>
        </div>
        <span className="ql-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
          Tu avance se guarda por caso
        </span>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {casosLista.map((c) => {
          const activo = c.id === casoActivo.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => (activo ? undefined : cambiarCaso(c.id))}
              className={`relative flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                activo
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)] cursor-default'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.5)] hover:bg-[hsl(var(--muted)/.4)]'
              }`}
              data-testid={`selector-caso-${c.id}`}
              disabled={activo}
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[hsl(var(--muted))] text-2xl">
                {c.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-bold">{c.nombreCorto}</div>
                  {activo ? (
                    <span className="ql-mono rounded bg-[hsl(var(--primary))] px-1.5 py-0.5 text-[9px] uppercase tracking-[.1em] text-[hsl(var(--primary-foreground))]">
                      Activo
                    </span>
                  ) : null}
                </div>
                <div className="mt-0.5 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">
                  {c.empresa.sector}
                </div>
                <div className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">
                  {c.indicadoresBase.length} indicadores · {c.incidencias.length} incidencias · {c.misiones.length} misiones
                </div>
              </div>
              {!activo ? (
                <ArrowRight size={14} className="mt-1 shrink-0 text-[hsl(var(--muted-foreground))]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Video introductorio del proceso del caso activo. YouTube-nocookie. */
function VideoDelProceso() {
  const v = casoActivo.video;
  const [reproducir, setReproducir] = useState(false);
  const url = `https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`;
  const miniatura = `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`;
  return (
    <Panel titulo="El proceso" subtitulo={`${v.titulo} · ${v.minutos} min`} delay={0.08}>
      <p className="text-[13px] leading-5 text-[hsl(var(--muted-foreground))]">{v.resumen}</p>
      <div className="mt-3 aspect-video overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-black">
        {reproducir ? (
          <iframe
            src={url}
            title={v.titulo}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setReproducir(true)}
            className="group relative block h-full w-full"
            data-testid="boton-play-video"
            aria-label={`Reproducir ${v.titulo}`}
          >
            <img src={miniatura} alt="" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" loading="lazy" />
            <span className="absolute inset-0 grid place-items-center bg-black/30">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-2xl transition group-hover:scale-105">
                <PlayCircle size={28} />
              </span>
            </span>
          </button>
        )}
      </div>
    </Panel>
  );
}

/**
 * Tarjeta de indicador con un botón "Ver fuente" que despliega FuenteDeDatos.
 */
function TarjetaIndicador({ ind }: { ind: (typeof indicadoresBase)[number] }) {
  const [abierta, setAbierta] = useState(false);
  const s = semaforo(ind.valor, ind.meta, ind.menorEsMejor);
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.5)] p-3.5">
      <div className="ql-mono truncate text-[10px] uppercase tracking-[-.02em] text-[hsl(var(--muted-foreground))]">
        {ind.label}
      </div>
      <div className="ql-display mt-1 text-[26px] font-bold leading-none">
        <Contador valor={ind.valor} decimales={ind.valor % 1 === 0 ? 0 : 1} sufijo={ind.unidad} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <Semaforo tono={s.tono} etiqueta={s.etiqueta} size="sm" />
        <span className="ql-mono text-[10px] text-[hsl(var(--muted-foreground))]">{pp(ind.variacion)}</span>
      </div>
      <div className="mt-2 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">
        meta {ind.menorEsMejor ? '≤' : '≥'} {ind.meta}
        {ind.unidad} · {ind.responsable}
      </div>
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        className="ql-mono mt-2 inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2 py-1 text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/.5)]"
        data-testid={`toggle-fuente-${ind.id}`}
      >
        {abierta ? 'Ocultar fuente' : 'Ver fuente'}
      </button>
      {abierta ? (
        <div className="mt-3">
          <FuenteDeDatos indicador={ind} />
        </div>
      ) : null}
    </div>
  );
}

export default function Inicio() {
  const { estado, set, puntos, avance } = useProgreso();
  const nombre = estado.perfil.nombre.trim();

  return (
    <div className="space-y-6">
      <SelectorDeCaso />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="ql-card overflow-hidden rounded-2xl"
      >
        <div className="p-6 sm:p-8">
          <div className="ql-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">
            Métodos de análisis y medición de la mejora continua · 10 horas
          </div>
          <h1 className="ql-display mt-2 text-4xl font-bold leading-[1.02] sm:text-6xl">QualityLab 360</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            Un laboratorio, no una presentación. Vas a tomar un problema real de{' '}
            <strong className="font-semibold text-[hsl(var(--foreground))]">{casoActivo.nombreCorto}</strong>,
            medirlo, analizar sus causas, proponer una mejora y demostrar con datos si funcionó.
          </p>
          <div className="mt-6">
            <Flujo />
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Campo
              label={nombre ? `Bienvenido, ${nombre}` : 'Tu nombre (queda solo en este dispositivo)'}
              valor={estado.perfil.nombre}
              onChange={(v) => set({ perfil: { ...estado.perfil, nombre: v } })}
              placeholder="Escribe tu nombre para personalizar el certificado"
              testId="input-nombre"
              className="max-w-md"
            />
            <Link href="/misiones" data-testid="link-empezar">
              <Boton className="w-full sm:w-auto">
                Empezar la ruta <ArrowRight size={14} />
              </Boton>
            </Link>
          </div>
        </div>

        <div className="grid gap-px border-t border-[hsl(var(--border))] bg-[hsl(var(--border))] sm:grid-cols-3">
          {[
            { label: 'Tu progreso', valor: avance, sufijo: '%', detalle: `${estado.misiones.length} de ${misiones.length} misiones` },
            { label: 'Quality Points', valor: puntos.total, sufijo: '', detalle: `de ${puntosPosibles} posibles` },
            { label: 'Datos del caso', valor: incidencias.length, sufijo: '', detalle: 'incidencias reales para analizar' },
          ].map((item) => (
            <div key={item.label} className="bg-[hsl(var(--card))] p-5">
              <div className="ql-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                {item.label}
              </div>
              <div className="ql-display mt-1 text-3xl font-bold">
                <Contador valor={item.valor} decimales={0} sufijo={item.sufijo} />
              </div>
              <div className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">{item.detalle}</div>
            </div>
          ))}
        </div>
      </motion.section>

      <PanelCuenta />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Panel
          titulo="El encargo"
          subtitulo={`${empresa.nombre} · ${empresa.sector} · ${empresa.tamano}`}
          delay={0.05}
          acciones={
            <div className="flex flex-wrap items-center gap-2">
              <EntrevistaEmpleado />
              <Boton variante="secundario" testId="boton-descargar-datos" onClick={() => descargar(`incidencias-${casoActivo.id}.csv`, incidenciasCsv())}>
                <Download size={14} /> Datos en CSV
              </Boton>
            </div>
          }
        >
          <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)] p-4">
            <Building2 size={18} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />
            <p className="text-sm leading-6">{empresa.encargo}</p>
          </div>
          <div className="mt-3 flex items-start gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
            <Sparkles size={13} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />
            <span>
              Puedes <em>entrevistar</em> a un empleado del caso: sorteamos su rol y, en secreto, si dirá la verdad
              o meterá contradicciones. Tu trabajo es distinguirlo confrontando lo que dice con los datos.
            </span>
          </div>
          <p className="mt-3 text-[11px] text-[hsl(var(--muted-foreground))]">{empresa.periodo}</p>
        </Panel>

        <VideoDelProceso />
      </div>

      <Panel
        titulo="Situación de la empresa"
        subtitulo="Tablero entregado por la gerencia al inicio del módulo. Cada indicador expone su fuente y últimas mediciones."
        delay={0.1}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {indicadoresBase.map((ind) => (
            <TarjetaIndicador key={ind.id} ind={ind} />
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel titulo="La ruta" subtitulo="Siete misiones encadenadas sobre el mismo caso" delay={0.15}>
          <div className="relative space-y-1 before:absolute before:bottom-6 before:left-[15px] before:top-6 before:w-px before:bg-[hsl(var(--border))]">
            {misiones.map((m) => {
              const hecha = estado.misiones.includes(m.clave);
              return (
                <Link
                  key={m.id}
                  href={`/misiones#${m.clave}`}
                  data-testid={`inicio-mision-${m.id}`}
                  className="relative flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-[hsl(var(--muted)/.5)]"
                >
                  <span
                    className={`ql-mono z-10 grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                      hecha
                        ? 'bg-[#2f9e6e] text-white'
                        : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]'
                    }`}
                  >
                    {m.id}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-bold">{m.titulo}</span>
                      <span className="ql-mono text-[10px] uppercase tracking-[.1em] text-[hsl(var(--primary))]">
                        {m.kicker}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">{m.reto}</p>
                  </div>
                  <span className="ql-mono ml-auto shrink-0 text-[10px] text-[hsl(var(--muted-foreground))]">
                    {m.puntos} QP
                  </span>
                </Link>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-6">
          <CoachQ labId="diagnostico" nota="Antes de tocar una herramienta, define el problema en términos medibles. Todo lo demás depende de eso." />

          <Panel titulo="Cómo se usa en clase" delay={0.2}>
            <ul className="space-y-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
              <li className="flex gap-2.5">
                <QrCode size={15} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />
                <span>
                  Entra desde el celular con el QR del aula. Puedes instalarla en la pantalla de inicio: funciona como
                  una app y no requiere cuenta.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Compass size={15} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />
                <span>
                  Tu avance se guarda en este dispositivo por caso. Cambiar de caso conserva lo trabajado en el otro.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Bot size={15} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />
                <span>
                  Q, el coach, y las entrevistas con empleados usan IA. Verifica siempre lo que te digan contra los
                  datos que ves en las pantallas.
                </span>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
