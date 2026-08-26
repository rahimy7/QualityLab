import { useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowDown, HelpCircle, Microscope, TriangleAlert, Wand2 } from 'lucide-react';
import { useProgreso, type PasoPorque } from '@/store/progreso';
import { tonoColor } from '@/lib/palette';
import { Boton, Campo, EncabezadoPagina, Hallazgo, Panel } from '@/components/lab/primitivos';
import { CoachQ } from '@/components/lab/CoachQ';
import { Teoria } from '@/components/lab/Teoria';
import { Quiz } from '@/components/lab/Quiz';
import { CierreMision } from '@/components/lab/CierreMision';

/**
 * Terminaciones que cierran el análisis en lugar de abrirlo. Cuando aparecen,
 * la plataforma no bloquea: pide un porqué más, que es lo que haría un buen
 * facilitador.
 */
const cierresPobres = [
  'falta de compromiso',
  'error humano',
  'descuido',
  'no le importa',
  'mala actitud',
  'irresponsabilidad',
  'falta de capacitacion',
  'falta de capacitación',
  'negligencia',
];

const tiposEvidencia = [
  'Registro del sistema',
  'Observación directa en piso',
  'Entrevista con el responsable',
  'Documento o procedimiento',
  'Medición o conteo',
  'Todavía es una hipótesis',
];

const cadenaEjemplo: PasoPorque[] = [
  {
    pregunta: '¿Por qué el pedido se entregó tarde?',
    respuesta: 'El pedido salió del centro de distribución después de la hora de corte de la ruta.',
    evidencia: 'Registro del sistema · marca de salida en el ERP, 38 pedidos del periodo',
  },
  {
    pregunta: '¿Por qué ocurrió eso?',
    respuesta: 'La preparación del pedido terminó después de la hora comprometida.',
    evidencia: 'Medición o conteo · tiempo de preparación promedio 47 min contra estándar de 40',
  },
  {
    pregunta: '¿Por qué ocurrió eso?',
    respuesta: 'El operario invirtió tiempo buscando producto que no estaba en la ubicación indicada.',
    evidencia: 'Observación directa en piso · acompañamiento a 4 operarios durante dos turnos',
  },
  {
    pregunta: '¿Por qué ocurrió eso?',
    respuesta: 'El maestro de ubicaciones del WMS no refleja la posición física real tras el relayout.',
    evidencia: 'Registro del sistema · conteo cruzado de 40 SKU, 5 con discrepancia',
  },
  {
    pregunta: '¿Por qué ocurrió eso?',
    respuesta: 'La instrucción IT-ALM-02 asigna la actualización a "almacén" sin nombrar un rol responsable.',
    evidencia: 'Documento o procedimiento · IT-ALM-02 vigente, punto 4.2',
  },
];

export default function CincoPorques() {
  const { estado, set, otorgarLogro, quitarLogro } = useProgreso();
  const pasos = estado.porques;
  const raiz = estado.causaRaiz;

  const analisis = useMemo(() => {
    const completos = pasos.filter((p) => p.respuesta.trim().length >= 12).length;
    const conEvidencia = pasos.filter(
      (p) => p.respuesta.trim().length >= 12 && p.evidencia.trim() !== '' && !p.evidencia.startsWith('Todavía'),
    ).length;
    const debiles = pasos
      .map((p, i) => ({ i, texto: p.respuesta.toLowerCase() }))
      .filter(({ texto }) => cierresPobres.some((c) => texto.includes(c)))
      .map(({ i }) => i + 1);
    return { completos, conEvidencia, debiles };
  }, [pasos]);

  const raizLista = raiz.enunciado.trim().length >= 25 && raiz.tipo !== '' && !raiz.tipo.startsWith('Todavía');
  const cadenaValidada = analisis.completos === 5 && analisis.conEvidencia === 5 && analisis.debiles.length === 0;

  useEffect(() => {
    if (cadenaValidada && raizLista) otorgarLogro('causa-evidencia');
    else quitarLogro('causa-evidencia');
  }, [cadenaValidada, raizLista, otorgarLogro, quitarLogro]);

  const actualizar = (indice: number, parcial: Partial<PasoPorque>) => {
    set({ porques: pasos.map((p, i) => (i === indice ? { ...p, ...parcial } : p)) });
  };

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        eyebrow="Misión 4b · Root Cause Lab"
        titulo="Los 5 Porqués"
        intro="Baja del síntoma observable a la condición del sistema que lo permite. Cada respuesta debe poder rastrearse a algo que alguien vio, midió o leyó: hipótesis no es causa comprobada."
        icono={HelpCircle}
        acciones={
          <Boton variante="secundario" testId="boton-ejemplo-porques" onClick={() => set({ porques: cadenaEjemplo })}>
            <Wand2 size={14} /> Ver cadena modelo
          </Boton>
        }
      />

      <CoachQ labId="porques" />

      <Panel
        titulo="Cadena de análisis"
        subtitulo="Problema de partida: 19 % de los pedidos se entrega después de la fecha comprometida"
      >
        <div className="space-y-1">
          {pasos.map((paso, i) => {
            const debil = analisis.debiles.includes(i + 1);
            const completo = paso.respuesta.trim().length >= 12;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: debil
                      ? `${tonoColor.alerta}88`
                      : completo
                        ? 'hsl(var(--primary) / .4)'
                        : 'hsl(var(--border))',
                    backgroundColor: debil ? `${tonoColor.alerta}0e` : undefined,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="ql-mono grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[hsl(var(--primary)/.12)] text-[11px] font-bold text-[hsl(var(--primary))]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="text-xs font-bold">{paso.pregunta}</div>
                      <Campo
                        label="Respuesta"
                        area
                        valor={paso.respuesta}
                        onChange={(v) => actualizar(i, { respuesta: v })}
                        placeholder="Describe un hecho observable, no una interpretación"
                        testId={`porque-respuesta-${i}`}
                      />
                      <Campo
                        label="¿Con qué evidencia lo sostienes?"
                        valor={paso.evidencia.split(' · ')[0]}
                        onChange={(v) => {
                          const detalle = paso.evidencia.includes(' · ') ? paso.evidencia.split(' · ')[1] : '';
                          actualizar(i, { evidencia: detalle ? `${v} · ${detalle}` : v });
                        }}
                        opciones={tiposEvidencia}
                        testId={`porque-evidencia-${i}`}
                      />
                      {paso.evidencia && !paso.evidencia.startsWith('Todavía') ? (
                        <Campo
                          label="Detalle de la evidencia"
                          valor={paso.evidencia.includes(' · ') ? paso.evidencia.split(' · ')[1] : ''}
                          onChange={(v) => actualizar(i, { evidencia: `${paso.evidencia.split(' · ')[0]} · ${v}` })}
                          placeholder="¿Qué registro, cuántos casos, en qué periodo?"
                          testId={`porque-detalle-${i}`}
                        />
                      ) : null}
                    </div>
                  </div>

                  {debil ? (
                    <div className="mt-3 flex items-start gap-2 rounded-lg p-2.5" style={{ backgroundColor: `${tonoColor.alerta}18` }}>
                      <TriangleAlert size={14} className="mt-px shrink-0" style={{ color: tonoColor.alerta }} />
                      <p className="text-[11px] leading-4">
                        Esta respuesta atribuye el problema a las personas y cierra el análisis. Pregúntate un porqué
                        más: ¿qué hace que ese error sea posible o probable en este proceso?
                      </p>
                    </div>
                  ) : null}
                </div>

                {i < pasos.length - 1 ? (
                  <div className="flex justify-center py-1">
                    <ArrowDown size={16} className="text-[hsl(var(--muted-foreground))]" />
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </Panel>

      <Panel titulo="Causa raíz probable" subtitulo="Formúlala como una condición ausente o un mecanismo faltante" delay={0.05}>
        <div className="space-y-4">
          <Campo
            label="Enunciado de la causa raíz"
            area
            valor={raiz.enunciado}
            onChange={(v) => set({ causaRaiz: { ...raiz, enunciado: v } })}
            placeholder="No existe un mecanismo con responsable asignado para…"
            testId="input-causa-raiz"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              label="¿Qué evidencia demuestra que esta es la causa?"
              valor={raiz.tipo}
              onChange={(v) => set({ causaRaiz: { ...raiz, tipo: v } })}
              opciones={tiposEvidencia}
              testId="input-tipo-evidencia-raiz"
            />
            <Campo
              label="Detalle de la verificación"
              valor={raiz.evidencia}
              onChange={(v) => set({ causaRaiz: { ...raiz, evidencia: v } })}
              placeholder="Conteo cruzado de 40 SKU: 5 con discrepancia"
              testId="input-evidencia-raiz"
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)] p-4">
          <div className="flex items-start gap-2.5">
            <Microscope size={16} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />
            <div>
              <div className="ql-mono text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--primary))]">
                Prueba de dos vías
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
                Una causa raíz se verifica en dos direcciones: si la condición está presente, el efecto aparece; si la
                eliminas, el efecto desaparece. Si solo puedes comprobar una de las dos, todavía tienes una hipótesis
                fuerte, no una causa demostrada. Dilo así en tu informe: es más creíble que afirmar de más.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {cadenaValidada && raizLista ? (
            <Hallazgo titulo="Cadena verificable · +50 QP">
              Los cinco niveles tienen evidencia declarada y ninguno termina en un juicio sobre las personas. Tu causa
              raíz puede defenderse ante la gerencia porque cada eslabón se puede auditar.
            </Hallazgo>
          ) : (
            <p className="text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
              Faltan: {5 - analisis.completos > 0 ? `${5 - analisis.completos} respuestas, ` : ''}
              {5 - analisis.conEvidencia > 0 ? `${5 - analisis.conEvidencia} evidencias, ` : ''}
              {analisis.debiles.length > 0 ? `revisar los porqués ${analisis.debiles.join(', ')}, ` : ''}
              {!raizLista ? 'formular la causa raíz con su verificación' : ''}
              {analisis.completos === 5 && analisis.conEvidencia === 5 && analisis.debiles.length === 0 && raizLista
                ? 'nada'
                : ''}
              .
            </p>
          )}
        </div>
      </Panel>

      <Teoria labId="porques" />

      <Panel delay={0.1}>
        <Quiz labId="porques" titulo="Ponlo a prueba" />
      </Panel>

      <CierreMision
        clave="causa"
        requisitos={[
          { label: 'Ishikawa con causas en las 6 ramas', cumplido: estado.logros.includes('ishikawa-completo') },
          { label: 'Los cinco porqués respondidos', cumplido: analisis.completos === 5 },
          { label: 'Cada nivel con evidencia declarada', cumplido: analisis.conEvidencia === 5 },
          { label: 'Causa raíz formulada y verificada', cumplido: raizLista },
        ]}
        siguiente={{ ruta: '/hoshin', label: 'Ir a Hoshin Kanri' }}
      />

      <div className="ql-card rounded-2xl p-5">
        <p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          ¿Todavía no trabajaste el diagrama de causa-efecto?{' '}
          <Link href="/ishikawa" className="font-bold text-[hsl(var(--primary))] hover:underline">
            Abre Ishikawa 6M
          </Link>{' '}
          para abrir el abanico de hipótesis antes de bajar por una sola rama.
        </p>
      </div>
    </div>
  );
}
