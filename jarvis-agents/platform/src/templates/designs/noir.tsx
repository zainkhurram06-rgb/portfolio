// NOIR: dark, cinematic, after-hours luxury. A full-screen reel, a ticker
// strip, a service list where a photo follows your mouse, a spinning badge.
// References: Salon SCK, Grand Noir.

import { DemoRibbon, Paragraphs, Stars, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, fitSize, navLinks, type DesignProps } from "./shared";

export function Noir({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const photos = c.gallery;
  const links = navLinks(d, { about: true, work: true, reviews: true });
  const ticker = [c.tagline, biz.city, c.ctaLabel, biz.phone].filter(Boolean) as string[];
  const badge = `${c.ctaLabel} · ${biz.name} · `.toUpperCase();
  return (
    <div className="dsite noir" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <div className="nr-ticker" aria-hidden="true">
        <div>{[0, 1, 2, 3].map((k) => <span key={k}>{ticker.map((x, i) => <b key={i}>{x}</b>)}</span>)}</div>
      </div>

      <header className="nr-head">
        <div className="nr-wrap">
          <a className="nr-brand" href="#top">{c.logoUrl && <img src={c.logoUrl} alt="" />}<span>{biz.name}</span></a>
          <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
          <a className="nr-book desk" href={d.bookHref}>{c.ctaLabel}</a>
          <MobileMenu d={d} links={links} />
        </div>
      </header>

      <section className="nr-hero" id="top">
        {c.heroVideo ? <video className="nr-bg" src={c.heroVideo} poster={c.heroImage ?? undefined} autoPlay muted loop playsInline />
          : c.heroImage ? <img className="nr-bg" src={c.heroImage} alt="" /> : <div className="nr-bg nr-grain" />}
        <div className="nr-hero-in">
          <p className="nr-kicker">{c.tagline}{biz.city ? ` / ${biz.city}` : ""}</p>
          <h1>{c.headline}</h1>
          <p className="nr-lead">{c.subheadline}</p>
          <div className="nr-actions">
            <a className="nr-btn" href={d.bookHref}>{c.ctaLabel}</a>
            {c.rating != null && <span className="nr-rate"><Stars n={Math.round(c.rating)} />{c.rating.toFixed(1)}{c.reviewCount ? ` · ${fill(L.google_reviews, { n: c.reviewCount })}` : ""}</span>}
          </div>
        </div>
        <a className="nr-scroll" href="#about"><span>{L.scroll}</span><i /></a>
      </section>

      <section className="nr-intro" id="about">
        <div className="nr-wrap">
          <h2 data-reveal>{c.aboutTitle}</h2>
          <div className="nr-cols" data-reveal>
            <div><Paragraphs text={c.about} /></div>
            <ul>{c.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="nr-menu" id="services">
        <div className="nr-wrap">
          <div className="nr-menu-head" data-reveal>
            <p className="nr-kicker">{L.sec_services_kicker}</p>
            <h2>{L.sec_services_title}</h2>
          </div>
          <ol className="nr-rows">
            {services.map((s, i) => {
              const img = photos.length ? photos[i % photos.length] : null;
              return (
                <li key={s.id} data-reveal>
                  <a href={d.bookHref} data-preview={img ?? undefined}>
                    <span className="nr-n">{String(i + 1).padStart(2, "0")}</span>
                    {img && <img className="nr-thumb" src={img} alt="" loading="lazy" />}
                    <span className="nr-name">{s.name}<small>{s.description}</small></span>
                    <span className="nr-price">{s.price ?? `${s.durationMin} ${L.min}`}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
        <img className="nr-float" alt="" aria-hidden="true" />
      </section>

      {photos.length >= 3 && (
        <section className="nr-work" id="work">
          <div className="nr-wrap nr-work-head" data-reveal>
            <h2>{L.sec_gallery_title}</h2>
            <span className="nr-drag">{L.drag} ⟷</span>
          </div>
          <div className="nr-strip" data-drag>
            {photos.map((src, i) => (
              <a key={src} href={src} data-lightbox={src} className={i % 2 ? "low" : ""}><img src={src} alt="" loading="lazy" draggable={false} /></a>
            ))}
          </div>
        </section>
      )}

      {staff.length > 0 && (
        <section className="nr-team">
          <div className="nr-wrap">
            <p className="nr-kicker" data-reveal>{L.the_chair}</p>
            <ul>{staff.map((p) => <li key={p.id} data-reveal><b>{p.name}</b>{p.title && <span>{p.title}</span>}</li>)}</ul>
          </div>
        </section>
      )}

      {(c.reviews.length > 0 || c.rating != null) && (
        <section className="nr-words" id="reviews">
          <div className="nr-wrap">
            {c.rating != null && (
              <div className="nr-score" data-reveal>
                <b>{c.rating.toFixed(1)}</b>
                <Stars n={Math.round(c.rating)} />
                <span>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</span>
              </div>
            )}
            <div className="nr-quotes">
              {c.reviews.slice(0, 4).map((r, i) => (
                <figure key={i} data-reveal><blockquote>“{r.text}”</blockquote><figcaption data-review-author={r.author}>{r.author}</figcaption></figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="nr-cta">
        <a className="nr-badge" href={d.bookHref} aria-label={c.ctaLabel}>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs><path id="nr-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
            <text><textPath href="#nr-circle">{badge.repeat(Math.max(1, Math.ceil(46 / badge.length)))}</textPath></text>
          </svg>
          <span>✦</span>
        </a>
        <h2 data-reveal>{L.sec_cta_title}</h2>
      </section>

      <section className="nr-visit" id="visit">
        <div className="nr-wrap">
          <div data-reveal>
            <p className="nr-kicker">{L.sec_contact_kicker}</p>
            {biz.address && <p className="nr-addr">{biz.address}</p>}
            <OpenBadge d={d} className="nr-open" />
            <div className="nr-actions">
              <a className="nr-btn solid" href={d.bookHref}>{c.ctaLabel}</a>
              {d.mapsHref && <a className="nr-btn" href={d.mapsHref}>{L.directions}</a>}
            </div>
          </div>
          <dl className="nr-hours" data-reveal>
            {d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}
            {biz.phone && <div><dt>{L.call}</dt><dd><a href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a></dd></div>}
          </dl>
        </div>
      </section>

      <footer className="nr-foot">
        <p className="nr-word" style={{ fontSize: fitSize(biz.name, 94) }}>{biz.name}</p>
        <div className="nr-wrap nr-foot-row">
          <span>© {d.year}</span>
          <span>{c.instagram && <a href={c.instagram}>Instagram</a>}{c.facebook && <a href={c.facebook}>Facebook</a>}</span>
        </div>
      </footer>

      <a className="nr-sticky" href={d.bookHref}>{c.ctaLabel}</a>
      <Script js={SHARED_JS + JS} />
    </div>
  );
}

// the photo that follows the mouse over the service list
const JS = `
(function () {
  var f = document.querySelector(".noir .nr-float");
  if (!f || !window.matchMedia("(hover: hover) and (min-width: 861px)").matches) return;
  document.querySelectorAll(".noir [data-preview]").forEach(function (a) {
    a.addEventListener("mouseenter", function () { f.src = a.getAttribute("data-preview"); f.classList.add("on"); });
    a.addEventListener("mouseleave", function () { f.classList.remove("on"); });
    a.addEventListener("mousemove", function (e) { f.style.transform = "translate(" + (e.clientX + 28) + "px," + (e.clientY - 140) + "px) rotate(-3deg)"; });
  });
})();
`;

export const css = `
.noir {
  --bg: #0d0c0b; --ink: color-mix(in srgb, var(--light) 92%, #fff); --gold: var(--accent);
  --muted: color-mix(in srgb, var(--ink) 58%, var(--bg)); --line: color-mix(in srgb, var(--ink) 14%, transparent);
  background: var(--bg); color: var(--ink); font-family: var(--body); font-size: 16px; line-height: 1.65;
}
.noir h1, .noir h2, .noir .nr-word, .noir .nr-score b, .noir .nr-team b, .noir .nr-name, .noir blockquote { font-family: var(--heading); font-weight: 400; }
.nr-wrap { width: min(1280px, 100% - 48px); margin-inline: auto; }
.nr-kicker { font-size: .72rem; letter-spacing: .4em; text-transform: uppercase; color: var(--gold); }
.nr-btn { display: inline-flex; align-items: center; padding: 15px 30px; border: 1px solid var(--gold); color: var(--gold); font-size: .76rem; letter-spacing: .28em; text-transform: uppercase; transition: background .35s, color .35s; }
.nr-btn:hover, .nr-btn.solid { background: var(--gold); color: var(--bg); }
.nr-btn.solid:hover { background: transparent; color: var(--gold); }
.nr-actions { display: flex; flex-wrap: wrap; gap: 14px 24px; align-items: center; }

.nr-ticker { overflow: hidden; border-block-end: 1px solid var(--line); background: #000; color: var(--gold); font-size: .72rem; letter-spacing: .3em; text-transform: uppercase; }
.nr-ticker > div { display: flex; width: max-content; animation: nr-tick 38s linear infinite; }
.nr-ticker span { display: flex; }
.nr-ticker b { font-weight: 500; padding: 10px 28px; white-space: nowrap; }
.nr-ticker b::after { content: "✦"; margin-inline-start: 56px; opacity: .6; }
@keyframes nr-tick { to { transform: translateX(-50%); } }
[dir=rtl] .nr-ticker > div { animation-name: nr-tick-rtl; }
@keyframes nr-tick-rtl { to { transform: translateX(50%); } }

.nr-head { position: sticky; top: 0; z-index: 60; transition: background .4s, backdrop-filter .4s; --mm-top: 76px; }
.noir[data-scrolled] .nr-head { background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(12px); }
.nr-head .nr-wrap { display: flex; align-items: center; gap: 40px; min-height: 76px; }
.nr-brand { display: flex; align-items: center; gap: 12px; margin-inline-end: auto; font-family: var(--heading); font-size: 1.4rem; letter-spacing: .14em; text-transform: uppercase; }
.nr-brand img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
.nr-head nav { display: flex; gap: 34px; font-size: .72rem; letter-spacing: .3em; text-transform: uppercase; color: var(--muted); }
.nr-head nav a:hover { color: var(--gold); }
.nr-book { font-size: .72rem; letter-spacing: .28em; text-transform: uppercase; padding: 11px 20px; border: 1px solid var(--gold); color: var(--gold); }
.noir .mm-panel { background: var(--bg); }
.noir .mm-panel nav a { font-family: var(--heading); text-transform: uppercase; letter-spacing: .06em; }
.noir .mm-book { background: var(--gold); color: var(--bg); letter-spacing: .26em; text-transform: uppercase; font-size: .78rem; }

.nr-hero { position: relative; min-height: calc(100svh - 76px); margin-block-start: -76px; display: grid; place-items: center; text-align: center; overflow: hidden; isolation: isolate; }
.nr-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; transform: scale(1.06); animation: nr-zoom 18s ease-out forwards; }
@keyframes nr-zoom { to { transform: scale(1); } }
.nr-hero::after { content: ""; position: absolute; inset: 0; z-index: -1; background: radial-gradient(ellipse at center, rgba(0,0,0,.25), rgba(0,0,0,.78) 75%), linear-gradient(180deg, rgba(0,0,0,.5), transparent 30%, rgba(0,0,0,.6)); }
.nr-grain { background: radial-gradient(900px 600px at 70% 30%, color-mix(in srgb, var(--primary) 55%, transparent), transparent), radial-gradient(700px 500px at 20% 80%, color-mix(in srgb, var(--gold) 30%, transparent), transparent), #0d0c0b; }
.nr-hero-in { width: min(1000px, 100% - 40px); padding-block: 140px 120px; display: grid; justify-items: center; gap: 26px; }
.nr-hero h1 { font-size: clamp(2.8rem, 7.6vw, 7rem); line-height: .98; text-transform: uppercase; letter-spacing: .02em; }
.nr-lead { max-width: 52ch; color: color-mix(in srgb, var(--ink) 78%, transparent); font-size: 1.05rem; }
.nr-hero .nr-actions { justify-content: center; }
.nr-rate { display: inline-flex; gap: 10px; align-items: center; font-size: .82rem; letter-spacing: .12em; color: color-mix(in srgb, var(--ink) 80%, transparent); }
.noir .stars { display: inline-flex; color: var(--gold); }
.nr-scroll { position: absolute; inset-block-end: 26px; inset-inline: 0; margin-inline: auto; width: max-content; display: grid; justify-items: center; gap: 10px; font-size: .66rem; letter-spacing: .4em; text-transform: uppercase; color: var(--muted); }
.nr-scroll i { width: 1px; height: 46px; background: linear-gradient(var(--gold), transparent); animation: nr-drop 2.2s ease-in-out infinite; transform-origin: top; }
@keyframes nr-drop { 0% { transform: scaleY(0); } 50% { transform: scaleY(1); } 100% { transform: scaleY(1); opacity: 0; } }

.nr-intro { padding-block: clamp(90px, 12vw, 170px); }
.nr-intro h2 { font-size: clamp(2.2rem, 5.4vw, 5rem); line-height: 1.05; max-width: 20ch; margin-block-end: 60px; }
.nr-cols { display: grid; grid-template-columns: 1.3fr 1fr; gap: clamp(30px, 6vw, 110px); }
.nr-cols p { color: var(--muted); margin-block-end: 16px; max-width: 60ch; }
.nr-cols ul { list-style: none; display: grid; align-content: start; }
.nr-cols li { padding-block: 16px; border-block-end: 1px solid var(--line); letter-spacing: .08em; }
.nr-cols li::before { content: "✦"; color: var(--gold); margin-inline-end: 14px; font-size: .7rem; }

.nr-menu { padding-block: clamp(80px, 10vw, 140px); border-block-start: 1px solid var(--line); }
.nr-menu-head { display: grid; gap: 18px; margin-block-end: 50px; }
.nr-menu h2 { font-size: clamp(2.6rem, 6vw, 5.6rem); line-height: 1; text-transform: uppercase; }
.nr-rows { list-style: none; border-block-start: 1px solid var(--line); }
.nr-rows a { display: grid; grid-template-columns: 70px 1fr auto; gap: 24px; align-items: center; padding-block: 30px; border-block-end: 1px solid var(--line); transition: padding .4s, color .4s; }
.nr-rows a:hover { padding-inline: 18px; color: var(--gold); }
.nr-n { font-size: .8rem; letter-spacing: .2em; color: var(--muted); }
.nr-thumb { display: none; }
.nr-name { font-size: clamp(1.7rem, 3.6vw, 3rem); line-height: 1.05; display: grid; gap: 8px; }
.nr-name small { font-family: var(--body); font-size: .92rem; color: var(--muted); line-height: 1.5; max-width: 54ch; }
.nr-price { font-size: .82rem; letter-spacing: .2em; text-transform: uppercase; white-space: nowrap; }
/* follows the mouse, whose coordinates are physical, so this one is pinned physically too */
.nr-float { position: fixed; inset: 0 auto auto 0; width: 240px; height: 300px; object-fit: cover; pointer-events: none; z-index: 50; opacity: 0; transition: opacity .3s; border-radius: 2px; box-shadow: 0 40px 80px -20px rgba(0,0,0,.8); }
.nr-float.on { opacity: 1; }
.nr-float:not([src]) { display: none; }

.nr-work { padding-block: clamp(80px, 10vw, 140px); }
.nr-work-head { display: flex; justify-content: space-between; align-items: end; margin-block-end: 36px; }
.nr-work h2 { font-size: clamp(2.2rem, 5vw, 4.4rem); text-transform: uppercase; }
.nr-drag { font-size: .72rem; letter-spacing: .3em; text-transform: uppercase; color: var(--gold); }
.nr-strip { display: flex; gap: 18px; overflow-x: auto; padding-inline: max(24px, calc((100% - 1280px) / 2)); scroll-padding-inline: max(24px, calc((100% - 1280px) / 2)); scroll-snap-type: x proximity; }
.nr-strip a { flex: 0 0 auto; width: clamp(240px, 26vw, 380px); aspect-ratio: 3 / 4.2; overflow: hidden; scroll-snap-align: start; }
.nr-strip a.low { margin-block-start: 60px; }
.nr-strip img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(.3) contrast(1.05); transition: filter .6s, transform 1s; }
.nr-strip a:hover img { filter: none; transform: scale(1.04); }

.nr-team { padding-block: clamp(70px, 9vw, 120px); border-block-start: 1px solid var(--line); }
.nr-team ul { list-style: none; display: flex; flex-wrap: wrap; gap: 20px 70px; margin-block-start: 30px; }
.nr-team li { display: grid; gap: 4px; }
.nr-team b { font-size: clamp(2.2rem, 4.6vw, 4rem); line-height: 1; }
.nr-team span { font-size: .72rem; letter-spacing: .3em; text-transform: uppercase; color: var(--muted); }

.nr-words { padding-block: clamp(80px, 10vw, 140px); background: #050505; }
.nr-words .nr-wrap { display: grid; grid-template-columns: 300px 1fr; gap: clamp(30px, 6vw, 100px); align-items: start; }
.nr-score { display: grid; gap: 10px; position: sticky; top: 110px; }
.nr-score b { font-size: clamp(5rem, 11vw, 9rem); line-height: .85; color: var(--gold); }
.nr-score span { font-size: .74rem; letter-spacing: .26em; text-transform: uppercase; color: var(--muted); }
.nr-quotes { display: grid; gap: 50px; }
.nr-quotes blockquote { font-size: clamp(1.5rem, 2.8vw, 2.4rem); line-height: 1.25; }
.nr-quotes figcaption { margin-block-start: 16px; font-size: .74rem; letter-spacing: .3em; text-transform: uppercase; color: var(--gold); }
.nr-quotes figure:nth-child(even) { padding-inline-start: clamp(0px, 8vw, 120px); }

.nr-cta { position: relative; padding-block: clamp(110px, 14vw, 200px); text-align: center; display: grid; justify-items: center; gap: 30px; background: radial-gradient(800px 400px at 50% 50%, color-mix(in srgb, var(--primary) 30%, transparent), transparent); }
.nr-cta h2 { font-size: clamp(2.6rem, 7vw, 6.4rem); text-transform: uppercase; line-height: .95; max-width: 14ch; }
.nr-badge { position: relative; width: 170px; height: 170px; display: grid; place-items: center; color: var(--gold); transition: transform .4s; }
.nr-badge:hover { transform: scale(1.06); }
.nr-badge svg { position: absolute; inset: 0; width: 100%; height: 100%; animation: nr-spin 16s linear infinite; }
.nr-badge text { fill: currentColor; font-family: var(--body); font-size: 15px; letter-spacing: 4.2px; }
.nr-badge span { font-size: 2rem; }
@keyframes nr-spin { to { transform: rotate(360deg); } }

.nr-visit { padding-block: clamp(70px, 9vw, 130px); border-block-start: 1px solid var(--line); }
.nr-visit .nr-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(30px, 6vw, 100px); }
.nr-addr { font-family: var(--heading); font-size: clamp(1.6rem, 3vw, 2.4rem); line-height: 1.2; margin-block: 18px; max-width: 22ch; }
.nr-open { margin-block-end: 30px; font-size: .78rem; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
.nr-hours div { display: flex; justify-content: space-between; gap: 18px; padding-block: 16px; border-block-end: 1px solid var(--line); }
.nr-hours dt { font-size: .74rem; letter-spacing: .26em; text-transform: uppercase; color: var(--muted); }

.nr-foot { padding-block: 50px 30px; overflow: hidden; }
.nr-word { text-align: center; text-transform: uppercase; line-height: .85; white-space: nowrap; color: transparent; -webkit-text-stroke: 1px color-mix(in srgb, var(--gold) 70%, transparent); }
.nr-foot-row { display: flex; justify-content: space-between; margin-block-start: 30px; font-size: .72rem; letter-spacing: .28em; text-transform: uppercase; color: var(--muted); }
.nr-foot-row span:last-child { display: flex; gap: 24px; }

.nr-sticky { display: none; }
@media (max-width: 860px) {
  .nr-head .nr-wrap { min-height: 64px; }
  .nr-head { --mm-top: 64px; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(12px); }
  .nr-hero { margin-block-start: 0; min-height: 88svh; }
  .nr-cols, .nr-words .nr-wrap, .nr-visit .nr-wrap { grid-template-columns: 1fr; }
  .nr-rows a { grid-template-columns: 64px 1fr; gap: 16px; }
  .nr-n { display: none; }
  .nr-thumb { display: block; width: 64px; height: 80px; object-fit: cover; }
  .nr-price { grid-column: 2; }
  .nr-score { position: static; }
  .nr-strip a.low { margin-block-start: 30px; }
  .nr-quotes figure:nth-child(even) { padding-inline-start: 0; }
  .nr-foot { padding-block-end: 100px; }
  .nr-sticky { display: flex; justify-content: center; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; padding: 16px; background: var(--gold); color: var(--bg); font-size: .76rem; letter-spacing: .26em; text-transform: uppercase; transform: translateY(140%); transition: transform .4s; }
  .noir[data-scrolled] .nr-sticky { transform: none; }
}
`;
