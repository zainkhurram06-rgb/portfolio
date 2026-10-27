// VERDA: a calm, modern practice. A deep brand-colour hero with light streaks
// and one huge rounded corner, their photo rising out of it, and a floating
// bar with the things patients actually look for: open now, services, phone.
// Ported from the Signature library (02-verde-medical), with real details.

import { DemoRibbon, Icon, Paragraphs, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, type DesignProps } from "./shared";

export function Verda({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const [first, ...rest] = biz.name.split(" ");
  const stats: [string, string][] = [
    ...(c.rating != null ? [[c.rating.toFixed(1), L.google_rating] as [string, string]] : []),
    ...(c.reviewCount ? [[String(c.reviewCount), L.stat_reviews] as [string, string]] : []),
    [String(services.length), L.stat_services],
    ...(staff.length ? [[String(staff.length), L.stat_team] as [string, string]] : []),
  ];
  const links: [string, string][] = [
    ["#services", L.nav_services], ["#about", L.nav_about],
    ...(c.reviews.length ? [["#reviews", L.nav_reviews] as [string, string]] : []),
    ["#visit", L.nav_contact],
  ];
  return (
    <div className="dsite verda" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="ve-nav ve-width">
        <a className="ve-brand" href="#top">
          {c.logoUrl && <img src={c.logoUrl} alt="" />}
          <span>{first.toLowerCase()}<i>+</i>{rest.length > 0 && <small>{rest.join(" ")}</small>}</span>
        </a>
        <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        <a className="ve-btn solid desk" href={d.bookHref}>{c.ctaLabel} ↗</a>
        <MobileMenu d={d} links={links} />
      </header>

      <main id="top">
        <section className="ve-width">
          <div className="ve-hero">
            <div className="ve-hero-copy">
              <span className="ve-eyebrow">{c.tagline}</span>
              <h1>{c.headline}</h1>
              <p>{c.subheadline}</p>
              <a className="ve-btn white" href={d.bookHref}>{c.ctaLabel} <span>↗</span></a>
            </div>
            <div className="ve-hero-photo">{c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : null}</div>
          </div>
          <div className="ve-bar">
            <div><small>{L.sec_hours}</small><strong><OpenBadge d={d} /></strong></div>
            <a href="#services"><small>{L.sec_services_kicker}</small><strong>{services.length} {L.stat_services} <span>⌄</span></strong></a>
            {biz.phone
              ? <a href={`tel:${tel(biz.phone)}`}><small>{L.call_now}</small><strong><Num>{biz.phone}</Num></strong></a>
              : <a href="#visit"><small>{L.nav_contact}</small><strong>{biz.city ?? biz.name}</strong></a>}
            <a className="ve-btn solid" href={d.bookHref}>{L.book_online} →</a>
          </div>
        </section>

        <section className="ve-width ve-section" id="services">
          <div className="ve-head">
            <div><span className="ve-eyebrow">{L.sec_services_kicker}</span><h2>{L.sec_services_title}</h2></div>
            <p>{L.sec_services_intro}</p>
          </div>
          <div className="ve-columns">
            <div className="ve-image">
              {c.gallery[0] ? <img src={c.gallery[0]} alt="" loading="lazy" /> : <div className="ve-image-blank" />}
              <div className="ve-overlay"><strong>{c.highlights[0] ?? c.tagline}</strong><small>{c.highlights[1] ?? L.book_online_sub}</small></div>
            </div>
            <div className="ve-list">
              {services.map((s) => (
                <a key={s.id} href={d.bookHref}>
                  <span className="ve-ico"><Icon name={s.icon} size={20} /></span>
                  <span className="ve-list-main"><b>{s.name}</b><small>{s.description}</small></span>
                  <span className="ve-list-meta">{s.price && <b>{s.price}</b>}<small>{s.durationMin} {L.min}</small></span>
                  <span className="ve-go">↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="ve-width ve-stats" aria-label={L.nav_why}>
          {stats.slice(0, 4).map(([n, l]) => <div key={l} data-reveal><strong>{n}</strong><p>{l}</p></div>)}
        </section>

        <section className="ve-width ve-feature" id="about">
          <div className="ve-art">
            {c.gallery[1] ? <img src={c.gallery[1]} alt="" loading="lazy" /> : <div className="ve-image-blank" />}
            {c.rating != null && <div className="ve-badge"><b>★ {c.rating.toFixed(1)}</b><span>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</span></div>}
          </div>
          <div data-reveal>
            <span className="ve-eyebrow">{L.sec_about_kicker}</span>
            <h2>{c.aboutTitle}</h2>
            <Paragraphs text={c.about} />
            <ul>{c.highlights.map((h) => <li key={h}><Icon name="check" size={16} />{h}</li>)}</ul>
            {staff.length > 0 && (
              <div className="ve-team">
                <b>{L.sec_team_title}</b>
                <div>{staff.map((p) => <span key={p.id}><i>{p.name.replace(/^(dr\.?)\s+/i, "").slice(0, 1)}</i>{p.name}<small>{p.title}</small></span>)}</div>
              </div>
            )}
          </div>
        </section>

        {c.insurers.length > 0 && (
          <section className="ve-width ve-insure">
            <b>{L.sec_insurance_title}</b>
            <div>{c.insurers.map((x) => <span key={x}>{x}</span>)}</div>
            <small>{L.sec_insurance_note}</small>
          </section>
        )}

        {c.reviews.length > 0 && (
          <section className="ve-width ve-section" id="reviews">
            <div className="ve-head"><div><span className="ve-eyebrow">{L.sec_reviews_kicker}</span><h2>{L.sec_reviews_title}</h2></div></div>
            <div className="ve-reviews">
              {c.reviews.slice(0, 3).map((r, i) => (
                <figure key={i} data-reveal>
                  <span>{"★".repeat(r.rating)}</span>
                  <blockquote>“{r.text}”</blockquote>
                  <figcaption data-review-author={r.author}><i>{r.author.slice(0, 1)}</i>{r.author}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {c.faqs.length > 0 && (
          <section className="ve-width ve-section ve-faq">
            <h2>{L.sec_faq_title}</h2>
            <div>{c.faqs.map((f) => <details key={f.q}><summary>{f.q}<span>+</span></summary><p>{f.a}</p></details>)}</div>
          </section>
        )}

        <section className="ve-width ve-section" id="visit">
          <div className="ve-contact">
            <span className="ve-eyebrow">{L.sec_contact_kicker}</span>
            <h2>{L.sec_cta_title}</h2>
            <p>{c.subheadline}</p>
            <a className="ve-btn white" href={d.bookHref}>{c.ctaLabel} ↗</a>
          </div>
          <div className="ve-visit">
            <div>
              <h3>{L.sec_contact_title}</h3>
              {biz.address && <p>{biz.address}</p>}
              <p className="ve-links">
                {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={16} /><Num>{biz.phone}</Num></a>}
                {d.mapsHref && <a href={d.mapsHref}><Icon name="map" size={16} />{L.get_directions}</a>}
              </p>
            </div>
            <div>
              <h3>{L.sec_hours}</h3>
              <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="ve-width ve-footer">
        <a className="ve-brand" href="#top"><span>{first.toLowerCase()}<i>+</i></span></a>
        <span>© {d.year} {biz.name} · {c.tagline}</span>
        <div>{c.instagram && <a href={c.instagram}>Instagram</a>}{c.facebook && <a href={c.facebook}>Facebook</a>}<a href="#top">↑</a></div>
      </footer>

      <a className="ve-sticky" href={d.bookHref}>{c.ctaLabel} ↗</a>
      <Script js={SHARED_JS} />
    </div>
  );
}

export const css = `
.verda {
  --deep: color-mix(in srgb, var(--primary) 70%, var(--dark)); --mint: color-mix(in srgb, var(--accent) 80%, #fff);
  --muted: color-mix(in srgb, var(--dark) 50%, #8d9a98); --line: color-mix(in srgb, var(--primary) 12%, #e9eeed);
  --wash: color-mix(in srgb, var(--light) 60%, #fff);
  background: color-mix(in srgb, var(--light) 25%, #fff); color: var(--dark); font: 15px/1.65 var(--body); -webkit-font-smoothing: antialiased;
}
.verda h1, .verda h2, .verda h3 { font-family: var(--heading); font-weight: 600; }
.ve-width { width: min(1180px, calc(100% - 80px)); margin-inline: auto; }
.ve-eyebrow { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; font-weight: 700; color: var(--primary); }
.ve-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 48px; padding: 12px 24px; border-radius: 999px; font-size: 14px; font-weight: 700; white-space: nowrap; transition: transform .2s, filter .2s; }
.ve-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
.ve-btn.solid { background: var(--primary); color: #fff; }
.ve-btn.white { background: #fff; color: var(--deep); }

.ve-nav { display: flex; align-items: center; gap: 30px; padding-block: 18px; --mm-top: 90px; }
.ve-brand { display: inline-flex; align-items: center; gap: 10px; margin-inline-end: auto; }
.ve-brand img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.ve-brand > span { font: 700 24px/1 var(--heading); letter-spacing: -.05em; color: var(--deep); }
.ve-brand i { font-style: normal; color: var(--accent); }
.ve-brand small { display: block; font: 700 10px var(--body); letter-spacing: .22em; text-transform: uppercase; margin-block-start: 4px; color: var(--muted); }
.ve-nav nav { display: flex; gap: 30px; }
.ve-nav nav a { font-size: 14px; font-weight: 600; transition: color .2s; }
.ve-nav nav a:hover { color: var(--primary); }
.verda .mm-panel { background: var(--deep); color: #fff; }
.verda .mm-panel nav a { font: 600 2rem var(--heading); letter-spacing: -.04em; }
.verda .mm-book { background: #fff; color: var(--deep); border-radius: 999px; font-weight: 700; }

.ve-hero { position: relative; overflow: hidden; color: #fff; text-align: center; border-radius: 28px 28px 200px 28px; padding: 64px 24px 0; min-height: 600px; display: flex; flex-direction: column; align-items: center;
  background: linear-gradient(135deg, var(--deep), var(--primary) 55%, color-mix(in srgb, var(--primary) 70%, var(--accent))); }
[dir=rtl] .ve-hero { border-radius: 28px 28px 28px 200px; }
.ve-hero::before { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(115deg, transparent 0 140px, #ffffff0d 140px 141px, transparent 141px 300px); pointer-events: none; }
.ve-hero-copy { position: relative; z-index: 2; max-width: 760px; }
.ve-hero .ve-eyebrow { color: var(--mint); }
.ve-hero h1 { font-size: clamp(40px, 5.4vw, 74px); line-height: 1.02; letter-spacing: -.05em; margin: 18px auto 18px; max-width: 14ch; }
.ve-hero-copy > p { max-width: 46ch; margin: 0 auto 26px; color: color-mix(in srgb, #fff 82%, var(--light)); }
.ve-hero-photo { position: relative; z-index: 1; margin-block-start: 34px; width: min(560px, 90%); flex: 1; min-height: 240px; border-radius: 22px 22px 0 0; overflow: hidden; background: color-mix(in srgb, var(--light) 50%, var(--primary)); }
.ve-hero-photo img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
.ve-bar { position: relative; z-index: 3; margin: -34px auto 0; width: calc(100% - 80px); background: #fff; border-radius: 20px; box-shadow: 0 22px 50px color-mix(in srgb, var(--dark) 12%, transparent); display: grid; grid-template-columns: repeat(3, 1fr) auto; align-items: center; padding: 14px; padding-inline-start: 30px; gap: 10px; }
.ve-bar > div, .ve-bar > a:not(.ve-btn) { padding-block: 10px; padding-inline-end: 20px; border-inline-end: 1px solid var(--line); min-width: 0; }
.ve-bar > a:nth-child(3) { border-inline-end: 0; }
.ve-bar small { display: block; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.ve-bar strong { display: block; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ve-bar strong span { color: var(--primary); }

.ve-section { padding-block-start: 110px; }
.ve-section h2, .ve-feature h2 { font-size: clamp(32px, 4vw, 52px); line-height: 1.06; letter-spacing: -.05em; margin: 12px 0 0; max-width: 16ch; }
.ve-head { display: flex; justify-content: space-between; align-items: end; gap: 30px; margin-block-end: 40px; }
.ve-head > p { color: var(--muted); max-width: 38ch; margin: 0; }
.ve-columns { display: grid; grid-template-columns: .9fr 1.1fr; gap: 28px; align-items: stretch; }
.ve-image { position: relative; border-radius: 24px; overflow: hidden; min-height: 460px; }
.ve-image img, .ve-art img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.ve-image-blank { position: absolute; inset: 0; background: linear-gradient(150deg, var(--wash), color-mix(in srgb, var(--primary) 40%, #fff)); }
.ve-overlay { position: absolute; inset: auto 18px 18px; background: #ffffffe6; backdrop-filter: blur(10px); border-radius: 16px; padding: 18px 20px; }
.ve-overlay strong { display: block; font: 600 20px var(--heading); letter-spacing: -.03em; }
.ve-overlay small { color: var(--muted); }
.ve-list { display: grid; align-content: start; }
.ve-list a { display: grid; grid-template-columns: 44px 1fr auto 34px; align-items: center; gap: 16px; padding-block: 20px; border-block-end: 1px solid var(--line); transition: background .25s, padding .25s; border-radius: 12px; }
.ve-list a:hover { background: #fff; padding-inline: 14px; }
.ve-ico { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; background: var(--wash); color: var(--primary); }
.ve-list-main b { display: block; font: 600 18px var(--heading); letter-spacing: -.02em; }
.ve-list-main small, .ve-list-meta small { display: block; font-size: 13px; color: var(--muted); line-height: 1.45; }
.ve-list-meta { text-align: end; }
.ve-list-meta b { color: var(--primary); }
.ve-go { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line); display: grid; place-items: center; transition: background .2s, color .2s, transform .3s; }
.ve-list a:hover .ve-go { background: var(--primary); color: #fff; transform: rotate(45deg); }

.ve-stats { display: grid; grid-template-columns: repeat(4, 1fr); margin-block-start: 90px; border-block: 1px solid var(--line); }
.ve-stats div { padding: 34px 26px; border-inline-end: 1px solid var(--line); }
.ve-stats div:last-child { border: 0; }
.ve-stats strong { font: 600 clamp(36px, 4vw, 54px)/1 var(--heading); letter-spacing: -.05em; color: var(--deep); }
.ve-stats p { margin: 8px 0 0; color: var(--muted); font-size: 13px; }

.ve-feature { display: grid; grid-template-columns: .95fr 1.05fr; gap: 60px; align-items: center; padding-block-start: 110px; }
.ve-art { position: relative; min-height: 540px; border-radius: 200px 200px 24px 24px; overflow: hidden; background: var(--wash); }
.ve-badge { position: absolute; inset-block-end: 24px; inset-inline-start: 24px; background: #fff; border-radius: 16px; padding: 14px 18px; box-shadow: 0 14px 30px #0000001a; display: grid; }
.ve-badge b { font: 700 22px var(--heading); color: var(--primary); }
.ve-badge span { font-size: 12px; color: var(--muted); }
.ve-feature p { color: var(--muted); }
.ve-feature ul { list-style: none; display: grid; gap: 10px; margin: 22px 0; }
.ve-feature li { display: flex; gap: 10px; align-items: center; font-weight: 600; }
.ve-feature li svg { color: #fff; background: var(--primary); border-radius: 50%; padding: 3px; width: 22px; height: 22px; flex: none; }
.ve-team { border-block-start: 1px solid var(--line); padding-block-start: 22px; }
.ve-team > b { font-size: 13px; letter-spacing: .1em; text-transform: uppercase; }
.ve-team > div { display: flex; flex-wrap: wrap; gap: 10px; margin-block-start: 14px; }
.ve-team span { display: grid; grid-template-columns: 38px auto; column-gap: 10px; align-items: center; background: #fff; border: 1px solid var(--line); border-radius: 999px; padding: 6px 18px 6px 6px; font-weight: 600; font-size: 14px; line-height: 1.2; }
.ve-team i { grid-row: span 2; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-style: normal; background: var(--wash); color: var(--primary); font-weight: 700; }
.ve-team small { color: var(--muted); font-weight: 400; font-size: 12px; }

.ve-insure { margin-block-start: 80px; background: var(--wash); border-radius: 22px; padding: 28px 32px; display: grid; gap: 14px; }
.ve-insure > div { display: flex; flex-wrap: wrap; gap: 8px; }
.ve-insure span { background: #fff; border-radius: 999px; padding: 8px 15px; font-weight: 600; font-size: 13px; }
.ve-insure small { color: var(--muted); }

.ve-reviews { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
.ve-reviews figure { margin: 0; background: #fff; border: 1px solid var(--line); border-radius: 22px; padding: 28px; display: flex; flex-direction: column; gap: 14px; }
.ve-reviews figure > span { color: #f2b544; letter-spacing: .12em; }
.ve-reviews blockquote { margin: 0; flex: 1; font-size: 15px; }
.ve-reviews figcaption { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 14px; }
.ve-reviews figcaption i { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-style: normal; background: var(--primary); color: #fff; }

.ve-faq { display: grid; grid-template-columns: 38% 1fr; gap: 50px; }
.ve-faq h2 { margin: 0; }
.ve-faq details { background: #fff; border: 1px solid var(--line); border-radius: 16px; margin-block-end: 10px; }
.ve-faq summary { list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 22px; font-weight: 600; cursor: pointer; }
.ve-faq summary::-webkit-details-marker { display: none; }
.ve-faq summary span { width: 30px; height: 30px; flex: none; border-radius: 50%; display: grid; place-items: center; background: var(--primary); color: #fff; transition: transform .2s; }
.ve-faq details[open] summary span { transform: rotate(45deg); }
.ve-faq details p { color: var(--muted); padding: 0 22px 20px; margin: 0; font-size: 14px; }

.ve-contact { text-align: center; color: #fff; border-radius: 28px 200px 28px 28px; padding: 80px 30px; background: linear-gradient(135deg, var(--deep), var(--primary)); display: flex; flex-direction: column; align-items: center; gap: 12px; }
[dir=rtl] .ve-contact { border-radius: 200px 28px 28px 28px; }
.ve-contact .ve-eyebrow { color: var(--mint); }
.ve-contact h2 { margin: 0 auto; }
.ve-contact p { max-width: 44ch; color: color-mix(in srgb, #fff 80%, var(--light)); margin-block-end: 10px; }
.ve-visit { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-block-start: 16px; }
.ve-visit > div { background: #fff; border: 1px solid var(--line); border-radius: 22px; padding: 30px; display: grid; gap: 12px; align-content: start; }
.ve-visit h3 { font-size: 20px; margin: 0; letter-spacing: -.03em; }
.ve-visit p { margin: 0; color: var(--muted); }
.ve-links { display: flex; flex-wrap: wrap; gap: 20px; }
.ve-links a { display: inline-flex; gap: 8px; align-items: center; color: var(--primary); font-weight: 700; }
.ve-visit dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 9px; border-block-end: 1px solid var(--line); font-size: 14px; }
.ve-visit dl div:last-child { border: 0; }
.ve-visit dd { margin: 0; font-weight: 600; }

.ve-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding-block: 36px; margin-block-start: 60px; border-block-start: 1px solid var(--line); font-size: 13px; color: var(--muted); }
.ve-footer .ve-brand { margin: 0; }
.ve-footer > div { display: flex; gap: 22px; }
.ve-sticky { display: none; }

@media (max-width: 960px) {
  .ve-bar { grid-template-columns: 1fr 1fr; padding: 18px; }
  .ve-bar > div, .ve-bar > a:not(.ve-btn) { border: 0; }
  .ve-bar .ve-btn { grid-column: span 2; }
  .ve-columns, .ve-feature { grid-template-columns: 1fr; }
  .ve-stats { grid-template-columns: 1fr 1fr; }
  .ve-stats div:nth-child(2) { border-inline-end: 0; }
  .ve-stats div:nth-child(-n+2) { border-block-end: 1px solid var(--line); }
  .ve-reviews { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .ve-width { width: calc(100% - 32px); }
  .ve-nav { --mm-top: 82px; }
  .ve-hero { border-radius: 24px 24px 90px 24px; padding: 44px 18px 0; min-height: 560px; }
  [dir=rtl] .ve-hero { border-radius: 24px 24px 24px 90px; }
  .ve-hero h1 { font-size: clamp(34px, 10vw, 46px); }
  .ve-bar { width: calc(100% - 20px); grid-template-columns: 1fr; gap: 0; padding: 14px 18px; }
  .ve-bar .ve-btn { grid-column: auto; margin-block-start: 8px; }
  .ve-bar > div, .ve-bar > a:not(.ve-btn) { border-block-end: 1px solid var(--line); padding-inline-end: 0; }
  .ve-section, .ve-feature { padding-block-start: 76px; }
  .ve-head { display: block; }
  .ve-head > p { margin-block-start: 14px; }
  .ve-image { min-height: 300px; }
  .ve-list a { grid-template-columns: 40px 1fr auto; gap: 12px; }
  .ve-go { display: none; }
  .ve-art { min-height: 380px; }
  .ve-stats { margin-block-start: 60px; }
  .ve-stats div { padding: 24px 14px; }
  .ve-faq { grid-template-columns: 1fr; gap: 20px; }
  .ve-contact { border-radius: 24px 90px 24px 24px; padding: 56px 22px; }
  .ve-visit { grid-template-columns: 1fr; }
  .ve-footer { flex-direction: column; text-align: center; padding-block-end: 100px; }
  .ve-sticky { display: flex; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; justify-content: center; padding: 16px; border-radius: 999px; background: var(--primary); color: #fff; font-weight: 700; font-size: 14px; transform: translateY(150%); transition: transform .4s; box-shadow: 0 12px 30px #0000002a; }
  .verda[data-scrolled] .ve-sticky { transform: none; }
}
`;
