# Plan del MVP

Reparto por área: **Facu** = backend y datos, **Bruno** = frontend y UI. Bruno = Bruno Capello.

Estados: `[ ]` pendiente, `[~]` en curso, `[x]` hecho.

> **Alcance del piloto: solo turnos.** Reserva pública, agenda, turnos a mano, confirmación y recordatorios. La pantalla de Pacientes queda fuera del MVP por ahora (ver al final).

## Fase 0 – Base

| Estado | Tarea | Responsable |
|---|---|---|
| [x] | Proyecto Next.js + repo remoto privado | Facu |
| [x] | Proteger `main`: ruleset `protect-main` (PR obligatorio, sin borrar ni forzar; sin aprobación obligatoria) | Facu |
| [x] | Proyecto Supabase y variables de entorno (`.env.local`, Vercel) | Facu |
| [x] | Deploy inicial en Vercel (agenda-turnos-nutri.vercel.app) | Facu |
| [~] | Layout base, componentes UI y tema Tailwind. Hecho: paleta y layouts de reserva, login y gestión. Falta: portada `/` (sigue la plantilla de Next), layout raíz (título "Create Next App", `lang="en"`, fuentes Geist sin usar), favicon y estilo de Privacidad y Términos | Bruno |

## Fase 1 – Esquema de datos

| Estado | Tarea | Responsable |
|---|---|---|
| [x] | Tablas: `nutritionists`, `patients`, `availability_rules`, `appointments` | Facu |
| [x] | Políticas RLS por nutricionista y tests de aislamiento | Facu |
| [x] | Migraciones versionadas en `supabase/migrations` | Facu |
| [x] | Tipos TypeScript generados desde Supabase | Facu |

## Fase 2 – Auth y disponibilidad

| Estado | Tarea | Responsable |
|---|---|---|
| [x] | Registro y login de nutricionistas (Supabase Auth) | Facu |
| [x] | Pantallas de registro/login, recuperación de contraseña y protección de rutas | Bruno |
| [ ] | Configurar Auth en Supabase: SMTP propio con Resend (sin eso los emails de recuperación solo llegan al equipo del proyecto), link de recuperación a 1800 s, plantillas de email en español, protección de contraseñas filtradas; correr `supabase/tests/isolation_and_overlap.sql` | Facu |
| [x] | Disponibilidad configurable: días, horarios, duración del turno (API) | Facu |
| [x] | Pantalla de configuración de disponibilidad: horarios, bloqueos, tipos de consulta, link de reserva y reglas; más cambio de contraseña en Mi cuenta | Facu |

## Fase 3 – Agenda y pacientes

| Estado | Tarea | Responsable |
|---|---|---|
| [x] | CRUD de pacientes (ficha mínima) – Server Actions | Facu |
| [x] | CRUD de turnos con validación de solapamientos – Server Actions | Facu |
| [x] | Agenda y turnos: vistas de mes y semana, confirmar, rechazar, atendido, ausente, alta y edición de turnos a mano, conectados a la API real | Bruno + Facu |

## Fase 4 – Reserva pública y recordatorios

| Estado | Tarea | Responsable |
|---|---|---|
| [x] | Cálculo de slots libres y endpoint público de reserva (sin exponer datos) | Facu |
| [x] | Página pública `/reservar/[slug]`, `confirmado` y `error`, conectada a la API real | Bruno |
| [x] | Emails de confirmación y recordatorio con Resend | Facu |
| [x] | Plantillas de email (hechas en el backend; Bruno puede rediseñarlas) | Facu |
| [x] | Job programado para recordatorios (Vercel Cron) | Facu |

## Fase 5 – Piloto

| Estado | Tarea | Responsable |
|---|---|---|
| [~] | Revisión de privacidad (Ley 25.326): consentimiento, textos y retención hechos; falta revisión de un abogado, casilla de consentimiento en el formulario y dominio de Resend | Facu + Bruno |
| [x] | Prueba gratuita (14 días, configurable por código): modo lectura al vencer, link público en pausa, activación manual | Facu |
| [x] | Panel de administración `/admin` (códigos, cuentas, activar o extender, historial) con verificación en dos pasos; solo metadatos, nunca datos de pacientes | Facu |
| [ ] | Prueba con la nutricionista piloto y sus pacientes, solo turnos | Facu + Bruno |
| [ ] | Durante el piloto: los pedidos de acceso, corrección o borrado de datos de un paciente (Ley 25.326) se resuelven a mano en la base con las actions existentes, dentro de los plazos de la ley | Facu |
| [ ] | Ajustes según feedback | Facu + Bruno |

## Fuera del MVP (fase 2)

- Recordatorios de WhatsApp automáticos (requieren WhatsApp Business API y plantillas aprobadas). Hoy el aviso es manual: la lista de Turnos arma el mensaje y la profesional lo envía.
- Pagos y facturación (hoy la activación es manual), avisos por email antes de que venza la prueba y límites por plan.
- Múltiples profesionales por cuenta.
- Pantallas de listado y ficha de paciente (Bruno). Las Server Actions ya están (`listPatients`, `getPatient`, `updatePatient`, `exportPatientData`, `deletePatient`); falta la UI. Mientras tanto el menú no muestra la sección.
