// AURELLE: soft silver and one bright accent. A rounded hero shell with their
// photo, treatment cards with huge ghost numbers, and a calm "precision" panel
// where a porcelain 3D tooth floats on a glow. Ported from the Signature
// library (01-aurelle-dental), filled with the business's real details.

import { DemoRibbon, Paragraphs, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, type DesignProps } from "./shared";
import { TOOTH_JS } from "./tooth3d";

// "Calm, careful dentistry for the whole family" -> ["Calm, careful dentistry", "for the whole family"]
function halves(text: string) {
  const words = text.split(" ");
  if (words.length < 4) return [text, ""];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

export function Aurelle({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const [h1a, h1b] = halves(c.headline);
  const stats: [string, string][] = [
    ...(c.rating != null ? [[c.rating.toFixed(1), L.google_rating] as [string, string]] : []),
    ...(c.reviewCount ? [[String(c.reviewCount), L.stat_reviews] as [string, string]] : []),
    ...(!c.reviewCount && staff.length ? [[String(staff.length), L.stat_team] as [string, string]] : []),
  ];
  const links: [string, string][] = [
    ["#care", L.nav_services], ["#precision", L.live_3d], ["#journey", L.sec_steps_kicker],
    ...(c.reviews.length ? [["#reviews", L.nav_reviews] as [string, string]] : []),
    ["#visit", L.nav_contact],
  ];
  return (
    <div className="dsite aurelle" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="au-nav au-width">
        <a className="au-logo" href="#top">{c.logoUrl && <img src={c.logoUrl} alt="" />}{biz.name}<span>✳</span></a>
        <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        <a className="au-outline desk" href={d.bookHref}>{c.ctaLabel} ↗</a>
        <MobileMenu d={d} links={links} />
      </header>

      <main id="top">
        <section className="au-width">
          <div className="au-shell">
            <div className="au-copy">
              <span className="au-chip">✦ {c.tagline}</span>
              <h1>{h1a}{h1b && <em> {h1b}</em>}</h1>
              <p>{c.subheadline}</p>
              <a className="au-btn lime" href={d.bookHref}>{c.ctaLabel} <span>↗</span></a>
              {stats.length > 0 && <div className="au-stats">{stats.map(([n, l]) => <div key={l}><b>{n}</b><small>{l}</small></div>)}</div>}
            </div>
            <div className="au-photo">
              {c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : <div className="au-photo-blank" />}
              <div className="au-bubble">{c.highlights[0] && <strong>{c.highlights[0]}</strong>}<OpenBadge d={d} /></div>
            </div>
          </div>
        </section>

        <section className="au-width" id="care">
          <div className="au-head" data-reveal>
            <span className="au-eyebrow">{L.sec_services_kicker}</span>
            <h2>{L.sec_services_title}</h2>
            <p>{L.sec_services_intro}</p>
          </div>
          <div className="au-services">
            {services.map((s, i) => (
              <a key={s.id} className={`au-tilt v${i % 3}`} href={d.bookHref} data-reveal>
                <span className="au-tilt-top">{String(i + 1).padStart(2, "0")} / {s.durationMin} {L.min}{s.price && <> · {s.price}</>}</span>
                <div className="au-ghost" aria-hidden="true">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                </div>
                <span className="au-arrow">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className="au-width au-precision" id="precision">
          <div className="au-precision-copy" data-reveal>
            <span className="au-eyebrow">{L.lab_kicker}</span>
            <h2>{c.aboutTitle}</h2>
            <Paragraphs text={c.about} />
            <div className="au-views" data-tooth-controls="#au-tooth">
              <button type="button" data-mat="pearl" aria-pressed="true">{L.view_porcelain}</button>
              <button type="button" data-mat="chrome" aria-pressed="false">{L.view_chrome}</button>
              <button type="button" className="au-rot" data-rotate>{L.rotate_turn} ↻</button>
            </div>
          </div>
          <div className="au-scene" data-3d-host>
            <canvas id="au-tooth" data-tooth-3d data-scale=".74" data-material="pearl" tabIndex={0} aria-label={L.drag_rotate} />
            <div className="au-fallback">{c.gallery[0] ? <img src={c.gallery[0]} alt="" /> : null}</div>
            <span className="au-drag">↔ {L.drag_rotate}</span>
          </div>
        </section>

        <section className="au-width au-journey" id="journey">
          <div className="au-head" data-reveal><span className="au-eyebrow">{L.sec_steps_kicker}</span><h2>{L.sec_steps_title}</h2></div>
          <div className="au-steps">
            {[[L.step1_title, L.step1], [L.step2_title, L.step2], [L.step3_title, L.step3]].map(([t, p], i) => (
              <article key={i} data-reveal><div className="au-step-n">0{i + 1}</div><h3>{t}</h3><p>{p}</p></article>
            ))}
          </div>
        </section>

        {staff.length > 0 && (
          <section className="au-width au-team">
            <div className="au-head left"><span className="au-eyebrow">{L.sec_team_kicker}</span><h2>{L.sec_team_title}</h2></div>
            <ul>{staff.map((p) => <li key={p.id}><b>{p.name}</b><span>{p.title}</span></li>)}</ul>
          </section>
        )}

        {c.reviews.length > 0 && (
          <section className="au-width" id="reviews">
            <div className="au-head" data-reveal>
              <span className="au-eyebrow">{L.sec_reviews_kicker}</span><h2>{L.sec_reviews_title}</h2>
              {c.rating != null && c.reviewCount ? <p>{fill(L.rated, { rating: c.rating.toFixed(1), n: c.reviewCount })}</p> : null}
            </div>
            <div className="au-reviews" data-drag>
              {c.reviews.map((r, i) => (
                <figure key={i}>
                  <span>{"★".repeat(r.rating)}</span>
                  <blockquote>{r.text}</blockquote>
                  <figcaption data-review-author={r.author}>{r.author}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {(c.faqs.length > 0 || c.insurers.length > 0) && (
          <section className="au-width au-faq">
            <div className="au-head left"><h2>{L.sec_faq_title}</h2>
              {c.insurers.length > 0 && <div className="au-insure"><b>{L.sec_insurance_title}</b><p>{c.insurers.join(" · ")}</p></div>}
            </div>
            <div>{c.faqs.map((f) => <details key={f.q}><summary>{f.q}<span>+</span></summary><p>{f.a}</p></details>)}</div>
          </section>
        )}

        <section className="au-width" id="visit">
          <div className="au-cta">
            <div><span className="au-eyebrow">{L.sec_contact_kicker}</span><h2>{L.sec_cta_title}</h2></div>
            <a className="au-btn lime" href={d.bookHref}>{c.ctaLabel} <span>↗</span></a>
          </div>
          <div className="au-visit">
            <div>
              <h3>{L.sec_contact_title}</h3>
              {biz.address && <p>{biz.address}</p>}
              <OpenBadge d={d} />
              <p className="au-links">
                {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a>}
                {d.mapsHref && <a href={d.mapsHref}>{L.directions} ↗</a>}
              </p>
            </div>
            <div>
              <h3>{L.sec_hours}</h3>
              <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="au-width au-footer">
        <a className="au-logo" href="#top">{biz.name}<span>✳</span></a>
        <div>{links.slice(0, 3).map(([h, l]) => <a key={h} href={h}>{l}</a>)}{c.instagram && <a href={c.instagram}>Instagram</a>}</div>
        <span>© {d.year} {biz.name}</span>
      </footer>

      <a className="au-sticky" href={d.bookHref}>{c.ctaLabel} ↗</a>
      <Script js={SHARED_JS + TOOTH_JS} />
    </div>
  );
}

export const css = `
.aurelle {
  --ink: color-mix(in srgb, var(--dark) 90%, #222); --muted: color-mix(in srgb, var(--primary) 55%, #8a918b);
  --silver: color-mix(in srgb, var(--light) 75%, #e8eae7); --line: color-mix(in srgb, var(--light) 50%, #dfe3de);
  --lime: var(--accent); --on-lime: color-mix(in srgb, var(--dark) 85%, var(--accent));
  background: #fff; color: var(--ink); font: 15px/1.65 var(--body); -webkit-font-smoothing: antialiased;
}
.aurelle h1, .aurelle h2, .aurelle h3 { font-family: var(--heading); font-weight: 500; }
.au-width { width: min(1180px, calc(100% - 80px)); margin-inline: auto; }
.au-eyebrow { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; }
.au-btn { display: inline-flex; align-items: center; gap: 12px; min-height: 50px; padding: 13px 24px; border-radius: 999px; font-size: 14px; font-weight: 700; white-space: nowrap; transition: transform .2s, filter .2s; }
.au-btn:hover { transform: translateY(-2px); filter: brightness(.96); }
.au-btn.lime { background: var(--lime); color: var(--on-lime); }

.au-nav { display: flex; align-items: center; gap: 30px; padding-block: 19px; --mm-top: 88px; }
.au-logo { display: inline-flex; align-items: center; gap: 8px; font: 700 23px var(--heading); letter-spacing: -.05em; margin-inline-end: auto; text-transform: uppercase; }
.au-logo img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.au-logo span { color: color-mix(in srgb, var(--lime) 70%, #4f7a1c); }
.au-nav nav { display: flex; gap: 26px; }
.au-nav nav a { font-size: 13px; color: var(--muted); transition: color .2s; }
.au-nav nav a:hover { color: var(--ink); }
.au-outline { border: 1px solid #c6cbc7; border-radius: 30px; padding: 12px 18px; font-weight: 700; font-size: 13px; transition: background .2s; }
.au-outline:hover { background: var(--silver); }
.aurelle .mm-panel { background: var(--silver); color: var(--ink); }
.aurelle .mm-panel nav a { font: 500 2.2rem var(--heading); letter-spacing: -.05em; }
.aurelle .mm-book { background: var(--lime); color: var(--on-lime); border-radius: 999px; font-weight: 700; }

.au-shell { margin-block-start: 8px; min-height: 560px; position: relative; overflow: hidden; border-radius: 24px; display: grid; grid-template-columns: 1fr 46%;
  background: linear-gradient(125deg, color-mix(in srgb, var(--silver) 85%, #fff), color-mix(in srgb, var(--silver) 80%, var(--primary)) 58%, var(--silver)); }
.au-copy { padding-block: 80px 60px; padding-inline: 64px 20px; position: relative; z-index: 2; }
.au-chip { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; background: #ffffff80; border: 1px solid #ffffffb0; border-radius: 99px; padding: 9px 14px; }
.au-copy h1 { font-size: clamp(44px, 5.6vw, 80px); line-height: 1; letter-spacing: -.06em; margin: 26px 0 22px; max-width: 13ch; }
.au-copy h1 em { font-style: normal; color: color-mix(in srgb, var(--primary) 45%, #8f9a95); }
.au-copy > p { max-width: 40ch; color: color-mix(in srgb, var(--ink) 70%, #fff); margin-block-end: 26px; }
.au-stats { display: flex; gap: 40px; padding-block-start: 46px; }
.au-stats b { display: block; font: 600 30px var(--heading); letter-spacing: -.06em; }
.au-stats small { font-size: 12px; color: var(--muted); }
.au-photo { position: relative; }
.au-photo img, .au-photo-blank { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.au-photo-blank { background: radial-gradient(circle at 60% 30%, #fff, var(--silver) 60%); }
.au-photo::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, color-mix(in srgb, var(--silver) 70%, transparent), transparent 22%); }
[dir=rtl] .au-photo::before { background: linear-gradient(270deg, color-mix(in srgb, var(--silver) 70%, transparent), transparent 22%); }
.au-bubble { position: absolute; z-index: 2; inset-block-start: 40px; inset-inline-end: 24px; max-width: 200px; border-radius: 15px; background: #ffffffe6; backdrop-filter: blur(8px); padding: 14px 18px; font-size: 12px; line-height: 1.45; box-shadow: 0 10px 30px #0000001a; display: grid; gap: 6px; }
.au-bubble strong { font: 600 20px/1.15 var(--heading); letter-spacing: -.03em; }

.au-head { text-align: center; padding-block: 96px 38px; }
.au-head h2 { font-size: clamp(32px, 4.2vw, 56px); line-height: 1.08; letter-spacing: -.05em; max-width: 16ch; margin: 12px auto; }
.au-head p { color: var(--muted); max-width: 46ch; margin-inline: auto; }
.au-head.left { text-align: start; padding-block: 0 20px; }
.au-head.left h2 { margin-inline: 0; }
.au-services { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.au-tilt { min-height: 320px; border-radius: 20px; padding: 28px; display: flex; flex-direction: column; justify-content: space-between; gap: 20px; position: relative; overflow: hidden; color: #fff; transition: transform .3s; }
.au-tilt:last-child:nth-child(3n+2) { grid-column: span 2; }
.au-tilt:hover { transform: translateY(-7px) rotate(-.6deg); }
.au-tilt.v0 { background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 40%, #805044), color-mix(in srgb, var(--dark) 70%, #3f302c)); }
.au-tilt.v1 { background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, #fff), color-mix(in srgb, var(--dark) 90%, var(--primary))); }
.au-tilt.v2 { background: linear-gradient(135deg, color-mix(in srgb, var(--lime) 55%, #fff), var(--lime)); color: var(--on-lime); }
.au-tilt-top { font-size: 12px; font-weight: 700; letter-spacing: .04em; position: relative; }
.au-ghost { position: absolute; font: 800 180px/1 var(--heading); inset-inline-end: -20px; inset-block-start: 30px; opacity: .13; letter-spacing: -.08em; pointer-events: none; }
.au-tilt h3 { font-size: 27px; line-height: 1.08; letter-spacing: -.04em; margin: 0 0 8px; max-width: 12ch; position: relative; }
.au-tilt p { font-size: 13px; line-height: 1.55; margin: 0; opacity: .85; max-width: 30ch; position: relative; }
.au-arrow { position: absolute; inset-block-start: 22px; inset-inline-end: 22px; border: 1px solid currentColor; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; font-size: 18px; transition: transform .3s, background .3s; }
.au-tilt:hover .au-arrow { transform: rotate(45deg); background: #ffffff30; }

.au-precision { margin-block: 96px 0; background: color-mix(in srgb, var(--silver) 50%, #fff); border-radius: 28px; min-height: 520px; display: grid; grid-template-columns: 1fr 1.1fr; align-items: center; overflow: hidden; }
.au-precision-copy { padding: 64px; }
.au-precision h2 { font-size: clamp(30px, 3.8vw, 50px); line-height: 1.07; letter-spacing: -.05em; max-width: 14ch; margin: 16px 0; }
.au-precision-copy > p { color: var(--muted); max-width: 44ch; font-size: 14px; }
.au-views { display: flex; flex-wrap: wrap; gap: 8px; margin-block-start: 28px; }
.au-views button { border: 1px solid #c6cbc7; border-radius: 999px; padding: 10px 16px; font-size: 12px; font-weight: 700; }
.au-views button[aria-pressed=true] { background: var(--ink); color: #fff; border-color: var(--ink); }
.au-views .au-rot { border: 0; }
.au-scene { height: 520px; position: relative; background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--lime) 75%, transparent) 0, transparent 58%); }
.au-scene canvas { position: absolute; inset: 0; width: 100%; height: 100%; cursor: grab; touch-action: pan-y; filter: drop-shadow(20px 25px 16px color-mix(in srgb, var(--dark) 22%, transparent)); }
.au-scene canvas:active { cursor: grabbing; }
.au-drag { position: absolute; inset-block-end: 22px; inset-inline-start: 50%; transform: translateX(-50%); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; white-space: nowrap; background: #ffffffb0; padding: 8px 14px; border-radius: 999px; pointer-events: none; }
.au-fallback { display: none; }
.no-3d canvas { display: none; }
.no-3d .au-fallback { display: block; position: absolute; inset: 12%; border-radius: 50%; overflow: hidden; }
.no-3d .au-fallback img { width: 100%; height: 100%; object-fit: cover; }

.au-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.au-steps article { border-radius: 18px; border: 1px solid var(--line); padding: 28px; }
.au-step-n { font: 500 46px var(--heading); color: color-mix(in srgb, var(--primary) 25%, #c5cfc5); letter-spacing: -.06em; }
.au-steps h3 { font-size: 19px; margin: 22px 0 8px; letter-spacing: -.02em; }
.au-steps p { font-size: 13.5px; color: var(--muted); margin: 0; }

.au-team { display: grid; grid-template-columns: 1fr 1.2fr; gap: 50px; padding-block-start: 96px; align-items: start; }
.au-team ul { list-style: none; }
.au-team li { display: flex; justify-content: space-between; gap: 16px; padding-block: 18px; border-block-end: 1px solid var(--line); }
.au-team li:first-child { border-block-start: 1px solid var(--line); }
.au-team b { font: 500 22px var(--heading); letter-spacing: -.03em; }
.au-team span { color: var(--muted); font-size: 13px; align-self: center; }

.au-reviews { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(300px, 1fr); gap: 16px; overflow-x: auto; padding-block-end: 8px; }
.au-reviews figure { margin: 0; border-radius: 18px; background: var(--silver); padding: 28px; display: flex; flex-direction: column; gap: 14px; }
.au-reviews figure:first-child { background: var(--lime); color: var(--on-lime); }
.au-reviews figure > span { letter-spacing: .15em; font-size: 13px; }
.au-reviews blockquote { margin: 0; font: 400 19px/1.4 var(--heading); letter-spacing: -.02em; flex: 1; }
.au-reviews figcaption { font-weight: 700; font-size: 13px; }

.au-faq { display: grid; grid-template-columns: 38% 1fr; gap: 50px; padding-block-start: 96px; }
.au-insure { margin-block-start: 24px; padding: 20px; border-radius: 16px; background: var(--silver); font-size: 14px; }
.au-insure p { margin: 6px 0 0; color: var(--muted); }
.au-faq details { border-block-end: 1px solid var(--line); }
.au-faq summary { list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-block: 20px; font-weight: 600; cursor: pointer; }
.au-faq summary::-webkit-details-marker { display: none; }
.au-faq summary span { width: 30px; height: 30px; flex: none; border-radius: 50%; display: grid; place-items: center; background: var(--lime); color: var(--on-lime); transition: transform .2s; }
.au-faq details[open] summary span { transform: rotate(45deg); }
.au-faq details p { color: var(--muted); margin: 0 0 20px; font-size: 14px; }

#visit { padding-block-start: 96px; }
.au-cta { background: color-mix(in srgb, var(--dark) 90%, #1f2924); color: #fff; border-radius: 26px; padding: 50px 58px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.au-cta h2 { font-size: clamp(30px, 3.4vw, 44px); letter-spacing: -.05em; margin: 8px 0 0; }
.au-cta .au-eyebrow { color: var(--lime); }
.au-visit { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-block-start: 16px; }
.au-visit > div { border: 1px solid var(--line); border-radius: 22px; padding: 30px; display: grid; gap: 12px; align-content: start; }
.au-visit h3 { font-size: 20px; letter-spacing: -.03em; margin: 0; }
.au-visit p { margin: 0; color: var(--muted); }
.au-links { display: flex; flex-wrap: wrap; gap: 20px; }
.au-links a { color: var(--ink); font-weight: 700; border-block-end: 2px solid var(--lime); }
.au-visit dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 9px; border-block-end: 1px solid var(--line); font-size: 14px; }
.au-visit dl div:last-child { border: 0; }
.au-visit dd { margin: 0; font-weight: 600; }

.au-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding-block: 36px; margin-block-start: 50px; font-size: 13px; color: var(--muted); }
.au-footer .au-logo { margin: 0; font-size: 18px; color: var(--ink); }
.au-footer > div { display: flex; gap: 22px; }
.au-sticky { display: none; }

@media (max-width: 980px) {
  .au-copy { padding-inline: 40px 10px; }
  .au-services, .au-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .au-tilt:last-child:nth-child(3n+2) { grid-column: auto; }
  .au-tilt:last-child:nth-child(odd) { grid-column: span 2; }
}
@media (max-width: 760px) {
  .au-width { width: calc(100% - 32px); }
  .au-nav { --mm-top: 80px; }
  .au-shell { grid-template-columns: 1fr; min-height: auto; }
  .au-copy { padding: 38px 24px 18px; }
  .au-copy h1 { font-size: clamp(38px, 11vw, 52px); }
  .au-stats { padding-block-start: 30px; gap: 30px; }
  .au-photo { height: 340px; }
  .au-photo::before { background: linear-gradient(180deg, color-mix(in srgb, var(--silver) 80%, transparent), transparent 30%); }
  .au-head { padding-block: 70px 28px; }
  .au-services, .au-steps { grid-template-columns: 1fr; }
  .au-tilt:last-child:nth-child(odd) { grid-column: auto; }
  .au-tilt { min-height: 250px; }
  .au-precision { grid-template-columns: 1fr; margin-block-start: 70px; }
  .au-precision-copy { padding: 36px 24px 0; }
  .au-scene { height: 360px; }
  .au-team, .au-faq { grid-template-columns: 1fr; gap: 20px; padding-block-start: 70px; }
  .au-reviews { grid-auto-columns: 84%; }
  #visit { padding-block-start: 70px; }
  .au-cta { padding: 33px 26px; flex-direction: column; align-items: flex-start; }
  .au-visit { grid-template-columns: 1fr; }
  .au-footer { flex-direction: column; text-align: center; padding-block-end: 100px; }
  .au-footer > div { flex-wrap: wrap; justify-content: center; }
  .au-sticky { display: flex; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; justify-content: center; padding: 16px; border-radius: 999px; background: var(--lime); color: var(--on-lime); font-weight: 700; font-size: 14px; transform: translateY(150%); transition: transform .4s; box-shadow: 0 12px 30px #0000002a; }
  .aurelle[data-scrolled] .au-sticky { transform: none; }
}
`;
