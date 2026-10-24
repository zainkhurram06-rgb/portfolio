// ATELIER: calm, editorial, expensive. Lots of air, two tall offset photos, a
// fashion serif, a price list you read like a menu. Reference: The Lane.

import { DemoRibbon, Paragraphs, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, fitSize, navLinks, type DesignProps } from "./shared";

export function Atelier({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const photos = c.gallery;
  const links = navLinks(d, { about: true, work: true, reviews: true });
  return (
    <div className="dsite atelier" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <div className="at-top desk">
        <div className="at-wrap">
          {biz.address && <span>{biz.address}</span>}
          <OpenBadge d={d} />
          {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a>}
        </div>
      </div>

      <header className="at-head">
        <div className="at-wrap">
          <a className="at-brand" href="#top">
            {c.logoUrl && <img src={c.logoUrl} alt="" />}
            <span>{biz.name}</span>
          </a>
          <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
          <a className="at-book desk" href={d.bookHref}>{c.ctaLabel}</a>
          <MobileMenu d={d} links={links} />
        </div>
      </header>

      <section className="at-hero" id="top">
        <div className="at-wrap">
          <div className="at-hero-copy" data-reveal>
            <p className="at-kicker">{c.tagline}{biz.city ? `, ${biz.city}` : ""}</p>
            <h1>{c.headline}</h1>
            <p className="at-lead">{c.subheadline}</p>
            <div className="at-actions">
              <a className="at-btn" href={d.bookHref}>{c.ctaLabel}</a>
              <a className="at-link" href="#services">{L.nav_services}</a>
            </div>
          </div>
          <div className="at-frames">
            <figure className="at-f1">
              {c.heroVideo ? <video src={c.heroVideo} poster={c.heroImage ?? undefined} autoPlay muted loop playsInline />
                : c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : <div className="at-blank"><span>{biz.name.slice(0, 1)}</span></div>}
            </figure>
            <figure className="at-f2">
              {photos[0] ? <img src={photos[0]} alt="" /> : <div className="at-blank soft" />}
            </figure>
            {c.rating != null && (
              <div className="at-seal">
                <b>{c.rating.toFixed(1)}</b>
                <span>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="at-intro" id="about">
        <div className="at-wrap">
          <p className="at-kicker" data-reveal>{L.sec_about_kicker}</p>
          <h2 data-reveal>{c.aboutTitle}</h2>
          <div className="at-cols" data-reveal>
            <div><Paragraphs text={c.about} /></div>
            <ol>{c.highlights.map((h, i) => <li key={h}><span>{String(i + 1).padStart(2, "0")}</span>{h}</li>)}</ol>
          </div>
        </div>
      </section>

      <section className="at-menu" id="services">
        <div className="at-wrap">
          <div className="at-menu-head" data-reveal>
            <p className="at-kicker">{L.sec_services_kicker}</p>
            <h2>{L.sec_services_title}</h2>
            <p>{L.sec_services_intro}</p>
          </div>
          <ul className="at-list">
            {services.map((s) => (
              <li key={s.id} data-reveal>
                <a href={d.bookHref}>
                  <span className="at-name">{s.name}</span>
                  <span className="at-dots" />
                  <span className="at-price">{s.price ?? `${s.durationMin} ${L.min}`}</span>
                  <span className="at-more"><span>{s.description}{s.price ? ` ${s.durationMin} ${L.min}.` : ""}</span><em>{L.book_this}</em></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {photos.length >= 3 && (
        <section className="at-look" id="work">
          <div className="at-wrap">
            <div className="at-look-head" data-reveal>
              <h2>{L.sec_gallery_title}</h2>
              {c.instagram && <a className="at-link" href={c.instagram}>{L.follow_instagram}</a>}
            </div>
            <div className="at-masonry">
              {photos.slice(1, 9).map((src, i) => (
                <a key={src} href={src} data-lightbox={src} className={`m${i % 3}`} data-reveal><img src={src} alt="" loading="lazy" /></a>
              ))}
            </div>
          </div>
        </section>
      )}

      {staff.length > 0 && (
        <section className="at-team">
          <div className="at-wrap">
            <p className="at-kicker" data-reveal>{L.sec_team_kicker}</p>
            <h2 data-reveal>{L.sec_team_title}</h2>
            <ul>{staff.map((p) => <li key={p.id} data-reveal><span className="at-person">{p.name}</span>{p.title && <span>{p.title}</span>}</li>)}</ul>
          </div>
        </section>
      )}

      {c.reviews.length > 0 && (
        <section className="at-words" id="reviews">
          <div className="at-wrap">
            <div className="at-words-head">
              <p className="at-kicker">{L.sec_reviews_kicker}</p>
              <div className="at-arrows">
                <button type="button" data-car="-1" aria-label="previous">←</button>
                <button type="button" data-car="1" aria-label="next">→</button>
              </div>
            </div>
            <div className="at-car" data-carousel>
              {c.reviews.map((r, i) => (
                <figure key={i}>
                  <blockquote>“{r.text}”</blockquote>
                  <figcaption data-review-author={r.author}>{r.author} <span aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="at-visit" id="visit">
        <div className="at-wrap">
          <div data-reveal>
            <p className="at-kicker">{L.sec_contact_kicker}</p>
            <h2>{L.sec_contact_title}</h2>
            {biz.address && <p className="at-addr">{biz.address}</p>}
            <OpenBadge d={d} className="at-badge" />
            <div className="at-actions">
              <a className="at-btn" href={d.bookHref}>{c.ctaLabel}</a>
              {d.mapsHref && <a className="at-link" href={d.mapsHref}>{L.directions}</a>}
              {biz.phone && <a className="at-link" href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a>}
            </div>
          </div>
          <dl className="at-hours" data-reveal>
            {d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}
          </dl>
        </div>
      </section>

      <footer className="at-foot">
        <div className="at-wrap">
          <p className="at-word" style={{ fontSize: fitSize(biz.name) }}>{biz.name}</p>
          <div className="at-foot-row">
            <span>© {d.year} {biz.name}</span>
            <span>
              {c.instagram && <a href={c.instagram}>Instagram</a>}
              {c.facebook && <a href={c.facebook}>Facebook</a>}
            </span>
          </div>
        </div>
      </footer>

      <a className="at-sticky" href={d.bookHref}>{c.ctaLabel}</a>
      <Script js={SHARED_JS + JS} />
    </div>
  );
}

const JS = `
(function () {
  var car = document.querySelector(".atelier [data-carousel]");
  document.querySelectorAll(".atelier [data-car]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!car) return;
      var dir = parseInt(b.getAttribute("data-car"), 10) * (document.documentElement.dir === "rtl" || car.closest("[dir=rtl]") ? -1 : 1);
      car.scrollBy({ left: dir * car.clientWidth * 0.85, behavior: "smooth" });
    });
  });
})();
`;

export const css = `
.atelier {
  --bg: color-mix(in srgb, var(--light) 70%, #f4f1ec);
  --ink: var(--dark);
  --muted: color-mix(in srgb, var(--dark) 58%, var(--bg));
  --line: color-mix(in srgb, var(--dark) 16%, transparent);
  background: var(--bg); color: var(--ink);
  font-family: var(--body); font-size: 16px; line-height: 1.7; font-weight: 400;
}
.atelier h1, .atelier h2, .atelier .at-person, .atelier .at-word, .atelier blockquote, .atelier .at-seal b {
  font-family: var(--heading); font-weight: 400; letter-spacing: -0.01em; line-height: 1.02;
}
.at-wrap { width: min(1240px, 100% - 48px); margin-inline: auto; }
.at-kicker { font-size: .72rem; letter-spacing: .32em; text-transform: uppercase; color: var(--muted); }
.at-btn { display: inline-flex; align-items: center; gap: 12px; padding: 15px 28px; background: var(--ink); color: var(--bg); font-size: .78rem; letter-spacing: .22em; text-transform: uppercase; transition: background .3s, color .3s; }
.at-btn:hover { background: var(--primary); color: #fff; }
.at-link { font-size: .78rem; letter-spacing: .22em; text-transform: uppercase; border-block-end: 1px solid currentColor; padding-block-end: 4px; }
.at-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 18px 30px; }

.at-top { border-block-end: 1px solid var(--line); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }
.at-top .at-wrap { display: flex; justify-content: flex-end; gap: 32px; padding-block: 10px; }
.at-top span:first-child { margin-inline-end: auto; }

.at-head { position: sticky; top: 0; z-index: 60; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(10px); --mm-top: 72px; }
.at-head .at-wrap { display: flex; align-items: center; gap: 36px; min-height: 72px; }
.at-brand { display: flex; align-items: center; gap: 12px; font-family: var(--heading); font-size: 1.45rem; margin-inline-end: auto; }
.at-brand img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.at-head nav { display: flex; gap: 30px; font-size: .74rem; letter-spacing: .24em; text-transform: uppercase; }
.at-head nav a { position: relative; }
.at-head nav a::after { content: ""; position: absolute; inset-inline: 0; inset-block-end: -6px; height: 1px; background: currentColor; transform: scaleX(0); transition: transform .35s; transform-origin: left; }
.at-head nav a:hover::after { transform: scaleX(1); }
.at-book { padding: 10px 18px; border: 1px solid var(--ink); font-size: .72rem; letter-spacing: .22em; text-transform: uppercase; }
.at-book:hover { background: var(--ink); color: var(--bg); }
.atelier .mm-panel { background: var(--bg); }
.atelier .mm-panel nav a { font-family: var(--heading); }
.atelier .mm-book { background: var(--ink); color: var(--bg); letter-spacing: .2em; text-transform: uppercase; font-size: .8rem; }

.at-hero { padding-block: clamp(40px, 7vw, 96px) clamp(70px, 10vw, 140px); }
.at-hero .at-wrap { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: clamp(32px, 6vw, 96px); align-items: end; }
.at-hero h1 { font-size: clamp(3rem, 7.4vw, 6.6rem); margin-block: 22px 26px; }
.at-lead { max-width: 36ch; color: var(--muted); font-size: 1.05rem; margin-block-end: 34px; }
.at-frames { position: relative; display: grid; grid-template-columns: 1fr .8fr; gap: clamp(14px, 2vw, 28px); align-items: start; }
.at-frames figure { overflow: hidden; background: color-mix(in srgb, var(--primary) 22%, var(--bg)); }
.at-f1 { aspect-ratio: 3 / 4.6; }
.at-f2 { aspect-ratio: 3 / 4.2; margin-block-start: 22%; }
.at-frames img, .at-frames video { width: 100%; height: 100%; object-fit: cover; transition: transform 1.6s ease; }
.at-frames figure:hover img { transform: scale(1.04); }
.at-blank { width: 100%; height: 100%; display: grid; place-items: center; background: linear-gradient(160deg, color-mix(in srgb, var(--primary) 70%, var(--bg)), color-mix(in srgb, var(--primary) 30%, var(--bg))); }
.at-blank span { font-family: var(--heading); font-size: clamp(5rem, 12vw, 10rem); color: color-mix(in srgb, var(--bg) 80%, transparent); }
.at-blank.soft { background: color-mix(in srgb, var(--accent) 35%, var(--bg)); }
.at-seal { position: absolute; inset-inline-start: -28px; inset-block-end: 8%; background: var(--bg); padding: 18px 22px; display: grid; gap: 2px; box-shadow: 0 30px 60px -30px rgba(0,0,0,.35); }
.at-seal b { font-size: 2.4rem; }
.at-seal span { font-size: .68rem; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }

.at-intro { padding-block: clamp(80px, 11vw, 150px); border-block-start: 1px solid var(--line); }
.at-intro h2 { font-size: clamp(2.2rem, 5vw, 4.4rem); max-width: 18ch; margin-block: 22px 56px; }
.at-cols { display: grid; grid-template-columns: 1.2fr 1fr; gap: clamp(32px, 6vw, 100px); }
.at-cols p { color: var(--muted); margin-block-end: 16px; max-width: 58ch; }
.at-cols ol { list-style: none; display: grid; align-content: start; }
.at-cols li { display: flex; gap: 22px; padding-block: 16px; border-block-end: 1px solid var(--line); font-size: 1.05rem; }
.at-cols li span { font-family: var(--heading); color: var(--primary); }

.at-menu { padding-block: clamp(80px, 11vw, 150px); background: var(--ink); color: var(--bg); --line: color-mix(in srgb, var(--bg) 18%, transparent); --muted: color-mix(in srgb, var(--bg) 62%, transparent); }
.at-menu-head { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 60px; align-items: end; margin-block-end: 56px; }
.at-menu-head .at-kicker { grid-column: 1 / -1; }
.at-menu h2 { font-size: clamp(2.4rem, 5.6vw, 5rem); }
.at-menu-head p:last-child { color: var(--muted); max-width: 44ch; }
.at-list { list-style: none; border-block-start: 1px solid var(--line); }
.at-list li a { display: grid; grid-template-columns: auto 1fr auto; align-items: baseline; gap: 18px; padding-block: 24px; border-block-end: 1px solid var(--line); }
.at-name { font-family: var(--heading); font-size: clamp(1.5rem, 2.8vw, 2.3rem); line-height: 1.1; transition: transform .4s; }
.at-dots { border-block-end: 1px dotted var(--muted); transform: translateY(-6px); }
.at-price { font-size: .9rem; letter-spacing: .14em; text-transform: uppercase; }
.at-more { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr auto; gap: 20px; max-height: 0; overflow: hidden; opacity: 0; transition: max-height .5s ease, opacity .4s; color: var(--muted); }
.at-more em { font-style: normal; font-size: .72rem; letter-spacing: .22em; text-transform: uppercase; color: var(--bg); border-block-end: 1px solid; align-self: start; }
.at-list li a:hover .at-more, .at-list li a:focus-visible .at-more { max-height: 120px; opacity: 1; }
.at-list li a:hover .at-name { transform: translateX(10px); }
[dir=rtl] .at-list li a:hover .at-name { transform: translateX(-10px); }
[dir=rtl] .at-head nav a::after { transform-origin: 100% 50%; }

.at-look { padding-block: clamp(80px, 11vw, 150px); }
.at-look-head { display: flex; justify-content: space-between; align-items: end; gap: 20px; flex-wrap: wrap; margin-block-end: 40px; }
.at-look h2 { font-size: clamp(2.2rem, 5vw, 4.2rem); }
.at-masonry { columns: 3 260px; column-gap: 18px; }
.at-masonry a { display: block; margin-block-end: 18px; break-inside: avoid; overflow: hidden; cursor: zoom-in; }
.at-masonry img { width: 100%; transition: transform 1.2s ease; }
.at-masonry .m0 img { aspect-ratio: 4 / 5; object-fit: cover; }
.at-masonry .m1 img { aspect-ratio: 1; object-fit: cover; }
.at-masonry .m2 img { aspect-ratio: 3 / 4.3; object-fit: cover; }
.at-masonry a:hover img { transform: scale(1.05); }

.at-team { padding-block: clamp(70px, 9vw, 120px); border-block-start: 1px solid var(--line); }
.at-team h2 { font-size: clamp(2rem, 4.4vw, 3.6rem); margin-block: 18px 40px; }
.at-team ul { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.at-team li { display: grid; gap: 6px; padding: 26px 0; border-block-start: 1px solid var(--line); }
.at-person { font-size: clamp(1.9rem, 3.4vw, 2.8rem); }
.at-team li span:last-child { font-size: .72rem; letter-spacing: .22em; text-transform: uppercase; color: var(--muted); }

.at-words { padding-block: clamp(80px, 11vw, 150px); background: color-mix(in srgb, var(--primary) 12%, var(--bg)); }
.at-words-head { display: flex; justify-content: space-between; align-items: center; margin-block-end: 30px; }
.at-arrows { display: flex; gap: 10px; }
.at-arrows button { width: 48px; height: 48px; border: 1px solid var(--ink); border-radius: 50%; font-size: 1.1rem; transition: background .3s, color .3s; }
.at-arrows button:hover { background: var(--ink); color: var(--bg); }
[dir=rtl] .at-arrows button { transform: scaleX(-1); }
.at-car { display: grid; grid-auto-flow: column; grid-auto-columns: min(780px, 88%); gap: 40px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.at-car::-webkit-scrollbar { display: none; }
.at-car figure { scroll-snap-align: start; display: grid; gap: 26px; }
.at-car blockquote { font-size: clamp(1.7rem, 3.4vw, 2.9rem); line-height: 1.18; }
.at-car figcaption { font-size: .74rem; letter-spacing: .24em; text-transform: uppercase; color: var(--muted); }
.at-car figcaption span { color: var(--primary); letter-spacing: .1em; }

.at-visit { padding-block: clamp(80px, 11vw, 150px); }
.at-visit .at-wrap { display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(32px, 6vw, 100px); align-items: start; }
.at-visit h2 { font-size: clamp(2.4rem, 5.4vw, 4.8rem); margin-block: 18px 22px; }
.at-addr { color: var(--muted); font-size: 1.1rem; margin-block-end: 18px; max-width: 34ch; }
.at-badge { margin-block-end: 30px; font-size: .8rem; letter-spacing: .14em; text-transform: uppercase; }
.at-hours { border-block-start: 1px solid var(--line); }
.at-hours div { display: flex; justify-content: space-between; gap: 20px; padding-block: 16px; border-block-end: 1px solid var(--line); }
.at-hours dt { font-size: .76rem; letter-spacing: .2em; text-transform: uppercase; }
.at-hours dd { color: var(--muted); }

.at-foot { padding-block: 40px 30px; border-block-start: 1px solid var(--line); overflow: hidden; }
.at-word { line-height: .9; white-space: nowrap; color: color-mix(in srgb, var(--ink) 90%, transparent); }
.at-foot-row { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-block-start: 24px; font-size: .74rem; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }
.at-foot-row span:last-child { display: flex; gap: 22px; }

.at-sticky { display: none; }
@media (max-width: 860px) {
  .at-hero .at-wrap, .at-cols, .at-menu-head, .at-visit .at-wrap { grid-template-columns: 1fr; }
  .at-hero { padding-block-start: 24px; }
  .at-seal { inset-inline-start: 10px; }
  .at-list li a { grid-template-columns: 1fr auto; }
  .at-dots { display: none; }
  .at-more { max-height: none; opacity: 1; grid-template-columns: 1fr; }
  .at-foot { padding-block-end: 96px; }
  .at-sticky { display: flex; justify-content: center; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; padding: 16px; background: var(--ink); color: var(--bg); font-size: .78rem; letter-spacing: .22em; text-transform: uppercase; box-shadow: 0 20px 40px -16px rgba(0,0,0,.45); transform: translateY(140%); transition: transform .4s ease; }
  .atelier[data-scrolled] .at-sticky { transform: none; }
  .at-masonry { columns: 2; column-gap: 10px; }
  .at-masonry a { margin-block-end: 10px; }
}
`;
