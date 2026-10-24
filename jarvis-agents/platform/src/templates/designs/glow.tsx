// GLOW: soft, modern, warm. A floating pill menu, their reel framed in a
// rounded card over a soft photo, a service explorer you tap through (works
// with no script at all), a fanned stack of photos. Reference: Suite Caroline.

import { DemoRibbon, Paragraphs, Stars, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, navLinks, type DesignProps } from "./shared";

export function Glow({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const photos = c.gallery;
  const links = navLinks(d, { about: true, work: true, reviews: true });
  const words = c.headline.split(" ");
  const last = words.pop();
  return (
    <div className="dsite glow" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="gl-head">
        <div className="gl-pill">
          <a className="gl-brand" href="#top">{c.logoUrl && <img src={c.logoUrl} alt="" />}<span>{biz.name}</span></a>
          <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
          <a className="gl-btn desk" href={d.bookHref}>{c.ctaLabel}</a>
          <MobileMenu d={d} links={links} />
        </div>
      </header>

      <section className="gl-hero" id="top">
        {c.heroImage && <img className="gl-haze" src={c.heroImage} alt="" aria-hidden="true" />}
        <div className="gl-wrap">
          <p className="gl-chip"><OpenBadge d={d} />{!d.opening.length && c.tagline}</p>
          <h1>{words.join(" ")} <em>{last}</em></h1>
          <p className="gl-lead">{c.subheadline}</p>
          <div className="gl-actions">
            <a className="gl-btn big" href={d.bookHref}>{c.ctaLabel}</a>
            {c.rating != null && <span className="gl-rate"><Stars n={Math.round(c.rating)} /><b>{c.rating.toFixed(1)}</b>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : ""}</span>}
          </div>
          <div className="gl-card">
            {c.heroVideo ? <video src={c.heroVideo} poster={c.heroImage ?? undefined} autoPlay muted loop playsInline />
              : c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : <div className="gl-soft"><span>{c.tagline}</span></div>}
          </div>
        </div>
      </section>

      <section className="gl-explore" id="services">
        <div className="gl-wrap">
          <div className="gl-sec-head" data-reveal>
            <p className="gl-kicker">{L.sec_services_kicker}</p>
            <h2>{L.pick_service}</h2>
            <p>{L.pick_service_sub}</p>
          </div>
          <div className="gl-tabs" data-reveal>
            {services.map((s, i) => (
              <div key={s.id} className="gl-tab">
                <input type="radio" name="gl-service" id={`gl-s${i}`} defaultChecked={i === 0} />
                <label htmlFor={`gl-s${i}`}>{s.name}</label>
                <article className="gl-panel">
                  {photos[i] ? <img src={photos[i]} alt="" loading="lazy" /> : <div className="gl-panel-art">{s.name.slice(0, 1)}</div>}
                  <div>
                    <h3>{s.name}</h3>
                    <p>{s.description}</p>
                    <dl>
                      <div><dt>{L.duration}</dt><dd>{s.durationMin} {L.min}</dd></div>
                      {s.price && <div><dt>{L.price}</dt><dd>{s.price}</dd></div>}
                    </dl>
                    <a className="gl-btn" href={d.bookHref}>{L.book_this}</a>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gl-about" id="about">
        <div className="gl-wrap">
          {photos.length >= 3 && (
            <div className="gl-fan" id="work" aria-label={L.sec_gallery_title}>
              {photos.slice(0, 4).map((src, i) => (
                <a key={src} href={src} data-lightbox={src} style={{ ["--i" as string]: String(i) }}><img src={src} alt="" loading="lazy" /></a>
              ))}
            </div>
          )}
          <div data-reveal>
            <p className="gl-kicker">{L.sec_about_kicker}</p>
            <h2>{c.aboutTitle}</h2>
            <Paragraphs text={c.about} />
            <ul>{c.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </div>
        </div>
      </section>

      {c.reviews.length > 0 && (
        <section className="gl-love" id="reviews">
          <div className="gl-wrap">
            <h2 data-reveal>{L.sec_reviews_title}</h2>
            <div className="gl-quotes">
              {c.reviews.slice(0, 3).map((r, i) => (
                <figure key={i} data-reveal>
                  <Stars n={r.rating} />
                  <blockquote>“{r.text}”</blockquote>
                  <figcaption data-review-author={r.author}><span>{r.author.slice(0, 1)}</span>{r.author}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {staff.length > 0 && (
        <section className="gl-team">
          <div className="gl-wrap">
            <h2 data-reveal>{L.sec_team_title}</h2>
            <div className="gl-faces">{staff.map((p, i) => (
              <div key={p.id} data-reveal>
                <span style={{ ["--h" as string]: String(i * 40) }}>{p.name.slice(0, 1)}</span>
                <b>{p.name}</b><small>{p.title}</small>
              </div>
            ))}</div>
          </div>
        </section>
      )}

      {c.faqs.length > 0 && (
        <section className="gl-faq">
          <div className="gl-wrap">
            <h2 data-reveal>{L.sec_faq_title}</h2>
            <div>{c.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
          </div>
        </section>
      )}

      <section className="gl-visit" id="visit">
        <div className="gl-wrap">
          <div className="gl-visit-card" data-reveal>
            <div>
              <h2>{L.sec_cta_title}</h2>
              {biz.address && <p>{biz.address}</p>}
              <OpenBadge d={d} className="gl-open" />
              <div className="gl-actions">
                <a className="gl-btn big" href={d.bookHref}>{c.ctaLabel}</a>
                {d.mapsHref && <a className="gl-btn ghost" href={d.mapsHref}>{L.directions}</a>}
              </div>
            </div>
            <dl>
              {d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}
              {biz.phone && <div><dt>{L.call}</dt><dd><a href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a></dd></div>}
            </dl>
          </div>
        </div>
      </section>

      <footer className="gl-foot">
        <div className="gl-wrap">
          <b>{biz.name}</b>
          <span>{c.instagram && <a href={c.instagram}>Instagram</a>}{c.facebook && <a href={c.facebook}>Facebook</a>}</span>
          <span>© {d.year}</span>
        </div>
      </footer>

      <a className="gl-float" href={d.bookHref}>{c.ctaLabel}</a>
      <Script js={SHARED_JS} />
    </div>
  );
}

export const css = `
.glow {
  --bg: color-mix(in srgb, var(--light) 80%, #fff); --ink: var(--dark); --rose: var(--primary);
  --soft: color-mix(in srgb, var(--primary) 14%, #fff); --muted: color-mix(in srgb, var(--dark) 60%, var(--bg)); --line: color-mix(in srgb, var(--dark) 12%, transparent);
  background: var(--bg); color: var(--ink); font-family: var(--body); font-size: 16px; line-height: 1.6;
}
.glow h1, .glow h2, .glow h3, .glow .gl-brand, .glow .gl-faces b, .glow .gl-foot b { font-family: var(--heading); font-weight: 400; line-height: 1.05; letter-spacing: -0.01em; }
.glow em { font-style: italic; color: var(--rose); }
.gl-wrap { width: min(1220px, 100% - 40px); margin-inline: auto; }
.gl-kicker { font-size: .8rem; font-weight: 600; color: var(--rose); letter-spacing: .08em; }
.gl-btn { display: inline-flex; align-items: center; justify-content: center; padding: 12px 22px; border-radius: 999px; background: var(--rose); color: #fff; font-weight: 600; font-size: .92rem; transition: transform .2s, box-shadow .2s; box-shadow: 0 10px 24px -12px var(--rose); white-space: nowrap; }
.gl-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -12px var(--rose); }
.gl-btn.big { padding: 16px 30px; font-size: 1rem; }
.gl-btn.ghost { background: #fff; color: var(--ink); box-shadow: none; border: 1px solid var(--line); }
.gl-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 22px; }

.gl-head { position: sticky; top: 12px; z-index: 60; padding-inline: 12px; --mm-top: 88px; }
.gl-pill { width: min(1220px, 100%); margin: 12px auto 0; display: flex; align-items: center; gap: 26px; padding-block: 10px; padding-inline: 22px 10px; border-radius: 999px; background: rgba(255,255,255,.78); backdrop-filter: blur(16px); box-shadow: 0 10px 40px -20px rgba(0,0,0,.25); }
.gl-brand { display: flex; align-items: center; gap: 10px; font-size: 1.3rem; margin-inline-end: auto; }
.gl-brand img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.gl-pill nav { display: flex; gap: 24px; font-size: .92rem; font-weight: 500; }
.gl-pill nav a:hover { color: var(--rose); }
.glow .mm { padding-inline-end: 12px; }
.glow .mm-panel { background: var(--bg); border-radius: 24px 24px 0 0; }
.glow .mm-panel nav a { font-family: var(--heading); font-size: 2.2rem; }
.glow .mm-book { background: var(--rose); color: #fff; border-radius: 999px; font-weight: 600; }

.gl-hero { position: relative; padding-block: clamp(50px, 8vw, 110px) clamp(60px, 8vw, 110px); overflow: hidden; text-align: center; }
.gl-haze { position: absolute; inset: -10%; width: 120%; height: 120%; object-fit: cover; filter: blur(60px) saturate(1.3); opacity: .35; z-index: 0; }
.gl-hero .gl-wrap { position: relative; display: grid; justify-items: center; gap: 22px; }
.gl-chip { display: inline-flex; gap: 10px; align-items: center; padding: 8px 16px; border-radius: 999px; background: #fff; font-size: .84rem; font-weight: 500; box-shadow: 0 6px 20px -12px rgba(0,0,0,.3); }
.gl-hero h1 { font-size: clamp(2.8rem, 7vw, 6.4rem); max-width: 15ch; }
.gl-lead { max-width: 52ch; color: var(--muted); font-size: 1.12rem; }
.gl-hero .gl-actions { justify-content: center; }
.gl-rate { display: inline-flex; align-items: center; gap: 8px; font-size: .88rem; color: var(--muted); }
.gl-rate b { color: var(--ink); }
.glow .stars { color: #f5a623; display: inline-flex; }
.gl-card { width: min(980px, 100%); aspect-ratio: 16 / 9; margin-block-start: 30px; border-radius: 32px; overflow: hidden; box-shadow: 0 50px 100px -50px color-mix(in srgb, var(--rose) 70%, #000); transform: perspective(1200px) rotateX(6deg); transition: transform .8s; }
.gl-card:hover { transform: none; }
.gl-card img, .gl-card video { width: 100%; height: 100%; object-fit: cover; }
.gl-soft { width: 100%; height: 100%; display: grid; place-items: center; background: radial-gradient(60% 80% at 25% 30%, color-mix(in srgb, var(--accent) 70%, #fff), transparent), radial-gradient(60% 80% at 80% 70%, color-mix(in srgb, var(--rose) 60%, #fff), transparent), var(--soft); }
.gl-soft span { font-family: var(--heading); font-size: clamp(1.6rem, 4vw, 3rem); color: #fff; text-shadow: 0 2px 20px rgba(0,0,0,.15); padding: 20px; }

.gl-explore { padding-block: clamp(70px, 9vw, 130px); background: #fff; border-radius: 40px 40px 0 0; }
.gl-sec-head { text-align: center; display: grid; justify-items: center; gap: 12px; margin-block-end: 40px; }
.gl-sec-head h2 { font-size: clamp(2.2rem, 5vw, 4.2rem); }
.gl-sec-head p:last-child { color: var(--muted); }
.gl-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.gl-tab { display: contents; }
.gl-tab input { position: absolute; opacity: 0; pointer-events: none; }
.gl-tab label { order: 0; cursor: pointer; padding: 12px 20px; border-radius: 999px; background: var(--soft); font-weight: 600; font-size: .95rem; transition: background .2s, color .2s; }
.gl-tab label:hover { background: color-mix(in srgb, var(--rose) 24%, #fff); }
.gl-tab input:checked + label { background: var(--ink); color: #fff; }
.gl-tab input:focus-visible + label { outline: 2px solid var(--rose); outline-offset: 3px; }
.gl-panel { order: 1; flex: 0 0 100%; display: none; grid-template-columns: 1fr 1fr; gap: clamp(20px, 4vw, 60px); align-items: center; margin-block-start: 30px; padding: clamp(18px, 3vw, 30px); border-radius: 32px; background: var(--bg); text-align: start; animation: gl-in .45s ease; }
.gl-tab input:checked ~ .gl-panel { display: grid; }
@keyframes gl-in { from { opacity: 0; transform: translateY(12px); } }
.gl-panel img, .gl-panel-art { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 24px; }
.gl-panel-art { display: grid; place-items: center; background: var(--soft); font-family: var(--heading); font-size: 6rem; color: var(--rose); }
.gl-panel h3 { font-size: clamp(2rem, 4vw, 3.2rem); margin-block-end: 12px; }
.gl-panel p { color: var(--muted); margin-block-end: 20px; }
.gl-panel dl { display: flex; gap: 30px; margin-block-end: 24px; }
.gl-panel dt { font-size: .78rem; color: var(--muted); }
.gl-panel dd { font-family: var(--heading); font-size: 1.6rem; }

.gl-about { padding-block: clamp(80px, 10vw, 140px); background: #fff; }
.gl-about .gl-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(40px, 7vw, 120px); align-items: center; }
.gl-about .gl-wrap > div:only-child { grid-column: 1 / -1; max-width: 760px; }
.gl-about h2 { font-size: clamp(2.2rem, 4.6vw, 3.8rem); margin-block: 12px 22px; }
.gl-about p { color: var(--muted); margin-block-end: 14px; }
.gl-about ul { list-style: none; display: grid; gap: 10px; margin-block-start: 22px; }
.gl-about li { display: flex; gap: 12px; align-items: center; font-weight: 500; }
.gl-about li::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--rose); box-shadow: 0 0 0 5px var(--soft); flex: none; }
.gl-fan { position: relative; height: clamp(360px, 42vw, 520px); }
.gl-fan a { position: absolute; inset-block-start: 6%; inset-inline-start: 18%; width: 62%; aspect-ratio: 3 / 4; border-radius: 26px; overflow: hidden; box-shadow: 0 30px 60px -30px rgba(0,0,0,.4); transform: rotate(calc((var(--i) - 1.5) * 7deg)) translateX(calc((var(--i) - 1.5) * 14%)); transition: transform .5s ease; cursor: zoom-in; border: 6px solid #fff; }
.gl-fan:hover a { transform: rotate(calc((var(--i) - 1.5) * 12deg)) translateX(calc((var(--i) - 1.5) * 30%)); }
.gl-fan img { width: 100%; height: 100%; object-fit: cover; }

.gl-love { padding-block: clamp(80px, 10vw, 140px); }
.gl-love h2 { font-size: clamp(2.2rem, 5vw, 4.2rem); text-align: center; margin-block-end: 44px; }
.gl-quotes { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 18px; }
.gl-quotes figure { background: #fff; border-radius: 28px; padding: 30px; display: grid; gap: 16px; align-content: start; box-shadow: 0 20px 50px -36px rgba(0,0,0,.3); }
.gl-quotes blockquote { font-size: 1.08rem; }
.gl-quotes figcaption { display: flex; gap: 10px; align-items: center; font-weight: 600; }
.gl-quotes figcaption span { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--soft); color: var(--rose); font-family: var(--heading); }

.gl-team { padding-block: clamp(60px, 8vw, 110px); text-align: center; }
.gl-team h2 { font-size: clamp(2rem, 4.4vw, 3.6rem); margin-block-end: 36px; }
.gl-faces { display: flex; flex-wrap: wrap; justify-content: center; gap: 30px 50px; }
.gl-faces > div { display: grid; justify-items: center; gap: 6px; }
.gl-faces span { width: 120px; height: 120px; border-radius: 50%; display: grid; place-items: center; font-family: var(--heading); font-size: 3rem; color: #fff; background: linear-gradient(140deg, color-mix(in srgb, var(--rose) 80%, #fff), color-mix(in srgb, var(--accent) 80%, #fff)); filter: hue-rotate(calc(var(--h) * 1deg)); }
.gl-faces b { font-size: 1.5rem; }
.gl-faces small { color: var(--muted); }

.gl-faq { padding-block: clamp(60px, 8vw, 110px); }
.gl-faq .gl-wrap { display: grid; grid-template-columns: 1fr 1.4fr; gap: clamp(30px, 6vw, 90px); }
.gl-faq h2 { font-size: clamp(2rem, 4.4vw, 3.6rem); }
.gl-faq details { background: #fff; border-radius: 22px; padding: 20px 24px; margin-block-end: 10px; }
.gl-faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; gap: 20px; font-weight: 600; }
.gl-faq summary::-webkit-details-marker { display: none; }
.gl-faq summary::after { content: "+"; color: var(--rose); font-size: 1.4rem; line-height: 1; }
.gl-faq details[open] summary::after { content: "−"; }
.gl-faq details p { margin-block-start: 10px; color: var(--muted); }

.gl-visit { padding-block: 0 clamp(60px, 8vw, 100px); }
.gl-visit-card { display: grid; grid-template-columns: 1.2fr 1fr; gap: clamp(30px, 6vw, 90px); padding: clamp(30px, 5vw, 70px); border-radius: 40px; background: linear-gradient(140deg, var(--soft), color-mix(in srgb, var(--accent) 22%, #fff)); }
.gl-visit h2 { font-size: clamp(2.4rem, 5.6vw, 4.8rem); margin-block-end: 18px; }
.gl-visit p { color: var(--muted); font-size: 1.1rem; }
.gl-open { margin-block: 14px 26px; font-weight: 600; font-size: .9rem; }
.gl-visit dl { background: rgba(255,255,255,.7); border-radius: 26px; padding: 10px 24px; align-self: start; }
.gl-visit dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 14px; border-block-end: 1px solid var(--line); }
.gl-visit dl div:last-child { border: 0; }

.gl-foot { padding-block: 30px 40px; }
.gl-foot .gl-wrap { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; color: var(--muted); }
.gl-foot b { font-size: 1.6rem; color: var(--ink); }
.gl-foot span { display: flex; gap: 20px; }

.gl-float { position: fixed; inset-block-end: 20px; inset-inline: 0; margin-inline: auto; width: max-content; z-index: 70; padding: 15px 30px; border-radius: 999px; background: var(--ink); color: #fff; font-weight: 600; box-shadow: 0 20px 40px -16px rgba(0,0,0,.5); transform: translateY(160%); transition: transform .45s cubic-bezier(.2,.9,.3,1.2); }
.glow[data-scrolled] .gl-float { transform: none; }

@media (max-width: 860px) {
  .gl-head { top: 8px; --mm-top: 80px; }
  .gl-pill { padding-inline-start: 18px; }
  .gl-card { aspect-ratio: 4 / 5; border-radius: 26px; transform: none; }
  .gl-panel, .gl-about .gl-wrap, .gl-faq .gl-wrap, .gl-visit-card { grid-template-columns: 1fr; }
  .gl-tabs { justify-content: flex-start; }
  .gl-fan { height: 380px; }
  .gl-foot { padding-block-end: 100px; }
}
`;
