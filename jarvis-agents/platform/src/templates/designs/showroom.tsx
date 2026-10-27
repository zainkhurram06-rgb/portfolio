// SHOWROOM: the car wash flagship. A glossy car in the business's colour turns
// on a turntable; scrolling through the wash section covers it in foam, rinses
// it and polishes it to a sparkle. Then a package picker with prices by
// vehicle size, the extras, before/after and booking.

import { DemoRibbon, Icon, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { BA_JS, MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, type DesignProps } from "./shared";
import { STAGE_JS, stageScene } from "./stage3d";
import { CAR } from "./scenes";

// which wash step is showing, from how far the sticky section has scrolled
const STEPS_JS = `
document.querySelectorAll("[data-wash]").forEach(function (sec) {
  var tick = function () {
    var r = sec.getBoundingClientRect(), p = -r.top / Math.max(1, r.height - innerHeight);
    sec.setAttribute("data-step", p < .46 ? "0" : p < .66 ? "1" : "2");
  };
  addEventListener("scroll", tick, { passive: true }); tick();
});
document.querySelectorAll("[data-sizes]").forEach(function (box) {
  box.querySelectorAll("[data-size-btn]").forEach(function (b) {
    b.addEventListener("click", function () {
      box.setAttribute("data-size", b.getAttribute("data-size-btn"));
      box.querySelectorAll("[data-size-btn]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    });
  });
});
`;

export function Showroom({ d }: DesignProps) {
  const { biz, c, L, services, packages } = d;
  const sizes = Array.from(new Set(packages.flatMap((p) => p.prices.map((x) => x.size))));
  const steps: [string, string][] = [[L.wash_foam, L.wash_foam_text], [L.wash_rinse, L.wash_rinse_text], [L.wash_shine, L.wash_shine_text]];
  const links: [string, string][] = [
    ["#wash", L.sec_steps_kicker], ["#packages", packages.length ? L.sec_packages_title : L.nav_services],
    ...(c.reviews.length ? [["#reviews", L.nav_reviews] as [string, string]] : []),
    ["#visit", L.nav_visit],
  ];
  return (
    <div className="dsite showroom" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="sr-nav">
        <a className="sr-logo" href="#top">{c.logoUrl && <img src={c.logoUrl} alt="" />}<span>{biz.name}</span></a>
        <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        {biz.phone && <a className="sr-phone desk" href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a>}
        <a className="sr-btn desk" href={d.bookHref}>{c.ctaLabel}</a>
        <MobileMenu d={d} links={links} />
      </header>

      <section className="sr-hero" id="top" data-3d-host>
        <div className="sr-grid-bg" aria-hidden="true" />
        <div className="sr-hero-copy">
          <span className="sr-kicker"><OpenBadge d={d} />{biz.city && <> · {biz.city}</>}</span>
          <h1>{c.headline}</h1>
          <p>{c.subheadline}</p>
          <div className="sr-buttons">
            <a className="sr-btn" href={d.bookHref}>{c.ctaLabel} →</a>
            <a className="sr-btn ghost" href="#packages">{packages.length ? L.sec_packages_title : L.view_services}</a>
          </div>
        </div>
        <div className="sr-car">
          <canvas data-stage="car" data-progress=".8" data-yaw="-.6" data-pitch="-.16" data-spin=".0025" data-scale=".82" tabIndex={0} aria-label={L.drag_rotate} />
          <div className="sr-fallback">{c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : null}</div>
          <span className="sr-drag">↔ {L.drag_rotate}</span>
        </div>
        <div className="sr-hero-stats">
          {c.rating != null && <div><b>{c.rating.toFixed(1)}★</b><span>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</span></div>}
          {c.highlights.slice(0, 2).map((h) => <div key={h}><b>✓</b><span>{h}</span></div>)}
        </div>
      </section>

      <section className="sr-wash" id="wash" data-wash data-step="0" data-3d-host>
        <div className="sr-wash-sticky">
          <canvas data-stage="car" data-scroll="sticky" data-yaw="-.9" data-pitch="-.2" data-spin=".0015" data-scale=".8" data-drag="off" tabIndex={-1} aria-hidden="true" />
          <div className="sr-fallback">{c.gallery[0] ? <img src={c.gallery[0]} alt="" /> : null}</div>
          <div className="sr-wash-copy">
            <span className="sr-kicker">{L.sec_steps_kicker}</span>
            <ol>
              {steps.map(([t, p], i) => (
                <li key={t} className={`s${i}`}><span>0{i + 1}</span><div><b>{t}</b><p>{p}</p></div></li>
              ))}
            </ol>
          </div>
          <div className="sr-progress" aria-hidden="true"><i /></div>
        </div>
      </section>

      <section className="sr-width sr-section" id="packages">
        <div className="sr-head">
          <div><span className="sr-kicker">{L.sec_services_kicker}</span><h2>{packages.length ? L.sec_packages_title : L.sec_services_title}</h2></div>
          <p>{packages.length ? L.sec_packages_intro : L.sec_services_intro}</p>
        </div>
        {packages.length > 0 ? (
          <div className="sr-packs" data-sizes data-size="0">
            {sizes.length > 1 && (
              <div className="sr-size" role="group" aria-label={L.bf_vehicle_size}>
                {sizes.map((s, i) => <button key={s} type="button" data-size-btn={i} aria-pressed={i === 0}>{s}</button>)}
              </div>
            )}
            <div className="sr-pack-grid">
              {packages.map((p, i) => (
                <article key={p.name} className={i === packages.length - 1 && packages.length > 1 ? "top" : ""} data-reveal>
                  {i === packages.length - 1 && packages.length > 1 && <span className="sr-badge">{L.most_popular}</span>}
                  <h3>{p.name}</h3>
                  <div className="sr-price">{p.prices.map((x) => <b key={x.size} data-for={sizes.indexOf(x.size)}>{x.price}</b>)}</div>
                  <ul>{p.includes.map((x) => <li key={x}><Icon name="check" size={15} />{x}</li>)}</ul>
                  <a className="sr-btn" href={d.bookHref}>{L.book_this} →</a>
                </article>
              ))}
            </div>
          </div>
        ) : null}
        <div className="sr-services">
          {services.map((s) => (
            <a key={s.id} href={d.bookHref} data-reveal>
              <span className="sr-ico"><Icon name={s.icon} size={22} /></span>
              <b>{s.name}</b><small>{s.description}</small>
              <span className="sr-meta">{s.price && <b>{s.price}</b>}<small>{s.durationMin} {L.min}</small></span>
            </a>
          ))}
        </div>
      </section>

      {c.beforeAfter.length > 0 && (
        <section className="sr-width sr-section">
          <div className="sr-head"><div><span className="sr-kicker">{L.made_by_hand}</span><h2>{L.sec_beforeafter_title}</h2></div></div>
          <div className="sr-ba-grid">
            {c.beforeAfter.slice(0, 2).map((p, i) => (
              <figure key={i}>
                <div className="sr-ba" data-ba dir="ltr">
                  <img src={p.before} alt={L.before} loading="lazy" />
                  <img className="after" src={p.after} alt={L.after} loading="lazy" />
                  <span className="b">{L.before}</span><span className="a">{L.after}</span>
                  <input type="range" min="0" max="100" defaultValue="50" aria-label={`${L.before} / ${L.after}`} />
                </div>
                {p.caption && <figcaption>{p.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {c.reviews.length > 0 && (
        <section className="sr-width sr-section" id="reviews">
          <div className="sr-head"><div><span className="sr-kicker">{L.sec_reviews_kicker}</span><h2>{L.sec_reviews_title}</h2></div></div>
          <div className="sr-reviews">
            {c.reviews.slice(0, 3).map((r, i) => (
              <figure key={i} data-reveal><span>{"★".repeat(r.rating)}</span><blockquote>{r.text}</blockquote><figcaption data-review-author={r.author}>{r.author}</figcaption></figure>
            ))}
          </div>
        </section>
      )}

      {(c.faqs.length > 0 || c.areasServed.length > 0) && (
        <section className="sr-width sr-section sr-faq">
          <div>
            <h2>{L.sec_faq_title}</h2>
            {c.areasServed.length > 0 && <div className="sr-areas"><b>{L.sec_areas_title}</b><p>{c.areasServed.join(" · ")}</p></div>}
          </div>
          <div>{c.faqs.map((f) => <details key={f.q}><summary>{f.q}<span>+</span></summary><p>{f.a}</p></details>)}</div>
        </section>
      )}

      <section className="sr-width sr-section" id="visit">
        <div className="sr-visit">
          <div>
            <span className="sr-kicker">{L.sec_contact_kicker}</span>
            <h2>{L.sec_cta_title}</h2>
            <a className="sr-btn" href={d.bookHref}>{c.ctaLabel} →</a>
          </div>
          <div className="sr-visit-facts">
            {biz.address && <p><Icon name="map" size={18} />{biz.address}</p>}
            {biz.phone && <p><Icon name="phone" size={18} /><a href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a></p>}
            {d.mapsHref && <a className="sr-dir" href={d.mapsHref}>{L.get_directions} ↗</a>}
            <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
          </div>
        </div>
      </section>

      <footer className="sr-width sr-footer">
        <span className="sr-logo">{biz.name}</span>
        <span>© {d.year} · {c.tagline}</span>
        <div>{c.instagram && <a href={c.instagram}>Instagram</a>}{c.facebook && <a href={c.facebook}>Facebook</a>}<a href="#top">↑</a></div>
      </footer>

      <a className="sr-sticky" href={d.bookHref}>{c.ctaLabel} →</a>
      <Script js={SHARED_JS + BA_JS + STEPS_JS + stageScene("car", CAR) + STAGE_JS} />
    </div>
  );
}

export const css = `
.showroom {
  --bg: color-mix(in srgb, var(--dark) 92%, #05070b); --panel: color-mix(in srgb, var(--dark) 70%, #1b2230);
  --ink: #f2f5fa; --muted: #95a0b3; --line: #ffffff1c; --hot: var(--accent);
  background: var(--bg); color: var(--ink); font: 15px/1.6 var(--body); -webkit-font-smoothing: antialiased;
}
.showroom h1, .showroom h2, .showroom h3 { font-family: var(--heading); font-weight: 800; text-transform: uppercase; letter-spacing: -.01em; }
.sr-width { width: min(1240px, calc(100% - 80px)); margin-inline: auto; }
.sr-kicker { display: inline-flex; gap: 6px; align-items: center; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; font-weight: 700; color: var(--hot); }
.sr-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 12px 26px; border-radius: 6px; background: var(--primary); color: #fff; font-weight: 700; font-size: 14px; white-space: nowrap; transition: transform .2s, filter .2s; }
.sr-btn:hover { transform: translateY(-2px); filter: brightness(1.12); }
.sr-btn.ghost { background: transparent; border: 1px solid #ffffff40; }

.sr-nav { position: absolute; inset-inline: 0; z-index: 20; display: flex; align-items: center; gap: 28px; padding: 18px clamp(20px, 4vw, 56px); --mm-top: 84px; }
.sr-logo { display: inline-flex; align-items: center; gap: 10px; font: 800 26px var(--heading); text-transform: uppercase; margin-inline-end: auto; }
.sr-logo img { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; }
.sr-nav nav { display: flex; gap: 26px; }
.sr-nav nav a { font-size: 13px; font-weight: 600; color: #c8d0dc; transition: color .2s; }
.sr-nav nav a:hover { color: #fff; }
.sr-phone { font-weight: 700; font-size: 14px; }
.showroom .mm summary { color: var(--ink); }
.showroom .mm-panel { background: var(--bg); color: var(--ink); }
.showroom .mm-panel nav a { font: 800 2.6rem var(--heading); text-transform: uppercase; }
.showroom .mm-book { background: var(--primary); color: #fff; border-radius: 6px; }

.sr-hero { position: relative; min-height: max(720px, 100svh); display: grid; grid-template-columns: .9fr 1.1fr; align-items: center; gap: 20px; padding: 110px clamp(20px, 4vw, 56px) 90px; overflow: hidden; isolation: isolate;
  background: radial-gradient(ellipse 50% 45% at 68% 55%, color-mix(in srgb, var(--primary) 38%, transparent), transparent 70%), var(--bg); }
.sr-grid-bg { position: absolute; inset: 0; z-index: -1; background-image: linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse at 60% 50%, #000 20%, transparent 75%); }
.sr-hero h1 { font-size: clamp(54px, 7vw, 116px); line-height: .9; margin: 18px 0 20px; }
.sr-hero-copy > p { color: var(--muted); font-size: 17px; max-width: 40ch; }
.sr-buttons { display: flex; flex-wrap: wrap; gap: 10px; margin-block-start: 26px; }
.sr-car { position: relative; height: min(70vh, 620px); }
.sr-car canvas { position: absolute; inset: -8%; width: 116%; height: 116%; cursor: grab; touch-action: pan-y; }
.sr-car canvas:active { cursor: grabbing; }
.sr-drag { position: absolute; inset-block-end: 0; inset-inline-start: 50%; transform: translateX(-50%); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
.sr-fallback { display: none; }
.no-3d canvas { display: none; }
.no-3d .sr-fallback { display: block; position: absolute; inset: 10%; border-radius: 10px; overflow: hidden; }
.no-3d .sr-fallback img { width: 100%; height: 100%; object-fit: cover; }
.sr-hero-stats { position: absolute; inset-inline: clamp(20px, 4vw, 56px); inset-block-end: 26px; display: flex; gap: 40px; flex-wrap: wrap; border-block-start: 1px solid var(--line); padding-block-start: 18px; }
.sr-hero-stats div { display: flex; gap: 10px; align-items: center; font-size: 13px; color: var(--muted); }
.sr-hero-stats b { font: 800 24px var(--heading); color: var(--ink); }

.sr-wash { height: 320vh; position: relative; background: linear-gradient(180deg, var(--bg), var(--panel) 50%, var(--bg)); }
.sr-wash-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }
.sr-wash-sticky canvas { position: absolute; inset: 0 0 0 30%; width: 70%; height: 100%; }
[dir=rtl] .sr-wash-sticky canvas { inset: 0 30% 0 0; }
.sr-wash-copy { position: absolute; inset-block-start: 50%; inset-inline-start: clamp(20px, 5vw, 80px); transform: translateY(-50%); width: min(380px, 40vw); z-index: 2; }
.sr-wash-copy ol { list-style: none; margin-block-start: 20px; display: grid; gap: 8px; }
.sr-wash-copy li { display: flex; gap: 16px; padding: 16px 18px; border-radius: 10px; border: 1px solid transparent; opacity: .35; transition: opacity .4s, background .4s, border-color .4s; }
.sr-wash-copy li > span { font: 800 30px/1 var(--heading); color: var(--hot); }
.sr-wash-copy b { font: 800 30px/1 var(--heading); text-transform: uppercase; }
.sr-wash-copy p { margin: 6px 0 0; color: var(--muted); font-size: 14px; }
.sr-wash[data-step="0"] li.s0, .sr-wash[data-step="1"] li.s1, .sr-wash[data-step="2"] li.s2 { opacity: 1; background: #ffffff0d; border-color: var(--line); backdrop-filter: blur(8px); }
.sr-progress { position: absolute; inset-inline: clamp(20px, 5vw, 80px); inset-block-end: 40px; height: 3px; background: var(--line); border-radius: 3px; overflow: hidden; }
.sr-progress i { display: block; height: 100%; width: 33%; background: var(--hot); transition: width .5s; }
.sr-wash[data-step="1"] .sr-progress i { width: 66%; }
.sr-wash[data-step="2"] .sr-progress i { width: 100%; }

.sr-section { padding-block-start: 120px; }
.sr-head { display: flex; justify-content: space-between; align-items: end; gap: 30px; margin-block-end: 40px; }
.sr-head h2, .sr-faq h2, .sr-visit h2 { font-size: clamp(42px, 5vw, 80px); line-height: .92; margin: 14px 0 0; }
.sr-head > p { color: var(--muted); max-width: 38ch; margin: 0; }
.sr-size { display: inline-flex; gap: 4px; padding: 4px; border-radius: 10px; background: var(--panel); margin-block-end: 22px; }
.sr-size button { padding: 10px 18px; border-radius: 7px; font-weight: 700; font-size: 13px; color: var(--muted); }
.sr-size button[aria-pressed=true] { background: var(--ink); color: var(--bg); }
.sr-pack-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
.sr-pack-grid article { position: relative; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 28px; display: flex; flex-direction: column; gap: 16px; }
.sr-pack-grid article.top { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary), 0 30px 60px color-mix(in srgb, var(--primary) 25%, transparent); }
.sr-badge { position: absolute; inset-block-start: -12px; inset-inline-start: 24px; background: var(--hot); color: #111; font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; padding: 5px 10px; border-radius: 4px; }
.sr-pack-grid h3 { font-size: 30px; margin: 0; }
.sr-price b { display: none; font: 800 54px/1 var(--heading); }
.sr-packs[data-size="0"] .sr-price b[data-for="0"], .sr-packs[data-size="1"] .sr-price b[data-for="1"], .sr-packs[data-size="2"] .sr-price b[data-for="2"] { display: block; }
.sr-pack-grid ul { list-style: none; display: grid; gap: 8px; flex: 1; }
.sr-pack-grid li { display: flex; gap: 8px; align-items: center; font-size: 14px; color: #c8d0dc; }
.sr-pack-grid li svg { color: var(--hot); flex: none; }
.sr-services { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin-block-start: 30px; }
.sr-services a { background: var(--bg); border: 1px solid var(--line); border-radius: 14px; padding: 24px; display: grid; grid-template-columns: 44px 1fr; column-gap: 14px; transition: background .2s; }
.sr-services a:hover { background: var(--panel); }
.sr-ico { grid-row: span 3; width: 44px; height: 44px; border-radius: 10px; display: grid; place-items: center; background: color-mix(in srgb, var(--primary) 25%, transparent); color: var(--hot); }
.sr-services a > b { font-size: 17px; }
.sr-services a > small { color: var(--muted); font-size: 13px; }
.sr-meta { display: flex; gap: 12px; align-items: center; margin-block-start: 8px; font-size: 13px; }
.sr-meta small { color: var(--muted); }

.sr-ba-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.sr-ba-grid figure { margin: 0; }
.sr-ba { position: relative; aspect-ratio: 4 / 3; overflow: hidden; border-radius: 12px; --pos: 50%; }
.sr-ba img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sr-ba .after { clip-path: inset(0 0 0 var(--pos)); }
.sr-ba::after { content: ""; position: absolute; inset-block: 0; inset-inline-start: var(--pos); width: 3px; background: var(--hot); pointer-events: none; }
.sr-ba span { position: absolute; inset-block-start: 12px; background: #000a; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.sr-ba .b { inset-inline-start: 12px; } .sr-ba .a { inset-inline-end: 12px; }
.sr-ba input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; margin: 0; cursor: ew-resize; }
.sr-ba-grid figcaption { margin-block-start: 10px; color: var(--muted); font-size: 14px; }

.sr-reviews { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.sr-reviews figure { margin: 0; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 26px; display: flex; flex-direction: column; gap: 14px; }
.sr-reviews figure > span { color: var(--hot); letter-spacing: .14em; }
.sr-reviews blockquote { margin: 0; flex: 1; font-size: 16px; }
.sr-reviews figcaption { font-weight: 700; font-size: 14px; }

.sr-faq { display: grid; grid-template-columns: 40% 1fr; gap: 60px; }
.sr-faq h2 { margin: 0; }
.sr-areas { margin-block-start: 26px; font-size: 14px; color: var(--muted); }
.sr-areas b { color: var(--ink); }
.sr-faq details { border-block-end: 1px solid var(--line); }
.sr-faq details:first-child { border-block-start: 1px solid var(--line); }
.sr-faq summary { list-style: none; display: flex; justify-content: space-between; gap: 16px; padding-block: 22px; font-weight: 600; cursor: pointer; }
.sr-faq summary::-webkit-details-marker { display: none; }
.sr-faq summary span { color: var(--hot); font-size: 22px; line-height: 1; transition: transform .2s; }
.sr-faq details[open] summary span { transform: rotate(45deg); }
.sr-faq details p { color: var(--muted); margin: 0 0 22px; }

.sr-visit { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; padding: clamp(30px, 5vw, 64px); border-radius: 18px; background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 55%, var(--panel)), var(--panel)); }
.sr-visit h2 { margin-block-end: 26px; }
.sr-visit-facts { display: grid; gap: 12px; align-content: start; }
.sr-visit-facts p { display: flex; gap: 10px; align-items: center; margin: 0; }
.sr-dir { font-weight: 700; color: var(--hot); }
.sr-visit-facts dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 8px; border-block-end: 1px solid var(--line); font-size: 14px; }
.sr-footer { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; padding-block: 40px; margin-block-start: 60px; border-block-start: 1px solid var(--line); font-size: 12px; color: var(--muted); }
.sr-footer .sr-logo { margin: 0; font-size: 20px; color: var(--ink); }
.sr-footer > div { display: flex; gap: 20px; }
.sr-sticky { display: none; }

@media (max-width: 900px) {
  .sr-hero { grid-template-columns: 1fr; padding-block-start: 100px; }
  .sr-car { height: 380px; }
  .sr-hero-stats { position: static; }
  .sr-faq, .sr-visit { grid-template-columns: 1fr; gap: 30px; }
}
@media (max-width: 760px) {
  .sr-width { width: calc(100% - 32px); }
  .sr-nav { padding: 16px; --mm-top: 78px; }
  .sr-hero { padding: 96px 16px 30px; gap: 0; }
  .sr-hero h1 { font-size: clamp(46px, 13vw, 66px); }
  .sr-car { height: 300px; }
  .sr-car canvas { inset: -6% -20%; width: 140%; height: 112%; }
  .sr-hero-stats { gap: 18px; }
  .sr-wash-sticky canvas, [dir=rtl] .sr-wash-sticky canvas { inset: 4% -25% 36%; width: 150%; height: 60%; }
  .sr-wash-copy { inset-block: auto 80px; inset-inline: 16px; transform: none; width: auto; }
  .sr-wash-copy li { display: none; }
  .sr-wash[data-step="0"] li.s0, .sr-wash[data-step="1"] li.s1, .sr-wash[data-step="2"] li.s2 { display: flex; }
  .sr-progress { inset-inline: 16px; inset-block-end: 50px; }
  .sr-section { padding-block-start: 84px; }
  .sr-head { display: block; }
  .sr-head > p { margin-block-start: 14px; }
  .sr-ba-grid { grid-template-columns: 1fr; }
  .sr-footer { flex-direction: column; text-align: center; padding-block-end: 100px; }
  .sr-sticky { display: flex; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; justify-content: center; padding: 16px; border-radius: 8px; background: var(--primary); color: #fff; font-weight: 700; font-size: 14px; transform: translateY(150%); transition: transform .4s; }
  .showroom[data-scrolled] .sr-sticky { transform: none; }
}
`;
