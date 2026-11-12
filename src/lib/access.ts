// What an account may do, from its plan and dates. Pure, so it is easy to
// test and safe to use anywhere.
//
//   plan "trial":  full access until trial_ends_at.
//   plan "active": full access until active_until (null = no end date).
//
// After the end date the account is "expired": the app blocks changes but
// keeps every piece of data. An unknown plan or a missing date also counts as
// expired, so a mistake never grants free access.

// Length of the trial the landing promises. Each invitation code carries its
// own `trial_days` (this is also the database default).
export const DEFAULT_TRIAL_DAYS = 14;

// From this many days left, the panel nudges harder.
export const TRIAL_WARNING_DAYS = 5;

export type AccessInput = {
  plan: string;
  trial_ends_at: string | null;
  active_until: string | null;
};

export type Access =
  | { status: "active"; endsAt: Date | null; daysLeft: number | null }
  | { status: "trial"; endsAt: Date; daysLeft: number }
  | { status: "expired"; endsAt: Date | null; daysLeft: 0 };

const DAY_MS = 86_400_000;
const expired = (endsAt: Date | null): Access => ({ status: "expired", endsAt, daysLeft: 0 });

// Whole days left, counting a started day as a day ("1 día" until the end).
const daysUntil = (end: Date, now: Date) => Math.max(1, Math.ceil((end.getTime() - now.getTime()) / DAY_MS));

export function accessState(account: AccessInput, now: Date = new Date()): Access {
  if (account.plan === "active") {
    if (!account.active_until) return { status: "active", endsAt: null, daysLeft: null };
    const end = new Date(account.active_until);
    return end > now
      ? { status: "active", endsAt: end, daysLeft: daysUntil(end, now) }
      : expired(end);
  }

  if (account.plan === "trial" && account.trial_ends_at) {
    const end = new Date(account.trial_ends_at);
    return end > now
      ? { status: "trial", endsAt: end, daysLeft: daysUntil(end, now) }
      : expired(end);
  }

  return expired(null);
}
