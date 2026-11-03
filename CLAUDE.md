@AGENTS.md

# agenda-nutri

SaaS de agenda de turnos para nutricionistas. El MVP se prueba primero con una nutricionista piloto y sus pacientes, y después se vende a clientes reales.

## Stack

- **Next.js 16** (App Router, `src/`, alias `@/*`) con Route Handlers y Server Actions. Frontend y backend en el mismo proyecto.
- **TypeScript** estricto y **Tailwind 4**.
- **Supabase**: Postgres + Auth + Row Level Security.
- **Vercel** para deploy, **Resend** para emails.

> Esta versión de Next.js tiene cambios respecto de lo conocido. Antes de escribir código leer la guía relevante en `node_modules/next/dist/docs/`.

## Comandos

```bash
npm run dev     # servidor de desarrollo
npm run build   # build de producción
npm run lint    # ESLint
```

## Convenciones

- **Idioma**: código, nombres de tablas/columnas, variables y commits en inglés. Documentación y textos de UI en español rioplatense.
- **Datos**: toda tabla con datos de un nutricionista lleva `nutritionist_id` (o equivalente) y RLS activada. Nunca desactivar RLS ni usar la `service_role` key desde el cliente.
- **Secretos**: solo en variables de entorno (`.env.local`, nunca commiteado). Las claves públicas llevan prefijo `NEXT_PUBLIC_`; la `service_role` y la API key de Resend solo se usan en el servidor.
- **Server first**: preferir Server Components y Server Actions; `"use client"` solo cuando haga falta interactividad.
- **Validación**: validar toda entrada en el servidor, aunque ya se valide en el cliente.
- **Fechas**: guardar en UTC (`timestamptz`) y mostrar en `America/Argentina/Buenos_Aires`.

## Datos de salud (Ley 25.326)

- Todo el tráfico por HTTPS.
- Acceso aislado por nutricionista mediante RLS.
- Ficha clínica mínima: guardar solo lo necesario para la atención. No loguear datos de pacientes ni enviarlos a servicios de terceros sin necesidad.
- El link público de reserva no debe exponer datos de otros pacientes ni de otros turnos; solo disponibilidad.

## Flujo de trabajo (git)

- `main` está protegida: no se pushea directo ni se puede borrar o forzar.
- Una rama por feature: `feature/<nombre-corto>` (también `fix/...`, `chore/...`).
- PR hacia `main`; la revisión del otro integrante es recomendada pero no obligatoria. Merge con squash.
- Commits chicos y en inglés, en imperativo (`add availability form`).
- Antes de abrir el PR: `npm run lint` y `npm run build` sin errores.

## Documentos

- `PLAN.md`: tareas del MVP y responsables.
- `docs/api.md`: referencia del backend para la UI (endpoints, actions, campos, errores).
