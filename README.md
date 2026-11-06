# 🍎 Nutri Tu Agenda

**La agenda de turnos pensada para nutricionistas.** La profesional configura sus horarios, comparte un link y sus pacientes reservan solos. Ella ve todo en un panel simple, confirma los pedidos y avisa por WhatsApp o email, sin planillas ni idas y vueltas de mensajes.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

> **Estado:** MVP en etapa de piloto, primero con una nutricionista y sus pacientes. Producción: <https://agenda-turnos-nutri.vercel.app>

---

## ✨ Qué hace

**Para la profesional** (`/dashboard`)
- 📅 **Agenda** del mes y de la semana, con días bloqueados y turnos de un vistazo.
- ✅ **Turnos**: confirma, rechaza, marca atendido o ausente; carga y edita turnos a mano (sin pedirle más datos al paciente que nombre y contacto).
- 🕘 **Disponibilidad**: días y horarios (varios por día), vacaciones y bloqueos, tipos de consulta con su duración y reglas de reserva.
- 🔗 **Link de reserva** propio, que se copia y se comparte.
- 💬 **Avisos por WhatsApp** con el mensaje ya escrito (lo envía ella, desde su WhatsApp).
- 🔐 Cambio de contraseña y recuperación de cuenta.

**Para el paciente** (`/reservar/<link>`, sin crear cuenta)
- Elige servicio, día y horario; deja nombre, email y teléfono; acepta la política de privacidad.
- Recibe un **email para confirmar** el turno (se libera solo a los 30 minutos si no lo confirma) y un **recordatorio** antes de la consulta.

**Por debajo**
- Los horarios libres se calculan en el servidor con las reglas semanales, los bloqueos y los turnos existentes; dos personas no pueden reservar el mismo horario.
- Cada profesional ve **solo sus datos** (Row Level Security en Postgres).
- Límite de pedidos en los endpoints públicos, recordatorios por cron y una política de retención de datos.

## 🧱 Stack

| Capa | Tecnología |
|---|---|
| App | **Next.js 16** (App Router, Server Components y Server Actions) + **TypeScript** |
| Estilos | **Tailwind 4** |
| Datos y auth | **Supabase** (Postgres + Auth + Row Level Security) |
| Emails | **Resend** |
| Deploy | **Vercel** (con Vercel Cron) |

> ⚠️ Esta versión de Next.js tiene cambios respecto de lo conocido (por ejemplo `proxy.ts` en lugar de `middleware.ts`). Antes de tocar código, leer la guía correspondiente en `node_modules/next/dist/docs/`.

## 🗺️ Cómo encaja todo

```
 Paciente ──► /reservar/<link> ──► /api/public/*  ──┐
                                                    │  (service_role, solo servidor:
 Profesional ─► /dashboard ──► Server Actions ──────┤   expone horarios libres, nunca datos)
                                                    ▼
                                  Supabase (Postgres + RLS + Auth)
                                                    ▲
 Vercel Cron ─► /api/cron/reminders ─► Resend ──────┘   (recordatorios por email)
```

- El **panel** usa la sesión de la profesional y RLS: lo que no es suyo, no existe para la base.
- La **reserva pública** pasa por rutas del servidor que usan la clave `service_role` y solo devuelven horarios libres.

## 🚀 Probarlo en local

**Necesitás:** Node 24 (el que usa Vercel; el script de tests usa funciones de Node recientes) y acceso al proyecto de Supabase.

```bash
git clone https://github.com/facucarrion/agenda-nutri.git
cd agenda-nutri
npm install
cp .env.template .env.local      # en PowerShell: Copy-Item .env.template .env.local
npm run dev                      # http://localhost:3000
```

`.env.template` ya trae las dos variables públicas de Supabase: con eso alcanza para trabajar en las pantallas. Las claves secretas se piden al equipo y **nunca se commitean**.

### Variables de entorno

| Variable | ¿Pública? | Para qué |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | Dirección del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí | Clave pública (la protege RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Reserva pública y crons. Se saltea RLS |
| `RESEND_API_KEY` | **No** | Envío de emails |
| `EMAIL_FROM` | No | Remitente, ej. `Nutri Tu Agenda <turnos@nutrituagenda.com>` |
| `CRON_SECRET` | **No** | Protege `/api/cron/*` (Vercel lo envía solo) |
| `NEXT_PUBLIC_SITE_URL` | Sí | URL pública para los links de los emails (solo producción) |
| `RETENTION_ENFORCE` | No | `true` activa el borrado real por retención; sin ella solo simula |

> 🔒 Regla de oro: un secreto jamás lleva el prefijo `NEXT_PUBLIC_`, porque eso lo manda al navegador.

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm test` | Tests de la lógica de horarios libres |
| `npx tsc --noEmit` | Chequeo de tipos |

Antes de abrir un PR: `lint`, `tsc` y `build` sin errores.

## 🗂️ Estructura

```
src/
├── app/
│   ├── (auth)/          login, registro y recuperación de contraseña
│   ├── (paciente)/      reserva pública: /reservar/<link>
│   ├── dashboard/       panel: turnos, agenda, disponibilidad, cuenta
│   ├── api/
│   │   ├── public/      horarios libres, reserva y confirmación (sin login)
│   │   └── cron/        recordatorios y retención de datos
│   ├── privacidad/      política de privacidad (borrador)
│   └── terminos/        términos de uso (borrador)
├── lib/                 lógica de negocio: horarios, reserva, emails, límites de uso
│   └── supabase/        clientes de servidor, navegador y admin
├── proxy.ts             sesión y protección de rutas
└── types/               tipos de la base de datos
supabase/
├── migrations/          el esquema, versionado
└── tests/               pruebas de aislamiento y solapamiento en SQL
docs/api.md              referencia del backend para quien arma pantallas
```

## 🗄️ Base de datos

El esquema vive en `supabase/migrations`. Tablas principales: `nutritionists`, `patients`, `appointment_types`, `availability_rules`, `availability_blocks`, `appointments` e `invitation_codes`.

- **Row Level Security** en todas las tablas: cada profesional accede solo a lo suyo.
- Una **restricción de exclusión** en `appointments` impide dos turnos activos solapados, aunque lleguen a la vez.
- `supabase/tests/isolation_and_overlap.sql` verifica el aislamiento entre profesionales y los solapamientos. Se corre en el editor SQL de Supabase y no deja datos.

### Dar de alta a una profesional

El registro es **solo con código de invitación**. Se crea uno por persona desde el editor SQL de Supabase:

```sql
insert into public.invitation_codes (code, business_name)
values ('NS-AB12-CD34', 'Consultorio Ejemplo');  -- el nombre del consultorio es opcional
```

Se lo pasás a la profesional por un canal privado; sirve **una sola vez**.

## ☁️ Deploy

Cada merge a `main` se despliega solo en Vercel. Para un entorno nuevo:

1. Importar el repo en Vercel y cargar las variables de entorno de la tabla de arriba.
2. En Supabase → Authentication → URL Configuration: `Site URL` con la URL de producción y `https://<tu-url>/auth/callback` en las redirect URLs.
3. Los crons (`vercel.json`) corren solos: recordatorios todos los días a las 11:00 UTC y retención el día 1 de cada mes.
4. Para que los emails lleguen a pacientes reales hace falta un **dominio verificado en Resend** y ajustar `EMAIL_FROM`.

> En el plan gratuito de Vercel, un deploy disparado por el commit de otra persona (que no es la dueña de la cuenta) queda **bloqueado**. Mergear con *squash* a nombre de quien administra la cuenta lo evita; pasar a un plan de equipo lo resuelve de raíz.

## 🔐 Datos de salud

La app maneja datos personales y de salud, sujetos a la **Ley 25.326** de Protección de Datos Personales: todo el tráfico va por HTTPS, el acceso se aísla por profesional, se guarda lo mínimo necesario y no se loguean datos de pacientes. Los textos legales son un **borrador pendiente de revisión de un abogado** (`src/lib/legal.ts` los marca como tales).

## 🤝 Cómo trabajamos

- Una rama por cambio (`feature/…`, `fix/…`, `chore/…`) y PR a `main`. Merge con **squash**.
- Commits chicos, en inglés y en imperativo. Código en inglés; documentación y textos de la interfaz en español rioplatense.
- Las reglas completas están en [`CLAUDE.md`](CLAUDE.md).

## 📚 Más documentación

- [`docs/api.md`](docs/api.md): endpoints, Server Actions, campos y errores.
- [`PLAN.md`](PLAN.md): tareas del MVP y responsables.
- [`CLAUDE.md`](CLAUDE.md): contexto y convenciones del proyecto.

> El nombre del producto vive en `src/lib/brand.ts`: cambiarlo ahí lo cambia en toda la interfaz y en los textos legales.

## 🧭 Qué viene

- Pantalla de **pacientes** (las acciones del backend ya están).
- **Dominio y remitente propio** en Resend, y SMTP propio para los emails de cuenta.
- **Revisión legal** de privacidad y términos.
- Recordatorios de **WhatsApp automáticos** con la API oficial (fase 2).
- Pagos y múltiples profesionales por cuenta (fase 2).

## 👥 Equipo

- **Facu Carrion** — backend, datos e infraestructura.
- **Bruno Capello** — frontend y diseño de la interfaz.
