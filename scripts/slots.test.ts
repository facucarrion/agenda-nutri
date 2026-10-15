import assert from "node:assert/strict";
import { computeSlots, zonedToUtc } from "../src/lib/slots.ts";

const tz = "America/Argentina/Buenos_Aires"; // UTC-3, no DST

// 09:00 Buenos Aires == 12:00 UTC
assert.equal(zonedToUtc(2030, 1, 7, 9 * 60, tz).toISOString(), "2030-01-07T12:00:00.000Z");

const base = {
  // 2030-01-07 is a Monday (weekday 1)
  rules: [
    { weekday: 1, start_time: "09:00", end_time: "11:00" },
    { weekday: 1, start_time: "15:00", end_time: "16:00" },
  ],
  busy: [],
  timezone: tz,
  fromDate: "2030-01-07",
  toDate: "2030-01-07",
  slotMinutes: 30,
  durationMinutes: 30,
  minNoticeHours: 0,
  now: new Date("2030-01-01T00:00:00Z"),
};

const all = computeSlots(base);
assert.deepEqual(all, [
  "2030-01-07T12:00:00.000Z",
  "2030-01-07T12:30:00.000Z",
  "2030-01-07T13:00:00.000Z",
  "2030-01-07T13:30:00.000Z",
  "2030-01-07T18:00:00.000Z",
  "2030-01-07T18:30:00.000Z",
]);

// 45 min consultations on a 30 min grid: last start must still fit the window
const long = computeSlots({ ...base, durationMinutes: 45 });
assert.equal(long.at(-1), "2030-01-07T18:00:00.000Z"); // 15:00 fits, 15:30 does not
assert.ok(!long.includes("2030-01-07T13:30:00.000Z")); // 10:30 + 45' > 11:00

// busy interval removes overlapping slots only
const busy = computeSlots({
  ...base,
  busy: [{ start: new Date("2030-01-07T12:30:00Z"), end: new Date("2030-01-07T13:00:00Z") }],
});
assert.ok(!busy.includes("2030-01-07T12:30:00.000Z"));
assert.ok(busy.includes("2030-01-07T12:00:00.000Z"));
assert.ok(busy.includes("2030-01-07T13:00:00.000Z"));

// minimum notice
const notice = computeSlots({
  ...base,
  minNoticeHours: 12,
  now: new Date("2030-01-07T05:00:00Z"), // cutoff 17:00Z: morning gone, afternoon ok
});
assert.deepEqual(notice, ["2030-01-07T18:00:00.000Z", "2030-01-07T18:30:00.000Z"]);

// other weekday has nothing
assert.deepEqual(computeSlots({ ...base, fromDate: "2030-01-08", toDate: "2030-01-08" }), []);

// invalid date
assert.deepEqual(computeSlots({ ...base, fromDate: "2030-13-40" }), []);

console.log("slots: all tests passed");
