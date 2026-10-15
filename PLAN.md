# Plan del MVP

Reparto por área: **Facu** = backend y datos, **Bruno** = frontend y UI. Bruno = Bruno Capello.

Estados: `[ ]` pendiente, `[~]` en curso, `[x]` hecho.

## Fase 0 – Base

| Estado | Tarea | Responsable |
|---|---|---|
| [x] | Proyecto Next.js + repo remoto privado | Facu |
| [ ] | Proteger `main` (PR + 1 revisión) en GitHub | Facu |
| [~] | Proyecto Supabase y variables de entorno (`.env.local`, Vercel) | Facu |
| [ ] | Deploy inicial en Vercel | Facu |
| [ ] | Layout base, componentes UI y tema Tailwind | Bruno |

## Fase 1 – Esquema de datos

| Estado | Tarea | Responsable |
|---|---|---|
| [x] | Tablas: `nutritionists`, `patients`, `availability_rules`, `appointments` | Facu |
| [~] | Políticas RLS por nutricionista y tests de aislamiento | Facu |
| [x] | Migraciones versionadas en `supabase/migrations` | Facu |
| [x] | Tipos TypeScript generados desde Supabase | Facu |

## Fase 2 – Auth y disponibilidad

| Estado | Tarea | Responsable |
|---|---|---|
| [x] | Registro y login de nutricionistas (Supabase Auth) | Facu |
| [~] | Pantallas de registro/login y protección de rutas | Bruno |
| [x] | Disponibilidad configurable: días, horarios, duración del turno (API) | Facu |
| [ ] | Pantalla de configuración de disponibilidad | Bruno |

## Fase 3 – Agenda y pacientes

| Estado | Tarea | Responsable |
|---|---|---|
| [x] | CRUD de pacientes (ficha mínima) – Server Actions | Facu |
| [ ] | Pantallas de listado y ficha de paciente | Bruno |
| [ ] | CRUD de turnos con validación de solapamientos – Server Actions | Facu |
| [ ] | Agenda semanal: alta, edición y cancelación de turnos | Bruno |

## Fase 4 – Reserva pública y recordatorios

| Estado | Tarea | Responsable |
|---|---|---|
| [ ] | Cálculo de slots libres y endpoint público de reserva (sin exponer datos) | Facu |
| [ ] | Página pública `/reservar/[slug]` para que el paciente reserve solo | Bruno |
| [ ] | Emails de confirmación y recordatorio con Resend | Facu |
| [ ] | Plantillas de email | Bruno |
| [ ] | Job programado para recordatorios (Vercel Cron) | Facu |

## Fase 5 – Piloto

| Estado | Tarea | Responsable |
|---|---|---|
| [ ] | Revisión de privacidad (Ley 25.326): aviso, consentimiento, retención | Facu + Bruno |
| [ ] | Prueba con la nutricionista piloto y sus pacientes | Facu + Bruno |
| [ ] | Ajustes según feedback | Facu + Bruno |

## Fuera del MVP (fase 2)

- Recordatorios por WhatsApp (requiere WhatsApp Business API y plantillas aprobadas).
- Pagos y facturación.
- Múltiples profesionales por cuenta.
