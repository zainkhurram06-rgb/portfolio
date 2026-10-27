// LIQUID: the salon flagship. A glossy liquid-chrome form in the salon's own
// colours floats over their name, ripples away from the cursor and spreads
// out as you scroll, then wraps around a glass panel playing their reel (or
// their photos). After that: a price menu, a before/after slider, stories
// that open full screen, and booking everywhere.

import { DemoRibbon, Paragraphs, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { BA_JS, MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, fitSize, type DesignProps } from "./shared";
import { STAGE_JS, stageScene } from "./stage3d";
import { LIQUID } from "./scenes";

export function Liquid({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team");
  const reel = c.gallery.slice(0, 4);
  const stories = c.gallery.slice(0, 10);
  const links: [string, string][] = [
    ["#menu", L.nav_services],
    ...(stories.length ? [["#stories", L.lookbook] as [string, string]] : []),
    ...(c.reviews.length ? [["#reviews", L.nav_reviews] as [string, string]] : []),
    ["#visit", L.nav_visit],
  ];
  const ticker = c.highlights.length ? c.highlights : [c.tagline];
  return (
    <div className="dsite liquid" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="lq-nav">
        <a className="lq-logo" href="#top">{c.logoUrl && <img src={c.logoUrl} alt="" />}<span>{biz.name}</span></a>
        <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        <a className="lq-pill dark desk" href={d.bookHref}>{c.ctaLabel}</a>
        <MobileMenu d={d} links={links} />
      </header>

      <section className="lq-hero" id="top" data-3d-host>
        <h1 className="lq-name" style={{ fontSize: fitSize(biz.name, 94, "17rem") }}>{biz.name}</h1>
        <div className="lq-stage">
          <canvas data-stage="liquid" data-scroll="leave" data-drag="off" data-spin="0" tabIndex={-1} aria-hidden="true" />
          <div className="lq-fallback">{c.heroImage ? <img src={c.heroImage} alt="" /> : null}</div>
        </div>
        <div className="lq-hero-foot">
          <div className="lq-hero-copy">
            <span className="lq-kicker">{c.tagline}{biz.city && <> · {biz.city}</>}</span>
            <p className="lq-headline">{c.headline}</p>
            <p className="lq-sub">{c.subheadline}</p>
            <div className="lq-buttons">
              <a className="lq-pill dark" href={d.bookHref}>{c.ctaLabel} ↗</a>
              <a className="lq-pill line" href="#menu">{L.nav_services}</a>
            </div>
          </div>
          <div className="lq-hero-side">
            {c.rating != null && <p className="lq-rating"><b>{c.rating.toFixed(1)}</b><span>★★★★★<br />{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</span></p>}
            <OpenBadge d={d} />
          </div>
        </div>
      </section>

      <div className="lq-ticker" aria-hidden="true">
        <div>{[0, 1, 2].map((k) => <span key={k}>{ticker.map((t, i) => <span key={i}>{t}<i>✦</i></span>)}</span>)}</div>
      </div>

      <section className="lq-reel" id="about" data-3d-host>
        <canvas className="lq-reel-liquid" data-stage="liquid" data-drag="off" data-spin="0" data-scale=".8" tabIndex={-1} aria-hidden="true" />
        <div className="lq-width lq-reel-grid">
          <div className="lq-reel-copy" data-reveal>
            <span className="lq-kicker">{L.sec_about_kicker}</span>
            <h2>{c.aboutTitle}</h2>
            <Paragraphs text={c.about} />
            {c.instagram && <a className="lq-link" href={c.instagram}>{L.follow_instagram} ↗</a>}
          </div>
          <div className="lq-glass">
            {c.heroVideo
              ? <video src={c.heroVideo} autoPlay muted loop playsInline poster={c.heroImage ?? undefined} />
              : reel.length > 0
                ? <div className="lq-slides">{reel.map((src, i) => <img key={src} src={src} alt="" loading="lazy" style={{ ["--i" as string]: String(i), ["--n" as string]: String(reel.length) }} />)}</div>
                : <div className="lq-glass-blank" />}
            <span className="lq-glass-tag">● {biz.name}</span>
          </div>
        </div>
      </section>

      <section className="lq-width lq-menu" id="menu">
        <div className="lq-head" data-reveal>
          <span className="lq-kicker">{L.sec_services_kicker}</span>
          <h2>{L.sec_services_title}</h2>
          <p>{L.sec_services_intro}</p>
        </div>
        <div className="lq-menu-list">
          {services.map((s) => (
            <a key={s.id} href={d.bookHref} data-reveal>
              <span className="lq-menu-name">{s.name}</span>
              <span className="lq-dots" aria-hidden="true" />
              <span className="lq-menu-price">{s.price ?? `${s.durationMin} ${L.min}`}</span>
              <small>{s.description}{s.price && <> · {s.durationMin} {L.min}</>}</small>
            </a>
          ))}
        </div>
      </section>

      {c.beforeAfter.length > 0 && (
        <section className="lq-width lq-ba">
          <div className="lq-head" data-reveal><span className="lq-kicker">{L.made_by_hand}</span><h2>{L.sec_beforeafter_title}</h2></div>
          <div className="lq-ba-grid">
            {c.beforeAfter.slice(0, 2).map((p, i) => (
              <figure key={i}>
                <div className="lq-ba-box" data-ba dir="ltr">
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

      {stories.length > 0 && (
        <section className="lq-stories" id="stories">
          <div className="lq-width lq-head"><span className="lq-kicker">{L.lookbook}</span><h2>{L.sec_gallery_title}</h2><p>{L.story_tap}</p></div>
          <div className="lq-strip" data-drag>
            {stories.map((src, i) => (
              <a key={src} href={src} data-lightbox={src} className={i % 3 === 1 ? "low" : ""}><img src={src} alt="" loading="lazy" draggable={false} /></a>
            ))}
          </div>
        </section>
      )}

      {staff.length > 0 && (
        <section className="lq-width lq-team">
          <div className="lq-head" data-reveal><span className="lq-kicker">{L.sec_team_kicker}</span><h2>{L.sec_team_title}</h2></div>
          <ul>{staff.map((p) => <li key={p.id} data-reveal><i>{p.name.slice(0, 1)}</i><b>{p.name}</b><span>{p.title}</span><a href={d.bookHref}>{L.book_this} ↗</a></li>)}</ul>
        </section>
      )}

      {c.reviews.length > 0 && (
        <section className="lq-width lq-reviews" id="reviews">
          <span className="lq-kicker">{L.sec_reviews_kicker}</span>
          {c.reviews.slice(0, 3).map((r, i) => (
            <figure key={i} data-reveal>
              <blockquote>“{r.text}”</blockquote>
              <figcaption data-review-author={r.author}>{r.author} · {"★".repeat(r.rating)}</figcaption>
            </figure>
          ))}
        </section>
      )}

      {c.faqs.length > 0 && (
        <section className="lq-width lq-faq">
          <h2>{L.sec_faq_title}</h2>
          <div>{c.faqs.map((f) => <details key={f.q}><summary>{f.q}<span>+</span></summary><p>{f.a}</p></details>)}</div>
        </section>
      )}

      <section className="lq-visit" id="visit">
        <div className="lq-width lq-visit-grid">
          <div>
            <span className="lq-kicker">{L.sec_contact_kicker}</span>
            <h2>{L.sec_cta_title}</h2>
            <a className="lq-pill light" href={d.bookHref}>{c.ctaLabel} ↗</a>
          </div>
          <div className="lq-visit-facts">
            {biz.address && <p>{biz.address}</p>}
            <OpenBadge d={d} />
            <p className="lq-links">
              {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a>}
              {d.mapsHref && <a href={d.mapsHref}>{L.directions} ↗</a>}
              {c.instagram && <a href={c.instagram}>Instagram ↗</a>}
            </p>
            <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
          </div>
        </div>
        <footer className="lq-width lq-footer">
          <span>{biz.name}</span><span>© {d.year} · {c.tagline}</span><a href="#top">↑</a>
        </footer>
      </section>

      <a className="lq-sticky" href={d.bookHref}>{c.ctaLabel} ↗</a>
      <Script js={SHARED_JS + BA_JS + stageScene("liquid", LIQUID) + STAGE_JS} />
    </div>
  );
}

export const css = `
.liquid {
  --paper: color-mix(in srgb, var(--light) 65%, #fbf8f6); --ink: color-mix(in srgb, var(--dark) 92%, #111);
  --muted: color-mix(in srgb, var(--dark) 50%, #a3999c); --line: color-mix(in srgb, var(--dark) 14%, transparent);
  background: var(--paper); color: var(--ink); font: 15px/1.6 var(--body); -webkit-font-smoothing: antialiased;
}
.liquid h1, .liquid h2 { font-family: var(--heading); font-weight: 400; }
.lq-width { width: min(1280px, calc(100% - 80px)); margin-inline: auto; }
.lq-kicker { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; font-weight: 600; }
.lq-pill { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 46px; padding: 12px 24px; border-radius: 999px; font-size: 13px; font-weight: 600; white-space: nowrap; transition: transform .2s, background .2s, color .2s; }
.lq-pill:hover { transform: translateY(-2px); }
.lq-pill.dark { background: var(--ink); color: var(--paper); }
.lq-pill.line { border: 1px solid var(--ink); }
.lq-pill.line:hover { background: var(--ink); color: var(--paper); }
.lq-pill.light { background: var(--paper); color: var(--ink); }

.lq-nav { position: absolute; inset-inline: 0; z-index: 20; display: flex; align-items: center; gap: 30px; padding: 22px clamp(20px, 4vw, 56px); --mm-top: 90px; }
.lq-logo { display: inline-flex; align-items: center; gap: 10px; font: 400 24px var(--heading); letter-spacing: .02em; margin-inline-end: auto; text-transform: uppercase; }
.lq-logo img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.lq-nav nav { display: flex; gap: 30px; }
.lq-nav nav a { font-size: 13px; font-weight: 500; transition: opacity .2s; }
.lq-nav nav a:hover { opacity: .5; }
.liquid .mm-panel { background: var(--paper); color: var(--ink); }
.liquid .mm-panel nav a { font: 400 2.6rem var(--heading); text-transform: uppercase; }
.liquid .mm-book { background: var(--ink); color: var(--paper); border-radius: 999px; }

.lq-hero { position: relative; min-height: max(700px, 100svh); overflow: hidden; isolation: isolate; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 clamp(20px, 4vw, 56px) 40px;
  background: radial-gradient(ellipse 60% 50% at 50% 45%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%), var(--paper); }
.lq-name { position: absolute; inset-inline: 0; inset-block-start: 15%; text-align: center; margin: 0; line-height: .82; text-transform: uppercase; letter-spacing: -.02em; color: color-mix(in srgb, var(--primary) 70%, var(--dark)); white-space: nowrap; z-index: 0; }
.lq-stage { position: absolute; inset: 6% 0 14%; z-index: 1; }
.lq-stage canvas { width: 100%; height: 100%; display: block; filter: drop-shadow(0 40px 50px color-mix(in srgb, var(--dark) 22%, transparent)); }
.lq-fallback { display: none; }
.no-3d canvas { display: none; }
.no-3d .lq-fallback { display: block; position: absolute; inset: 10% 30%; border-radius: 48% 52% 45% 55%; overflow: hidden; }
.no-3d .lq-fallback img { width: 100%; height: 100%; object-fit: cover; }
.lq-hero-foot { position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: end; gap: 40px; }
.lq-hero-copy { max-width: 520px; display: grid; gap: 12px; }
.lq-headline { font: 400 clamp(26px, 2.6vw, 38px)/1.1 var(--heading); margin: 0; }
.lq-sub { color: var(--muted); margin: 0; max-width: 44ch; }
.lq-buttons { display: flex; gap: 10px; flex-wrap: wrap; margin-block-start: 6px; }
.lq-hero-side { display: grid; gap: 12px; justify-items: end; text-align: end; font-size: 13px; }
.lq-rating { display: flex; align-items: center; gap: 12px; margin: 0; }
.lq-rating b { font: 400 64px/1 var(--heading); }
.lq-rating span { font-size: 12px; line-height: 1.4; text-align: start; color: var(--muted); }

.lq-ticker { overflow: hidden; border-block: 1px solid var(--line); padding-block: 18px; white-space: nowrap; }
.lq-ticker > div { display: flex; min-width: max-content; animation: lq-marquee 30s linear infinite; }
.lq-ticker span { display: inline-flex; align-items: center; gap: 40px; padding-inline-end: 40px; font: 400 26px var(--heading); text-transform: uppercase; }
.lq-ticker i { font-style: normal; color: var(--primary); font-size: 18px; }
[dir=rtl] .lq-ticker > div { animation-name: lq-marquee-rtl; }

.lq-reel { position: relative; padding-block: 140px; overflow: hidden; isolation: isolate; }
.lq-reel-liquid { position: absolute; inset: 0; width: 100%; height: 100%; z-index: -1; opacity: .9; }
.lq-reel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: center; }
.lq-reel h2, .lq-head h2, .lq-faq h2, .lq-visit h2 { font-size: clamp(44px, 5.6vw, 88px); line-height: .95; letter-spacing: -.01em; margin: 16px 0 26px; text-transform: uppercase; }
.lq-reel-copy { background: color-mix(in srgb, var(--paper) 75%, transparent); backdrop-filter: blur(14px); padding: 36px; border-radius: 4px; }
.lq-reel-copy > p { color: color-mix(in srgb, var(--ink) 75%, transparent); max-width: 46ch; }
.lq-link { display: inline-block; margin-block-start: 10px; border-block-end: 1px solid currentColor; font-weight: 600; font-size: 14px; }
.lq-glass { position: relative; aspect-ratio: 4 / 5; max-height: 640px; justify-self: center; width: min(100%, 470px); border-radius: 260px 260px 20px 20px; overflow: hidden; border: 1px solid #ffffffa0; box-shadow: 0 40px 80px color-mix(in srgb, var(--dark) 25%, transparent), inset 0 0 0 10px #ffffff30; background: #ffffff40; backdrop-filter: blur(20px); }
.lq-glass video, .lq-glass-blank { position: absolute; inset: 10px; width: calc(100% - 20px); height: calc(100% - 20px); object-fit: cover; border-radius: 250px 250px 12px 12px; }
.lq-glass-blank { background: linear-gradient(160deg, var(--light), var(--accent)); }
.lq-slides { position: absolute; inset: 10px; border-radius: 250px 250px 12px 12px; overflow: hidden; }
.lq-slides img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; animation: lq-slide calc(var(--n) * 4s) infinite; animation-delay: calc(var(--i) * 4s); }
.lq-glass-tag { position: absolute; inset-block-end: 24px; inset-inline-start: 50%; transform: translateX(-50%); background: #ffffffd0; backdrop-filter: blur(6px); border-radius: 999px; padding: 7px 14px; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; }

.lq-menu { padding-block: 120px 40px; }
.lq-head { margin-block-end: 40px; }
.lq-head p { color: var(--muted); max-width: 46ch; margin: 0; }
.lq-menu-list { display: grid; grid-template-columns: 1fr 1fr; gap: 0 70px; }
.lq-menu-list a { display: grid; grid-template-columns: auto 1fr auto; align-items: baseline; gap: 12px; padding-block: 22px; border-block-end: 1px solid var(--line); transition: padding .3s; }
.lq-menu-list a:hover { padding-inline-start: 10px; }
.lq-menu-name { font: 400 clamp(22px, 2vw, 30px)/1.1 var(--heading); text-transform: uppercase; }
.lq-dots { border-block-end: 1px dotted color-mix(in srgb, var(--dark) 35%, transparent); transform: translateY(-6px); }
.lq-menu-price { font-weight: 600; white-space: nowrap; }
.lq-menu-list small { grid-column: 1 / -1; color: var(--muted); font-size: 13px; }

.lq-ba { padding-block: 100px 0; }
.lq-ba-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.lq-ba figure { margin: 0; }
.lq-ba-box { position: relative; aspect-ratio: 4 / 5; overflow: hidden; border-radius: 4px; --pos: 50%; }
.lq-ba-box img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.lq-ba-box .after { clip-path: inset(0 0 0 var(--pos)); }
.lq-ba-box::after { content: ""; position: absolute; inset-block: 0; inset-inline-start: var(--pos); width: 2px; background: #fff; box-shadow: 0 0 12px #0006; pointer-events: none; }
.lq-ba-box span { position: absolute; inset-block-start: 14px; background: #ffffffd0; border-radius: 999px; padding: 5px 12px; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
.lq-ba-box .b { inset-inline-start: 14px; } .lq-ba-box .a { inset-inline-end: 14px; }
.lq-ba-box input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: ew-resize; margin: 0; }
.lq-ba figcaption { margin-block-start: 10px; color: var(--muted); font-size: 14px; }

.lq-stories { padding-block: 120px 0; }
.lq-strip { display: flex; gap: 14px; overflow-x: auto; padding-inline: max(40px, calc((100% - 1280px) / 2)); padding-block-end: 30px; }
.lq-strip a { flex: none; width: clamp(200px, 22vw, 300px); aspect-ratio: 9 / 16; border-radius: 16px; overflow: hidden; transition: transform .4s; }
.lq-strip a.low { margin-block-start: 50px; }
.lq-strip a:hover { transform: translateY(-8px) rotate(-1deg); }
.lq-strip img { width: 100%; height: 100%; object-fit: cover; }

.lq-team { padding-block: 110px 0; }
.lq-team ul { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.lq-team li { display: grid; grid-template-columns: 54px 1fr; column-gap: 14px; align-items: center; padding: 18px; border: 1px solid var(--line); border-radius: 999px; }
.lq-team i { grid-row: span 3; width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; font: normal 400 24px var(--heading); background: linear-gradient(140deg, var(--accent), var(--primary)); color: #fff; }
.lq-team b { font: 400 22px/1.1 var(--heading); text-transform: uppercase; }
.lq-team span { color: var(--muted); font-size: 13px; }
.lq-team a { font-size: 12px; font-weight: 600; }

.lq-reviews { padding-block: 120px 0; }
.lq-reviews figure { margin: 0; padding-block: 34px; border-block-end: 1px solid var(--line); }
.lq-reviews blockquote { margin: 0 0 14px; font: 400 clamp(26px, 3.4vw, 50px)/1.08 var(--heading); text-transform: uppercase; max-width: 22ch; }
.lq-reviews figure:nth-of-type(2) blockquote { margin-inline-start: auto; text-align: end; }
.lq-reviews figure:nth-of-type(2) figcaption { text-align: end; }
.lq-reviews figcaption { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }

.lq-faq { display: grid; grid-template-columns: 40% 1fr; gap: 60px; padding-block: 120px; }
.lq-faq h2 { margin-block-start: 0; }
.lq-faq details { border-block-end: 1px solid var(--line); }
.lq-faq details:first-child { border-block-start: 1px solid var(--line); }
.lq-faq summary { list-style: none; display: flex; justify-content: space-between; gap: 16px; padding-block: 22px; font-size: 16px; font-weight: 500; cursor: pointer; }
.lq-faq summary::-webkit-details-marker { display: none; }
.lq-faq summary span { font-size: 22px; line-height: 1; transition: transform .2s; }
.lq-faq details[open] summary span { transform: rotate(45deg); }
.lq-faq details p { color: var(--muted); margin: 0 0 22px; }

.lq-visit { background: var(--ink); color: var(--paper); padding-block: 110px 30px; }
.lq-visit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
.lq-visit h2 { margin-block-start: 14px; }
.lq-visit-facts { display: grid; gap: 14px; font-size: 15px; }
.lq-visit-facts p { margin: 0; }
.lq-links { display: flex; flex-wrap: wrap; gap: 20px; }
.lq-links a { border-block-end: 1px solid color-mix(in srgb, var(--paper) 50%, transparent); }
.lq-visit dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 9px; border-block-end: 1px solid #ffffff22; font-size: 14px; }
.lq-footer { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-block-start: 90px; padding-block-start: 24px; border-block-start: 1px solid #ffffff22; font-size: 12px; color: color-mix(in srgb, var(--paper) 60%, transparent); }
.lq-footer span:first-child { font: 400 18px var(--heading); text-transform: uppercase; color: var(--paper); }
.lq-sticky { display: none; }
@keyframes lq-marquee { to { transform: translateX(-50%); } }
@keyframes lq-marquee-rtl { to { transform: translateX(50%); } }
@keyframes lq-slide { 0% { opacity: 0; transform: scale(1.06); } 6%, 25% { opacity: 1; } 31%, 100% { opacity: 0; transform: scale(1); } }

@media (max-width: 900px) {
  .lq-reel-grid, .lq-menu-list, .lq-faq, .lq-visit-grid { grid-template-columns: 1fr; }
  .lq-reel-grid { gap: 40px; }
}
@media (max-width: 760px) {
  .lq-width { width: calc(100% - 32px); }
  .lq-nav { padding: 18px 16px; --mm-top: 80px; }
  .lq-hero { min-height: 760px; padding: 0 16px 28px; }
  .lq-name { inset-block-start: 14%; }
  .lq-stage { inset: 14% -20% 34%; }
  .lq-hero-foot { flex-direction: column; align-items: stretch; gap: 20px; }
  .lq-hero-side { justify-items: start; text-align: start; grid-auto-flow: column; justify-content: space-between; align-items: center; }
  .lq-rating b { font-size: 44px; }
  .lq-ticker span { font-size: 20px; }
  .lq-reel { padding-block: 90px; }
  .lq-reel-copy { padding: 24px; }
  .lq-menu { padding-block-start: 90px; }
  .lq-ba-grid { grid-template-columns: 1fr; }
  .lq-strip { padding-inline: 16px; }
  .lq-strip a { width: 62vw; }
  .lq-reviews figure:nth-of-type(2) blockquote, .lq-reviews figure:nth-of-type(2) figcaption { text-align: start; margin-inline-start: 0; }
  .lq-faq { gap: 20px; padding-block: 90px; }
  .lq-visit { padding-block: 80px 110px; }
  .lq-sticky { display: flex; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; justify-content: center; padding: 16px; border-radius: 999px; background: var(--ink); color: var(--paper); font-weight: 600; font-size: 14px; transform: translateY(150%); transition: transform .4s; }
  .liquid[data-scrolled] .lq-sticky { transform: none; }
}
`;
