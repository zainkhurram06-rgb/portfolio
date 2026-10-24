// STRANGE: retro, loud, full of personality. Cream paper, one bold brand
// colour, giant characterful type, services as vintage tickets, a spinning
// sticker. Reference: Strange Bird.

import { DemoRibbon, Paragraphs, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, fitSize, navLinks, type DesignProps } from "./shared";

export function Strange({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const photos = c.gallery;
  const links = navLinks(d, { about: true, work: true, reviews: true });
  // the first real word goes on its own line in italics: "A small studio" -> "A small" / "studio..."
  const words = c.aboutTitle.split(" ");
  const cut = Math.max(1, words.findIndex((w) => w.length >= 4) + 1);
  const first = words.slice(0, cut).join(" ");
  const restTitle = words.slice(cut);
  const sticker = `${c.ctaLabel} ✶ `.toUpperCase();
  return (
    <div className="dsite strange" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="st-head">
        <div className="st-wrap">
          <a className="st-brand" href="#top">{biz.name}</a>
          <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
          {c.instagram && <a className="st-ig desk" href={c.instagram} aria-label="Instagram">IG</a>}
          <a className="st-pill desk" href={d.bookHref}>{c.ctaLabel}</a>
          <MobileMenu d={d} links={links} />
        </div>
      </header>

      <section className="st-hero" id="top">
        <div className="st-photo">
          {c.heroVideo ? <video src={c.heroVideo} poster={c.heroImage ?? undefined} autoPlay muted loop playsInline />
            : c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : <div className="st-paint" />}
          <div className="st-hero-words">
            <h1 style={{ fontSize: fitSize(biz.name, 84, "11rem") }}>{biz.name}</h1>
            <p>{c.tagline}{biz.city ? `, ${biz.city}` : ""}</p>
          </div>
          <a className="st-sticker" href={d.bookHref} aria-label={c.ctaLabel}>
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <defs><path id="st-c" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" /></defs>
              <text><textPath href="#st-c">{sticker.repeat(Math.max(1, Math.ceil(40 / sticker.length)))}</textPath></text>
            </svg>
            <b>✶</b>
          </a>
        </div>
        <div className="st-wrap st-intro">
          <p className="st-big">{c.headline}</p>
          <div>
            <p>{c.subheadline}</p>
            <a className="st-pill solid" href={d.bookHref}>{c.ctaLabel}</a>
          </div>
        </div>
      </section>

      <div className="st-marquee" aria-hidden="true">
        <div>{[0, 1].map((k) => <span key={k}>{services.map((s) => <b key={s.id}>{s.name}</b>)}</span>)}</div>
      </div>

      <section className="st-who" id="about">
        <div className="st-wrap">
          <h2 data-reveal><span>{first}</span> {restTitle.join(" ")}</h2>
          <div className="st-who-text" data-reveal>
            <p className="st-label">{L.sec_about_kicker}</p>
            <Paragraphs text={c.about} />
            <ul>{c.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="st-tickets" id="services">
        <div className="st-wrap">
          <div className="st-head2" data-reveal>
            <h2>{L.sec_services_title}</h2>
            <p>{L.sec_services_intro}</p>
          </div>
          <div className="st-grid">
            {services.map((s, i) => (
              <a key={s.id} className="st-ticket" href={d.bookHref} data-reveal style={{ ["--tilt" as string]: `${[-1.4, 1, -0.6, 1.6, -1][i % 5]}deg` }}>
                <span className="st-no">No. {String(i + 1).padStart(2, "0")}</span>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <span className="st-stub">
                  <span>{s.durationMin} {L.min}</span>
                  <b>{s.price ?? L.book_this}</b>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {photos.length >= 3 && (
        <section className="st-work" id="work">
          <div className="st-wrap">
            <h2 data-reveal>{L.sec_gallery_title}</h2>
            <div className="st-polaroids">
              {photos.slice(0, 6).map((src, i) => (
                <a key={src} href={src} data-lightbox={src} data-reveal style={{ ["--r" as string]: `${[-3, 2, -1, 3, -2, 1][i]}deg` }}>
                  <img src={src} alt="" loading="lazy" />
                </a>
              ))}
            </div>
            {c.instagram && <a className="st-pill" href={c.instagram}>{L.follow_instagram}</a>}
          </div>
        </section>
      )}

      {staff.length > 0 && (
        <section className="st-crew">
          <div className="st-wrap">
            <p className="st-label">{L.sec_team_kicker}</p>
            <ul>{staff.map((p) => <li key={p.id} data-reveal><b>{p.name}</b><span>{p.title}</span></li>)}</ul>
          </div>
        </section>
      )}

      {c.reviews.length > 0 && (
        <section className="st-love" id="reviews">
          <div className="st-wrap">
            <h2 data-reveal>{L.sec_reviews_title}</h2>
            <div className="st-notes">
              {c.reviews.slice(0, 3).map((r, i) => (
                <figure key={i} data-reveal><blockquote>{r.text}</blockquote><figcaption data-review-author={r.author}>{r.author} {"★".repeat(r.rating)}</figcaption></figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {c.faqs.length > 0 && (
        <section className="st-faq">
          <div className="st-wrap">
            <h2 data-reveal>{L.sec_faq_title}</h2>
            <div>{c.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
          </div>
        </section>
      )}

      <section className="st-visit" id="visit">
        <div className="st-wrap">
          <h2 data-reveal>{L.sec_cta_title}</h2>
          <div className="st-visit-grid">
            <div>
              <p className="st-label">{L.sec_contact_kicker}</p>
              {biz.address && <p className="st-addr">{biz.address}</p>}
              <OpenBadge d={d} className="st-open" />
              {biz.phone && <p><a href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a></p>}
            </div>
            <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
            <div className="st-visit-cta">
              <a className="st-pill solid" href={d.bookHref}>{c.ctaLabel}</a>
              {d.mapsHref && <a className="st-pill" href={d.mapsHref}>{L.directions}</a>}
            </div>
          </div>
        </div>
      </section>

      <footer className="st-foot">
        <div className="st-wrap">
          <span>© {d.year} {biz.name}</span>
          <span>{c.instagram && <a href={c.instagram}>Instagram</a>}{c.facebook && <a href={c.facebook}>Facebook</a>}</span>
        </div>
      </footer>

      <a className="st-float" href={d.bookHref}>{c.ctaLabel}</a>
      <Script js={SHARED_JS} />
    </div>
  );
}

export const css = `
.strange {
  --paper: color-mix(in srgb, var(--light) 55%, #fbe9d7); --ink: var(--primary);
  --deep: var(--dark); --line: color-mix(in srgb, var(--primary) 30%, transparent);
  background: var(--paper); color: var(--ink); font-family: var(--body); font-size: 16px; line-height: 1.55;
}
.strange h1, .strange h2, .strange h3, .strange .st-big, .strange .st-brand, .strange .st-crew b, .strange blockquote { font-family: var(--heading); font-weight: 400; line-height: .95; }
.st-wrap { width: min(1300px, 100% - 40px); margin-inline: auto; }
.st-label { font-size: .78rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
.st-pill { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 26px; border: 2px solid currentColor; border-radius: 999px; font-weight: 700; font-size: .82rem; letter-spacing: .12em; text-transform: uppercase; transition: transform .2s, background .2s, color .2s; }
.st-pill:hover { transform: rotate(-2deg) scale(1.03); }
.st-pill.solid { background: var(--ink); color: var(--paper); border-color: var(--ink); }

.st-head { position: sticky; top: 0; z-index: 60; background: var(--paper); border-block-end: 2px solid var(--ink); --mm-top: 70px; }
.st-head .st-wrap { display: flex; align-items: center; gap: 28px; min-height: 70px; }
.st-brand { font-size: 1.6rem; margin-inline-end: auto; text-transform: uppercase; letter-spacing: .02em; }
.st-head nav { display: flex; gap: 26px; font-weight: 700; font-size: .8rem; letter-spacing: .14em; text-transform: uppercase; }
.st-head nav a:hover { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; }
.st-ig { font-weight: 800; font-size: .8rem; }
.strange .mm-panel { background: var(--paper); border-block-start: 2px solid var(--ink); }
.strange .mm-panel nav a { font-family: var(--heading); font-size: 2.6rem; text-transform: uppercase; }
.strange .mm-book { background: var(--ink); color: var(--paper); border-radius: 999px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; }

.st-hero { padding-block-end: clamp(50px, 8vw, 110px); }
.st-photo { position: relative; height: min(88svh, 860px); overflow: hidden; }
.st-photo img, .st-photo video { width: 100%; height: 100%; object-fit: cover; }
.st-paint { width: 100%; height: 100%; background: radial-gradient(60% 70% at 30% 30%, color-mix(in srgb, var(--accent) 80%, transparent), transparent), radial-gradient(70% 60% at 80% 80%, var(--primary), transparent), var(--deep); }
.st-photo::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,.45)); }
.st-hero-words { position: absolute; inset: auto 0 6% 0; z-index: 1; text-align: center; color: var(--paper); padding-inline: 20px; }
.st-hero-words h1 { text-transform: uppercase; line-height: .85; letter-spacing: -.01em; }
.st-hero-words p { margin-block-start: 18px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; font-size: .9rem; }
.st-sticker { position: absolute; inset-block-start: 7%; inset-inline-end: 5%; z-index: 2; width: 150px; height: 150px; border-radius: 50%; background: var(--accent); color: var(--deep); display: grid; place-items: center; box-shadow: 0 18px 40px -16px rgba(0,0,0,.5); }
.st-sticker svg { position: absolute; inset: 6px; width: calc(100% - 12px); height: calc(100% - 12px); animation: st-spin 12s linear infinite; }
.st-sticker text { fill: currentColor; font-family: var(--body); font-weight: 800; font-size: 17px; letter-spacing: 3px; }
.st-sticker b { font-size: 1.8rem; }
@keyframes st-spin { to { transform: rotate(360deg); } }
.st-intro { display: grid; grid-template-columns: 1.3fr 1fr; gap: clamp(28px, 5vw, 80px); align-items: end; margin-block-start: clamp(40px, 6vw, 80px); }
.st-big { font-size: clamp(2.4rem, 5.6vw, 5.2rem); }
.st-intro p:not(.st-big) { font-size: 1.15rem; margin-block-end: 26px; color: var(--deep); }

.st-marquee { overflow: hidden; border-block: 2px solid var(--ink); padding-block: 14px; }
.st-marquee > div { display: flex; width: max-content; animation: st-roll 30s linear infinite; }
.st-marquee span { display: flex; }
.st-marquee b { font-family: var(--heading); font-weight: 400; font-size: clamp(2.6rem, 6vw, 5rem); line-height: 1.1; padding-inline: 28px; color: transparent; -webkit-text-stroke: 1.5px var(--ink); white-space: nowrap; text-transform: uppercase; }
.st-marquee b:nth-child(even) { color: var(--ink); -webkit-text-stroke: 0; }
@keyframes st-roll { to { transform: translateX(-50%); } }
[dir=rtl] .st-marquee > div { animation-name: st-roll-rtl; }
@keyframes st-roll-rtl { to { transform: translateX(50%); } }

.st-who { padding-block: clamp(80px, 11vw, 160px); }
.st-who .st-wrap { display: grid; grid-template-columns: 1.1fr 1fr; gap: clamp(30px, 6vw, 100px); align-items: center; }
.st-who h2 { font-size: clamp(3.4rem, 9vw, 8.6rem); text-transform: uppercase; }
.st-who h2 span { display: block; font-style: italic; color: var(--deep); }
.st-who-text { display: grid; gap: 16px; text-transform: uppercase; font-weight: 600; font-size: .98rem; letter-spacing: .02em; }
.st-who-text ul { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; margin-block-start: 8px; }
.st-who-text li { border: 2px solid var(--ink); border-radius: 999px; padding: 6px 14px; font-size: .78rem; letter-spacing: .1em; }

.st-tickets { padding-block: clamp(80px, 10vw, 140px); background: var(--ink); color: var(--paper); }
.st-head2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 60px; align-items: end; margin-block-end: 56px; }
.st-head2 h2 { font-size: clamp(2.8rem, 6.4vw, 6rem); text-transform: uppercase; }
.st-head2 p { font-size: 1.1rem; max-width: 42ch; }
.st-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px 26px; }
.st-ticket { --notch: 14px; position: relative; display: grid; gap: 12px; padding: 26px 26px 0; background: var(--paper); color: var(--ink); transform: rotate(var(--tilt)); transition: transform .3s; -webkit-mask: radial-gradient(circle var(--notch) at 0 calc(100% - 62px), transparent 98%, #000) , radial-gradient(circle var(--notch) at 100% calc(100% - 62px), transparent 98%, #000); -webkit-mask-composite: source-in; mask-composite: intersect; }
.st-ticket:hover { transform: rotate(0) translateY(-6px); }
.st-ticket.in { transform: rotate(var(--tilt)); }
.st-ticket.in:hover { transform: rotate(0) translateY(-6px); }
.st-no { font-weight: 800; font-size: .74rem; letter-spacing: .24em; }
.st-ticket h3 { font-size: 2rem; text-transform: uppercase; }
.st-ticket p { font-size: .95rem; color: var(--deep); min-height: 3em; }
.st-stub { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-inline: -26px; padding: 18px 26px; border-block-start: 2px dashed var(--line); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; font-size: .82rem; }
.st-stub b { font-size: 1rem; }

.st-work { padding-block: clamp(80px, 10vw, 140px); text-align: center; }
.st-work h2 { font-size: clamp(2.8rem, 6.4vw, 6rem); text-transform: uppercase; margin-block-end: 50px; }
.st-polaroids { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(14px, 3vw, 40px); margin-block-end: 50px; }
.st-polaroids a { background: #fff; padding: 12px 12px 46px; box-shadow: 0 20px 40px -24px rgba(0,0,0,.4); transform: rotate(var(--r)); transition: transform .35s; cursor: zoom-in; }
.st-polaroids a.in { transform: rotate(var(--r)); }
.st-polaroids a:hover { transform: rotate(0) scale(1.04); z-index: 2; position: relative; }
.st-polaroids img { width: 100%; aspect-ratio: 1; object-fit: cover; }

.st-crew { padding-block: clamp(60px, 8vw, 110px); border-block-start: 2px solid var(--ink); }
.st-crew ul { list-style: none; display: flex; flex-wrap: wrap; gap: 14px 50px; margin-block-start: 22px; }
.st-crew li { display: grid; }
.st-crew b { font-size: clamp(2.4rem, 5vw, 4.4rem); text-transform: uppercase; }
.st-crew span { font-weight: 700; font-size: .78rem; letter-spacing: .2em; text-transform: uppercase; color: var(--deep); }

.st-love { padding-block: clamp(80px, 10vw, 140px); background: var(--accent); color: var(--deep); }
.st-love h2 { font-size: clamp(2.6rem, 6vw, 5.4rem); text-transform: uppercase; margin-block-end: 44px; max-width: 16ch; }
.st-notes { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
.st-notes figure { background: var(--paper); padding: 28px; border-radius: 4px 4px 22px 4px; display: grid; gap: 18px; }
.st-notes blockquote { font-size: 1.5rem; line-height: 1.15; }
.st-notes figcaption { font-weight: 800; font-size: .8rem; letter-spacing: .16em; text-transform: uppercase; }

.st-faq { padding-block: clamp(70px, 9vw, 120px); }
.st-faq .st-wrap { display: grid; grid-template-columns: 1fr 1.4fr; gap: clamp(30px, 6vw, 90px); }
.st-faq h2 { font-size: clamp(2.4rem, 5vw, 4.4rem); text-transform: uppercase; }
.st-faq details { border-block-end: 2px solid var(--ink); padding-block: 20px; }
.st-faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; gap: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.st-faq summary::-webkit-details-marker { display: none; }
.st-faq summary::after { content: "+"; font-family: var(--heading); font-size: 2rem; line-height: .6; transition: transform .3s; }
.st-faq details[open] summary::after { transform: rotate(45deg); }
.st-faq details p { margin-block-start: 12px; color: var(--deep); }

.st-visit { padding-block: clamp(90px, 12vw, 170px); background: var(--deep); color: var(--paper); }
.st-visit h2 { font-size: clamp(3rem, 8vw, 7.6rem); text-transform: uppercase; max-width: 12ch; margin-block-end: 60px; color: var(--accent); }
.st-visit-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: clamp(28px, 5vw, 70px); align-items: start; }
.st-addr { font-family: var(--heading); font-size: 1.8rem; line-height: 1.1; margin-block: 12px; }
.st-open { margin-block: 6px 12px; font-weight: 700; font-size: .8rem; letter-spacing: .1em; text-transform: uppercase; }
.st-visit dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 12px; border-block-end: 1px dashed color-mix(in srgb, var(--paper) 30%, transparent); }
.st-visit dt { font-weight: 700; text-transform: uppercase; letter-spacing: .1em; font-size: .82rem; }
.st-visit-cta { display: grid; gap: 12px; }
.st-visit .st-pill.solid { background: var(--accent); color: var(--deep); border-color: var(--accent); }

.st-foot { padding-block: 26px; background: var(--deep); color: color-mix(in srgb, var(--paper) 70%, transparent); border-block-start: 1px solid color-mix(in srgb, var(--paper) 15%, transparent); font-size: .8rem; letter-spacing: .14em; text-transform: uppercase; }
.st-foot .st-wrap { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.st-foot span:last-child { display: flex; gap: 20px; }

.st-float { display: none; }
@media (max-width: 860px) {
  .st-photo { height: 74svh; }
  .st-sticker { width: 110px; height: 110px; }
  .st-intro, .st-who .st-wrap, .st-head2, .st-faq .st-wrap, .st-visit-grid { grid-template-columns: 1fr; }
  .st-polaroids { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .st-foot { padding-block-end: 96px; }
  .st-float { display: flex; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; justify-content: center; padding: 16px; border-radius: 999px; background: var(--ink); color: var(--paper); font-weight: 800; letter-spacing: .12em; text-transform: uppercase; font-size: .82rem; transform: translateY(150%); transition: transform .4s; }
  .strange[data-scrolled] .st-float { transform: none; }
}
`;
