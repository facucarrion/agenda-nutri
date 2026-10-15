const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function formatWhen(iso: string, timezone: string) {
  const date = new Intl.DateTimeFormat("es-AR", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
  const time = new Intl.DateTimeFormat("es-AR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));

  return `${date} a las ${time} hs`;
}

function layout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
<div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px">
<h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>
${bodyHtml}
</div></body></html>`;
}

type Common = {
  patientName: string;
  nutritionistName: string;
  startsAt: string;
  timezone: string;
};

export function confirmationEmail(
  data: Common & { confirmUrl: string; validMinutes: number },
) {
  const when = formatWhen(data.startsAt, data.timezone);
  const subject = "Confirmá tu turno";

  const html = layout(
    subject,
    `<p>Hola ${escapeHtml(data.patientName)},</p>
<p>Reservaste un turno con <strong>${escapeHtml(data.nutritionistName)}</strong> el <strong>${escapeHtml(when)}</strong>.</p>
<p>Para confirmarlo, tocá el botón. El turno queda reservado ${data.validMinutes} minutos; después se libera.</p>
<p style="margin:24px 0"><a href="${escapeHtml(data.confirmUrl)}" style="background:#18181b;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Confirmar turno</a></p>
<p style="font-size:13px;color:#52525b">Si no pediste este turno, ignorá este mensaje.</p>`,
  );

  const text = `Hola ${data.patientName},

Reservaste un turno con ${data.nutritionistName} el ${when}.

Para confirmarlo abrí este link (el turno queda reservado ${data.validMinutes} minutos):
${data.confirmUrl}

Si no pediste este turno, ignorá este mensaje.`;

  return { subject, html, text };
}

export function reminderEmail(data: Common) {
  const when = formatWhen(data.startsAt, data.timezone);
  const subject = "Recordatorio de tu turno";

  const html = layout(
    subject,
    `<p>Hola ${escapeHtml(data.patientName)},</p>
<p>Te recordamos tu turno con <strong>${escapeHtml(data.nutritionistName)}</strong> el <strong>${escapeHtml(when)}</strong>.</p>
<p style="font-size:13px;color:#52525b">Si no podés asistir, avisale al profesional con tiempo.</p>`,
  );

  const text = `Hola ${data.patientName},

Te recordamos tu turno con ${data.nutritionistName} el ${when}.

Si no podés asistir, avisale al profesional con tiempo.`;

  return { subject, html, text };
}
