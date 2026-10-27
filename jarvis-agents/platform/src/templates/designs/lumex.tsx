// LUMEX: immersive glass-and-water dental. A live 3D chrome tooth floats behind
// a giant serif headline, then returns in a "lab" you can turn and switch to
// porcelain. Ported from the Signature library (08-lumex-aesthetics), filled
// with the business's real details and coloured by their brand.

import { DemoRibbon, Icon, Paragraphs, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, type DesignProps } from "./shared";
import { TOOTH_JS } from "./tooth3d";

// "Calm, careful dentistry for the whole family" -> ["Calm, careful", "dentistry for the whole family"]
function splitHeadline(text: string) {
  const words = text.split(" ");
  const cut = Math.max(1, Math.min(3, Math.floor(words.length / 2)));
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

// the last two words of a title in italics: "Dentistry without the" / "dread"
function emTail(text: string, n = 2) {
  const words = text.split(" ");
  if (words.length <= n) return ["", text];
  return [words.slice(0, -n).join(" "), words.slice(-n).join(" ")];
}

export function Lumex({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const [h1a, h1b] = splitHeadline(c.headline);
  const [aboutA, aboutB] = emTail(c.aboutTitle);
  const [ctaA, ctaB] = emTail(L.sec_cta_title, 1);
  const quote = c.reviews[0];
  const links: [string, string][] = [
    ["#experience", L.nav_about], ["#services", L.nav_services], ["#lab", L.live_3d],
    ...(staff.length || quote ? [["#people", L.sec_team_kicker] as [string, string]] : []),
    ["#visit", L.nav_visit],
  ];
  const ticker = c.highlights.length ? c.highlights : [c.tagline];
  return (
    <div className="dsite lumex" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="lx-header">
        <a className="lx-logo" href="#top">{c.logoUrl && <img src={c.logoUrl} alt="" />}<span>{biz.name}</span></a>
        <nav className="lx-nav desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        <a className="lx-cta desk" href={d.bookHref}>{c.ctaLabel} <span>↗</span></a>
        <MobileMenu d={d} links={links} />
      </header>

      <section className="lx-hero" id="top" data-3d-host>
        <div className="lx-glow" /><div className="lx-grain" />
        <i className="lx-sphere s1" /><i className="lx-sphere s2" /><i className="lx-sphere s3" /><i className="lx-sphere s4" />
        <p className="lx-kicker"><span>✳</span> {c.tagline}{biz.city && <> <span className="lx-line" /> {biz.city}</>}</p>
        <div className="lx-art">
          <canvas data-tooth-3d data-scale=".65" tabIndex={0} aria-label={L.drag_rotate} />
          <div className="lx-fallback">{c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : null}</div>
        </div>
        <div className="lx-copy">
          <h1><em>{h1a}</em><span>{h1b}</span></h1>
          <p className="lx-sub">{c.subheadline}</p>
          <div className="lx-buttons">
            <a className="lx-pill light" href={d.bookHref}>{c.ctaLabel} <span>↗</span></a>
            <a className="lx-pill glass" href="#services">{L.nav_services} <span>↗</span></a>
          </div>
        </div>
        {c.rating != null && (
          <div className="lx-seal"><span>{L.google_rating}</span><b>{c.rating.toFixed(1)}</b><span>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : "★★★★★"}</span></div>
        )}
        <div className="lx-bottom">
          <span className="desk"><span className="lx-orbit">✳</span> {L.in_the_details}</span>
          <span className="lx-drag"><span>↔</span> {L.drag_rotate}</span>
          <a href="#experience" className="lx-scroll">{L.scroll_explore} <span>↓</span></a>
        </div>
      </section>

      <div className="lx-ticker" aria-hidden="true">
        <div>{[0, 1, 2].map((k) => <span key={k}>{ticker.map((t, i) => <span key={i}><span>{t}</span><b>✳</b></span>)}</span>)}</div>
      </div>

      <section className="lx-intro lx-width" id="experience">
        <div className="lx-side"><span className="lx-eyebrow">01 / {L.sec_about_kicker}</span><span className="lx-star">✳</span></div>
        <div className="lx-intro-copy" data-reveal>
          <h2>{aboutA}<br /><em>{aboutB}</em></h2>
          <Paragraphs text={c.about} />
          <a className="lx-text-link" href="#lab">{L.closer_look} <span>↗</span></a>
        </div>
        <aside className="lx-note" data-reveal>
          <div className="lx-orb" />
          <OpenBadge d={d} className="lx-open" />
          <ul>{c.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
        </aside>
      </section>

      <section className="lx-services lx-width" id="services">
        <div className="lx-head" data-reveal>
          <div><span className="lx-eyebrow">02 / {L.sec_services_kicker}</span><h2>{emTail(L.sec_services_title)[0]}<br /><em>{emTail(L.sec_services_title)[1]}</em></h2></div>
          <p>{L.sec_services_intro}</p>
        </div>
        <div className="lx-grid">
          {services.map((s, i) => (
            <a key={s.id} className={`lx-card v${i % 3}`} href={d.bookHref} data-reveal>
              <div className="lx-card-top"><span>{String(i + 1).padStart(2, "0")} / {s.durationMin} {L.min}</span><span>✳</span></div>
              <div className="lx-sculpt" aria-hidden="true"><Icon name={s.icon} size={150} /><i /></div>
              <div className="lx-card-bottom">
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                {s.price && <b>{s.price}</b>}
                <span className="lx-arrow">↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="lx-lab" id="lab" data-3d-host>
        <div className="lx-lab-inner lx-width">
          <div className="lx-lab-intro" data-reveal>
            <span className="lx-eyebrow">03 / {L.lab_kicker}</span>
            <h2>{L.lab_title}<br /><em>{L.lab_title_em}</em></h2>
            <p>{L.lab_text}</p>
            <div className="lx-views" data-tooth-controls="#lx-lab-tooth">
              <button type="button" data-mat="chrome" aria-pressed="true">{L.view_chrome}</button>
              <button type="button" data-mat="pearl" aria-pressed="false">{L.view_porcelain}</button>
              <button type="button" className="lx-rot" data-rotate>{L.rotate_turn} ↗</button>
            </div>
            <p className="lx-caption">← {L.drag_rotate}</p>
          </div>
          <div className="lx-viewer">
            <div className="lx-viewer-glow" />
            <canvas id="lx-lab-tooth" data-tooth-3d data-scale=".72" tabIndex={0} aria-label={L.drag_rotate} />
            <div className="lx-fallback">{c.gallery[0] ? <img src={c.gallery[0]} alt="" /> : null}</div>
            <span className="lx-cross one">+</span><span className="lx-cross two">+</span>
            <span className="lx-tag">{biz.name.toUpperCase()} <span>● {L.live_3d}</span></span>
          </div>
        </div>
      </section>

      <section className="lx-journey lx-width">
        <div className="lx-head" data-reveal>
          <div><span className="lx-eyebrow">04 / {L.sec_steps_kicker}</span><h2>{emTail(L.sec_steps_title)[0]}<br /><em>{emTail(L.sec_steps_title)[1]}</em></h2></div>
        </div>
        <div className="lx-steps">
          {[[L.step1_title, L.step1], [L.step2_title, L.step2], [L.step3_title, L.step3]].map(([t, p], i) => (
            <div key={i} className="lx-step" data-reveal><span>0{i + 1}</span><h3>{t}</h3><p>{p}</p></div>
          ))}
        </div>
      </section>

      {(staff.length > 0 || quote) && (
        <section className="lx-people" id="people">
          <div className="lx-people-left">
            <span className="lx-eyebrow">05 / {L.sec_team_kicker}</span>
            <h2>{emTail(L.sec_team_title, 1)[0]}<br /><em>{emTail(L.sec_team_title, 1)[1]}</em></h2>
            {staff.length > 0 && <ul className="lx-team">{staff.map((p) => <li key={p.id}><b>{p.name}</b><span>{p.title}</span></li>)}</ul>}
            <a className="lx-pill dark" href={d.bookHref}>{c.ctaLabel} <span>↗</span></a>
          </div>
          <div className="lx-people-right">
            <div className="lx-portrait">
              {c.gallery[1] ? <img src={c.gallery[1]} alt="" loading="lazy" /> : <div className="lx-portrait-shape" />}
              {quote && (
                <div className="lx-portrait-overlay">
                  <span className="lx-ast">✳</span>
                  <div className="lx-blur" />
                  <p>“{quote.text}”</p>
                  <span data-review-author={quote.author}>{quote.author} · {"★".repeat(quote.rating)}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {c.faqs.length > 0 && (
        <section className="lx-faq lx-width" id="faq">
          <div><span className="lx-eyebrow">06 / ✳</span><h2>{emTail(L.sec_faq_title, 1)[0]}<br /><em>{emTail(L.sec_faq_title, 1)[1]}</em></h2></div>
          <div className="lx-faq-list">{c.faqs.map((f) => <details key={f.q}><summary>{f.q} <span>+</span></summary><p>{f.a}</p></details>)}</div>
        </section>
      )}

      <section className="lx-last" id="visit">
        <div className="lx-halo" />
        <span className="lx-eyebrow">{L.sec_contact_kicker}</span>
        <h2>{ctaA}<br /><em>{ctaB}</em></h2>
        <p>{c.subheadline}</p>
        <a className="lx-pill light" href={d.bookHref}>{c.ctaLabel} <span>↗</span></a>
        <div className="lx-visit">
          <div>
            {biz.address && <p>{biz.address}</p>}
            <OpenBadge d={d} />
            <p className="lx-visit-links">
              {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a>}
              {d.mapsHref && <a href={d.mapsHref}>{L.directions} ↗</a>}
            </p>
          </div>
          <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
        </div>
      </section>

      <footer className="lx-footer lx-width">
        <a className="lx-logo" href="#top">{biz.name}</a>
        <span>© {d.year} · {c.tagline}</span>
        <div>{c.instagram && <a href={c.instagram}>Instagram</a>}{c.facebook && <a href={c.facebook}>Facebook</a>}<a href="#top">↑</a></div>
      </footer>

      <a className="lx-sticky" href={d.bookHref}>{c.ctaLabel} <span>↗</span></a>
      <Script js={SHARED_JS + TOOTH_JS} />
    </div>
  );
}

const DEEP = "color-mix(in srgb, var(--dark) 82%, var(--primary))";

export const css = `
.lumex {
  --ink: var(--dark); --deep: ${DEEP};
  --mint: color-mix(in srgb, var(--primary) 40%, #fff); --frost: color-mix(in srgb, var(--light) 80%, #fff);
  --off: color-mix(in srgb, var(--light) 30%, #fbfcfb); --muted: color-mix(in srgb, var(--dark) 55%, #fff);
  --soft-em: color-mix(in srgb, var(--primary) 55%, #fff);
  background: var(--off); color: var(--ink); font-family: var(--body); -webkit-font-smoothing: antialiased;
}
.lumex p { line-height: 1.7; }
.lumex h2 { font-family: var(--body); font-weight: 400; letter-spacing: -.06em; line-height: 1.02; }
.lumex h1 em, .lumex h2 em, .lx-seal b, .lx-portrait-overlay p { font-family: var(--heading); font-weight: 400; font-style: italic; letter-spacing: -.03em; }
.lx-width { width: min(1336px, calc(100% - 110px)); margin-inline: auto; }
.lx-eyebrow { font-weight: 700; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; }

.lx-header { height: 76px; display: flex; align-items: center; gap: 30px; padding-inline: clamp(24px, 5.5vw, 90px); position: absolute; inset: auto 0 auto 0; z-index: 30; border-block-end: 1px solid color-mix(in srgb, var(--frost) 22%, transparent); color: var(--frost); backdrop-filter: blur(12px); background: color-mix(in srgb, var(--deep) 14%, transparent); --mm-top: 76px; }
.lx-logo { display: inline-flex; align-items: center; gap: 10px; font: 700 22px var(--body); letter-spacing: -.06em; margin-inline-end: auto; white-space: nowrap; }
.lx-logo img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.lx-nav { display: flex; gap: 32px; }
.lx-nav a { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; transition: opacity .2s; }
.lx-nav a:hover { opacity: .6; }
.lx-cta { border: 1px solid color-mix(in srgb, #fff 50%, transparent); background: color-mix(in srgb, #fff 10%, transparent); padding: 11px 17px; border-radius: 6px; color: #fff; font-size: 11px; display: flex; gap: 20px; align-items: center; transition: background .2s; }
.lx-cta:hover { background: color-mix(in srgb, #fff 20%, transparent); }
.lumex .mm-panel { background: var(--deep); color: var(--frost); }
.lumex .mm-panel nav a { font-family: var(--heading); font-style: italic; font-size: 2.2rem; }
.lumex .mm-book { background: var(--frost); color: var(--deep); border-radius: 6px; font-weight: 600; }

.lx-hero { height: max(735px, 100svh); max-height: 1020px; position: relative; color: #fff; isolation: isolate; overflow: hidden;
  background:
    radial-gradient(ellipse 18% 35% at 55% 29%, color-mix(in srgb, var(--light) 80%, transparent), transparent 90%),
    radial-gradient(ellipse 29% 31% at 74% 54%, color-mix(in srgb, var(--accent) 50%, transparent), transparent 95%),
    radial-gradient(ellipse 30% 40% at 22% 38%, color-mix(in srgb, var(--primary) 60%, transparent), transparent 100%),
    radial-gradient(ellipse 45% 52% at 48% 58%, color-mix(in srgb, var(--primary) 65%, #fff), color-mix(in srgb, var(--primary) 70%, var(--dark)) 69%, var(--deep) 115%); }
.lx-hero::before { content: ""; position: absolute; inset: -12%; background: linear-gradient(118deg, transparent 7%, color-mix(in srgb, var(--light) 20%, transparent) 29%, transparent 43%, color-mix(in srgb, var(--accent) 12%, transparent) 67%, transparent 87%); filter: blur(45px); animation: lx-mists 15s ease-in-out infinite alternate; z-index: 0; }
.lx-hero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--deep) 30%, transparent), transparent 32%, transparent 68%, color-mix(in srgb, var(--deep) 45%, transparent)); z-index: 1; pointer-events: none; }
.lx-glow { position: absolute; inset-inline-start: 30%; inset-block-start: 5%; width: 42vw; height: 40vw; max-width: 750px; max-height: 750px; background: radial-gradient(circle, color-mix(in srgb, var(--light) 40%, transparent), transparent 68%); filter: blur(40px); }
.lx-grain { position: absolute; inset: 0; pointer-events: none; z-index: 8; opacity: .11; background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.56%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22180%22 height=%22180%22 filter=%22url(%23n)%22 opacity=%22.44%22/%3E%3C/svg%3E'); }
.lx-art { position: absolute; inset: 3% 0 0; z-index: 2; display: flex; justify-content: center; align-items: center; pointer-events: none; }
.lx-art canvas { width: min(1100px, 100%); height: 100%; pointer-events: auto; cursor: grab; touch-action: pan-y; filter: drop-shadow(0 30px 42px color-mix(in srgb, var(--deep) 40%, transparent)); }
.lx-art canvas:active { cursor: grabbing; }
.lx-fallback { display: none; }
.no-3d canvas { display: none; }
.no-3d .lx-fallback { display: block; position: absolute; inset: 14% 22%; border-radius: 40% 40% 30% 30%; overflow: hidden; opacity: .55; }
.no-3d .lx-fallback img { width: 100%; height: 100%; object-fit: cover; }
.lx-kicker { position: absolute; inset-block-start: 116px; inset-inline-start: clamp(24px, 5.5vw, 90px); display: flex; align-items: center; gap: 18px; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; z-index: 5; color: var(--frost); }
.lx-line { width: 48px; height: 1px; background: color-mix(in srgb, var(--frost) 60%, transparent); }
.lx-copy { position: absolute; inset-block-start: 41%; inset-inline: 3%; z-index: 6; text-align: center; pointer-events: none; }
.lx-hero h1 { margin: 0 auto 14px; line-height: .91; }
.lx-hero h1 em { display: block; font-size: clamp(64px, 8.4vw, 140px); color: #fff; text-shadow: 0 2px 18px color-mix(in srgb, var(--deep) 35%, transparent); }
.lx-hero h1 span { display: block; font: 500 clamp(34px, 5.6vw, 96px)/1 var(--body); letter-spacing: -.07em; color: var(--deep); text-transform: uppercase; }
.lx-sub { font-size: clamp(13px, 1vw, 15px); margin: 24px auto 20px; max-width: 46ch; color: color-mix(in srgb, #fff 92%, var(--light)); text-shadow: 0 2px 12px color-mix(in srgb, var(--deep) 60%, transparent); }
.lx-buttons { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; pointer-events: auto; }
.lx-pill { display: inline-flex; gap: 30px; align-items: center; justify-content: center; border: 1px solid transparent; padding: 15px 23px; border-radius: 5px; font-size: 11px; line-height: 1.2; font-weight: 600; transition: transform .25s, background .25s; white-space: nowrap; }
.lx-pill:hover { transform: translateY(-3px); }
.lx-pill.light { background: var(--frost); color: var(--deep); }
.lx-pill.glass { color: #fff; border-color: color-mix(in srgb, #fff 55%, transparent); background: color-mix(in srgb, #fff 10%, transparent); backdrop-filter: blur(5px); }
.lx-pill.dark { background: var(--deep); color: #fff; }
.lx-seal { border: 1px solid color-mix(in srgb, #fff 60%, transparent); border-radius: 50%; width: 124px; height: 124px; position: absolute; inset-inline-end: 8%; inset-block-start: 36%; z-index: 5; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-align: center; box-shadow: inset 0 0 0 6px color-mix(in srgb, #fff 7%, transparent); transform: rotate(11deg); }
.lx-seal span { font-size: 7px; letter-spacing: .11em; text-transform: uppercase; max-width: 9ch; line-height: 1.4; }
.lx-seal b { font-size: 36px; line-height: 1; }
.lx-bottom { position: absolute; inset-block-end: 30px; inset-inline: clamp(24px, 5.5vw, 90px); display: flex; align-items: center; justify-content: space-between; gap: 16px; z-index: 7; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; }
.lx-orbit { font-size: 20px; vertical-align: middle; margin-inline-end: 12px; }
.lx-drag { border: 1px solid color-mix(in srgb, #fff 32%, transparent); border-radius: 20px; padding: 10px 14px; background: color-mix(in srgb, var(--light) 8%, transparent); }
.lx-drag span { border: 1px solid color-mix(in srgb, #fff 65%, transparent); border-radius: 50%; padding: 3px 6px; margin-inline-end: 8px; }
.lx-scroll span { font-size: 18px; margin-inline-start: 12px; }
.lx-sphere { position: absolute; z-index: 4; border-radius: 50%; pointer-events: none; background: radial-gradient(circle at 27% 26%, #ffffffd1 0%, color-mix(in srgb, var(--light) 50%, transparent) 15%, color-mix(in srgb, var(--primary) 45%, transparent) 37%, color-mix(in srgb, var(--primary) 55%, var(--dark)) 68%, color-mix(in srgb, var(--light) 45%, transparent) 93%); box-shadow: inset -5px -8px 16px color-mix(in srgb, var(--deep) 36%, transparent), inset 3px 3px 9px #ffffff8c; animation: lx-float 7s ease-in-out infinite alternate; }
.s1 { width: 22px; height: 22px; inset-inline-start: 17%; inset-block-start: 33%; }
.s2 { width: 11px; height: 11px; inset-inline-end: 24%; inset-block-start: 28%; animation-delay: -3s; }
.s3 { width: 33px; height: 33px; inset-inline-end: 12%; inset-block-end: 24%; animation-delay: -2s; }
.s4 { width: 8px; height: 8px; inset-inline-start: 36%; inset-block-end: 18%; animation-delay: -1s; }

.lx-ticker { height: 71px; background: var(--deep); display: flex; align-items: center; white-space: nowrap; overflow: hidden; color: color-mix(in srgb, var(--light) 80%, transparent); }
.lx-ticker > div { display: flex; min-width: max-content; animation: lx-marquee 32s linear infinite; font-size: 10px; letter-spacing: .24em; text-transform: uppercase; }
.lx-ticker span { display: inline-flex; align-items: center; gap: 55px; padding-inline-end: 55px; }
.lx-ticker b { font-size: 25px; font-weight: 400; }
[dir=rtl] .lx-ticker > div { animation-name: lx-marquee-rtl; }

.lx-intro { display: grid; grid-template-columns: 20% 1fr 27%; gap: 5%; padding-block: 150px 160px; align-items: start; }
.lx-side { display: flex; flex-direction: column; gap: 145px; }
.lx-star { font-size: 82px; line-height: 1; color: var(--mint); }
.lx-intro h2 { font-size: clamp(48px, 5.4vw, 92px); margin: 0 0 35px; }
.lx-intro h2 em, .lx-head h2 em, .lx-faq h2 em { color: var(--soft-em); }
.lx-intro-copy > p { max-width: 590px; font-size: 15px; color: var(--muted); margin-block-end: 18px; }
.lx-text-link { border-block-end: 1px solid var(--muted); font-size: 12px; padding-block-end: 10px; display: inline-flex; gap: 70px; align-items: center; margin-block-start: 20px; }
.lx-note { margin-block-start: 110px; position: relative; background: color-mix(in srgb, var(--primary) 10%, var(--off)); border-radius: 5px; padding: 45px 28px 28px; min-height: 235px; transform: rotate(3deg); box-shadow: 0 22px 40px color-mix(in srgb, var(--dark) 6%, transparent); display: grid; gap: 14px; align-content: start; }
.lx-orb { position: absolute; inset-inline-end: -27px; inset-block-start: -68px; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle at 30% 24%, #fff, var(--mint) 37%, color-mix(in srgb, var(--primary) 80%, var(--dark)) 68%, var(--mint) 90%); box-shadow: 12px 20px 30px color-mix(in srgb, var(--primary) 30%, transparent); animation: lx-float 6s ease-in-out infinite alternate; }
.lx-open { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; }
.lx-note ul { list-style: none; display: grid; gap: 8px; }
.lx-note li { font-family: var(--heading); font-style: italic; font-size: 21px; line-height: 1.25; }

.lx-head { display: flex; justify-content: space-between; align-items: end; margin-block-end: 55px; gap: 24px; }
.lx-head h2 { font-size: clamp(48px, 5.8vw, 96px); margin: 20px 0 0; }
.lx-head > p { font-size: 14px; max-width: 300px; color: var(--muted); margin-block-end: 8px; }
.lx-services { padding-block-end: 160px; }
.lx-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.lx-card { min-height: 500px; padding: 28px; display: flex; flex-direction: column; border-radius: 5px; overflow: hidden; position: relative; transition: transform .45s, box-shadow .45s; color: var(--ink); }
.lx-card:hover { transform: perspective(1000px) rotateX(2.5deg) rotateY(-2.5deg) translateY(-9px); box-shadow: 0 25px 55px color-mix(in srgb, var(--dark) 19%, transparent); }
.lx-card.v0 { background: linear-gradient(145deg, color-mix(in srgb, var(--primary) 25%, #fff), color-mix(in srgb, var(--primary) 45%, #fff) 70%, color-mix(in srgb, var(--primary) 52%, var(--light))); }
.lx-card.v1 { background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 25%, #f4efe7), color-mix(in srgb, var(--accent) 40%, #e9e0d4) 75%, color-mix(in srgb, var(--accent) 45%, #d9cfc6)); }
.lx-card.v2 { background: linear-gradient(155deg, color-mix(in srgb, var(--primary) 40%, #fff), color-mix(in srgb, var(--primary) 75%, #fff) 80%, color-mix(in srgb, var(--primary) 85%, var(--dark))); color: #fff; }
.lx-card-top { display: flex; justify-content: space-between; align-items: start; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.lx-card-top span:last-child { font-size: 23px; }
.lx-sculpt { height: 240px; display: flex; align-items: center; justify-content: center; position: relative; color: color-mix(in srgb, #fff 85%, var(--primary)); filter: drop-shadow(-10px -14px 18px #ffffff9e) drop-shadow(15px 21px 16px color-mix(in srgb, var(--dark) 30%, transparent)); }
.lx-sculpt svg { transform: rotate(-13deg); animation: lx-float 6s ease-in-out infinite alternate; stroke-width: 1.1; }
.lx-sculpt i { position: absolute; width: 41px; height: 41px; background: radial-gradient(circle at 26% 20%, #fff, var(--mint) 55%, color-mix(in srgb, var(--primary) 70%, var(--dark))); border-radius: 50%; inset-inline-end: 18%; inset-block-end: 18%; }
.lx-card-bottom { margin-block-start: auto; position: relative; padding-inline-end: 50px; display: grid; gap: 10px; }
.lx-card-bottom h3 { font: 500 30px/1.05 var(--body); letter-spacing: -.06em; }
.lx-card-bottom p { font-size: 13px; line-height: 1.55; max-width: 280px; margin: 0; opacity: .85; }
.lx-card-bottom b { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; }
.lx-arrow { position: absolute; inset-inline-end: 0; inset-block-end: 0; border: 1px solid color-mix(in srgb, currentColor 45%, transparent); background: color-mix(in srgb, #fff 38%, transparent); width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; font-size: 20px; transition: background .2s, transform .2s; }
.lx-card:hover .lx-arrow { background: #fff; color: var(--deep); transform: rotate(45deg); }

.lx-lab { background: var(--deep); color: var(--frost); position: relative; overflow: hidden; }
.lx-lab::before { content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse at 67% 48%, color-mix(in srgb, var(--primary) 30%, transparent), transparent 45%), linear-gradient(130deg, transparent 40%, color-mix(in srgb, var(--primary) 15%, transparent)); }
.lx-lab-inner { min-height: 775px; display: grid; grid-template-columns: 43% 57%; align-items: center; position: relative; }
.lx-lab-intro { z-index: 4; }
.lx-lab h2 { font-size: clamp(52px, 6vw, 100px); margin: 34px 0; }
.lx-lab h2 em { color: var(--mint); }
.lx-lab-intro > p { font-size: 14px; max-width: 395px; color: color-mix(in srgb, var(--frost) 75%, transparent); }
.lx-views { display: flex; gap: 10px; flex-wrap: wrap; margin-block-start: 45px; }
.lx-views button { border: 1px solid color-mix(in srgb, var(--frost) 35%, transparent); padding: 11px 17px; border-radius: 3px; color: var(--frost); font-size: 11px; }
.lx-views button[aria-pressed=true] { background: var(--frost); color: var(--deep); }
.lx-views .lx-rot { border: 0; font-size: 10px; letter-spacing: .15em; text-transform: uppercase; }
.lx-caption { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; margin-block-start: 34px; color: color-mix(in srgb, var(--frost) 50%, transparent); }
.lx-viewer { height: 680px; position: relative; z-index: 2; isolation: isolate; }
.lx-viewer-glow { position: absolute; inset: 10%; background: radial-gradient(circle, color-mix(in srgb, var(--primary) 45%, transparent), transparent 65%); filter: blur(35px); }
.lx-viewer canvas { position: absolute; inset: 0; width: 100%; height: 100%; cursor: grab; touch-action: pan-y; }
.lx-viewer .lx-fallback { inset: 18%; border-radius: 50%; }
.lx-cross { position: absolute; font-size: 26px; font-weight: 200; opacity: .4; pointer-events: none; }
.lx-cross.one { inset-block-start: 20%; inset-inline-start: 5%; }
.lx-cross.two { inset-block-end: 22%; inset-inline-end: 4%; }
.lx-tag { position: absolute; inset-block-end: 9%; inset-inline-end: 6%; font-size: 10px; letter-spacing: .19em; color: var(--mint); pointer-events: none; }
.lx-tag span { margin-inline-start: 12px; color: color-mix(in srgb, var(--accent) 60%, #9df1d3); }

.lx-journey { padding-block: 155px 160px; }
.lx-steps { display: grid; grid-template-columns: repeat(3, 1fr); border-block-start: 1px solid color-mix(in srgb, var(--dark) 18%, transparent); margin-block-start: 72px; }
.lx-step { padding-block: 35px 30px; padding-inline: 0 27px; border-inline-end: 1px solid color-mix(in srgb, var(--dark) 12%, transparent); }
.lx-step:not(:first-child) { padding-inline-start: 26px; }
.lx-step:last-child { border: 0; }
.lx-step > span { display: inline-block; font-family: var(--heading); font-style: italic; font-size: 20px; margin-block-end: 90px; color: var(--soft-em); }
.lx-step h3 { font-size: 22px; font-weight: 500; letter-spacing: -.05em; margin-block-end: 11px; }
.lx-step p { font-size: 13px; color: var(--muted); max-width: 260px; margin: 0; }

.lx-people { display: grid; grid-template-columns: 1fr 1fr; background: color-mix(in srgb, var(--primary) 14%, var(--light)); min-height: 700px; }
.lx-people-left { padding: 100px clamp(30px, 6vw, 120px); display: flex; flex-direction: column; align-items: flex-start; gap: 28px; }
.lx-people-left h2 { font-size: clamp(56px, 6.4vw, 104px); margin: 16px 0 0; }
.lx-people-left h2 em { color: color-mix(in srgb, var(--primary) 65%, var(--light)); }
.lx-team { list-style: none; display: grid; gap: 0; width: 100%; max-width: 440px; }
.lx-team li { display: flex; justify-content: space-between; gap: 16px; padding-block: 14px; border-block-end: 1px solid color-mix(in srgb, var(--dark) 15%, transparent); }
.lx-team b { font-family: var(--heading); font-style: italic; font-weight: 400; font-size: 24px; }
.lx-team span { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); align-self: center; }
.lx-people-right { padding: 46px; padding-inline-start: 0; }
.lx-portrait { min-height: 610px; height: 100%; border-radius: 5px; position: relative; overflow: hidden; isolation: isolate; background: linear-gradient(150deg, color-mix(in srgb, var(--primary) 55%, #fff) 5%, color-mix(in srgb, var(--light) 80%, #fff) 42%, color-mix(in srgb, var(--primary) 70%, #fff) 100%); }
.lx-portrait > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.lx-portrait-shape { position: absolute; inset-inline-start: 20%; inset-block-start: 13%; width: 59%; height: 62%; background: radial-gradient(ellipse at 40% 25%, #f1f6f0 1%, color-mix(in srgb, var(--primary) 30%, #fff) 35%, color-mix(in srgb, var(--primary) 75%, var(--dark)) 65%, transparent 70%); border-radius: 45% 46% 40% 40%; transform: rotate(-7deg); }
.lx-portrait-overlay { position: absolute; inset: 25px; display: flex; flex-direction: column; justify-content: end; z-index: 2; color: #f1f8f5; }
.lx-ast { font-size: 36px; position: absolute; inset-block-start: 5px; inset-inline-end: 8px; }
.lx-blur { position: absolute; inset: auto 0 0 0; height: 240px; backdrop-filter: blur(18px); border-block-start: 1px solid #ffffff45; background: color-mix(in srgb, var(--deep) 30%, transparent); }
.lx-portrait-overlay p { font-size: clamp(22px, 2.6vw, 36px); line-height: 1.23; position: relative; max-width: 480px; margin-block-end: 16px; }
.lx-portrait-overlay > span:last-child { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; margin-block-end: 7px; position: relative; }

.lx-faq { padding-block: 170px; display: grid; grid-template-columns: 42% 58%; gap: 6%; }
.lx-faq h2 { font-size: clamp(52px, 5.8vw, 90px); margin: 28px 0; }
.lx-faq-list details { border-block-start: 1px solid color-mix(in srgb, var(--dark) 15%, transparent); }
.lx-faq-list details:last-child { border-block-end: 1px solid color-mix(in srgb, var(--dark) 15%, transparent); }
.lx-faq-list summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-block: 25px; font-size: 15px; cursor: pointer; }
.lx-faq-list summary::-webkit-details-marker { display: none; }
.lx-faq-list summary span { display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--dark) 22%, transparent); width: 30px; height: 30px; border-radius: 50%; font-size: 20px; transition: transform .2s; flex-shrink: 0; }
.lx-faq-list details[open] summary span { transform: rotate(45deg); }
.lx-faq-list details p { font-size: 13px; color: var(--muted); margin: 0 0 25px; padding-inline-end: 35px; }

.lx-last { min-height: 620px; padding-block: 110px 60px; background: radial-gradient(ellipse at center 29%, color-mix(in srgb, var(--light) 85%, #fff) 0%, color-mix(in srgb, var(--primary) 75%, #fff) 35%, var(--deep) 90%); color: #f7fdfb; position: relative; isolation: isolate; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden; gap: 14px; }
.lx-halo { position: absolute; inset-block-start: 70px; width: 390px; height: 390px; border: 1px solid #ffffff50; box-shadow: 0 0 0 75px #f3faf909, 0 0 0 150px #f3faf90b, 0 0 0 225px #f3faf906; border-radius: 50%; z-index: -1; }
.lx-last h2 { font-size: clamp(60px, 8vw, 128px); margin: 10px 0; }
.lx-last h2 em { color: #fff; }
.lx-last > p { font-size: 14px; max-width: 46ch; }
.lx-visit { margin-block-start: 60px; width: min(980px, calc(100% - 40px)); display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: start; padding-block-start: 30px; border-block-start: 1px solid #ffffff40; font-size: 14px; }
.lx-visit > div { display: grid; gap: 12px; align-content: start; }
.lx-visit-links { display: flex; flex-wrap: wrap; gap: 20px; }
.lx-visit-links a { border-block-end: 1px solid #ffffff80; }
.lx-visit dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 10px; border-block-end: 1px solid #ffffff2a; }

.lx-footer { min-height: 125px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
.lx-footer .lx-logo { margin: 0; }
.lx-footer > span { font-size: 10px; letter-spacing: .13em; text-transform: uppercase; color: var(--muted); }
.lx-footer > div { display: flex; gap: 27px; font-size: 12px; }

.lx-sticky { display: none; }
@keyframes lx-float { to { transform: translateY(-18px) rotate(9deg); } }
@keyframes lx-mists { to { transform: translateX(10%) translateY(-8%) scale(1.08); } }
@keyframes lx-marquee { to { transform: translateX(-50%); } }
@keyframes lx-marquee-rtl { to { transform: translateX(50%); } }

@media (max-width: 1080px) {
  .lx-width { width: calc(100% - 72px); }
  .lx-intro { grid-template-columns: 13% 1fr 27%; gap: 4%; }
  .lx-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lx-lab-inner { grid-template-columns: 46% 54%; }
}
@media (max-width: 860px) {
  .lx-width { width: calc(100% - 40px); }
  .lx-header { height: 64px; padding-inline: 20px; --mm-top: 64px; }
  .lx-hero { height: 760px; min-height: 760px; max-height: none; }
  .lx-kicker { inset-block-start: 96px; inset-inline-start: 20px; font-size: 8px; gap: 10px; }
  .lx-art { inset: 0; }
  .lx-copy { inset-block-start: 42%; inset-inline: 10px; }
  .lx-hero h1 em { font-size: clamp(48px, 13vw, 84px); }
  .lx-hero h1 span { font-size: clamp(28px, 7.6vw, 54px); }
  .lx-pill { font-size: 10px; padding: 13px; gap: 14px; }
  .lx-seal { width: 80px; height: 80px; inset-inline-end: 6%; inset-block-start: 22%; }
  .lx-seal b { font-size: 22px; }
  .lx-seal span { font-size: 5px; }
  .lx-bottom { inset-inline: 20px; inset-block-end: 20px; font-size: 8px; }
  .lx-ticker { height: 55px; }
  .lx-intro { display: block; padding-block: 90px 100px; }
  .lx-side { flex-direction: row; justify-content: space-between; align-items: center; gap: 20px; margin-block-end: 26px; }
  .lx-star { font-size: 40px; }
  .lx-note { margin-block-start: 70px; margin-inline-start: 10%; max-width: 300px; }
  .lx-head { display: block; }
  .lx-head > p { margin-block-start: 22px; }
  .lx-grid { grid-template-columns: 1fr; }
  .lx-card { min-height: 420px; }
  .lx-lab-inner { display: flex; flex-direction: column; align-items: stretch; padding-block: 100px 30px; }
  .lx-viewer { height: 480px; margin-inline: -10px; }
  .lx-journey { padding-block: 100px; }
  .lx-steps { grid-template-columns: 1fr; }
  .lx-step { padding: 26px 0 !important; border-inline-end: 0; border-block-end: 1px solid color-mix(in srgb, var(--dark) 12%, transparent); }
  .lx-step > span { margin-block-end: 18px; }
  .lx-people { grid-template-columns: 1fr; }
  .lx-people-left { padding: 85px 22px 50px; }
  .lx-people-right { padding: 0 20px 20px; }
  .lx-portrait { min-height: 460px; }
  .lx-faq { grid-template-columns: 1fr; gap: 40px; padding-block: 100px; }
  .lx-visit { grid-template-columns: 1fr; }
  .lx-footer { padding-block: 30px 100px; }
  .lx-sticky { display: flex; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; justify-content: center; gap: 14px; padding: 16px; border-radius: 6px; background: var(--deep); color: #fff; font-weight: 600; font-size: 13px; transform: translateY(150%); transition: transform .4s; }
  .lumex[data-scrolled] .lx-sticky { transform: none; }
}
`;
