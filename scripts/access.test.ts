import assert from "node:assert/strict";
import { accessState } from "../src/lib/access.ts";

const now = new Date("2026-11-12T15:00:00Z");
const iso = (ms: number) => new Date(now.getTime() + ms).toISOString();
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

// Trial running
let a = accessState({ plan: "trial", trial_ends_at: iso(10 * DAY), active_until: null }, now);
assert.equal(a.status, "trial");
assert.equal(a.daysLeft, 10);

// A started day counts as a day, and the last hours still say "1 día"
a = accessState({ plan: "trial", trial_ends_at: iso(1.5 * DAY), active_until: null }, now);
assert.equal(a.daysLeft, 2);
a = accessState({ plan: "trial", trial_ends_at: iso(2 * HOUR), active_until: null }, now);
assert.equal(a.status, "trial");
assert.equal(a.daysLeft, 1);

// Trial over: blocked, with the end date kept for messages
a = accessState({ plan: "trial", trial_ends_at: iso(-1), active_until: null }, now);
assert.equal(a.status, "expired");
assert.equal(a.daysLeft, 0);
assert.equal(accessState({ plan: "trial", trial_ends_at: iso(0), active_until: null }, now).status, "expired");

// Active without an end date, and active with one
a = accessState({ plan: "active", trial_ends_at: null, active_until: null }, now);
assert.equal(a.status, "active");
assert.equal(a.daysLeft, null);
a = accessState({ plan: "active", trial_ends_at: iso(-5 * DAY), active_until: iso(20 * DAY) }, now);
assert.equal(a.status, "active");
assert.equal(a.daysLeft, 20);
assert.equal(accessState({ plan: "active", trial_ends_at: null, active_until: iso(-1) }, now).status, "expired");

// Anything odd fails closed
assert.equal(accessState({ plan: "trial", trial_ends_at: null, active_until: null }, now).status, "expired");
assert.equal(accessState({ plan: "premium", trial_ends_at: iso(DAY), active_until: iso(DAY) }, now).status, "expired");
assert.equal(accessState({ plan: "", trial_ends_at: null, active_until: null }, now).status, "expired");

// An old trial date does not matter once the account is active
assert.equal(
  accessState({ plan: "active", trial_ends_at: iso(-90 * DAY), active_until: null }, now).status,
  "active",
);

console.log("access: all tests passed");
