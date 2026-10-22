// Works out which appointment times are free. Pure function, no database, so it
// is easy to test. All wall-clock maths happens in the business's own timezone,
// which is what makes the same code right in Dubai, London and Sydney, including
// on the days the clocks change.

import { DateTime, Interval } from "luxon";

export type Window = { weekday: number; startMin: number; endMin: number };
export type Busy = { start: Date; end: Date };

export type StaffAvailability = {
  id: string;
  hours: Window[];      // weekly pattern for this person
  busy: Busy[];         // their existing bookings and time off
};

export type SlotInput = {
  date: string;         // YYYY-MM-DD, in the business's timezone
  timezone: string;     // IANA, e.g. Europe/London
  durationMin: number;
  stepMin: number;      // offer a slot every N minutes
  minNoticeMin: number; // no bookings sooner than this from now
  maxDaysAhead: number;
  now: Date;
  staff: StaffAvailability[];
  closed: Busy[];       // whole-business closures (holidays)
};

export type Slot = { start: string; end: string; staffIds: string[] };

function overlaps(a: Interval, list: Busy[]) {
  return list.some((b) => {
    const bi = Interval.fromDateTimes(DateTime.fromJSDate(b.start), DateTime.fromJSDate(b.end));
    return a.overlaps(bi);
  });
}

export function availableSlots(input: SlotInput): Slot[] {
  const day = DateTime.fromISO(input.date, { zone: input.timezone });
  if (!day.isValid) return [];

  const now = DateTime.fromJSDate(input.now).setZone(input.timezone);
  const earliest = now.plus({ minutes: input.minNoticeMin });
  const latestDay = now.startOf("day").plus({ days: input.maxDaysAhead });
  if (day.startOf("day") < now.startOf("day") || day.startOf("day") > latestDay) return [];

  const bySlot = new Map<string, Slot>();

  for (const person of input.staff) {
    for (const w of person.hours.filter((h) => h.weekday === day.weekday)) {
      // the end of this person's shift, as a real moment in time
      const shiftEnd = day.set({ hour: Math.floor(w.endMin / 60) % 24, minute: w.endMin % 60 })
        .plus({ days: w.endMin === 1440 ? 1 : 0 });

      for (let m = w.startMin; m + input.durationMin <= w.endMin; m += input.stepMin) {
        const start = day.set({ hour: Math.floor(m / 60), minute: m % 60, second: 0, millisecond: 0 });
        // on a spring-forward day some wall-clock times do not exist and luxon
        // pushes them an hour on. skip those rather than offer a fake time.
        if (start.hour * 60 + start.minute !== m) continue;
        const end = start.plus({ minutes: input.durationMin });
        if (end > shiftEnd) continue;
        if (start < earliest) continue;

        const iv = Interval.fromDateTimes(start, end);
        if (overlaps(iv, input.closed) || overlaps(iv, person.busy)) continue;

        const key = start.toUTC().toISO()!;
        const slot = bySlot.get(key) ?? { start: key, end: end.toUTC().toISO()!, staffIds: [] };
        if (!slot.staffIds.includes(person.id)) slot.staffIds.push(person.id);
        bySlot.set(key, slot);
      }
    }
  }

  return [...bySlot.values()].sort((a, b) => a.start.localeCompare(b.start));
}
