import { test } from "node:test";
import assert from "node:assert/strict";
import { availableSlots, type SlotInput } from "./slots";

const base: SlotInput = {
  date: "2026-11-03",                 // a Tuesday
  timezone: "Asia/Dubai",
  durationMin: 60,
  stepMin: 30,
  minNoticeMin: 60,
  maxDaysAhead: 60,
  now: new Date("2026-11-01T08:00:00Z"),
  staff: [{ id: "a", hours: [{ weekday: 2, startMin: 9 * 60, endMin: 12 * 60 }], busy: [] }],
  closed: [],
};

const local = (iso: string, tz: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" });

test("offers slots inside working hours, in local time", () => {
  const slots = availableSlots(base);
  assert.deepEqual(slots.map((s) => local(s.start, base.timezone)),
    ["09:00", "09:30", "10:00", "10:30", "11:00"]);
});

test("existing bookings block overlapping slots", () => {
  const slots = availableSlots({
    ...base,
    staff: [{ ...base.staff[0], busy: [{ start: new Date("2026-11-03T06:00:00Z"), end: new Date("2026-11-03T07:00:00Z") }] }],
  });
  // 06:00Z is 10:00 in Dubai, so 09:30, 10:00 and 10:30 are gone
  assert.deepEqual(slots.map((s) => local(s.start, base.timezone)), ["09:00", "11:00"]);
});

test("closed days give nothing, other weekdays give nothing", () => {
  assert.equal(availableSlots({ ...base, date: "2026-11-04" }).length, 0);
  assert.equal(availableSlots({
    ...base, closed: [{ start: new Date("2026-11-03T00:00:00Z"), end: new Date("2026-11-04T00:00:00Z") }],
  }).length, 0);
});

test("respects minimum notice and the past", () => {
  const now = new Date("2026-11-03T05:30:00Z"); // 09:30 Dubai
  const slots = availableSlots({ ...base, now });
  assert.deepEqual(slots.map((s) => local(s.start, base.timezone)), ["10:30", "11:00"]);
  assert.equal(availableSlots({ ...base, date: "2026-10-30" }).length, 0);
});

test("two staff: a slot lists everyone free for it", () => {
  const slots = availableSlots({
    ...base,
    staff: [
      base.staff[0],
      { id: "b", hours: [{ weekday: 2, startMin: 10 * 60, endMin: 11 * 60 }], busy: [] },
    ],
  });
  const ten = slots.find((s) => local(s.start, base.timezone) === "10:00")!;
  assert.deepEqual(ten.staffIds.sort(), ["a", "b"]);
});

test("clock change day in London does not invent or lose times", () => {
  // 29 March 2026: clocks go 01:00 -> 02:00 in London
  const slots = availableSlots({
    ...base,
    timezone: "Europe/London",
    date: "2026-03-29",
    now: new Date("2026-03-20T00:00:00Z"),
    durationMin: 30,
    stepMin: 30,
    staff: [{ id: "a", hours: [{ weekday: 7, startMin: 0, endMin: 4 * 60 }], busy: [] }],
  });
  const times = slots.map((s) => local(s.start, "Europe/London"));
  assert.ok(!times.includes("01:00") && !times.includes("01:30"), times.join(","));
  assert.ok(times.includes("00:00") && times.includes("03:30"));
  assert.equal(new Set(slots.map((s) => s.start)).size, slots.length);
});
