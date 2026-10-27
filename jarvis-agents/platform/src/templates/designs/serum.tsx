// SERUM: an editorial skin clinic. Framed page, a giant two-tone serif
// headline next to a tall portrait, treatments laid out like a product shelf
// (but each one books), and a quiet philosophy spread. Ported from the
// Signature library (05-seraskin): the shop became treatments, the cart became
// booking, and the newsletter became a real enquiry form.

import { DemoRibbon, Icon, Paragraphs, tel } from "@/components/site/bits";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, type DesignProps } from "./shared";

// "Clear skin, calmly" -> ["Clear skin,", "calmly"]: the tail goes italic
function tail(text: string) {
  const words = text.split(" ");
  if (words.length < 3) return ["", text];
  const cut = Math.max(1, Math.floor(words.length / 2));
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

export function Serum({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const [h1a, h1b] = tail(c.headline);
  const [abA, abB] = tail(c.aboutTitle);
  const strip = c.highlights.length ? c.highlights : [c.tagline];
  const marks = ["✳", "◌", "✦", "↗"];
  const links: [string, string][] = [
    ["#treatments", L.nav_services], ["#philosophy", L.nav_about],
    ...(c.reviews.length ? [["#reviews", L.nav_reviews] as [string, string]] : []),
    ["#visit", L.nav_contact],
  ];
  return (
    <div className="dsite serum" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />
      <div className="se-frame">
        <header className="se-nav">
          <a className="se-logo" href="#top">{c.logoUrl && <img src={c.logoUrl} alt="" />}<span>{biz.name}<i>.</i></span></a>
          <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
          <a className="se-book desk" href={d.bookHref}>{c.ctaLabel} ↗</a>
          <MobileMenu d={d} links={links} />
        </header>

        <main id="top">
          <section className="se-hero">
            <div className="se-intro">
              <span className="se-eyebrow">{c.tagline}{biz.city && <> / {biz.city}</>}</span>
              <div>
                <h1>{h1a && <span>{h1a}</span>}<em>{h1b}</em></h1>
                <p>{c.subheadline}</p>
                <a className="se-btn" href={d.bookHref}>{c.ctaLabel} ↗</a>
              </div>
              <span className="se-eyebrow">01 / <OpenBadge d={d} /></span>
            </div>
            <div className="se-photo">
              {c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : <div className="se-blank" />}
              {c.rating != null && (
                <div className="se-tag"><b>★ {c.rating.toFixed(1)}</b><span>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</span></div>
              )}
            </div>
            <div className="se-side">{c.gallery[0] ? <img src={c.gallery[0]} alt="" /> : <div className="se-blank alt" />}</div>
          </section>

          <div className="se-strip">{strip.slice(0, 4).map((h, i) => <span key={h}>{marks[i % 4]} {h}</span>)}</div>

          <section className="se-section" id="treatments">
            <span className="se-eyebrow">{L.sec_services_kicker}</span>
            <h2 className="se-heading">{tail(L.sec_services_title)[0]} <em>{tail(L.sec_services_title)[1]}</em></h2>
            <p className="se-lede">{L.sec_services_intro}</p>
            <div className="se-shelf">
              {services.map((s, i) => (
                <article key={s.id} className={`se-item t${i % 4}`} data-reveal>
                  <a className="se-item-photo" href={d.bookHref} aria-label={s.name}>
                    {c.gallery[(i % Math.max(1, c.gallery.length - 1)) + 1]
                      ? <img src={c.gallery[(i % Math.max(1, c.gallery.length - 1)) + 1]} alt="" loading="lazy" />
                      : <span className="se-icon"><Icon name={s.icon} size={64} /></span>}
                    <small>{s.durationMin} {L.min}</small>
                  </a>
                  <div className="se-item-info">
                    <div><h3>{s.name}</h3><small>{s.description}</small></div>
                    {s.price && <strong>{s.price}</strong>}
                  </div>
                  <a className="se-add" href={d.bookHref}>{L.book_this} +</a>
                </article>
              ))}
            </div>
          </section>

          <section className="se-philosophy" id="philosophy">
            <div className="se-philosophy-img">{c.gallery[1] ? <img src={c.gallery[1]} alt="" loading="lazy" /> : <div className="se-blank" />}</div>
            <div className="se-philosophy-copy" data-reveal>
              <span className="se-eyebrow">{L.sec_about_kicker}</span>
              <h2 className="se-heading">{abA} <em>{abB}</em></h2>
              <Paragraphs text={c.about} />
              {staff.length > 0 && (
                <ul className="se-team">{staff.map((p) => <li key={p.id}><b>{p.name}</b><span>{p.title}</span></li>)}</ul>
              )}
              <a className="se-btn" href={d.bookHref}>{c.ctaLabel} ↗</a>
            </div>
          </section>

          {c.reviews.length > 0 && (
            <section className="se-section se-reviews" id="reviews">
              <span className="se-eyebrow">{L.sec_reviews_kicker}</span>
              <div className="se-quotes" data-drag>
                {c.reviews.map((r, i) => (
                  <figure key={i}>
                    <blockquote>“{r.text}”</blockquote>
                    <figcaption data-review-author={r.author}>{r.author} · {"★".repeat(r.rating)}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {(c.faqs.length > 0 || c.credentials.length > 0) && (
            <section className="se-section se-faq">
              <div>
                <h2 className="se-heading">{tail(L.sec_faq_title)[0]} <em>{tail(L.sec_faq_title)[1]}</em></h2>
                {c.credentials.length > 0 && <ul className="se-creds">{c.credentials.map((x) => <li key={x}>✦ {x}</li>)}</ul>}
              </div>
              <div>{c.faqs.map((f) => <details key={f.q}><summary>{f.q}<span>+</span></summary><p>{f.a}</p></details>)}</div>
            </section>
          )}

          <section className="se-visit" id="visit">
            <div>
              <span className="se-eyebrow">{L.sec_contact_kicker}</span>
              <h2 className="se-heading">{tail(L.sec_cta_title)[0]} <em>{tail(L.sec_cta_title)[1]}</em></h2>
              {biz.address && <p>{biz.address}</p>}
              <p className="se-links">
                {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a>}
                {d.mapsHref && <a href={d.mapsHref}>{L.directions} ↗</a>}
              </p>
              <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
            </div>
            <div className="se-form">
              <h3>{L.sec_message_title}</h3>
              <EnquiryForm slug={biz.slug} services={services.map((s) => s.name)} button={`${L.form_send} ↗`} buttonClass="se-btn"
                messagePlaceholder={L.form_message_health} L={L} />
            </div>
          </section>
        </main>

        <footer className="se-footer">
          <a className="se-logo" href="#top"><span>{biz.name}<i>.</i></span></a>
          <span>© {d.year} · {c.tagline}</span>
          <div>{c.instagram && <a href={c.instagram}>Instagram</a>}{c.facebook && <a href={c.facebook}>Facebook</a>}<a href="#top">↑</a></div>
        </footer>
      </div>
      <a className="se-sticky" href={d.bookHref}>{c.ctaLabel} ↗</a>
      <Script js={SHARED_JS} />
    </div>
  );
}

export const css = `
.serum {
  --sage: var(--accent); --moss: var(--primary); --ink: color-mix(in srgb, var(--dark) 90%, #1a1a1a);
  --paper: color-mix(in srgb, var(--light) 45%, #f8f8f4); --muted: color-mix(in srgb, var(--dark) 45%, #8b8f86);
  --line: color-mix(in srgb, var(--dark) 12%, transparent); --tint: color-mix(in srgb, var(--accent) 22%, #fff);
  background: var(--paper); color: var(--ink); font: 15px/1.65 var(--body); -webkit-font-smoothing: antialiased;
}
.se-frame { border-block-start: 8px solid var(--sage); }
.serum h1, .serum h2, .serum h3 { font-family: var(--heading); font-weight: 400; }
.serum em { font-style: italic; }
.se-eyebrow { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; font-weight: 600; }
.se-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 12px 24px; border-radius: 999px; background: var(--ink); color: #fff; font-size: 13px; font-weight: 600; white-space: nowrap; transition: transform .2s, background .2s; }
.se-btn:hover { transform: translateY(-2px); background: var(--moss); }

.se-nav { display: flex; align-items: center; gap: 30px; padding: 22px 32px; --mm-top: 82px; }
.se-logo { display: inline-flex; align-items: center; gap: 8px; font: 400 28px var(--heading); letter-spacing: -.03em; margin-inline-end: auto; }
.se-logo img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.se-logo i { color: var(--sage); font-style: normal; }
.se-nav nav { display: flex; gap: 28px; }
.se-nav nav a { font-size: 13px; font-weight: 600; transition: opacity .2s; }
.se-nav nav a:hover { opacity: .55; }
.se-book { font-size: 14px; }
.serum .mm-panel { background: var(--paper); color: var(--ink); }
.serum .mm-panel nav a { font: italic 400 2.4rem var(--heading); }
.serum .mm-book { background: var(--ink); color: #fff; border-radius: 999px; }

.se-hero { display: grid; grid-template-columns: 1fr 1.2fr .5fr; gap: 6px; padding: 10px 32px 0; min-height: 640px; }
.se-intro { display: flex; flex-direction: column; justify-content: space-between; padding-block: 24px; padding-inline-end: 28px; }
.se-intro h1 { font-size: clamp(64px, 8.4vw, 136px); line-height: .88; letter-spacing: -.05em; margin: 0 0 24px; }
.se-intro h1 span { display: block; color: var(--sage); }
.se-intro h1 em { display: block; color: var(--moss); }
.se-intro p { max-width: 34ch; color: var(--muted); font-size: 14px; margin-block-end: 22px; }
.se-intro .open-badge { text-transform: none; letter-spacing: 0; font-weight: 500; }
.se-photo, .se-side { position: relative; overflow: hidden; background: var(--tint); }
.se-photo img, .se-side img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.se-blank { position: absolute; inset: 0; background: radial-gradient(circle at 70% 25%, #fff 0, var(--tint) 45%, color-mix(in srgb, var(--sage) 60%, #fff)); }
.se-blank.alt { background: linear-gradient(180deg, var(--tint), color-mix(in srgb, var(--sage) 45%, #fff)); }
.se-tag { position: absolute; inset-block-start: 18px; inset-inline-end: 18px; background: color-mix(in srgb, var(--paper) 92%, transparent); padding: 14px 16px; border-radius: 6px; display: grid; max-width: 170px; }
.se-tag b { font: 400 26px/1.1 var(--heading); }
.se-tag span { font-size: 12px; color: var(--muted); }
.se-strip { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding: 18px 32px; border-block-end: 1px solid var(--line); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }

.se-section { padding: 110px 32px 0; }
.se-heading { font-size: clamp(40px, 5.2vw, 80px); line-height: .98; letter-spacing: -.045em; margin: 14px 0 0; max-width: 16ch; }
.se-heading em { color: var(--moss); }
.se-lede { color: var(--muted); max-width: 46ch; margin: 18px 0 40px; }
.se-shelf { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.se-item { display: flex; flex-direction: column; }
.se-item-photo { position: relative; aspect-ratio: 4 / 5; overflow: hidden; display: grid; place-items: center; background: var(--tint); }
.se-item.t1 .se-item-photo { background: color-mix(in srgb, var(--sage) 30%, #f0eadf); }
.se-item.t2 .se-item-photo { background: color-mix(in srgb, var(--moss) 18%, #fff); }
.se-item.t3 .se-item-photo { background: #f0eadf; }
.se-item-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .7s; }
.se-item:hover .se-item-photo img { transform: scale(1.05); }
.se-icon { color: var(--moss); opacity: .75; transition: transform .5s; }
.se-item:hover .se-icon { transform: translateY(-8px) rotate(-6deg); }
.se-item-photo small { position: absolute; inset-block-start: 12px; inset-inline-start: 12px; background: #ffffffd0; border-radius: 999px; padding: 4px 10px; font-size: 11px; }
.se-item-info { display: flex; justify-content: space-between; gap: 12px; padding-block: 16px 12px; flex: 1; }
.se-item-info h3 { font-size: 22px; line-height: 1.1; letter-spacing: -.02em; margin: 0 0 4px; }
.se-item-info small { color: var(--muted); font-size: 13px; line-height: 1.45; display: block; }
.se-item-info strong { font-weight: 600; white-space: nowrap; }
.se-add { border-block-start: 1px solid var(--ink); padding-block-start: 12px; font-size: 13px; font-weight: 600; text-align: start; transition: color .2s; }
.se-add:hover { color: var(--moss); }

.se-philosophy { display: grid; grid-template-columns: 1fr 1fr; margin-block-start: 120px; background: color-mix(in srgb, var(--sage) 16%, var(--paper)); }
.se-philosophy-img { position: relative; min-height: 640px; overflow: hidden; }
.se-philosophy-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.se-philosophy-copy { padding: 90px clamp(28px, 6vw, 90px); display: flex; flex-direction: column; justify-content: center; gap: 18px; align-items: flex-start; }
.se-philosophy-copy > p { color: var(--muted); max-width: 46ch; margin: 0; }
.se-team { list-style: none; width: 100%; max-width: 440px; }
.se-team li { display: flex; justify-content: space-between; gap: 14px; padding-block: 12px; border-block-end: 1px solid var(--line); }
.se-team b { font: italic 400 21px var(--heading); }
.se-team span { color: var(--muted); font-size: 13px; align-self: center; }

.se-quotes { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(420px, 46%); gap: 40px; overflow-x: auto; margin-block-start: 24px; padding-block-end: 10px; }
.se-quotes figure { margin: 0; border-block-start: 1px solid var(--ink); padding-block-start: 24px; }
.se-quotes blockquote { margin: 0 0 18px; font: italic 400 clamp(24px, 2.6vw, 36px)/1.2 var(--heading); letter-spacing: -.02em; }
.se-quotes figcaption { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }

.se-faq { display: grid; grid-template-columns: 40% 1fr; gap: 60px; }
.se-creds { list-style: none; margin-block-start: 26px; display: grid; gap: 8px; color: var(--moss); font-weight: 600; font-size: 14px; }
.se-faq details { border-block-end: 1px solid var(--line); }
.se-faq details:first-child { border-block-start: 1px solid var(--line); }
.se-faq summary { list-style: none; display: flex; justify-content: space-between; gap: 16px; padding-block: 22px; font-size: 16px; font-weight: 500; cursor: pointer; }
.se-faq summary::-webkit-details-marker { display: none; }
.se-faq summary span { font-size: 22px; line-height: 1; transition: transform .2s; color: var(--moss); }
.se-faq details[open] summary span { transform: rotate(45deg); }
.se-faq details p { color: var(--muted); margin: 0 0 22px; }

.se-visit { margin: 120px 32px 0; padding: 70px clamp(24px, 5vw, 70px); background: var(--ink); color: var(--paper); display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
.se-visit .se-heading em { color: var(--sage); }
.se-visit > div:first-child { display: grid; gap: 14px; align-content: start; }
.se-visit p { margin: 0; color: color-mix(in srgb, var(--paper) 75%, transparent); }
.se-links { display: flex; flex-wrap: wrap; gap: 22px; }
.se-links a { border-block-end: 1px solid var(--sage); color: var(--paper); }
.se-visit dl { margin-block-start: 10px; }
.se-visit dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 9px; border-block-end: 1px solid #ffffff22; font-size: 14px; }
.se-form { background: var(--paper); color: var(--ink); padding: 34px; }
.se-form h3 { font-size: 30px; margin: 0 0 18px; letter-spacing: -.03em; }
.se-form form { display: grid; gap: 10px; }
.se-form input, .se-form select, .se-form textarea { width: 100%; background: #fff; border: 1px solid var(--line); border-radius: 4px; padding: 13px 14px; color: var(--ink); }
.se-form button { justify-self: start; margin-block-start: 6px; }
.se-form [data-note] { font-size: 13px; color: var(--moss); }

.se-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding: 34px 32px; font-size: 12px; color: var(--muted); }
.se-footer .se-logo { margin: 0; font-size: 22px; color: var(--ink); }
.se-footer > div { display: flex; gap: 22px; }
.se-sticky { display: none; }

@media (max-width: 1080px) {
  .se-hero { grid-template-columns: 1fr 1fr; }
  .se-side { display: none; }
  .se-shelf { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .se-nav { padding: 18px 18px; --mm-top: 76px; }
  .se-nav .se-logo { font-size: 22px; line-height: 1.1; }
  .se-hero { grid-template-columns: 1fr; padding: 0 18px; min-height: 0; }
  .se-intro { padding: 20px 0 30px; gap: 30px; }
  .se-intro h1 { font-size: clamp(54px, 17vw, 84px); }
  .se-photo { height: 420px; }
  .se-strip { padding: 16px 18px; justify-content: flex-start; gap: 10px 22px; }
  .se-section { padding: 80px 18px 0; }
  .se-shelf { gap: 18px 10px; }
  .se-item-info { flex-direction: column; gap: 6px; }
  .se-item-info h3 { font-size: 19px; }
  .se-philosophy { grid-template-columns: 1fr; margin-block-start: 80px; }
  .se-philosophy-img { min-height: 380px; }
  .se-philosophy-copy { padding: 54px 18px; }
  .se-quotes { grid-auto-columns: 86%; gap: 24px; }
  .se-faq { grid-template-columns: 1fr; gap: 24px; }
  .se-visit { margin: 80px 0 0; padding: 54px 18px; grid-template-columns: 1fr; gap: 36px; }
  .se-form { padding: 24px 18px; }
  .se-footer { flex-direction: column; text-align: center; padding: 30px 18px 100px; }
  .se-sticky { display: flex; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; justify-content: center; padding: 16px; border-radius: 999px; background: var(--ink); color: #fff; font-weight: 600; font-size: 14px; transform: translateY(150%); transition: transform .4s; }
  .serum[data-scrolled] .se-sticky { transform: none; }
}
`;
