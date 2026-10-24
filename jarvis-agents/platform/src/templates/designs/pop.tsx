// POP: fashion magazine. A huge photo with geometric type, Instagram-style
// stories that open full screen, a before and after slider you drag, reviews
// that scroll by on their own. Reference: Hershesons.

import { DemoRibbon, Paragraphs, Stars, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, navLinks, type DesignProps } from "./shared";

export function Pop({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const photos = c.gallery;
  const stories = photos.slice(0, 6).map((src, i) => ({ src, label: services[i % Math.max(services.length, 1)]?.name ?? biz.name }));
  const pair = c.beforeAfter[0];
  const links = navLinks(d, { about: true, work: true, reviews: true });
  return (
    <div className="dsite pop" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <div className="pp-bar"><span><OpenBadge d={d} /><b>{c.tagline}</b>{biz.city && <b>{biz.city}</b>}</span></div>

      <header className="pp-head">
        <div className="pp-wrap">
          <a className="pp-brand" href="#top">{c.logoUrl ? <img src={c.logoUrl} alt="" /> : null}<span>{biz.name}</span></a>
          <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
          <a className="pp-btn dark desk" href={d.bookHref}>{c.ctaLabel}</a>
          <MobileMenu d={d} links={links} />
        </div>
      </header>

      <section className="pp-hero" id="top">
        <div className="pp-frame">
          {c.heroVideo ? <video src={c.heroVideo} poster={c.heroImage ?? undefined} autoPlay muted loop playsInline />
            : c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : <div className="pp-color" />}
          <div className="pp-hero-copy">
            <h1>{c.headline}</h1>
            <p>{c.subheadline}</p>
            <div className="pp-actions">
              <a className="pp-btn" href={d.bookHref}>{c.ctaLabel}</a>
              {biz.phone && <a className="pp-btn ghost" href={`tel:${tel(biz.phone)}`}>{L.call}</a>}
            </div>
          </div>
          {c.rating != null && <div className="pp-rate"><Stars n={Math.round(c.rating)} /><b>{c.rating.toFixed(1)}</b><span>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</span></div>}
        </div>
      </section>

      {stories.length >= 3 && (
        <section className="pp-stories" aria-label={L.made_by_hand}>
          <div className="pp-wrap pp-story-row">
            {stories.map((s, i) => (
              <button key={s.src} type="button" className="pp-story" data-story={i}>
                <span className="pp-ring"><img src={s.src} alt="" loading="lazy" /></span>
                <span className="pp-story-label">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="pp-viewer" hidden data-stories={JSON.stringify(stories.map((s) => s.src))}>
            <div className="pp-bars">{stories.map((_, i) => <i key={i}><b /></i>)}</div>
            <img alt="" />
            <button type="button" className="pp-close" aria-label={L.close}>×</button>
            <button type="button" className="pp-prev" aria-label="previous" />
            <button type="button" className="pp-next" aria-label="next" />
            <a className="pp-btn pp-story-book" href={d.bookHref}>{c.ctaLabel}</a>
          </div>
        </section>
      )}

      <section className="pp-about" id="about">
        <div className="pp-wrap">
          <h2 data-reveal>{c.aboutTitle}</h2>
          <div className="pp-about-body" data-reveal>
            <Paragraphs text={c.about} />
            <div className="pp-tags">{c.highlights.map((h) => <span key={h}>{h}</span>)}</div>
          </div>
        </div>
      </section>

      <section className="pp-services" id="services">
        <div className="pp-wrap pp-sec-head" data-reveal>
          <h2>{L.sec_services_title}</h2>
          <span className="pp-hint">{L.drag} →</span>
        </div>
        <div className="pp-cards" data-drag>
          {services.map((s, i) => (
            <a key={s.id} className="pp-card" href={d.bookHref}>
              <span className="pp-num">{String(i + 1).padStart(2, "0")}</span>
              {photos[i] && <img src={photos[i]} alt="" loading="lazy" draggable={false} />}
              <h3>{s.name}</h3>
              <p>{s.description}</p>
              <span className="pp-meta"><b>{s.price ?? `${s.durationMin} ${L.min}`}</b><em>{L.book_this} →</em></span>
            </a>
          ))}
        </div>
      </section>

      {pair && (
        <section className="pp-ba">
          <div className="pp-wrap">
            <h2 data-reveal>{L.sec_beforeafter_title}</h2>
            <div className="pp-compare" data-compare style={{ ["--pos" as string]: "50%" }}>
              <img src={pair.after} alt={L.after} />
              <div className="pp-before"><img src={pair.before} alt={L.before} /></div>
              <span className="pp-tag l">{L.before}</span><span className="pp-tag r">{L.after}</span>
              <input type="range" min="0" max="100" defaultValue="50" aria-label={`${L.before} / ${L.after}`} />
              <span className="pp-handle" aria-hidden="true" />
            </div>
            {pair.caption && <p className="pp-cap">{pair.caption}</p>}
          </div>
        </section>
      )}

      {c.reviews.length > 0 && (
        <section className="pp-reviews" id="reviews">
          <h2 className="pp-wrap" data-reveal>{L.sec_reviews_title}</h2>
          <div className="pp-belt">
            <div>{[0, 1].map((k) => <span key={k}>{c.reviews.map((r, i) => (
              <figure key={i}><Stars n={r.rating} /><blockquote>“{r.text}”</blockquote><figcaption data-review-author={r.author}>{r.author}</figcaption></figure>
            ))}</span>)}</div>
          </div>
        </section>
      )}

      {staff.length > 0 && (
        <section className="pp-team">
          <div className="pp-wrap">
            <h2 data-reveal>{L.sec_team_title}</h2>
            <div className="pp-people">{staff.map((p, i) => (
              <div key={p.id} data-reveal>
                <span className="pp-face">{photos[(i + 3) % Math.max(photos.length, 1)] ? <img src={photos[(i + 3) % photos.length]} alt="" loading="lazy" /> : p.name.slice(0, 1)}</span>
                <b>{p.name}</b><span>{p.title}</span>
              </div>
            ))}</div>
          </div>
        </section>
      )}

      <section className="pp-visit" id="visit">
        <div className="pp-wrap">
          <div className="pp-visit-card" data-reveal>
            <h2>{L.sec_cta_title}</h2>
            {biz.address && <p>{biz.address}</p>}
            <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
            <div className="pp-actions">
              <a className="pp-btn dark" href={d.bookHref}>{c.ctaLabel}</a>
              {d.mapsHref && <a className="pp-btn outline" href={d.mapsHref}>{L.directions}</a>}
              {biz.phone && <a className="pp-btn outline" href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a>}
            </div>
          </div>
          {photos[1] ? <img className="pp-visit-img" src={photos[1]} alt="" loading="lazy" /> : <div className="pp-visit-img pp-color" />}
        </div>
      </section>

      <footer className="pp-foot">
        <div className="pp-wrap">
          <b>{biz.name}</b>
          <span>{c.instagram && <a href={c.instagram}>Instagram</a>}{c.facebook && <a href={c.facebook}>Facebook</a>}</span>
          <span>© {d.year}</span>
        </div>
      </footer>

      <a className="pp-float" href={d.bookHref}>{c.ctaLabel}</a>
      <Script js={SHARED_JS + JS} />
    </div>
  );
}

// the story viewer and the before and after slider
const JS = `
(function () {
  var v = document.querySelector(".pop .pp-viewer");
  if (v) {
    var srcs = JSON.parse(v.getAttribute("data-stories")), img = v.querySelector("img"), bars = v.querySelectorAll(".pp-bars i"), at = 0, timer = null;
    var show = function (i) {
      if (i < 0) i = 0;
      if (i >= srcs.length) return close();
      at = i; img.src = srcs[i];
      bars.forEach(function (b, k) { b.className = k < i ? "done" : k === i ? "now" : ""; });
      clearTimeout(timer); timer = setTimeout(function () { show(at + 1); }, 4000);
    };
    var close = function () { clearTimeout(timer); v.hidden = true; document.body.style.overflow = ""; };
    document.querySelectorAll(".pop [data-story]").forEach(function (b) {
      b.addEventListener("click", function () { v.hidden = false; document.body.style.overflow = "hidden"; show(parseInt(b.getAttribute("data-story"), 10)); });
    });
    v.querySelector(".pp-close").addEventListener("click", close);
    v.querySelector(".pp-next").addEventListener("click", function () { show(at + 1); });
    v.querySelector(".pp-prev").addEventListener("click", function () { show(at - 1); });
    document.addEventListener("keydown", function (e) { if (!v.hidden && e.key === "Escape") close(); });
  }
  document.querySelectorAll(".pop [data-compare]").forEach(function (box) {
    var r = box.querySelector("input");
    r.addEventListener("input", function () { box.style.setProperty("--pos", r.value + "%"); });
  });
})();
`;

export const css = `
.pop {
  --bg: #fff; --ink: #0b0b0b; --muted: #6b6b6b; --line: #e8e6e3; --pop: var(--primary);
  background: var(--bg); color: var(--ink); font-family: var(--body); font-size: 16px; line-height: 1.55;
}
.pop h1, .pop h2, .pop h3, .pop .pp-brand, .pop .pp-num, .pop .pp-rate b, .pop .pp-team b, .pop .pp-foot b { font-family: var(--heading); font-weight: 700; letter-spacing: -0.03em; line-height: .95; }
.pp-wrap { width: min(1360px, 100% - 40px); margin-inline: auto; }
.pp-btn { display: inline-flex; align-items: center; justify-content: center; padding: 14px 26px; border-radius: 999px; background: #fff; color: var(--ink); font-weight: 600; font-size: .92rem; transition: transform .2s, background .2s, color .2s; white-space: nowrap; }
.pp-btn:hover { transform: translateY(-2px); }
.pp-btn.dark { background: var(--ink); color: #fff; }
.pp-btn.dark:hover { background: var(--pop); }
.pp-btn.ghost { background: rgba(255,255,255,.14); color: #fff; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.4); }
.pp-btn.outline { background: transparent; border: 1.5px solid var(--ink); }
.pp-actions { display: flex; flex-wrap: wrap; gap: 10px; }

.pp-bar { padding: 12px 14px 0; }
.pp-bar > span { display: flex; justify-content: center; align-items: center; gap: 22px; flex-wrap: wrap; background: var(--ink); color: #fff; border-radius: 999px; padding: 9px 20px; font-size: .78rem; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }

.pp-head { position: sticky; top: 0; z-index: 60; background: rgba(255,255,255,.9); backdrop-filter: blur(14px); --mm-top: 74px; }
.pp-head .pp-wrap { display: flex; align-items: center; gap: 30px; min-height: 74px; }
.pp-brand { display: flex; align-items: center; gap: 10px; font-size: 1.6rem; margin-inline-end: auto; }
.pp-brand img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.pp-head nav { display: flex; gap: 26px; font-weight: 500; font-size: .95rem; }
.pp-head nav a:hover { color: var(--pop); }
.pop .mm-panel { background: #fff; }
.pop .mm-panel nav a { font-family: var(--heading); font-weight: 700; font-size: 2.4rem; letter-spacing: -.03em; }
.pop .mm-book { background: var(--ink); color: #fff; border-radius: 999px; font-weight: 600; }

.pp-hero { padding: 0 14px; }
.pp-frame { position: relative; height: min(88svh, 900px); border-radius: 22px; overflow: hidden; color: #fff; }
.pp-frame > img, .pp-frame > video, .pp-color { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pp-color { background: radial-gradient(60% 60% at 70% 30%, var(--accent), transparent), linear-gradient(140deg, var(--pop), color-mix(in srgb, var(--pop) 40%, #000)); }
.pp-frame::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.6), transparent 55%); }
.pp-hero-copy { position: absolute; inset-inline: clamp(20px, 5vw, 70px); inset-block-end: clamp(26px, 6vw, 70px); z-index: 1; display: grid; gap: 18px; max-width: 840px; }
.pp-hero h1 { font-size: clamp(3rem, 8.4vw, 8rem); }
.pp-hero-copy p { font-size: 1.15rem; max-width: 46ch; color: rgba(255,255,255,.88); }
.pp-rate { position: absolute; inset-block-start: 22px; inset-inline-end: 22px; z-index: 1; display: flex; align-items: center; gap: 10px; background: #fff; color: var(--ink); padding: 10px 16px; border-radius: 999px; font-size: .82rem; }
.pp-rate b { font-size: 1.2rem; }
.pop .stars { color: #f5a623; display: inline-flex; }

.pp-stories { padding-block: 34px 10px; }
.pp-story-row { display: flex; gap: 22px; overflow-x: auto; scrollbar-width: none; padding-block: 6px; }
.pp-story-row::-webkit-scrollbar { display: none; }
.pp-story { flex: none; display: grid; justify-items: center; gap: 8px; width: 92px; }
.pp-ring { width: 84px; height: 84px; border-radius: 50%; padding: 3px; background: conic-gradient(from 210deg, var(--pop), var(--accent), #fd5949, var(--pop)); transition: transform .25s; }
.pp-story:hover .pp-ring { transform: scale(1.06); }
.pp-ring img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid #fff; }
.pp-story-label { font-size: .74rem; font-weight: 600; max-width: 92px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pp-viewer { position: fixed; inset: 0; z-index: 150; background: #000; display: grid; place-items: center; }
.pp-viewer[hidden] { display: none; }
.pp-viewer > img { max-height: 100svh; width: min(100%, 520px); height: 100svh; object-fit: cover; }
.pp-bars { position: absolute; inset-block-start: 14px; inset-inline: 0; margin-inline: auto; width: min(100% - 28px, 492px); display: flex; gap: 4px; z-index: 2; }
.pp-bars i { flex: 1; height: 3px; background: rgba(255,255,255,.35); border-radius: 3px; overflow: hidden; }
.pp-bars b { display: block; height: 100%; width: 0; background: #fff; }
.pp-bars i.done b { width: 100%; }
.pp-bars i.now b { animation: pp-fill 4s linear forwards; }
@keyframes pp-fill { to { width: 100%; } }
.pp-close { position: absolute; inset-block-start: 26px; inset-inline-end: 18px; z-index: 3; color: #fff; font-size: 2.2rem; line-height: 1; }
.pp-prev, .pp-next { position: absolute; inset-block: 0; width: 40%; z-index: 1; }
.pp-prev { inset-inline-start: 0; } .pp-next { inset-inline-end: 0; }
.pp-story-book { position: absolute; inset-block-end: 30px; z-index: 2; }

.pp-about { padding-block: clamp(70px, 10vw, 140px); }
.pp-about .pp-wrap { display: grid; grid-template-columns: 1.2fr 1fr; gap: clamp(30px, 6vw, 100px); align-items: end; }
.pp-about h2 { font-size: clamp(2.6rem, 6.2vw, 6rem); }
.pp-about-body p { color: var(--muted); margin-block-end: 14px; font-size: 1.05rem; }
.pp-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-block-start: 16px; }
.pp-tags span { padding: 8px 14px; border-radius: 999px; background: color-mix(in srgb, var(--pop) 10%, #fff); color: var(--pop); font-weight: 600; font-size: .85rem; }

.pp-services { padding-block: clamp(40px, 6vw, 80px) clamp(70px, 10vw, 130px); }
.pp-sec-head { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-block-end: 34px; }
.pp-services h2 { font-size: clamp(2.4rem, 5.4vw, 5rem); }
.pp-hint { font-weight: 600; color: var(--muted); }
.pp-cards { display: flex; gap: 16px; overflow-x: auto; padding-inline: max(20px, calc((100% - 1360px) / 2)); scroll-padding-inline: max(20px, calc((100% - 1360px) / 2)); scroll-snap-type: x mandatory; padding-block-end: 10px; }
.pp-card { flex: 0 0 clamp(260px, 28vw, 360px); scroll-snap-align: start; display: grid; gap: 12px; align-content: start; padding: 22px; border-radius: 20px; background: #f4f3f1; transition: background .3s, color .3s; }
.pp-card:hover { background: var(--ink); color: #fff; }
.pp-card img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 12px; }
.pp-num { font-size: 3rem; color: var(--pop); }
.pp-card h3 { font-size: 1.8rem; }
.pp-card p { color: var(--muted); font-size: .95rem; }
.pp-card:hover p { color: rgba(255,255,255,.7); }
.pp-meta { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-block-start: 8px; padding-block-start: 14px; border-block-start: 1px solid var(--line); }
.pp-meta em { font-style: normal; font-weight: 600; font-size: .85rem; }

.pp-ba { padding-block: clamp(60px, 8vw, 110px); background: #f4f3f1; }
.pp-ba h2 { font-size: clamp(2.4rem, 5.4vw, 5rem); margin-block-end: 30px; }
.pp-compare { --pos: 50%; position: relative; aspect-ratio: 16 / 9; max-height: 640px; width: 100%; border-radius: 20px; overflow: hidden; user-select: none; }
.pp-compare > img, .pp-before img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pp-before { position: absolute; inset: 0; clip-path: inset(0 calc(100% - var(--pos)) 0 0); }
[dir=rtl] .pp-before { clip-path: inset(0 0 0 calc(100% - var(--pos))); }
.pp-compare input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: ew-resize; margin: 0; }
.pp-handle { position: absolute; inset-block: 0; inset-inline-start: var(--pos); width: 0; display: grid; place-items: center; pointer-events: none; }
.pp-handle::before { content: ""; position: absolute; inset-block: 0; width: 3px; background: #fff; }
.pp-handle::after { font-size: 1.1rem; color: var(--ink); }
.pp-handle::after { content: "⟷"; position: relative; width: 48px; height: 48px; border-radius: 50%; background: #fff; display: grid; place-items: center; box-shadow: 0 6px 20px rgba(0,0,0,.25); }
.pp-tag { position: absolute; inset-block-start: 16px; padding: 6px 12px; border-radius: 999px; background: rgba(0,0,0,.6); color: #fff; font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; pointer-events: none; }
.pp-tag.l { inset-inline-start: 16px; } .pp-tag.r { inset-inline-end: 16px; }
.pp-cap { margin-block-start: 14px; color: var(--muted); }

.pp-reviews { padding-block: clamp(70px, 9vw, 120px); overflow: hidden; }
.pp-reviews h2 { font-size: clamp(2.4rem, 5.4vw, 5rem); margin-block-end: 36px; }
.pp-belt > div { display: flex; width: max-content; animation: pp-belt 40s linear infinite; }
.pp-belt:hover > div { animation-play-state: paused; }
.pp-belt span { display: flex; gap: 16px; padding-inline-end: 16px; }
.pp-belt figure { width: 340px; flex: none; padding: 26px; border-radius: 20px; border: 1.5px solid var(--ink); display: grid; gap: 14px; align-content: start; }
.pp-belt blockquote { font-size: 1.08rem; }
.pp-belt figcaption { font-weight: 700; }
@keyframes pp-belt { to { transform: translateX(-50%); } }
[dir=rtl] .pp-belt > div { animation-name: pp-belt-rtl; }
@keyframes pp-belt-rtl { to { transform: translateX(50%); } }

.pp-team { padding-block: clamp(60px, 8vw, 110px); }
.pp-team h2 { font-size: clamp(2.2rem, 4.6vw, 4.2rem); margin-block-end: 34px; }
.pp-people { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 26px; }
.pp-people > div { display: grid; gap: 6px; }
.pp-face { aspect-ratio: 3 / 4; border-radius: 18px; overflow: hidden; background: color-mix(in srgb, var(--pop) 18%, #fff); display: grid; place-items: center; font-family: var(--heading); font-size: 4rem; color: var(--pop); margin-block-end: 8px; }
.pp-face img { width: 100%; height: 100%; object-fit: cover; }
.pp-team b { font-size: 1.6rem; }
.pp-people span:last-child { color: var(--muted); }

.pp-visit { padding: 0 14px clamp(40px, 6vw, 80px); }
.pp-visit .pp-wrap { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.pp-visit-card { background: color-mix(in srgb, var(--pop) 12%, #fff); border-radius: 22px; padding: clamp(28px, 5vw, 60px); display: grid; gap: 18px; align-content: start; }
.pp-visit h2 { font-size: clamp(2.6rem, 6vw, 5.4rem); }
.pp-visit-card dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 10px; border-block-end: 1px solid color-mix(in srgb, var(--ink) 12%, transparent); }
.pp-visit-img { width: 100%; height: 100%; min-height: 360px; object-fit: cover; border-radius: 22px; }

.pp-foot { padding-block: 30px 40px; }
.pp-foot .pp-wrap { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.pp-foot b { font-size: 2rem; }
.pp-foot span { display: flex; gap: 20px; color: var(--muted); }

.pp-float { display: none; }
@media (max-width: 860px) {
  .pp-bar > span { gap: 12px; font-size: .7rem; border-radius: 16px; }
  .pp-frame { height: 78svh; border-radius: 18px; }
  .pp-rate { inset-inline-end: 12px; inset-block-start: 12px; }
  .pp-about .pp-wrap, .pp-visit .pp-wrap { grid-template-columns: 1fr; }
  .pp-compare { aspect-ratio: 4 / 5; }
  .pp-foot { padding-block-end: 100px; }
  .pp-float { display: flex; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; justify-content: center; padding: 16px; border-radius: 999px; background: var(--ink); color: #fff; font-weight: 600; transform: translateY(150%); transition: transform .4s; }
  .pop[data-scrolled] .pp-float { transform: none; }
}
`;
