"use client";

// The booking page every business gets: service -> person -> day -> time -> details.
// Times are always shown in the business's own timezone, wherever the customer is.

import { useEffect, useMemo, useState } from "react";
import { fill, type Labels } from "@/lib/labels";

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
  L: Labels;
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
    if (res?.ok) { setStatus("done"); return; }
    setStatus("form");
    setError(res?.status === 409 ? p.L.bk_taken : p.L.bk_error);
    if (res?.status === 409) { setSlot(null); setSlots(null); setRefresh((n) => n + 1); }       // that time went, show what's left
  }

  if (status === "done" && service && slot) {
    return (
      <div className="bk-card bk-done">
        <div className="bk-tick">✓</div>
        <h2>{p.L.bk_done_title}</h2>
        <p><strong>{service.name}</strong><br />{fmtLong.format(new Date(slot.start))}</p>
        <p className="bk-muted">{p.L.bk_done_text}{p.phone ? ` ${p.phone}` : ""}</p>
        <a className="bk-btn" href={p.homeHref}>{fill(p.L.bk_back_to, { name: p.name })}</a>
      </div>
    );
  }

  return (
    <div className="bk-grid">
      <div className="bk-steps">
        <section className="bk-card">
          <h3><span>1</span>{p.L.bk_choose_service}</h3>
          <div className="bk-list">
            {p.services.map((s) => (
              <button key={s.id} type="button" className={`bk-option ${service?.id === s.id ? "on" : ""}`} onClick={() => chooseService(s)}>
                <span><strong>{s.name}</strong><small>{s.durationMin} {p.L.min}{s.description ? ` · ${s.description}` : ""}</small></span>
                {s.price && <em>{s.price}</em>}
              </button>
            ))}
          </div>
        </section>

        {service && p.staff.length > 1 && (
          <section className="bk-card">
            <h3><span>2</span>{p.L.bk_with_who}</h3>
            <div className="bk-chips">
              <button type="button" className={person === "" ? "on" : ""} onClick={() => choosePerson("")}>{p.L.bk_anyone}</button>
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
            <h3><span>{p.staff.length > 1 ? 3 : 2}</span>{p.L.bk_pick_time}</h3>
            {days === null ? <p className="bk-muted">{p.L.bk_checking}</p>
              : days.length === 0 ? <p className="bk-muted">{p.L.bk_no_days}{p.phone ? ` ${p.phone}` : ""}</p>
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
                    {slots === null ? <p className="bk-muted">{p.L.bk_loading}</p>
                      : slots.length === 0 ? <p className="bk-muted">{p.L.bk_nothing_day}</p>
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
        <h3>{p.L.bk_your_booking}</h3>
        {service ? (
          <dl>
            <div><dt>{p.L.bk_service}</dt><dd>{service.name}</dd></div>
            <div><dt>{p.L.bk_length}</dt><dd>{service.durationMin} {p.L.min}</dd></div>
            {service.price && <div><dt>{p.L.bk_price}</dt><dd>{service.price}</dd></div>}
            {p.staff.length > 1 && <div><dt>{p.L.bk_with}</dt><dd>{p.staff.find((s) => s.id === person)?.name ?? p.L.bk_anyone}</dd></div>}
            {slot && <div><dt>{p.L.bk_when}</dt><dd>{fmtLong.format(new Date(slot.start))}</dd></div>}
          </dl>
        ) : <p className="bk-muted">{p.L.bk_start}</p>}

        {slot && (
          <form onSubmit={book}>
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
            <input name="name" placeholder={p.L.bk_full_name} required maxLength={80} />
            <input name="phone" placeholder={p.L.bk_mobile} type="tel" required maxLength={40} />
            <input name="email" placeholder={p.L.form_email} type="email" maxLength={120} />
            {!p.isClinic && <textarea name="note" placeholder={p.L.bk_note} rows={2} maxLength={500} />}
            <button className="bk-btn" disabled={status === "sending"}>{status === "sending" ? p.L.bk_booking : p.L.bk_confirm}</button>
          </form>
        )}
        {error && <p className="bk-error">{error}</p>}
      </aside>
    </div>
  );
}
