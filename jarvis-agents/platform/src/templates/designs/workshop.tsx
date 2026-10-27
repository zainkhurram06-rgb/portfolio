// WORKSHOP: the mechanics flagship. Dark steel and one safety colour. A brake
// assembly turns in the hero; further down it pulls apart as you scroll, and
// each service lights up a part, with its price and a booking button. Then
// the guarantee, every service, reviews and a call-first footer.

import { DemoRibbon, Icon, Paragraphs, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, type DesignProps } from "./shared";
import { STAGE_JS, stageScene } from "./stage3d";
import { BRAKE } from "./scenes";

// as the parts section scrolls, step through the services and light each part
const PARTS_JS = `
document.querySelectorAll("[data-parts]").forEach(function (sec) {
  var items = sec.querySelectorAll("[data-part]"), canvas = sec.querySelector("canvas"), last = -2, held = false;
  var show = function (i) {
    if (i === last) return; last = i;
    items.forEach(function (x, k) { x.classList.toggle("on", k === i); });
    if (canvas) canvas.dispatchEvent(new CustomEvent("stage-focus", { detail: i < 0 ? -1 : Number(items[i].getAttribute("data-part")) }));
  };
  var tick = function () {
    if (held) return;
    var r = sec.getBoundingClientRect(), p = -r.top / Math.max(1, r.height - innerHeight);
    show(p < .3 ? -1 : Math.min(items.length - 1, Math.floor((p - .3) / .7 * items.length)));
  };
  items.forEach(function (x, k) {
    x.addEventListener("mouseenter", function () { held = true; show(k); });
    x.addEventListener("mouseleave", function () { held = false; last = -2; tick(); });
    x.addEventListener("focusin", function () { show(k); });
  });
  addEventListener("scroll", tick, { passive: true }); tick();
});
`;

export function Workshop({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const parts = services.slice(0, 4);
  const links: [string, string][] = [
    ["#parts", L.nav_services], ["#about", L.nav_why],
    ...(c.reviews.length ? [["#reviews", L.nav_reviews] as [string, string]] : []),
    ["#visit", L.nav_visit],
  ];
  return (
    <div className="dsite workshop" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="ws-nav">
        <a className="ws-logo" href="#top">{c.logoUrl && <img src={c.logoUrl} alt="" />}<span>{biz.name}</span></a>
        <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        <a className="ws-btn line desk" href={d.bookHref}>{c.ctaLabel}</a>
        {biz.phone && <a className="ws-btn desk" href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={16} /><Num>{biz.phone}</Num></a>}
        <MobileMenu d={d} links={links} />
      </header>

      <section className="ws-hero" id="top" data-3d-host>
        <div className="ws-hero-copy">
          <span className="ws-tag"><OpenBadge d={d} /></span>
          <h1>{c.headline}</h1>
          <p>{c.subheadline}</p>
          <div className="ws-buttons">
            <a className="ws-btn" href={d.bookHref}>{c.ctaLabel} →</a>
            {biz.phone && <a className="ws-btn line" href={`tel:${tel(biz.phone)}`}>{L.call_now}</a>}
          </div>
          <div className="ws-facts">
            {c.rating != null && <div><b>{c.rating.toFixed(1)}</b><span>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</span></div>}
            {c.warranty && <div><b><Icon name="shield" size={26} /></b><span>{c.warranty}</span></div>}
          </div>
        </div>
        <div className="ws-stage">
          <div className="ws-ring" aria-hidden="true" />
          <canvas data-stage="brake" data-progress="0" data-yaw=".95" data-pitch="-.2" data-spin="0" data-scale="1.1" tabIndex={0} aria-label={L.drag_rotate} />
          <div className="ws-fallback">{c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : null}</div>
          <span className="ws-coord">{biz.city && <>{biz.city.toUpperCase()} / </>}{L.drag_rotate}</span>
        </div>
      </section>

      {parts.length > 0 && (
        <section className="ws-parts" id="parts" data-parts data-3d-host>
          <div className="ws-parts-sticky">
            <canvas data-stage="brake" data-scroll="sticky" data-yaw="1.05" data-pitch="-.24" data-spin="0" data-scale=".78" data-drag="off" tabIndex={-1} aria-hidden="true" />
            <div className="ws-fallback">{c.gallery[0] ? <img src={c.gallery[0]} alt="" /> : null}</div>
            <div className="ws-parts-head">
              <span className="ws-kicker">{L.sec_services_kicker}</span>
              <h2>{L.sec_services_title}</h2>
              <p>{L.take_apart} ↓</p>
            </div>
            <ol className="ws-part-list">
              {parts.map((s, i) => (
                <li key={s.id} data-part={i}>
                  <a href={d.bookHref}>
                    <span className="ws-n">0{i + 1}</span>
                    <span className="ws-pt"><b>{s.name}</b><small>{s.description}</small></span>
                    <span className="ws-pp">{s.price ?? L.free_quote}<small>{s.durationMin} {L.min}</small></span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="ws-width ws-section ws-about" id="about">
        <div data-reveal>
          <span className="ws-kicker">{L.sec_about_kicker}</span>
          <h2>{c.aboutTitle}</h2>
          <Paragraphs text={c.about} />
        </div>
        <ul className="ws-checks">
          {c.highlights.map((h) => <li key={h} data-reveal><Icon name="check" size={18} />{h}</li>)}
          {c.credentials.map((x) => <li key={x} data-reveal><Icon name="award" size={18} />{x}</li>)}
          {c.warranty && <li data-reveal><Icon name="shield" size={18} /><span><b>{L.sec_warranty_title}</b> {c.warranty}</span></li>}
        </ul>
      </section>

      <section className="ws-width ws-section" id="services">
        <div className="ws-head"><h2>{L.pick_service}</h2><p>{L.pick_service_sub}</p></div>
        <div className="ws-all">
          {services.map((s, i) => (
            <a key={s.id} href={d.bookHref} data-reveal>
              <span className="ws-n">{String(i + 1).padStart(2, "0")}</span>
              <b>{s.name}</b>
              <small>{s.description}</small>
              <span className="ws-all-meta"><span>{s.durationMin} {L.min}</span><b>{s.price ?? L.free_quote}</b></span>
            </a>
          ))}
        </div>
      </section>

      {staff.length > 0 && (
        <section className="ws-width ws-section ws-team">
          <h2>{L.sec_team_title}</h2>
          <ul>{staff.map((p) => <li key={p.id}><i>{p.name.slice(0, 1)}</i><b>{p.name}</b><span>{p.title}</span></li>)}</ul>
        </section>
      )}

      {c.reviews.length > 0 && (
        <section className="ws-width ws-section" id="reviews">
          <div className="ws-head"><h2>{L.sec_reviews_title}</h2>{c.rating != null && c.reviewCount ? <p>{fill(L.rated, { rating: c.rating.toFixed(1), n: c.reviewCount })}</p> : null}</div>
          <div className="ws-reviews">
            {c.reviews.slice(0, 3).map((r, i) => (
              <figure key={i} data-reveal><span>{"★".repeat(r.rating)}</span><blockquote>“{r.text}”</blockquote><figcaption data-review-author={r.author}>{r.author}</figcaption></figure>
            ))}
          </div>
        </section>
      )}

      {c.faqs.length > 0 && (
        <section className="ws-width ws-section ws-faq">
          <h2>{L.sec_faq_title}</h2>
          <div>{c.faqs.map((f) => <details key={f.q}><summary>{f.q}<span>+</span></summary><p>{f.a}</p></details>)}</div>
        </section>
      )}

      <section className="ws-width ws-section" id="visit">
        <div className="ws-visit">
          <div>
            <h2>{L.sec_cta_title}</h2>
            <div className="ws-buttons">
              <a className="ws-btn" href={d.bookHref}>{c.ctaLabel} →</a>
              {biz.phone && <a className="ws-btn line" href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a>}
            </div>
          </div>
          <div className="ws-visit-facts">
            {biz.address && <p><Icon name="map" size={18} />{biz.address}</p>}
            <OpenBadge d={d} />
            {d.mapsHref && <a href={d.mapsHref}>{L.get_directions} ↗</a>}
            <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
          </div>
        </div>
      </section>

      <footer className="ws-width ws-footer">
        <span className="ws-logo">{biz.name}</span>
        <span>© {d.year} · {c.tagline}</span>
        <div>{c.facebook && <a href={c.facebook}>Facebook</a>}{c.instagram && <a href={c.instagram}>Instagram</a>}<a href="#top">↑</a></div>
      </footer>

      <div className="ws-sticky">
        {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={16} />{L.call}</a>}
        <a href={d.bookHref}>{c.ctaLabel} →</a>
      </div>
      <Script js={SHARED_JS + PARTS_JS + stageScene("brake", BRAKE) + STAGE_JS} />
    </div>
  );
}

export const css = `
.workshop {
  --steel: color-mix(in srgb, var(--dark) 94%, #000); --plate: color-mix(in srgb, var(--dark) 80%, #2a2d31);
  --ink: color-mix(in srgb, var(--light) 85%, #fff); --muted: #9a9ea5; --line: #ffffff1a; --hot: var(--primary); --amber: var(--accent);
  background: var(--steel); color: var(--ink); font: 15px/1.6 var(--body); -webkit-font-smoothing: antialiased;
}
.workshop h1, .workshop h2 { font-family: var(--heading); font-weight: 700; text-transform: uppercase; letter-spacing: -.01em; }
.ws-width { width: min(1240px, calc(100% - 80px)); margin-inline: auto; }
.ws-kicker { font: 600 12px var(--heading); letter-spacing: .2em; text-transform: uppercase; color: var(--amber); }
.ws-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 12px 24px; background: var(--hot); color: #fff; font: 700 14px var(--heading); text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px)); transition: filter .2s, transform .2s; }
.ws-btn:hover { filter: brightness(1.12); transform: translateY(-2px); }
.ws-btn.line { background: transparent; color: var(--ink); box-shadow: inset 0 0 0 1px #ffffff40; clip-path: none; }

.ws-nav { position: absolute; inset-inline: 0; z-index: 20; display: flex; align-items: center; gap: 22px; padding: 18px clamp(20px, 4vw, 56px); border-block-end: 1px solid var(--line); --mm-top: 85px; }
.ws-logo { display: inline-flex; align-items: center; gap: 10px; font: 700 22px var(--heading); text-transform: uppercase; margin-inline-end: auto; }
.ws-logo img { width: 36px; height: 36px; object-fit: cover; }
.ws-nav nav { display: flex; gap: 24px; }
.ws-nav nav a { font: 600 13px var(--heading); text-transform: uppercase; letter-spacing: .08em; color: #c3c6cb; }
.ws-nav nav a:hover { color: var(--amber); }
.workshop .mm summary { color: var(--ink); }
.workshop .mm-panel { background: var(--steel); color: var(--ink); }
.workshop .mm-panel nav a { font: 700 2.4rem var(--heading); text-transform: uppercase; }
.workshop .mm-book { background: var(--hot); color: #fff; }

.ws-hero { position: relative; min-height: max(720px, 100svh); display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 30px; padding: 120px clamp(20px, 4vw, 56px) 60px; overflow: hidden; isolation: isolate;
  background: radial-gradient(circle at 72% 52%, color-mix(in srgb, var(--hot) 22%, transparent), transparent 40%), repeating-linear-gradient(-45deg, transparent 0 22px, #ffffff04 22px 23px), var(--steel); }
.ws-tag { display: inline-flex; padding: 6px 12px; background: var(--plate); border-inline-start: 3px solid var(--amber); font-size: 13px; }
.ws-hero h1 { font-size: clamp(48px, 6.4vw, 104px); line-height: .92; margin: 22px 0; }
.ws-hero-copy > p { color: var(--muted); font-size: 17px; max-width: 42ch; }
.ws-buttons { display: flex; flex-wrap: wrap; gap: 10px; margin-block-start: 26px; }
.ws-facts { display: flex; gap: 34px; flex-wrap: wrap; margin-block-start: 44px; padding-block-start: 22px; border-block-start: 1px solid var(--line); }
.ws-facts div { display: flex; gap: 12px; align-items: center; max-width: 260px; font-size: 13px; color: var(--muted); }
.ws-facts b { font: 700 40px/1 var(--heading); color: var(--amber); }
.ws-stage { position: relative; height: min(72vh, 640px); }
.ws-stage canvas { position: absolute; inset: -8%; width: 116%; height: 116%; cursor: grab; touch-action: pan-y; }
.ws-ring { position: absolute; inset: 8%; border-radius: 50%; border: 1px dashed #ffffff22; box-shadow: 0 0 0 40px #ffffff05, 0 0 0 80px #ffffff03; }
.ws-coord { position: absolute; inset-block-end: 0; inset-inline-end: 0; font: 500 11px var(--heading); letter-spacing: .14em; color: var(--muted); }
.ws-fallback { display: none; }
.no-3d canvas { display: none; }
.no-3d .ws-fallback { display: block; position: absolute; inset: 10%; overflow: hidden; }
.no-3d .ws-fallback img { width: 100%; height: 100%; object-fit: cover; }

.ws-parts { height: 340vh; position: relative; border-block: 1px solid var(--line); }
.ws-parts-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; background: radial-gradient(circle at 36% 55%, color-mix(in srgb, var(--hot) 14%, transparent), transparent 45%); }
.ws-parts-sticky canvas { position: absolute; inset: 22% 36% 0 0; width: 64%; height: 78%; }
[dir=rtl] .ws-parts-sticky canvas { inset: 22% 0 0 36%; }
.ws-parts-head { position: absolute; inset-block-start: 90px; inset-inline-start: clamp(20px, 4vw, 56px); }
.ws-parts-head h2 { font-size: clamp(40px, 4.6vw, 72px); line-height: .92; margin: 12px 0 8px; }
.ws-parts-head p { color: var(--muted); font-size: 13px; letter-spacing: .1em; text-transform: uppercase; }
.ws-part-list { position: absolute; inset-block-start: 50%; inset-inline-end: clamp(20px, 4vw, 56px); transform: translateY(-50%); width: min(460px, 36vw); list-style: none; display: grid; gap: 8px; }
.ws-part-list a { display: grid; grid-template-columns: 40px 1fr auto; gap: 14px; align-items: center; padding: 18px; background: #ffffff06; border: 1px solid var(--line); transition: background .3s, border-color .3s, transform .3s; }
.ws-part-list li.on a { background: color-mix(in srgb, var(--hot) 16%, var(--plate)); border-color: var(--amber); transform: translateX(-8px); }
[dir=rtl] .ws-part-list li.on a { transform: translateX(8px); }
.ws-n { font: 700 22px var(--heading); color: var(--amber); }
.ws-pt b { display: block; font: 700 18px var(--heading); text-transform: uppercase; }
.ws-pt small { display: block; color: var(--muted); font-size: 13px; line-height: 1.45; }
.ws-pp { text-align: end; font: 700 18px var(--heading); white-space: nowrap; }
.ws-pp small { display: block; font: 400 12px var(--body); color: var(--muted); }

.ws-section { padding-block-start: 120px; }
.ws-section h2 { font-size: clamp(40px, 4.8vw, 76px); line-height: .92; margin: 12px 0 24px; }
.ws-about { display: grid; grid-template-columns: 1.1fr .9fr; gap: 60px; align-items: start; }
.ws-about p { color: var(--muted); max-width: 52ch; }
.ws-checks { list-style: none; display: grid; gap: 10px; }
.ws-checks li { display: flex; gap: 12px; align-items: center; padding: 16px 18px; background: var(--plate); border-inline-start: 3px solid var(--amber); font-weight: 600; }
.ws-checks svg { color: var(--amber); flex: none; }
.ws-head { display: flex; justify-content: space-between; align-items: end; gap: 30px; margin-block-end: 36px; }
.ws-head h2 { margin: 0; }
.ws-head p { color: var(--muted); max-width: 40ch; margin: 0; }
.ws-all { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 12px; }
.ws-all a { background: var(--steel); border: 1px solid var(--line); padding: 26px; display: flex; flex-direction: column; gap: 8px; min-height: 220px; transition: background .25s; }
.ws-all a:hover { background: var(--plate); }
.ws-all a > b { font: 700 22px/1.1 var(--heading); text-transform: uppercase; }
.ws-all a > small { color: var(--muted); font-size: 13px; flex: 1; }
.ws-all-meta { display: flex; justify-content: space-between; padding-block-start: 14px; border-block-start: 1px solid var(--line); font-size: 13px; color: var(--muted); }
.ws-all-meta b { color: var(--amber); font-family: var(--heading); font-size: 16px; }

.ws-team ul { list-style: none; display: flex; flex-wrap: wrap; gap: 12px; }
.ws-team li { display: grid; grid-template-columns: 48px auto; column-gap: 12px; align-items: center; padding: 12px 22px 12px 12px; background: var(--plate); }
.ws-team i { grid-row: span 2; width: 48px; height: 48px; display: grid; place-items: center; font: normal 700 20px var(--heading); background: var(--hot); color: #fff; }
.ws-team b { font: 700 17px var(--heading); text-transform: uppercase; }
.ws-team span { color: var(--muted); font-size: 13px; }

.ws-reviews { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.ws-reviews figure { margin: 0; padding: 26px; background: var(--plate); display: flex; flex-direction: column; gap: 14px; }
.ws-reviews figure > span { color: var(--amber); letter-spacing: .14em; }
.ws-reviews blockquote { margin: 0; flex: 1; font-size: 16px; }
.ws-reviews figcaption { font: 700 14px var(--heading); text-transform: uppercase; }

.ws-faq { display: grid; grid-template-columns: 40% 1fr; gap: 60px; }
.ws-faq h2 { margin: 0; }
.ws-faq details { border-block-end: 1px solid var(--line); }
.ws-faq details:first-child { border-block-start: 1px solid var(--line); }
.ws-faq summary { list-style: none; display: flex; justify-content: space-between; gap: 16px; padding-block: 22px; font-weight: 600; cursor: pointer; }
.ws-faq summary::-webkit-details-marker { display: none; }
.ws-faq summary span { color: var(--amber); font-size: 22px; line-height: 1; transition: transform .2s; }
.ws-faq details[open] summary span { transform: rotate(45deg); }
.ws-faq details p { color: var(--muted); margin: 0 0 22px; }

.ws-visit { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; padding: clamp(30px, 5vw, 64px); background: linear-gradient(135deg, color-mix(in srgb, var(--hot) 40%, var(--plate)), var(--plate)); }
.ws-visit h2 { margin-block-start: 0; }
.ws-visit-facts { display: grid; gap: 12px; align-content: start; }
.ws-visit-facts p { display: flex; gap: 10px; align-items: center; margin: 0; }
.ws-visit-facts > a { color: var(--amber); font-weight: 700; }
.ws-visit-facts dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 8px; border-block-end: 1px solid var(--line); font-size: 14px; }
.ws-footer { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; padding-block: 40px; margin-block-start: 60px; border-block-start: 1px solid var(--line); font-size: 12px; color: var(--muted); }
.ws-footer .ws-logo { margin: 0; font-size: 18px; color: var(--ink); }
.ws-footer > div { display: flex; gap: 20px; }
.ws-sticky { display: none; }

@media (max-width: 960px) {
  .ws-hero { grid-template-columns: 1fr; padding-block-start: 110px; }
  .ws-stage { height: 400px; order: -1; margin-block-start: 10px; }
  .ws-about, .ws-faq, .ws-visit { grid-template-columns: 1fr; gap: 30px; }
  .ws-parts-sticky canvas, [dir=rtl] .ws-parts-sticky canvas { inset: 20% 0 32%; width: 100%; height: 48%; --stage-zoom: .62; }
  .ws-parts-head { inset-block-start: 76px; }
  .ws-parts-head h2 { font-size: 36px; }
  .ws-part-list { inset-block: auto 92px; inset-inline: 16px; transform: none; width: auto; }
  .ws-part-list li { display: none; }
  .ws-part-list li.on { display: block; }
  .ws-part-list li.on a { transform: none; }
}
@media (max-width: 760px) {
  .ws-width { width: calc(100% - 32px); }
  .ws-nav { padding: 16px; --mm-top: 78px; }
  .ws-hero { padding: 90px 16px 40px; gap: 10px; }
  .ws-stage { height: 320px; }
  .ws-hero h1 { font-size: clamp(40px, 11vw, 60px); }
  .ws-parts-head { inset-inline-start: 16px; }
  .ws-section { padding-block-start: 84px; }
  .ws-head { display: block; }
  .ws-head p { margin-block-start: 12px; }
  .ws-footer { flex-direction: column; text-align: center; padding-block-end: 110px; }
  .ws-sticky { display: flex; gap: 8px; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; transform: translateY(150%); transition: transform .4s; }
  .ws-sticky a { flex: 1; display: flex; gap: 8px; justify-content: center; align-items: center; padding: 15px; background: var(--hot); color: #fff; font: 700 14px var(--heading); text-transform: uppercase; }
  .ws-sticky a:first-child:not(:last-child) { background: var(--plate); flex: .6; }
  .workshop[data-scrolled] .ws-sticky { transform: none; }
}
`;
