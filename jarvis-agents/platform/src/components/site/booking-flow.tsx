"use client";

// The booking page every business gets: service -> person -> day -> time -> details.
// Times are always shown in the business's own timezone, wherever the customer is.

import { useEffect, useMemo, useState } from "react";

type Service = { id: string; name: string; description: string; durationMin: number; price: string | null };
type Person = { id: string; name: string; title: string };
type Slot = { start: string; end: string; staffIds: string[] };

type Props = {
  slug: string;
  name: string;
  homeHref: string;
  locale: string;
  timezone: string;
  phone: string | null;
  isClinic: boolean;
  services: Service[];
  staff: Person[];
};

export function BookingFlow(p: Props) {
  const [service, setService] = useState<Service | null>(p.services.length === 1 ? p.services[0] : null);
  const [person, setPerson] = useState<string>("");            // "" = anyone
  const [days, setDays] = useState<string[] | null>(null);
  const [day, setDay] = useState<string>("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [status, setStatus] = useState<"form" | "sending" | "done">("form");
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);                 // bump to reload times

  const fmtDay = useMemo(() => new Intl.DateTimeFormat(p.locale, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }), [p.locale]);
  const fmtLong = useMemo(() => new Intl.DateTimeFormat(p.locale, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: p.timezone }), [p.locale, p.timezone]);
  const fmtTime = useMemo(() => new Intl.DateTimeFormat(p.locale, { hour: "numeric", minute: "2-digit", timeZone: p.timezone }), [p.locale, p.timezone]);

  // picking things resets whatever depended on the old choice
  function chooseService(s: Service) {
    if (s.id === service?.id) return;
    setService(s); setDays(null); setDay(""); setSlots(null); setSlot(null);
  }
  function choosePerson(id: string) { setPerson(id); setSlots(null); setSlot(null); }
  function chooseDay(d: string) { setDay(d); setSlots(null); setSlot(null); }

  // which days have space
  useEffect(() => {
    if (!service) return;
    fetch(`/api/sites/${p.slug}/days?service=${service.id}`).then((r) => r.json())
      .then((j) => { setDays(j.days ?? []); if (j.days?.[0]) setDay(j.days[0]); })
      .catch(() => setDays([]));
  }, [service, p.slug]);

  // the free times on the chosen day
  useEffect(() => {
    if (!service || !day) return;
    const staffQ = person ? `&staff=${person}` : "";
    fetch(`/api/sites/${p.slug}/slots?service=${service.id}&date=${day}${staffQ}`).then((r) => r.json())
      .then((j) => setSlots(j.slots ?? [])).catch(() => setSlots([]));
  }, [service, day, person, p.slug, refresh]);

  async function book(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!service || !slot) return;
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setStatus("sending"); setError("");
    const res = await fetch(`/api/sites/${p.slug}/bookings`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...f, serviceId: service.id, staffId: person || undefined, start: slot.start }),
    }).catch(() => null);
    const j = await res?.json().catch(() => ({}));
    if (res?.ok) { setStatus("done"); return; }
    setStatus("form");
    setError(j?.error ?? "Something went wrong. Please call us.");
    if (res?.status === 409) { setSlot(null); setSlots(null); setRefresh((n) => n + 1); }       // that time went, show what's left
  }

  if (status === "done" && service && slot) {
    return (
      <div className="bk-card bk-done">
        <div className="bk-tick">✓</div>
        <h2>You&apos;re booked in</h2>
        <p><strong>{service.name}</strong><br />{fmtLong.format(new Date(slot.start))}</p>
        <p className="bk-muted">We&apos;ll send you a reminder before your appointment. Need to change it? Call {p.phone ?? "us"}.</p>
        <a className="bk-btn" href={p.homeHref}>Back to {p.name}</a>
      </div>
    );
  }

  return (
    <div className="bk-grid">
      <div className="bk-steps">
        <section className="bk-card">
          <h3><span>1</span>Choose a service</h3>
          <div className="bk-list">
            {p.services.map((s) => (
              <button key={s.id} type="button" className={`bk-option ${service?.id === s.id ? "on" : ""}`} onClick={() => chooseService(s)}>
                <span><strong>{s.name}</strong><small>{s.durationMin} min{s.description ? ` · ${s.description}` : ""}</small></span>
                {s.price && <em>{s.price}</em>}
              </button>
            ))}
          </div>
        </section>

        {service && p.staff.length > 1 && (
          <section className="bk-card">
            <h3><span>2</span>With who?</h3>
            <div className="bk-chips">
              <button type="button" className={person === "" ? "on" : ""} onClick={() => choosePerson("")}>Anyone available</button>
              {p.staff.map((s) => (
                <button type="button" key={s.id} className={person === s.id ? "on" : ""} onClick={() => choosePerson(s.id)}>
                  {s.name}{s.title ? <small> · {s.title}</small> : null}
                </button>
              ))}
            </div>
          </section>
        )}

        {service && (
          <section className="bk-card">
            <h3><span>{p.staff.length > 1 ? 3 : 2}</span>Pick a time</h3>
            {days === null ? <p className="bk-muted">Checking the diary...</p>
              : days.length === 0 ? <p className="bk-muted">No online times in the next few weeks. Please call {p.phone ?? "us"}.</p>
              : (
                <>
                  <div className="bk-days">
                    {days.map((d) => (
                      <button type="button" key={d} className={d === day ? "on" : ""} onClick={() => chooseDay(d)}>
                        {fmtDay.format(new Date(`${d}T12:00:00Z`))}
                      </button>
                    ))}
                  </div>
                  <div className="bk-times">
                    {slots === null ? <p className="bk-muted">Loading times...</p>
                      : slots.length === 0 ? <p className="bk-muted">Nothing free that day. Try another.</p>
                      : slots.map((s) => (
                        <button type="button" key={s.start} className={slot?.start === s.start ? "on" : ""} onClick={() => setSlot(s)}>
                          {fmtTime.format(new Date(s.start))}
                        </button>
                      ))}
                  </div>
                </>
              )}
          </section>
        )}
      </div>

      <aside className="bk-card bk-summary">
        <h3>Your booking</h3>
        {service ? (
          <dl>
            <div><dt>Service</dt><dd>{service.name}</dd></div>
            <div><dt>Length</dt><dd>{service.durationMin} min</dd></div>
            {service.price && <div><dt>Price</dt><dd>{service.price}</dd></div>}
            {p.staff.length > 1 && <div><dt>With</dt><dd>{p.staff.find((s) => s.id === person)?.name ?? "Anyone available"}</dd></div>}
            {slot && <div><dt>When</dt><dd>{fmtLong.format(new Date(slot.start))}</dd></div>}
          </dl>
        ) : <p className="bk-muted">Choose a service to start.</p>}

        {slot && (
          <form onSubmit={book}>
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
            <input name="name" placeholder="Full name" required maxLength={80} />
            <input name="phone" placeholder="Mobile number" type="tel" required maxLength={40} />
            <input name="email" placeholder="Email (optional)" type="email" maxLength={120} />
            {!p.isClinic && <textarea name="note" placeholder="Anything we should know? (optional)" rows={2} maxLength={500} />}
            <button className="bk-btn" disabled={status === "sending"}>{status === "sending" ? "Booking..." : "Confirm booking"}</button>
          </form>
        )}
        {error && <p className="bk-error">{error}</p>}
      </aside>
    </div>
  );
}
