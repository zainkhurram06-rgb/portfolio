// MONOLITH: black and white, nothing else. The business's name set huge and
// tight across the top, photos in greyscale, the treatments on a white sheet
// like a price list. Only the brand's accent is allowed in, as a single dot.
// Ported from the Signature library (04-noir-dental).

import { DemoRibbon, Paragraphs, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, type DesignProps } from "./shared";

// "Harbour Dental" -> ["Harbour", "Dental."]; one word names stay on one line
function nameLines(name: string) {
  const words = name.toUpperCase().split(" ");
  if (words.length === 1) return [words[0], ""];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

export function Monolith({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const [n1, n2] = nameLines(biz.name);
  const long = biz.name.length > 16;
  const links: [string, string][] = [
    ["#approach", L.nav_about], ["#services", L.nav_services],
    ...(staff.length ? [["#team", L.sec_team_kicker] as [string, string]] : []),
    ["#visit", L.nav_contact],
  ];
  const [h0, h1] = [c.highlights[0], c.highlights[1]];
  return (
    <div className="dsite monolith" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="mo-nav mo-width">
        <a className="mo-logo" href="#top">{biz.name.toUpperCase().split(" ").join(" / ")}</a>
        <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        <a className="mo-btn line desk" href={d.bookHref}>{c.ctaLabel} ↗</a>
        <MobileMenu d={d} links={links} />
      </header>

      <main id="top">
        <section className="mo-hero mo-width">
          <div className="mo-over">{c.tagline}</div>
          <h1 className={long ? "long" : ""}>{n1}{n2 && <span>{n2}<i>.</i></span>}</h1>
          <div className="mo-hero-grid">
            <div className="mo-hero-img">{c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : <div className="mo-blank" />}</div>
            <div className="mo-hero-text">
              <span className="mo-small">{biz.city ? `${biz.city} / ` : ""}001</span>
              <p>{c.headline}</p>
              <small>{c.subheadline}</small>
              <a className="mo-btn white" href={d.bookHref}>{c.ctaLabel} ↗</a>
            </div>
          </div>
        </section>

        <section className="mo-why mo-width" id="approach">
          <div className="mo-headline" data-reveal>
            <div><span className="mo-eyebrow">{L.sec_about_kicker}</span><h2>{c.aboutTitle}</h2></div>
            <div className="mo-about"><Paragraphs text={c.about} /></div>
          </div>
          <div className="mo-features">
            <div className="mo-feature" data-reveal>
              <span>01 / {L.nav_why}</span>
              <h3>{h0 ?? c.tagline}</h3>
              <a href="#services">{L.view_services} ↗</a>
            </div>
            <div className="mo-feature" data-reveal>
              <span>02 / {c.rating != null ? L.google_rating : L.book_online}</span>
              {c.rating != null
                ? <h3 className="mo-rating"><b>{c.rating.toFixed(1)}</b>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : "★★★★★"}</h3>
                : <h3>{h1 ?? L.book_online_sub}</h3>}
              <a href={d.bookHref}>{c.ctaLabel} ↗</a>
            </div>
          </div>
          {c.highlights.length > 2 && <ul className="mo-list">{c.highlights.slice(2).map((h) => <li key={h}>{h}</li>)}</ul>}
        </section>

        <section className="mo-white" id="services">
          <div className="mo-width mo-services">
            <div className="mo-services-head">
              <span className="mo-eyebrow">001 / {L.sec_services_kicker}</span>
              <h2>{L.sec_services_title}</h2>
              <p>{L.sec_services_intro}</p>
            </div>
            <div>
              {services.map((s, i) => (
                <a key={s.id} className="mo-row" href={d.bookHref}>
                  <span className="mo-n">{String(i + 1).padStart(2, "0")} /</span>
                  <span className="mo-row-main"><strong>{s.name}</strong><small>{s.description}</small></span>
                  <span className="mo-row-meta">{s.price && <b>{s.price}</b>}<small>{s.durationMin} {L.min}</small></span>
                  <span className="mo-go" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {staff.length > 0 && (
          <section className="mo-why mo-width" id="team">
            <span className="mo-eyebrow">{L.sec_team_kicker}</span>
            <h2>{L.sec_team_title}</h2>
            <div className="mo-portraits">
              {staff.slice(0, 6).map((p, i) => (
                <article key={p.id} data-reveal>
                  {c.gallery[i + 2] ? <img src={c.gallery[i + 2]} alt="" loading="lazy" /> : <div className="mo-blank" />}
                  <h3>{p.name}</h3><p>{p.title}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {c.reviews.length > 0 && (
          <section className="mo-reviews mo-width" id="reviews">
            <span className="mo-eyebrow">{L.sec_reviews_kicker}</span>
            {c.reviews.slice(0, 3).map((r, i) => (
              <figure key={i} data-reveal>
                <blockquote>“{r.text}”</blockquote>
                <figcaption data-review-author={r.author}>{r.author} <span>{"★".repeat(r.rating)}</span></figcaption>
              </figure>
            ))}
          </section>
        )}

        {(c.faqs.length > 0 || c.insurers.length > 0) && (
          <section className="mo-faq mo-width">
            <h2>{L.sec_faq_title}</h2>
            <div>
              {c.faqs.map((f) => <details key={f.q}><summary>{f.q}<span>+</span></summary><p>{f.a}</p></details>)}
              {c.insurers.length > 0 && (
                <details><summary>{L.sec_insurance_title}<span>+</span></summary><p>{c.insurers.join(" · ")}. {L.sec_insurance_note}</p></details>
              )}
            </div>
          </section>
        )}

        <section className="mo-bottom mo-width" id="visit">
          <span className="mo-eyebrow">{L.sec_contact_kicker}</span>
          <h2>{L.sec_cta_title}{!/[.!?…]$/.test(L.sec_cta_title) && <i>.</i>}</h2>
          <a className="mo-btn white" href={d.bookHref}>{c.ctaLabel} ↗</a>
          <div className="mo-visit">
            <div>
              <span className="mo-small">{L.sec_contact_title}</span>
              {biz.address && <p>{biz.address}</p>}
              <OpenBadge d={d} />
              <p className="mo-links">
                {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a>}
                {d.mapsHref && <a href={d.mapsHref}>{L.directions} ↗</a>}
              </p>
            </div>
            <div>
              <span className="mo-small">{L.sec_hours}</span>
              <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="mo-footer mo-width">
        <a className="mo-logo" href="#top">{biz.name.toUpperCase().split(" ").join(" / ")}</a>
        <span>© {d.year} · {c.tagline}</span>
        <div>{c.instagram && <a href={c.instagram}>Instagram</a>}{c.facebook && <a href={c.facebook}>Facebook</a>}<a href="#top">↑</a></div>
      </footer>

      <a className="mo-sticky" href={d.bookHref}>{c.ctaLabel} ↗</a>
      <Script js={SHARED_JS} />
    </div>
  );
}

export const css = `
.monolith { --bg: #0a0a0a; --ink: #f5f5f3; --dim: #9f9f9f; --rule: #343434; background: var(--bg); color: var(--ink); font: 15px/1.6 var(--body); -webkit-font-smoothing: antialiased; }
.monolith h1, .monolith h2, .monolith h3 { font-family: var(--heading); font-weight: 500; }
.monolith i { font-style: normal; color: var(--accent); }
.mo-width { width: min(1240px, calc(100% - 80px)); margin-inline: auto; }
.mo-eyebrow { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--dim); }
.mo-small { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #888; }
.mo-btn { display: inline-flex; align-items: center; gap: 10px; min-height: 46px; padding: 12px 22px; border-radius: 999px; font-size: 13px; font-weight: 600; white-space: nowrap; transition: transform .2s, background .2s, color .2s; }
.mo-btn:hover { transform: translateY(-2px); }
.mo-btn.line { border: 1px solid #555; }
.mo-btn.line:hover { background: var(--ink); color: var(--bg); }
.mo-btn.white { background: var(--ink); color: #111; align-self: flex-start; }

.mo-nav { display: flex; align-items: center; gap: 32px; padding-block: 26px; border-block-end: 1px solid var(--rule); --mm-top: 98px; }
.mo-logo { font: 700 19px var(--heading); letter-spacing: -.04em; margin-inline-end: auto; white-space: nowrap; }
.mo-nav nav { display: flex; gap: 28px; }
.mo-nav nav a { font-size: 13px; color: #d8d8d8; transition: opacity .2s; }
.mo-nav nav a:hover { opacity: .55; }
.monolith .mm summary { color: var(--ink); }
.monolith .mm-panel { background: var(--bg); color: var(--ink); border-block-start: 1px solid var(--rule); }
.monolith .mm-panel nav a { font: 500 2.4rem var(--heading); letter-spacing: -.06em; text-transform: uppercase; }
.monolith .mm-book { background: var(--ink); color: #111; border-radius: 999px; font-weight: 600; }

.mo-hero { padding-block: 80px 90px; border-block-end: 1px solid var(--rule); }
.mo-over { display: flex; gap: 17px; align-items: center; font-size: 12px; color: #b8b8b8; text-transform: uppercase; letter-spacing: .08em; }
.mo-over::before { content: ""; height: 1px; width: 50px; background: #7d7d7d; flex: none; }
.mo-hero h1 { font-size: clamp(64px, 11.7vw, 176px); letter-spacing: -.085em; line-height: .89; margin: 26px 0 12px; font-weight: 700; overflow-wrap: anywhere; }
.mo-hero h1.long { font-size: clamp(48px, 8.4vw, 128px); }
.mo-hero h1 span { display: block; font-weight: 400; }
.mo-hero-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 28px; margin-block-start: 50px; }
.mo-hero-img { height: 420px; background: linear-gradient(135deg, #232323, #555); overflow: hidden; }
.mo-hero-img img, .mo-portraits img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.05); transition: filter .6s; }
.mo-hero-img:hover img, .mo-portraits article:hover img { filter: grayscale(0); }
.mo-blank { width: 100%; height: 100%; background: linear-gradient(135deg, #1d1d1d, #4a4a4a); }
.mo-hero-text { border: 1px solid #393939; padding: 45px; display: flex; flex-direction: column; gap: 22px; justify-content: space-between; }
.mo-hero-text p { font: 400 clamp(24px, 2.7vw, 36px)/1.15 var(--heading); letter-spacing: -.04em; max-width: 16ch; margin: 0; }
.mo-hero-text small { color: var(--dim); font-size: 14px; max-width: 40ch; }

.mo-why { padding-block: 120px; }
.mo-why h2, .mo-services h2, .mo-faq h2 { font-size: clamp(46px, 6.4vw, 92px); line-height: 1; letter-spacing: -.07em; margin: 14px 0 40px; }
.mo-headline { display: flex; align-items: start; justify-content: space-between; gap: 40px; }
.mo-headline h2 { max-width: 12ch; }
.mo-about { color: var(--dim); max-width: 400px; padding-block-start: 30px; }
.mo-about p { margin: 0 0 12px; }
.mo-features { display: grid; grid-template-columns: 1.25fr .75fr; gap: 16px; }
.mo-feature { background: #181818; padding: 35px; min-height: 260px; display: flex; flex-direction: column; justify-content: space-between; gap: 20px; }
.mo-feature:first-child { background: linear-gradient(125deg, #1a1a1a, #373737); }
.mo-feature span { font-size: 12px; color: #aeaeae; text-transform: uppercase; letter-spacing: .1em; }
.mo-feature h3 { font-size: clamp(26px, 3.6vw, 46px); letter-spacing: -.05em; line-height: 1.08; max-width: 14ch; margin: 0; }
.mo-feature a { align-self: flex-start; text-decoration: underline; text-underline-offset: 5px; font-size: 14px; }
.mo-rating { display: flex; flex-direction: column; font-size: 16px !important; letter-spacing: 0 !important; color: var(--dim); }
.mo-rating b { font-size: clamp(64px, 7vw, 100px); line-height: 1; letter-spacing: -.07em; color: var(--ink); font-weight: 500; }
.mo-list { list-style: none; display: flex; flex-wrap: wrap; gap: 0; margin-block-start: 16px; border-block-start: 1px solid var(--rule); }
.mo-list li { flex: 1 1 200px; padding: 20px 0; padding-inline-end: 20px; font-size: 14px; color: #cfcfcf; }
.mo-list li::before { content: "● "; color: var(--accent); font-size: 10px; vertical-align: middle; }

.mo-white { background: #f5f5f3; color: #090909; padding-block: 100px; }
.mo-services { display: grid; grid-template-columns: .85fr 1.15fr; gap: 60px; align-items: start; }
.mo-services-head { position: sticky; inset-block-start: 40px; }
.mo-services-head p { color: #777; max-width: 36ch; }
.mo-white .mo-eyebrow { color: #747474; }
.mo-row { display: grid; grid-template-columns: 46px 1fr auto 38px; align-items: center; gap: 18px; padding-block: 24px; border-block-end: 1px solid #c9c9c9; transition: padding .3s; }
.mo-row:first-child { border-block-start: 1px solid #c9c9c9; }
.mo-row:hover { padding-inline: 10px; }
.mo-n { font-size: 12px; color: #818181; }
.mo-row-main strong { display: block; font: 500 19px var(--heading); letter-spacing: -.03em; }
.mo-row-main small { display: block; font-size: 13px; color: #6d6d6d; line-height: 1.5; margin-block-start: 3px; }
.mo-row-meta { text-align: end; display: grid; font-size: 14px; }
.mo-row-meta small { color: #818181; font-size: 12px; }
.mo-go { background: #111; color: #fff; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-size: 18px; transition: background .2s, transform .3s; }
.mo-row:hover .mo-go { background: var(--accent); color: #111; transform: rotate(45deg); }

.mo-portraits { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; }
.mo-portraits article { background: #1d1d1d; overflow: hidden; }
.mo-portraits img, .mo-portraits .mo-blank { height: 300px; }
.mo-portraits h3 { font-size: 18px; margin: 20px 18px 4px; letter-spacing: -.02em; }
.mo-portraits p { font-size: 13px; color: #888; margin: 0 18px 22px; }

.mo-reviews { padding-block: 40px 120px; display: grid; gap: 0; }
.mo-reviews figure { margin: 0; padding-block: 40px; border-block-end: 1px solid var(--rule); }
.mo-reviews blockquote { margin: 0 0 18px; font: 400 clamp(24px, 3.2vw, 44px)/1.15 var(--heading); letter-spacing: -.045em; max-width: 26ch; }
.mo-reviews figure:nth-child(odd) blockquote { margin-inline-start: auto; text-align: end; }
.mo-reviews figure:nth-child(odd) figcaption { text-align: end; }
.mo-reviews figcaption { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--dim); }
.mo-reviews figcaption span { color: var(--accent); margin-inline-start: 10px; }

.mo-faq { display: grid; grid-template-columns: 40% 1fr; gap: 50px; padding-block: 40px 120px; }
.mo-faq h2 { margin-block-start: 0; }
.mo-faq details { border-block-end: 1px solid var(--rule); }
.mo-faq details:first-child { border-block-start: 1px solid var(--rule); }
.mo-faq summary { list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 20px; padding-block: 24px; font-size: 17px; cursor: pointer; }
.mo-faq summary::-webkit-details-marker { display: none; }
.mo-faq summary span { font-size: 24px; font-weight: 200; transition: transform .25s; }
.mo-faq details[open] summary span { transform: rotate(45deg); }
.mo-faq details p { color: var(--dim); margin: 0 0 24px; max-width: 60ch; }

.mo-bottom { padding-block: 110px 80px; border-block: 1px solid var(--rule); }
.mo-bottom h2 { font-size: clamp(56px, 9vw, 136px); line-height: .9; letter-spacing: -.085em; font-weight: 500; max-width: 10ch; margin: 18px 0 34px; }
.mo-visit { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-block-start: 90px; padding-block-start: 34px; border-block-start: 1px solid var(--rule); }
.mo-visit > div { display: grid; gap: 12px; align-content: start; }
.mo-visit p { margin: 0; font-size: 17px; }
.mo-links { display: flex; flex-wrap: wrap; gap: 22px; }
.mo-links a { border-block-end: 1px solid #777; }
.mo-visit dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 10px; border-block-end: 1px solid var(--rule); }
.mo-visit dd { margin: 0; color: #d8d8d8; }
.monolith .open-badge { font-size: 13px; color: #cfcfcf; }

.mo-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding-block: 32px; font-size: 12px; color: #8b8b8b; }
.mo-footer .mo-logo { margin: 0; color: var(--ink); font-size: 15px; }
.mo-footer > div { display: flex; gap: 22px; }
.mo-sticky { display: none; }

@media (max-width: 860px) {
  .mo-width { width: calc(100% - 36px); }
  .mo-nav { padding-block: 20px; --mm-top: 82px; }
  .mo-hero { padding-block: 46px 60px; }
  .mo-hero h1 { font-size: clamp(46px, 14vw, 90px); }
  .mo-hero h1.long { font-size: clamp(36px, 10.5vw, 70px); }
  .mo-hero-grid, .mo-features, .mo-services, .mo-faq, .mo-visit { grid-template-columns: 1fr; }
  .mo-hero-grid { margin-block-start: 30px; }
  .mo-hero-img { height: 300px; }
  .mo-hero-text { padding: 28px; }
  .mo-why { padding-block: 76px; }
  .mo-headline { display: block; }
  .mo-feature { min-height: 220px; padding: 28px; }
  .mo-white { padding-block: 64px; }
  .mo-services { gap: 20px; }
  .mo-services-head { position: static; }
  .mo-row { grid-template-columns: 1fr auto; gap: 6px 14px; }
  .mo-n, .mo-go { display: none; }
  .mo-portraits { grid-template-columns: 1fr 1fr; }
  .mo-portraits img, .mo-portraits .mo-blank { height: 210px; }
  .mo-reviews figure:nth-child(odd) blockquote, .mo-reviews figure:nth-child(odd) figcaption { text-align: start; margin-inline-start: 0; }
  .mo-faq { gap: 10px; padding-block: 20px 80px; }
  .mo-bottom { padding-block: 76px 60px; }
  .mo-bottom h2 { font-size: clamp(48px, 15vw, 80px); }
  .mo-visit { gap: 34px; margin-block-start: 60px; }
  .mo-footer { flex-direction: column; text-align: center; padding-block-end: 100px; }
  .mo-sticky { display: flex; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; justify-content: center; padding: 16px; border-radius: 999px; background: var(--ink); color: #111; font-weight: 600; font-size: 14px; transform: translateY(150%); transition: transform .4s; }
  .monolith[data-scrolled] .mo-sticky { transform: none; }
}
`;
