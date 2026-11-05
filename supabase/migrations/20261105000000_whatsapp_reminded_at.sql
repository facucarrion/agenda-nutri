-- When the nutritionist opened the WhatsApp reminder for this appointment, so
-- the "tomorrow" list can show who was already notified.
alter table public.appointments add column whatsapp_reminded_at timestamptz;
