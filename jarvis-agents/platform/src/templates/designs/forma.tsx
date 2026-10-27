// FORMA: a renovation or trades business presented like a design studio.
// Warm paper tones, a big serif headline with an italic second line, one wide
// photo of their best job, then the work itself, the process and a real quote
// form. Ported from the Signature library (07-forma-interiors), real details.

import { DemoRibbon, Icon, Paragraphs, tel } from "@/components/site/bits";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, type DesignProps } from "./shared";

// "Kitchens and bathrooms, built to last" -> ["Kitchens and bathrooms,", "built to last"]
function lines(text: string) {
  const comma = text.indexOf(", ");
  if (comma > 8 && comma < text.length - 6) return [text.slice(0, comma + 1), text.slice(comma + 2)];
  const words = text.split(" ");
  if (words.length < 4) return [text, ""];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

// adds a full stop unless the title already ends with punctuation
const dot = (t: string) => (/[.!?…]$/.test(t) ? t : `${t}.`);

export function Forma({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const [h1a, h1b] = lines(c.headline);
  const [abA, abB] = lines(c.aboutTitle);
  const work = c.gallery.slice(0, 4);
  const art = c.gallery[4] ?? c.gallery[1];
  const links: [string, string][] = [
    ...(work.length || c.beforeAfter.length ? [["#work", L.sec_gallery_kicker] as [string, string]] : []),
    ["#services", L.nav_services], ["#process", L.sec_steps_kicker], ["#quote", L.nav_contact],
  ];
  return (
    <div className="dsite forma" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="fo-nav fo-width">
        <a className="fo-logo" href="#top">{c.logoUrl && <img src={c.logoUrl} alt="" />}<span>{biz.name.toLowerCase()}<i>.</i></span></a>
        <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        <a className="fo-btn dark desk" href="#quote">{L.free_quote} ↗</a>
        <MobileMenu d={d} links={links} />
      </header>

      <main id="top">
        <section className="fo-hero fo-width">
          <div className="fo-hero-top">
            <div>
              <span className="fo-eyebrow">{c.tagline}</span>
              <h1>{h1a}{h1b && <em>{h1b}</em>}</h1>
            </div>
            <div className="fo-hero-side">
              <p>{c.subheadline}</p>
              {biz.phone && <a className="fo-call" href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={16} /><Num>{biz.phone}</Num></a>}
            </div>
          </div>
          <div className="fo-main-photo">
            {c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : <div className="fo-blank" />}
            <div className="fo-badge">
              <b>{c.rating != null ? `★ ${c.rating.toFixed(1)}` : c.highlights[0] ?? biz.name}</b>
              {c.rating != null && c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : c.areasServed.length ? fill(L.serving, { areas: c.areasServed.slice(0, 2).join(", ") }) : c.tagline}
            </div>
          </div>
          <div className="fo-index"><span>{services.slice(0, 3).map((s) => s.name).join(" / ")}</span><a href="#work">{L.scroll_explore} ↓</a></div>
        </section>

        {(work.length > 0 || c.beforeAfter.length > 0) && (
          <section className="fo-width fo-section" id="work">
            <div className="fo-title">
              <div><span className="fo-eyebrow">01 / {L.sec_gallery_kicker}</span><h2>{dot(L.sec_gallery_title)}</h2></div>
              <p>{c.highlights[0] ? `${c.highlights.slice(0, 3).join(". ")}.` : c.tagline}</p>
            </div>
            {c.beforeAfter.length > 0 ? (
              <div className="fo-ba">
                {c.beforeAfter.slice(0, 2).map((p, i) => (
                  <figure key={i} data-reveal>
                    <div><a href={p.before} data-lightbox={p.before}><img src={p.before} alt="" loading="lazy" /><span>{L.before}</span></a>
                      <a href={p.after} data-lightbox={p.after}><img src={p.after} alt="" loading="lazy" /><span>{L.after}</span></a></div>
                    {p.caption && <figcaption>{p.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            ) : (
              <div className="fo-projects">
                {work.map((src, i) => (
                  <a key={src} href={src} data-lightbox={src} className={`fo-project p${i}`} data-reveal>
                    <div className="fo-project-photo"><img src={src} alt="" loading="lazy" /></div>
                    <div className="fo-project-label"><strong>{services[i % Math.max(1, services.length)]?.name ?? biz.name} ↗</strong><small>{biz.city}</small></div>
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="fo-width fo-values" id="about">
          <div className="fo-values-copy" data-reveal>
            <span className="fo-eyebrow">02 / {L.sec_about_kicker}</span>
            <h2>{abA}{abB && <><br /><em>{abB}</em></>}</h2>
            <Paragraphs text={c.about} />
            {(c.credentials.length > 0 || c.warranty) && (
              <div className="fo-trust">
                {c.warranty && <p><Icon name="shield" size={18} /><span><b>{L.sec_warranty_title}</b>{c.warranty}</span></p>}
                {c.credentials.map((x) => <p key={x}><Icon name="award" size={18} /><span>{x}</span></p>)}
              </div>
            )}
          </div>
          <div className="fo-values-art">{art ? <img src={art} alt="" loading="lazy" /> : <div className="fo-blank" />}</div>
        </section>

        <section className="fo-width fo-section" id="services">
          <div className="fo-title">
            <div><span className="fo-eyebrow">03 / {L.sec_services_kicker}</span><h2>{dot(L.sec_services_title)}</h2></div>
            <p>{L.sec_services_intro}</p>
          </div>
          <div className="fo-services">
            {services.map((s, i) => (
              <a key={s.id} href="#quote" data-reveal>
                <span className="fo-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="fo-s-main"><b>{s.name}</b><small>{s.description}</small></span>
                <span className="fo-s-price">{s.price ?? L.free_quote}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="fo-width fo-section" id="process">
          <span className="fo-eyebrow">04 / {L.sec_steps_kicker}</span>
          <div className="fo-title"><h2>{dot(L.sec_steps_title)}</h2></div>
          <div className="fo-steps">
            {[[L.step1_title, L.step1], [L.step2_title, L.step2], [L.step3_title, L.step3]].map(([t, p], i) => (
              <div key={i} data-reveal><span>0{i + 1}</span><h3>{t}</h3><p>{p}</p></div>
            ))}
          </div>
        </section>

        {c.reviews.length > 0 && (
          <section className="fo-width fo-section fo-reviews" id="reviews">
            <span className="fo-eyebrow">05 / {L.sec_reviews_kicker}</span>
            <div className="fo-quotes">
              {c.reviews.slice(0, 4).map((r, i) => (
                <figure key={i} data-reveal>
                  <blockquote>“{r.text}”</blockquote>
                  <figcaption data-review-author={r.author}>{r.author} · {"★".repeat(r.rating)}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {(c.faqs.length > 0 || c.areasServed.length > 0) && (
          <section className="fo-width fo-section fo-faq">
            <div>
              <h2>{dot(L.sec_faq_title)}</h2>
              {c.areasServed.length > 0 && (
                <div className="fo-areas"><b>{L.sec_areas_title}</b><div>{c.areasServed.map((a) => <span key={a}>{a}</span>)}</div></div>
              )}
            </div>
            <div>{c.faqs.map((f) => <details key={f.q}><summary>{f.q}<span>+</span></summary><p>{f.a}</p></details>)}</div>
          </section>
        )}

        <section className="fo-width fo-section" id="quote">
          <div className="fo-contact">
            <div className="fo-contact-copy">
              <span className="fo-eyebrow">{L.sec_contact_kicker}</span>
              <h2>{L.quote_title}{!/[.!?…]$/.test(L.quote_title) && <em>.</em>}</h2>
              <p>{L.quote_sub}</p>
              <div className="fo-contact-facts">
                {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={16} /><Num>{biz.phone}</Num></a>}
                {biz.address && <span><Icon name="map" size={16} />{biz.address}</span>}
                <OpenBadge d={d} />
              </div>
              <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
            </div>
            <div className="fo-form">
              <EnquiryForm slug={biz.slug} services={services.map((s) => s.name)} button={`${L.quote_button} ↗`} buttonClass="fo-btn light"
                messagePlaceholder={L.quote_message} L={L} />
            </div>
          </div>
        </section>
      </main>

      <footer className="fo-width fo-footer">
        <a className="fo-logo" href="#top"><span>{biz.name.toLowerCase()}<i>.</i></span></a>
        <span>© {d.year} {biz.name} · {c.tagline}</span>
        <div>{c.instagram && <a href={c.instagram}>Instagram</a>}{c.facebook && <a href={c.facebook}>Facebook</a>}<a href="#top">↑</a></div>
      </footer>

      <div className="fo-sticky">
        {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={16} />{L.call}</a>}
        <a href="#quote">{L.free_quote} ↗</a>
      </div>
      <Script js={SHARED_JS} />
    </div>
  );
}

export const css = `
.forma {
  --paper: color-mix(in srgb, var(--light) 70%, #f7f3ec); --ink: color-mix(in srgb, var(--dark) 92%, #2a221c);
  --tan: var(--accent); --muted: color-mix(in srgb, var(--dark) 55%, #a29585); --line: color-mix(in srgb, var(--dark) 14%, transparent);
  --warm: color-mix(in srgb, var(--accent) 25%, var(--paper));
  background: var(--paper); color: var(--ink); font: 15px/1.65 var(--body); -webkit-font-smoothing: antialiased;
}
.forma h1, .forma h2, .forma h3 { font-family: var(--heading); font-weight: 400; }
.forma em { font-style: italic; color: var(--tan); }
.fo-width { width: min(1240px, calc(100% - 80px)); margin-inline: auto; }
.fo-eyebrow { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; font-weight: 700; }
.fo-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 12px 24px; border-radius: 999px; font-size: 13px; font-weight: 700; white-space: nowrap; transition: transform .2s, filter .2s; }
.fo-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
.fo-btn.dark { background: var(--primary); color: #fff; }
.fo-btn.light { background: var(--paper); color: var(--ink); }

.fo-nav { display: flex; align-items: center; gap: 30px; padding-block: 22px; border-block-end: 1px solid var(--line); --mm-top: 92px; }
.fo-logo { display: inline-flex; align-items: center; gap: 8px; font: 400 26px var(--heading); letter-spacing: -.03em; margin-inline-end: auto; }
.fo-logo img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.fo-logo i { font-style: normal; color: var(--tan); }
.fo-nav nav { display: flex; gap: 28px; }
.fo-nav nav a { font-size: 13px; font-weight: 600; color: var(--muted); transition: color .2s; }
.fo-nav nav a:hover { color: var(--ink); }
.forma .mm-panel { background: var(--paper); color: var(--ink); }
.forma .mm-panel nav a { font: italic 400 2.4rem var(--heading); }
.forma .mm-book { background: var(--primary); color: #fff; border-radius: 999px; }

.fo-hero { padding-block: 70px 0; }
.fo-hero-top { display: grid; grid-template-columns: 1fr 260px; gap: 40px; align-items: start; }
.fo-hero h1 { font-size: clamp(50px, 7.4vw, 112px); line-height: .98; letter-spacing: -.05em; margin: 22px 0 46px; }
.fo-hero h1 em { display: block; }
.fo-hero-side { padding-block-start: 30px; display: grid; gap: 18px; }
.fo-hero-side p { color: var(--muted); font-size: 14px; margin: 0; }
.fo-call { display: inline-flex; gap: 8px; align-items: center; font-weight: 700; border-block-end: 1px solid var(--ink); justify-self: start; padding-block-end: 4px; }
.fo-main-photo { position: relative; height: clamp(360px, 46vw, 620px); overflow: hidden; background: var(--warm); }
.fo-main-photo img { width: 100%; height: 100%; object-fit: cover; animation: fo-zoom 18s ease-out both; }
.fo-blank { width: 100%; height: 100%; background: linear-gradient(160deg, var(--warm), color-mix(in srgb, var(--tan) 60%, var(--paper))); }
.fo-badge { position: absolute; inset-block-end: 22px; inset-inline-end: 22px; background: var(--paper); padding: 18px 22px; max-width: 260px; font-size: 13px; color: var(--muted); display: grid; gap: 2px; }
.fo-badge b { font: 400 24px/1.15 var(--heading); color: var(--ink); }
.fo-index { display: flex; justify-content: space-between; gap: 20px; padding-block: 16px; border-block-end: 1px solid var(--line); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }

.fo-section { padding-block-start: 120px; }
.fo-title { display: flex; justify-content: space-between; align-items: end; gap: 40px; margin-block-end: 44px; }
.fo-title h2, .fo-values h2, .fo-faq h2, .fo-contact h2 { font-size: clamp(40px, 5vw, 76px); line-height: 1; letter-spacing: -.05em; margin: 14px 0 0; }
.fo-title > p { color: var(--muted); max-width: 40ch; margin: 0; font-size: 14px; }
.fo-projects { display: grid; grid-template-columns: 1.3fr 1fr; grid-auto-rows: 300px; gap: 16px; }
.fo-project { position: relative; overflow: hidden; display: block; }
.fo-project.p0 { grid-row: span 2; }
.fo-project.p3 { grid-column: span 2; }
.fo-project-photo { position: absolute; inset: 0; }
.fo-project-photo img { width: 100%; height: 100%; object-fit: cover; transition: transform .8s; }
.fo-project:hover img { transform: scale(1.05); }
.fo-project-label { position: absolute; inset: auto 0 0; padding: 40px 22px 18px; color: #fff; background: linear-gradient(transparent, #0000008c); display: flex; justify-content: space-between; align-items: end; gap: 12px; }
.fo-project-label strong { font: 400 22px var(--heading); }
.fo-project-label small { font-size: 12px; opacity: .85; }
.fo-ba { display: grid; gap: 30px; }
.fo-ba figure { margin: 0; }
.fo-ba figure > div { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fo-ba a { position: relative; height: 380px; overflow: hidden; display: block; }
.fo-ba img { width: 100%; height: 100%; object-fit: cover; }
.fo-ba span { position: absolute; inset-block-start: 14px; inset-inline-start: 14px; background: var(--paper); padding: 5px 12px; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; font-weight: 700; }
.fo-ba figcaption { margin-block-start: 12px; color: var(--muted); font-size: 14px; }

.fo-values { display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: center; padding-block-start: 120px; }
.fo-values-copy > p { color: var(--muted); max-width: 46ch; }
.fo-values h2 { margin-block-end: 26px; }
.fo-values-art { height: 600px; overflow: hidden; background: var(--warm); border-radius: 280px 280px 0 0; }
.fo-values-art img { width: 100%; height: 100%; object-fit: cover; }
.fo-trust { display: grid; gap: 10px; margin-block-start: 26px; }
.fo-trust p { display: flex; gap: 12px; align-items: start; margin: 0; padding: 14px 16px; background: var(--warm); font-size: 14px; }
.fo-trust svg { color: var(--primary); flex: none; margin-block-start: 2px; }
.fo-trust b { display: block; }

.fo-services { border-block-start: 1px solid var(--ink); }
.fo-services a { display: grid; grid-template-columns: 70px 1fr auto; gap: 20px; align-items: center; padding-block: 26px; border-block-end: 1px solid var(--line); transition: background .3s, padding .3s; }
.fo-services a:hover { background: var(--warm); padding-inline: 18px; }
.fo-n { font: italic 400 24px var(--heading); color: var(--tan); }
.fo-s-main b { display: block; font: 400 clamp(22px, 2.4vw, 32px)/1.1 var(--heading); letter-spacing: -.03em; }
.fo-s-main small { display: block; color: var(--muted); font-size: 14px; margin-block-start: 4px; }
.fo-s-price { font-weight: 700; font-size: 14px; white-space: nowrap; }

.fo-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 30px; }
.fo-steps div { border-block-start: 1px solid var(--ink); padding-block-start: 26px; }
.fo-steps span { font: italic 400 46px var(--heading); color: var(--tan); }
.fo-steps h3 { font-size: 26px; letter-spacing: -.03em; margin: 26px 0 10px; }
.fo-steps p { color: var(--muted); font-size: 14px; margin: 0; max-width: 34ch; }

.fo-quotes { display: grid; grid-template-columns: 1fr 1fr; gap: 50px 70px; margin-block-start: 34px; }
.fo-quotes blockquote { margin: 0 0 14px; font: 400 clamp(22px, 2.2vw, 30px)/1.25 var(--heading); letter-spacing: -.02em; }
.fo-quotes figure { margin: 0; }
.fo-quotes figure:nth-child(even) { margin-block-start: 70px; }
.fo-quotes figcaption { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }

.fo-faq { display: grid; grid-template-columns: 40% 1fr; gap: 60px; }
.fo-areas { margin-block-start: 28px; }
.fo-areas b { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; }
.fo-areas div { display: flex; flex-wrap: wrap; gap: 8px; margin-block-start: 12px; }
.fo-areas span { border: 1px solid var(--line); border-radius: 999px; padding: 7px 14px; font-size: 13px; }
.fo-faq details { border-block-end: 1px solid var(--line); }
.fo-faq details:first-child { border-block-start: 1px solid var(--line); }
.fo-faq summary { list-style: none; display: flex; justify-content: space-between; gap: 16px; padding-block: 22px; font-size: 16px; font-weight: 600; cursor: pointer; }
.fo-faq summary::-webkit-details-marker { display: none; }
.fo-faq summary span { font-size: 22px; line-height: 1; transition: transform .2s; color: var(--tan); }
.fo-faq details[open] summary span { transform: rotate(45deg); }
.fo-faq details p { color: var(--muted); margin: 0 0 22px; }

.fo-contact { background: var(--primary); color: var(--paper); padding: clamp(30px, 6vw, 80px); display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
.fo-contact h2 { margin-block-end: 18px; }
.fo-contact-copy > p { color: color-mix(in srgb, var(--paper) 75%, transparent); max-width: 40ch; }
.fo-contact-facts { display: grid; gap: 10px; margin-block: 26px; font-size: 14px; }
.fo-contact-facts a, .fo-contact-facts span { display: inline-flex; gap: 10px; align-items: center; }
.fo-contact-facts a { font-weight: 700; font-size: 18px; }
.fo-contact dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 9px; border-block-end: 1px solid #ffffff26; font-size: 14px; }
.fo-form form { display: grid; gap: 10px; }
.fo-form input, .fo-form select, .fo-form textarea { width: 100%; background: transparent; color: var(--paper); border: 0; border-block-end: 1px solid #ffffff55; padding: 14px 2px; border-radius: 0; }
.fo-form select option { color: #222; }
.fo-form input::placeholder, .fo-form textarea::placeholder { color: color-mix(in srgb, var(--paper) 65%, transparent); }
.fo-form button { justify-self: start; margin-block-start: 14px; }
.fo-form [data-note] { font-size: 14px; }

.fo-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding-block: 36px; font-size: 12px; color: var(--muted); }
.fo-footer .fo-logo { margin: 0; color: var(--ink); }
.fo-footer > div { display: flex; gap: 22px; }
.fo-sticky { display: none; }
@keyframes fo-zoom { from { transform: scale(1.08); } }

@media (max-width: 900px) {
  .fo-hero-top, .fo-values, .fo-faq, .fo-contact { grid-template-columns: 1fr; }
  .fo-hero-side { padding-block-start: 0; margin-block-end: 30px; }
  .fo-hero h1 { margin-block-end: 20px; }
  .fo-values { gap: 40px; }
  .fo-values-art { height: 440px; }
}
@media (max-width: 760px) {
  .fo-width { width: calc(100% - 32px); }
  .fo-nav { --mm-top: 84px; }
  .fo-nav .fo-logo { font-size: 21px; line-height: 1.1; }
  .fo-hero { padding-block-start: 44px; }
  .fo-hero h1 { font-size: clamp(42px, 12vw, 64px); }
  .fo-main-photo { height: 360px; }
  .fo-badge { inset-inline: 14px auto; inset-block-end: 14px; padding: 14px 16px; }
  .fo-index span { display: none; }
  .fo-section, .fo-values { padding-block-start: 80px; }
  .fo-title { display: block; }
  .fo-title > p { margin-block-start: 14px; }
  .fo-projects { grid-template-columns: 1fr; grid-auto-rows: 260px; }
  .fo-project.p0 { grid-row: auto; }
  .fo-project.p3 { grid-column: auto; }
  .fo-ba a { height: 220px; }
  .fo-services a { grid-template-columns: 40px 1fr; }
  .fo-s-price { grid-column: 2; }
  .fo-steps, .fo-quotes { grid-template-columns: 1fr; gap: 34px; }
  .fo-quotes figure:nth-child(even) { margin: 0; }
  .fo-faq { gap: 24px; }
  .fo-contact { gap: 30px; padding: 40px 22px; }
  .fo-footer { flex-direction: column; text-align: center; padding-block-end: 110px; }
  .fo-sticky { display: flex; gap: 8px; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; transform: translateY(150%); transition: transform .4s; }
  .fo-sticky a { flex: 1; display: flex; gap: 8px; justify-content: center; align-items: center; padding: 15px; border-radius: 999px; background: var(--primary); color: #fff; font-weight: 700; font-size: 14px; box-shadow: 0 12px 30px #0000002a; }
  .fo-sticky a:first-child:not(:last-child) { background: var(--paper); color: var(--ink); flex: .6; }
  .forma[data-scrolled] .fo-sticky { transform: none; }
}
`;
