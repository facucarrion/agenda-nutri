-- The sign-up trigger must not be callable through the REST API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Keep extensions out of the exposed public schema.
create schema if not exists extensions;
alter extension btree_gist set schema extensions;
