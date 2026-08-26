# QualityLab 360

Plataforma web (PWA) para el módulo de 10 horas **Métodos de Análisis y Medición de la Mejora Continua**: los participantes entran desde el celular con un QR y resuelven un caso real —Distribuidora Andina— midiendo, analizando causas, proponiendo una mejora y demostrando con datos si funcionó.

## Run & Operate

- `pnpm run dev` — levanta el aula (puerto 18778) y la API (8080) a la vez. Es lo que hace falta para dar clase con sesiones.
- `pnpm --filter @workspace/qualitylab run dev` — solo la web. Funciona igual, pero sin guardar en la base de datos.
- `pnpm --filter @workspace/api-server run dev` — solo la API Express (puerto 8080)
- `pnpm run typecheck` — typecheck de todos los paquetes
- `pnpm run build` — typecheck + build de todo el workspace
- `pnpm --filter @workspace/db run push` — aplica el esquema Drizzle a la base (solo desarrollo)
- `pnpm --filter @workspace/api-spec run codegen` — regenera cliente y esquemas Zod desde `openapi.yaml`
- Env requerido: `DATABASE_URL` (Postgres) en `.env`, más `PORT` y `BASE_PATH` para la web (los inyecta `.replit-artifact/artifact.toml`). Hay una plantilla en `.env.example`; los `.env` están fuera de git.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: React 19 + Vite 7 + Tailwind 4 + wouter (router) + framer-motion + Recharts
- API: Express 5 · DB: PostgreSQL (Neon) + Drizzle · Validación: Zod (`zod/v4`)
- Contrato: OpenAPI en `lib/api-spec/openapi.yaml`; Orval genera los hooks de React Query y los esquemas Zod
- El contenido del módulo viaja en el bundle y el avance vive en `localStorage`; la base de datos es un espejo

## Where things live

Todo el módulo educativo está en `artifacts/qualitylab/src`:

- `data/` — **fuente de verdad del contenido**. `caso.ts` (empresa, indicadores base, economía), `incidencias.ts` (dataset de 148 incidencias, generado con semilla fija), `series.ts` (24 semanas de 6 indicadores + muestras individuales), `teoria.ts` (10 bloques conceptuales), `quizzes.ts` (banco de ejercicios con retroalimentación por opción), `auditoria.ts`, `misiones.ts` (catálogo de pantallas, misiones y logros), `coach.ts`, `equipos.ts`.
- `lib/stats.ts` — toda la estadística del módulo (Pareto, histograma, regresión, límites de control, reglas de Nelson, capacidad, t de Welch con su valor p). Sin dependencias: es material de clase auditable.
- `store/progreso.tsx` — estado del participante y su persistencia; también calcula los Quality Points.
- `components/charts/graficos.tsx` — los siete gráficos del módulo.
- `components/lab/` — piezas compartidas: `primitivos.tsx`, `Quiz`, `Teoria`, `CoachQ`, `CierreMision`.
- `pages/` — una pantalla por laboratorio; `App.tsx` las enruta con carga diferida.
- `store/nube.tsx` — sincronización con el servidor: unirse a una sesión, guardado diferido, latido y recuperación.
- `components/lab/Aula.tsx` — unirse a la clase, estado de conexión y resolución de conflictos.
- `components/lab/TableroAula.tsx` — panel del facilitador: crear la sesión y ver el aula en vivo.
- `public/` — `manifest.webmanifest`, `sw.js` e iconos de la PWA.

Y fuera de la app web:

- `lib/db/src/schema/` — una tabla por archivo: `sesiones`, `participantes`, `avances`, `respuestas`.
- `lib/api-spec/openapi.yaml` — **fuente de verdad del contrato**. Todo endpoint nuevo empieza aquí.
- `artifacts/api-server/src/routes/` — `sesiones.ts` (aula y tablero) y `avance.ts` (guardar y leer progreso).

## Architecture decisions

- **Sin backend ni cuentas.** El avance se guarda en `localStorage` del dispositivo. Es lo que permite repartir un QR y que la sala esté trabajando en el primer minuto; el precio es que cambiar de teléfono reinicia el progreso, y así se advierte en el panel del facilitador.
- **Datos con semilla fija.** `incidencias.ts` y las muestras de `series.ts` se generan con `mulberry32` y semilla constante: dos equipos que analicen lo mismo deben obtener el mismo número, así la discusión es sobre el método y no sobre los datos. El dataset se descarga en CSV desde `/datos`.
- **La estadística no se delega a una librería.** `lib/stats.ts` implementa las fórmulas a mano (incluida la beta incompleta para el valor p) porque el archivo es parte del material: un participante puede abrirlo y verificar lo que la plataforma afirma.
- **Los ejercicios se validan contra criterio, no contra "campo lleno".** El Quality Score del KPI comprueba que la fórmula tenga denominador, que la meta difiera de la línea base, que haya fuente declarada; los 5 porqués marcan en ámbar las cadenas que terminan en juicios sobre las personas.
- **Movimiento reducido explícito.** Recharts anima por JavaScript, así que `prefers-reduced-motion` se lee con `lib/movimiento.ts` y desactiva `isAnimationActive`; neutralizar solo las animaciones CSS dejaba los gráficos vacíos.
- **Carga diferida por pantalla.** Solo `Inicio` viaja en el bundle inicial (~181 kB gzip); Recharts se descarga al abrir el primer laboratorio con gráficos.
- **La base de datos es un espejo, no la fuente.** El participante trabaja contra `localStorage` y la sincronización va detrás, diferida 2.5 s y con latido cada 90 s. Si el wifi del aula cae, la clase continúa y lo pendiente se envía al volver la red. Conectarse a una sesión es opcional: sin código, la plataforma funciona igual.
- **Identidad sin cuentas.** El navegador genera un `dispositivoId` en el primer arranque. Para entrar basta el código de sesión; para recuperar el avance en otro teléfono, el mismo código y el mismo nombre. No hay contraseñas que repartir en un aula.
- **Los contadores del tablero se derivan de la tabla `respuestas`,** no del cuerpo de la petición: un guardado parcial no puede borrar el historial que ve el facilitador.
- **Una respuesta por ejercicio.** La API usa `onConflictDoNothing`: la primera respuesta es la que cuenta, igual que en el cliente.
- **Orval emite sintaxis de Zod 4 pero importa la raíz del paquete** (que en zod 3.25 sigue siendo v3). El script `codegen` reescribe el import a `zod/v4` con `lib/api-spec/ajustar-import-zod.mjs`.

## Product

19 pantallas agrupadas en cuatro bloques:

- **Ruta** — Inicio, Mi curso (teoría por sesión), Misiones.
- **Laboratorios** — Diagnóstico (votación en vivo), KPI Lab (ficha + Quality Score + semáforo), Pareto Lab (148 incidencias, corte 80/20 configurable, frecuencia vs. costo, cambio de patrón entre periodos), Ishikawa 6M, 5 Porqués (con validación de evidencia), Hoshin Kanri (cascada + X-Matrix con detección de iniciativas huérfanas), Statistics Lab (tendencia, histograma + capacidad, dispersión + regresión, carta de control con reglas de Nelson), Improvement Lab (antes/después, t de Welch, impacto económico), Audit Lab (clasificación de hallazgos con evidencia), Simulador Kaizen.
- **Resultados** — Dashboard ejecutivo, Quality Coach (asistente por reglas que calcula sobre el trabajo del participante), Proyecto final A3 exportable, Ranking, Certificado.
- **Facilitación** — Panel del facilitador (tablero del aula en vivo, agenda de 10 h, desafíos para proyectar, clave del caso) y Datos del caso (tablas filtrables + CSV).

**Sesiones de clase.** El facilitador abre una sesión en `/profesor` y obtiene un código de 6 caracteres (sin 0/O ni 1/I/L, porque se dicta en voz alta) y un enlace `?sesion=CODIGO` para el QR: quien lo abre se une sin teclear nada. Su tablero se refresca solo cada 5 s con el avance de cada participante, el marcador por equipo y el acierto pregunta por pregunta, ordenado de peor a mejor para saber qué retomar.

Gamificación: 7 misiones (950 QP) + 16 ejercicios con retroalimentación (385 QP) + 10 logros (500 QP) = 1835 QP posibles. Cada misión exige requisitos verificables antes de otorgar puntos.

## User preferences

- Todo el contenido de cara al participante va en español.
- El código de la app usa comillas simples. No hay configuración de Prettier en el repo, así que `prettier --write` las cambia a dobles: no lo ejecutes sobre `artifacts/qualitylab/src`.
