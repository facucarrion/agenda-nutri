// Draws the live favicon: a plate as the clock face, the fork as the hour
// hand and the knife as the minute hand, plus an orange badge with the
// number of appointments today. Plain canvas, no DOM, so it can run in any
// 2D context. Coordinates are in a 512 x 512 box, the size of the design.

const BG = "#14352a";
const PLATE = "#f4eee2";
const PLATE_INNER = "#faf7f0";
const RIM = "#cfc8ad";
const HAND = "#1f5a43";
const ACCENT = "#f28c3a";

export type FaviconState = {
  hours: number;
  minutes: number;
  count: number;
  // Extra turns added to both hands, for the "new appointment" spin.
  spin?: number;
  // Badge scale, 1 at rest; bigger while it jumps.
  badgeScale?: number;
};

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Fork pointing up from the center, 150 units long.
function fork(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = HAND;
  roundedRect(ctx, -13, -78, 26, 108, 8); // handle
  ctx.fill();
  roundedRect(ctx, -40, -100, 80, 34, 14); // head
  ctx.fill();
  for (const x of [-40, -8, 24]) {
    roundedRect(ctx, x, -158, 16, 72, 8); // tines
    ctx.fill();
  }
}

// Knife pointing up from the center, 190 units long.
function knife(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = HAND;
  roundedRect(ctx, -13, -60, 26, 90, 8); // handle
  ctx.fill();
  ctx.beginPath(); // blade, sharp edge on the right
  ctx.moveTo(-18, -52);
  ctx.lineTo(-18, -150);
  ctx.quadraticCurveTo(-16, -192, 8, -194);
  ctx.quadraticCurveTo(26, -150, 22, -52);
  ctx.closePath();
  ctx.fill();
}

export function drawFavicon(ctx: CanvasRenderingContext2D, size: number, state: FaviconState) {
  const { hours, minutes, count, spin = 0, badgeScale = 1 } = state;
  ctx.save();
  ctx.clearRect(0, 0, size, size);
  ctx.scale(size / 512, size / 512);

  ctx.fillStyle = BG;
  roundedRect(ctx, 0, 0, 512, 512, 96);
  ctx.fill();

  ctx.translate(256, 256);
  ctx.fillStyle = PLATE;
  ctx.beginPath();
  ctx.arc(0, 0, 212, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PLATE_INNER;
  ctx.beginPath();
  ctx.arc(0, 0, 166, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = RIM;
  ctx.lineWidth = 8;
  ctx.stroke();

  const turn = Math.PI * 2;
  const minuteAngle = (minutes / 60) * turn + spin * turn;
  const hourAngle = (((hours % 12) + minutes / 60) / 12) * turn + spin * turn;

  ctx.save();
  ctx.rotate(hourAngle);
  fork(ctx);
  ctx.restore();
  ctx.save();
  ctx.rotate(minuteAngle);
  knife(ctx);
  ctx.restore();

  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (count > 0) {
    const label = count > 9 ? "9+" : String(count);
    ctx.save();
    ctx.scale(size / 512, size / 512);
    // Bottom-right badge, big enough to read at 16 px.
    ctx.translate(368, 368);
    ctx.scale(badgeScale, badgeScale);
    ctx.fillStyle = ACCENT;
    ctx.strokeStyle = BG;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(0, 0, 136, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${label.length > 1 ? 150 : 190}px system-ui, sans-serif`;
    ctx.fillText(label, 0, 12);
    ctx.restore();
  }
}
