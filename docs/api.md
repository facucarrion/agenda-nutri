# Referencia del backend (para la UI)

Todo lo que hay del lado servidor y cómo usarlo desde las pantallas. El backend está terminado; falta la UI.

- **Producción**: https://agenda-turnos-nutri.vercel.app
- **Tipos de la base**: `src/types/database.ts` (`Tables<"patients">`, `TablesInsert<...>`, `Enums<...>`).
- **Convención de resultados**: las Server Actions nunca lanzan por errores esperados. Devuelven `{ ok: true, ... }` o `{ ok: false, error: "mensaje en español" }`; mostrá `error` tal cual al usuario.

## 1. Cómo correrlo en local

1. `npm install`
2. Crear `.env.local` en la raíz (no se commitea) con:

```
NEXT_PUBLIC_SUPABASE_URL=https://ilqkwirxltvljitajcxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_GB3KLYvtnfZfUF_XuYXo4g_qgP5MaBu
```

Con esas dos podés hacer toda la UI con login. Las claves secretas (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) solo hacen falta para la reserva pública y los emails; no las necesitás para las pantallas internas.

3. `npm run dev` y abrí http://localhost:3000
4. Antes de abrir un PR: `npm run lint`, `npx tsc --noEmit` y `npm run build`.

> Next.js 16 tiene cambios respecto de versiones anteriores: usa `proxy.ts` en lugar de `middleware.ts`, `cookies()` y `params` son async, y el acceso a datos dinámicos fuera de `<Suspense>` rompe el build. La guía está en `node_modules/next/dist/docs/`.

## 2. Autenticación

Archivo: `src/app/(auth)/actions.ts`. Las pantallas `/login` y `/register` ya existen como base (`src/app/(auth)/login|register/page.tsx`); se pueden rediseñar.

| Action | Entrada (FormData) | Resultado |
|---|---|---|
| `login` | `email`, `password` | redirige a `/dashboard` o `{ error }` |
| `register` | `full_name`, `email`, `password` (mín. 8) | `{ message }` (hay que confirmar email), redirige a `/dashboard`, o `{ error }` |
| `logout` | – | redirige a `/login` |

Se usan con `useActionState` (ver las pantallas existentes).

**Protección de rutas**: `src/proxy.ts` redirige a `/login` si no hay sesión. Son públicas: `/`, `/login`, `/register`, `/auth/*`, `/reservar/*`, `/privacidad`, `/terminos`, `/api/public/*`, `/api/cron/*`. Cualquier otra ruta nueva queda protegida automáticamente.

**Usuario y perfil en una pantalla (Server Component)**:

```ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
const { data: me } = await supabase
  .from("nutritionists")
  .select("full_name, slug, slot_minutes, min_notice_hours, timezone")
  .eq("id", user!.id)
  .single();
```

RLS ya limita todo a los datos del profesional logueado: no hace falta filtrar por `nutritionist_id` en las lecturas.

## 3. Pacientes

Actions en `src/app/dashboard/patients/actions.ts`. Resultado: `{ ok: true, id } | { ok: false, error }`.

| Action | Entrada |
|---|---|
| `createPatient(formData)` | ver campos abajo |
| `updatePatient(id, formData)` | ver campos abajo |
| `deletePatient(id)` | **borra también sus turnos**: pedir confirmación en la UI |
| `exportPatientData(id)` | devuelve `{ ok: true, data: { exported_at, patient, appointments } }` para ofrecer descarga (derecho de acceso) |

**Campos del formulario**

| Campo | Obligatorio | Formato |
|---|---|---|
| `first_name`, `last_name` | sí | texto |
| `email` | no | email válido; único por profesional |
| `phone` | no | texto |
| `birth_date` | no | `YYYY-MM-DD`, no futura |
| `dni` | no | 6 a 10 dígitos (se ignoran puntos y espacios) |
| `weight_kg` | no | número > 0 (acepta coma) |
| `height_cm` | no | número > 0 |
| `notes` | no | texto libre, hasta 5000 caracteres |

**Lecturas** (`src/lib/patients.ts`, solo en Server Components o actions):

- `listPatients(search?)`: ordenado por apellido y nombre; busca en nombre, apellido, email y teléfono.
- `getPatient(id)`: devuelve el paciente o `null`.

## 4. Disponibilidad y tipos de consulta

Actions en `src/app/dashboard/availability/actions.ts`. Resultado: `{ ok: true } | { ok: false, error }`. Cada una revalida `/dashboard/availability`.

| Action | Campos |
|---|---|
| `addAvailabilityRule(formData)` | `weekday` (0 = domingo … 6 = sábado), `start_time`, `end_time` en `HH:MM` |
| `deleteAvailabilityRule(id)` | – |
| `addAvailabilityBlock(formData)` | `starts_at`, `ends_at` (ISO **con offset**, ej. `2026-12-24T00:00:00-03:00`), `reason` (opcional) |
| `deleteAvailabilityBlock(id)` | – |
| `createAppointmentType(formData)` | `name`, `duration_minutes` (10 a 240) |
| `updateAppointmentType(id, formData)` | `name`, `duration_minutes`, `is_active` (`"false"` para desactivar) |
| `deleteAppointmentType(id)` | los turnos viejos conservan el turno; solo pierden la referencia al tipo |
| `updateBookingSettings(formData)` | `slot_minutes` (10 a 240, intervalo de la grilla), `min_notice_hours` (0 a 720) |

**Reglas de negocio**

- Se permiten varios bloques por día (ej. 09:00–13:00 y 15:00–18:00), pero **no superpuestos**: devuelve "Ese horario se superpone con otro del mismo día".
- `slot_minutes` es cada cuánto arranca un turno posible; la **duración** de cada consulta sale del tipo.
- `min_notice_hours` es la anticipación mínima para reservas públicas (por defecto 12).

**Lecturas**: no hay helpers; leé directo con el cliente de servidor (RLS filtra por profesional):

```ts
const { data: rules } = await supabase
  .from("availability_rules")
  .select("*")
  .order("weekday")
  .order("start_time");
// también: "availability_blocks" y "appointment_types"
```

## 5. Agenda (turnos)

Actions en `src/app/dashboard/agenda/actions.ts`. Resultado: `{ ok: true, id } | { ok: false, error }`.

| Action | Campos |
|---|---|
| `createAppointment(formData)` | `patient_id`, `appointment_type_id`, `starts_at` (ISO con offset), `notes` (opcional) |
| `updateAppointment(id, formData)` | mismos campos; solo turnos activos (pendientes o confirmados) |
| `cancelAppointment(id)` | libera el horario |
| `completeAppointment(id)` | marca como atendido |
| `markNoShow(id)` | marca como ausente |

**Reglas**

- El fin del turno lo calcula el servidor con la duración del tipo: no se envía `ends_at`.
- Un horario ocupado devuelve "Ya hay un turno en ese horario". Los turnos cancelados no bloquean.
- El turno manual **no** valida contra la disponibilidad semanal: la nutricionista puede agendar fuera de horario a propósito.
- Solo se puede elegir un tipo de consulta activo.

**Lectura** (`src/lib/appointments.ts`):

```ts
const turnos = await listAppointments(desde, hasta); // Date, Date (hasta excluido)
// cada item: id, starts_at, ends_at, status, source, notes, patient_id,
// appointment_type_id, patients { first_name, last_name, phone },
// appointment_types { name, duration_minutes }
```

Estados: `pending` (reserva pública sin confirmar), `confirmed`, `cancelled`, `completed`, `no_show`. Origen: `manual` o `public`. Los `pending` vencen a los 30 minutos y liberan el horario.

## 6. Reserva pública (sin login)

Para la página `/reservar/[slug]`. Los datos del profesional se leen en el servidor y los horarios y la reserva se piden por la API.

### Perfil público (Server Component)

```ts
import { getPublicProfile } from "@/lib/public-booking";

const profile = await getPublicProfile(slug);
// null si no existe, o:
// { fullName, slug, timezone, types: [{ id, name, duration_minutes }] }
```

Solo expone el nombre, la timezone y los tipos de consulta activos.

### `GET /api/public/:slug/slots`

Query: `type` (uuid del tipo), `from` y `to` (`YYYY-MM-DD`, fechas locales del profesional, máximo 31 días).

```json
200 { "slots": ["2026-10-19T12:00:00.000Z", "..."], "timezone": "America/Argentina/Buenos_Aires" }
400 { "error": "Tipo de consulta inválido." }
429 { "error": "Demasiados pedidos. Probá de nuevo en un minuto." }
```

Los `slots` vienen en UTC: mostralos en la `timezone` devuelta, no en la del navegador.

### `POST /api/public/:slug/book`

```json
{
  "type": "<uuid del tipo>",
  "starts_at": "<uno de los slots devueltos>",
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "ana@correo.com",
  "phone": "1155550000",
  "consent": true,
  "website": ""
}
```

| Código | Significado |
|---|---|
| `201 { ok: true }` | Reserva creada; se envió un email con el link de confirmación |
| `400` | JSON inválido |
| `409 { error }` | Dato inválido o horario ya no disponible; mostrar `error` |
| `429 { error }` | Demasiados intentos (5 cada 10 minutos por IP; 3 por hora por email) |
| `502 { error }` | No se pudo enviar el email; el horario se liberó, reintentar |

**Obligatorio en el formulario**

- `consent` debe ser el **booleano `true`**, desde una casilla que diga que acepta la [política de privacidad](/privacidad) y los [términos](/terminos) (con links).
- `website` es un campo **oculto y vacío** (honeypot contra bots). No lo muestres ni lo autocompletes.

### Confirmación

El email lleva un link a `GET /api/public/confirm?token=...`, que confirma y redirige a:

- `/reservar/confirmado` si salió bien.
- `/reservar/error` si el link venció (30 minutos), ya se usó o es inválido.

**Estas dos páginas hay que crearlas**; hoy dan 404.

## 7. Páginas a construir

| Ruta | Qué muestra | Usa |
|---|---|---|
| `/dashboard` | Resumen del día / próximos turnos | `listAppointments` |
| `/dashboard/agenda` | Vista semanal con alta, edición y cancelación | `listAppointments`, actions de agenda |
| `/dashboard/patients` | Listado con búsqueda | `listPatients`, `createPatient` |
| `/dashboard/patients/[id]` | Ficha, historial, exportar y borrar | `getPatient`, `updatePatient`, `exportPatientData`, `deletePatient` |
| `/dashboard/availability` | Horarios semanales, bloqueos, tipos de consulta y ajustes | actions de disponibilidad |
| `/reservar/[slug]` | Elegir tipo, fecha y horario; datos; consentimiento | `getPublicProfile`, `/slots`, `/book` |
| `/reservar/confirmado`, `/reservar/error` | Resultado de la confirmación | – |

Mostrá el link público del profesional (`/reservar/<slug>`) en el dashboard para que lo pueda copiar.

## 8. Reglas generales

- **Fechas**: la base guarda UTC. Mostrar y pedir siempre en la timezone del profesional (`nutritionists.timezone`, hoy `America/Argentina/Buenos_Aires`). Al enviar un horario a una action, usar ISO con offset.
- **Datos de salud (Ley 25.326)**: no hacer `console.log` de datos de pacientes; no mandarlos a servicios de terceros; no incluirlos en URLs.
- **Textos legales**: `/privacidad` y `/terminos` son borradores pendientes de revisión de un abogado.
- **Secretos**: nunca con prefijo `NEXT_PUBLIC_`. La `service_role` solo vive en el servidor (`src/lib/supabase/admin.ts`).
- **Lógica nueva**: preferir Server Components y Server Actions; `"use client"` solo si hay interactividad.
- **Git**: ramas `feature/*`, PR a `main` (la revisión es recomendada, no obligatoria); mirar que la base del PR sea `main` antes de mergear.
