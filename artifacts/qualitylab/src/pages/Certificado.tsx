import { Award, Printer } from 'lucide-react';
import { equipos } from '@/data/equipos';
import { empresa } from '@/data/caso';
import { misiones, puntosPosibles } from '@/data/misiones';
import { preguntas } from '@/data/quizzes';
import { useProgreso } from '@/store/progreso';
import { Boton, Campo, EncabezadoPagina, Panel } from '@/components/lab/primitivos';

export default function Certificado() {
  const { estado, set, puntos, avance } = useProgreso();
  const equipo = equipos.find((e) => e.id === estado.perfil.equipoId) ?? equipos[0];
  const aciertos = preguntas.filter((p) => estado.quiz[p.id] === p.correcta).length;
  const completadas = misiones.filter((m) => estado.misiones.includes(m.clave));
  const habilitado = completadas.length === misiones.length && estado.perfil.nombre.trim() !== '';

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Cierre del módulo"
        titulo="Mi certificado"
        intro="El certificado se emite cuando las siete misiones están completas. No acredita asistencia: acredita que demostraste cada competencia con evidencia dentro de la plataforma."
        icono={Award}
        acciones={
          habilitado ? (
            <Boton testId="boton-imprimir-certificado" onClick={() => window.print()}>
              <Printer size={14} /> Imprimir
            </Boton>
          ) : undefined
        }
      />

      {!estado.perfil.nombre.trim() ? (
        <Panel titulo="Falta tu nombre">
          <Campo
            label="¿Cómo debe aparecer tu nombre en el certificado?"
            valor={estado.perfil.nombre}
            onChange={(v) => set({ perfil: { ...estado.perfil, nombre: v } })}
            placeholder="Nombre y apellido"
            testId="input-nombre-certificado"
            className="max-w-md"
          />
        </Panel>
      ) : null}

      <div
        className="ql-card overflow-hidden rounded-2xl"
        style={{ opacity: habilitado ? 1 : 0.55 }}
      >
        <div className="border-b-4 border-[hsl(var(--accent))] bg-[hsl(var(--primary))] px-8 py-7 text-center text-[hsl(var(--primary-foreground))]">
          <div className="ql-mono text-[10px] uppercase tracking-[.24em] opacity-80">QualityLab 360</div>
          <div className="ql-display mt-1 text-2xl font-bold">Laboratorio de Mejora Continua</div>
        </div>

        <div className="px-6 py-10 text-center sm:px-12">
          <p className="ql-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">
            Se certifica que
          </p>
          <h2 className="ql-display mt-3 text-4xl font-bold sm:text-5xl">
            {estado.perfil.nombre.trim() || 'Nombre del participante'}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            completó el módulo <strong className="text-[hsl(var(--foreground))]">Métodos de Análisis y Medición de la Mejora Continua</strong>{' '}
            (10 horas), resolviendo el caso integrador de {empresa.nombre} como parte del {equipo.nombre}.
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              { label: 'Misiones', valor: `${completadas.length}/${misiones.length}` },
              { label: 'Quality Points', valor: `${puntos.total}/${puntosPosibles}` },
              { label: 'Ejercicios correctos', valor: `${aciertos}/${preguntas.length}` },
            ].map((d) => (
              <div key={d.label} className="rounded-xl border border-[hsl(var(--border))] p-3.5">
                <div className="ql-display text-2xl font-bold text-[hsl(var(--primary))]">{d.valor}</div>
                <div className="ql-mono mt-0.5 text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                  {d.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-2xl text-left">
            <div className="ql-mono mb-3 text-center text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">
              Competencias demostradas
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {misiones.map((m) => {
                const hecha = estado.misiones.includes(m.clave);
                return (
                  <li
                    key={m.id}
                    className="flex items-start gap-2 rounded-lg border border-[hsl(var(--border))] p-2.5 text-[11px] leading-4"
                    style={{ opacity: hecha ? 1 : 0.45 }}
                  >
                    <span className="ql-mono mt-px shrink-0 font-bold text-[hsl(var(--primary))]">
                      {hecha ? '✓' : '·'}
                    </span>
                    <span>{m.evidencia}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-9 flex flex-wrap items-end justify-center gap-10">
            <div className="text-center">
              <div className="h-px w-40 bg-[hsl(var(--border))]" />
              <div className="ql-mono mt-2 text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                Facilitador del módulo
              </div>
            </div>
            <div className="text-center">
              <div className="h-px w-40 bg-[hsl(var(--border))]" />
              <div className="ql-mono mt-2 text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">
                Fecha de emisión
              </div>
            </div>
          </div>
        </div>
      </div>

      {!habilitado ? (
        <Panel>
          <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            Faltan {misiones.length - completadas.length} misiones por completar
            {!estado.perfil.nombre.trim() ? ' y tu nombre' : ''}. El certificado se activa automáticamente cuando
            termines: {avance} % de la ruta recorrido.
          </p>
        </Panel>
      ) : null}
    </div>
  );
}
