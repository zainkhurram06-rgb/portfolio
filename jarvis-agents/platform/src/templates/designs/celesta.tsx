// CELESTA: bright, rounded, clinical blue. The hero is one big gradient panel
// with a blueprint grid, orbit rings and a live 3D tooth; a second tooth sits in
// a "smile studio" screen next to the steps. Ported from the Signature library
// (03-celesta-dental), filled with the business's real details and colours.

import { DemoRibbon, Icon, Paragraphs, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, type DesignProps } from "./shared";
import { TOOTH_JS } from "./tooth3d";

const initials = (name: string) => name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function Celesta({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const staff = d.staff.filter((s) => s.name.trim().toLowerCase() !== "team" && !/^bay \d/i.test(s.name));
  const metrics: [string, string][] = [
    ...(c.rating != null ? [[c.rating.toFixed(1), L.google_rating] as [string, string]] : []),
    ...(c.reviewCount ? [[String(c.reviewCount), L.stat_reviews] as [string, string]] : []),
    ...(services.length ? [[String(services.length), L.stat_services] as [string, string]] : []),
    ...(staff.length ? [[String(staff.length), L.stat_team] as [string, string]] : []),
  ].slice(0, 3);
  const links: [string, string][] = [
    ...(staff.length ? [["#team", L.sec_team_kicker] as [string, string]] : []),
    ["#journey", L.sec_steps_kicker], ["#services", L.nav_services],
    ...(c.reviews.length ? [["#reviews", L.nav_reviews] as [string, string]] : []),
    ["#visit", L.nav_contact],
  ];
  return (
    <div className="dsite celesta" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="cl-nav cl-width">
        <a className="cl-logo" href="#top">{c.logoUrl && <img src={c.logoUrl} alt="" />}<span>{biz.name}</span><b>✳</b></a>
        <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        <a className="cl-btn blue desk" href={d.bookHref}>{c.ctaLabel} ↗</a>
        <MobileMenu d={d} links={links} />
      </header>

      <main id="top">
        <section className="cl-width">
          <div className="cl-hero">
            <div className="cl-hero-copy">
              <span className="cl-eyebrow">{c.tagline} / {biz.city}</span>
              <h1>{c.headline}</h1>
              <p>{c.subheadline}</p>
              <div className="cl-hero-btns">
                <a className="cl-btn white" href={d.bookHref}>{c.ctaLabel} →</a>
                <a className="cl-btn ghost" href="#services">{L.view_services}</a>
              </div>
              {metrics.length > 0 && (
                <div className="cl-metrics">{metrics.map(([n, l]) => <div key={l}><strong>{n}</strong><span>{l}</span></div>)}</div>
              )}
            </div>
            <div className="cl-visual" data-3d-host>
              <div className="cl-orbit" /><div className="cl-orbit two" />
              <span className="cl-scan top">{biz.name} / {L.live_3d}</span>
              <canvas data-tooth-3d data-scale=".7" data-material="pearl" tabIndex={0} aria-label={L.drag_rotate} />
              <div className="cl-fallback">{c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : null}</div>
              <div className="cl-float"><strong>360°</strong>{L.drag_rotate}</div>
              <span className="cl-scan bottom"><OpenBadge d={d} /></span>
            </div>
          </div>
        </section>

        <section className="cl-width cl-section cl-about" id="about">
          <div data-reveal>
            <span className="cl-eyebrow">{L.sec_about_kicker}</span>
            <h2>{c.aboutTitle}</h2>
          </div>
          <div className="cl-about-body" data-reveal>
            <Paragraphs text={c.about} />
            <ul>{c.highlights.map((h) => <li key={h}><Icon name="check" size={16} />{h}</li>)}</ul>
          </div>
        </section>

        {staff.length > 0 && (
          <section className="cl-width cl-section" id="team">
            <span className="cl-eyebrow">{L.sec_team_kicker}</span>
            <h2>{L.sec_team_title}</h2>
            <div className="cl-doctors">
              {staff.slice(0, 6).map((p, i) => (
                <article key={p.id} className={`cl-doctor t${i % 3}`} data-reveal>
                  <div className="cl-doc-photo">
                    {c.gallery[i + 2] ? <img src={c.gallery[i + 2]} alt="" loading="lazy" /> : <span>{initials(p.name)}</span>}
                  </div>
                  <div className="cl-doc-details">
                    <strong>{p.name}</strong>
                    <p>{p.title}</p>
                    <a href={d.bookHref}>{L.book_this} ↗</a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="cl-width cl-section" id="journey">
          <span className="cl-eyebrow">{L.sec_steps_kicker}</span>
          <div className="cl-process">
            <div>
              <h2>{L.sec_steps_title}</h2>
              <p className="cl-intro">{L.lab_text}</p>
              <div className="cl-steps">
                {[[L.step1_title, L.step1], [L.step2_title, L.step2], [L.step3_title, L.step3]].map(([t, p], i) => (
                  <a key={i} href={d.bookHref}><span className="n">0{i + 1}</span><span><b>{t}</b><small>{p}</small></span></a>
                ))}
              </div>
            </div>
            <div className="cl-studio" data-3d-host>
              <div className="cl-grid" aria-hidden="true" />
              <div className="cl-studio-head"><span>{biz.name.toUpperCase()} / {L.lab_kicker}</span><span className="cl-live">● {L.live_3d}</span></div>
              <canvas id="cl-studio-tooth" data-tooth-3d data-scale=".7" tabIndex={0} aria-label={L.drag_rotate} />
              <div className="cl-fallback">{c.gallery[0] ? <img src={c.gallery[0]} alt="" /> : null}</div>
              <div className="cl-studio-foot" data-tooth-controls="#cl-studio-tooth">
                <span>360° / {L.closer_look}</span>
                <button type="button" data-rotate>{L.rotate_turn} ↻</button>
              </div>
              <div className="cl-marks" aria-hidden="true">+ &nbsp; + &nbsp; +</div>
            </div>
          </div>
        </section>

        <section className="cl-width cl-section" id="services">
          <div className="cl-head">
            <div><span className="cl-eyebrow">{L.sec_services_kicker}</span><h2>{L.sec_services_title}</h2></div>
            <p className="cl-intro">{L.sec_services_intro}</p>
          </div>
          <div className="cl-services">
            {services.map((s) => (
              <a key={s.id} href={d.bookHref} data-reveal>
                <div className="cl-icon"><Icon name={s.icon} size={30} /></div>
                <h3>{s.name} ↗</h3>
                <p>{s.description}</p>
                <div className="cl-meta"><span>{s.durationMin} {L.min}</span>{s.price && <b>{s.price}</b>}</div>
              </a>
            ))}
          </div>
        </section>

        {c.insurers.length > 0 && (
          <section className="cl-width cl-section cl-insure">
            <h2>{L.sec_insurance_title}</h2>
            <ul>{c.insurers.map((x) => <li key={x}>{x}</li>)}</ul>
            <p className="cl-intro">{L.sec_insurance_note}</p>
          </section>
        )}

        {c.reviews.length > 0 && (
          <section className="cl-width cl-section" id="reviews">
            <div className="cl-head">
              <div><span className="cl-eyebrow">{L.sec_reviews_kicker}</span><h2>{L.sec_reviews_title}</h2></div>
              {c.rating != null && <p className="cl-rated">★ {c.reviewCount ? fill(L.rated, { rating: c.rating.toFixed(1), n: c.reviewCount }) : c.rating.toFixed(1)}</p>}
            </div>
            <div className="cl-reviews" data-drag>
              {c.reviews.map((r, i) => (
                <figure key={i} className={i === 0 ? "lead" : ""} data-reveal>
                  <span className="cl-stars">{"★".repeat(r.rating)}</span>
                  <blockquote>“{r.text}”</blockquote>
                  <figcaption data-review-author={r.author}>{r.author}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {c.faqs.length > 0 && (
          <section className="cl-width cl-section cl-faq" id="faq">
            <h2>{L.sec_faq_title}</h2>
            <div>{c.faqs.map((f) => <details key={f.q}><summary>{f.q}<span>+</span></summary><p>{f.a}</p></details>)}</div>
          </section>
        )}

        <section className="cl-width cl-section" id="visit">
          <div className="cl-last">
            <div><span className="cl-eyebrow">{L.sec_contact_kicker}</span><h2>{L.sec_cta_title}</h2></div>
            <a className="cl-btn white" href={d.bookHref}>{c.ctaLabel} ↗</a>
          </div>
          <div className="cl-visit">
            <div className="cl-card">
              <h3>{L.sec_contact_title}</h3>
              {biz.address && <p>{biz.address}</p>}
              <OpenBadge d={d} className="cl-open" />
              <p className="cl-links">
                {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={16} /><Num>{biz.phone}</Num></a>}
                {d.mapsHref && <a href={d.mapsHref}><Icon name="map" size={16} />{L.get_directions}</a>}
              </p>
            </div>
            <div className="cl-card">
              <h3>{L.sec_hours}</h3>
              <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="cl-width cl-footer">
        <a className="cl-logo" href="#top"><span>{biz.name}</span><b>✳</b></a>
        <span>© {d.year} · {c.tagline}</span>
        <div>{c.instagram && <a href={c.instagram}>Instagram</a>}{c.facebook && <a href={c.facebook}>Facebook</a>}<a href="#top">↑</a></div>
      </footer>

      <a className="cl-sticky" href={d.bookHref}>{c.ctaLabel} ↗</a>
      <Script js={SHARED_JS + TOOTH_JS} />
    </div>
  );
}

export const css = `
.celesta {
  --ink: color-mix(in srgb, var(--dark) 85%, var(--primary)); --sky: color-mix(in srgb, var(--primary) 70%, #4aa3ff);
  --pale: color-mix(in srgb, var(--light) 70%, #fff); --line: color-mix(in srgb, var(--primary) 16%, #fff);
  --muted: color-mix(in srgb, var(--primary) 45%, #8a9bb0); --soft: color-mix(in srgb, var(--primary) 6%, #fff);
  background: color-mix(in srgb, var(--light) 35%, #fff); color: var(--ink); font: 15px/1.6 var(--body); -webkit-font-smoothing: antialiased;
}
.celesta h1, .celesta h2, .celesta h3 { font-family: var(--heading); font-weight: 700; }
.cl-width { width: min(1180px, calc(100% - 80px)); margin-inline: auto; }
.cl-eyebrow { font-size: 11px; letter-spacing: .19em; text-transform: uppercase; font-weight: 700; }
.cl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 12px 23px; border-radius: 999px; font-size: 13px; font-weight: 700; white-space: nowrap; transition: transform .2s, filter .2s; }
.cl-btn:hover { transform: translateY(-2px); filter: brightness(.96); }
.cl-btn.blue { background: var(--primary); color: #fff; }
.cl-btn.white { background: #fff; color: var(--primary); box-shadow: 0 15px 27px color-mix(in srgb, var(--dark) 30%, transparent); }
.cl-btn.ghost { color: #fff; border: 1px solid color-mix(in srgb, #fff 45%, transparent); }

.cl-nav { display: flex; align-items: center; gap: 28px; padding-block: 20px; position: relative; z-index: 10; --mm-top: 88px; }
.cl-logo { display: inline-flex; align-items: center; gap: 8px; font: 800 22px var(--heading); letter-spacing: -.04em; margin-inline-end: auto; }
.cl-logo img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.cl-logo b { color: var(--primary); font-weight: 400; }
.cl-nav nav { display: flex; gap: 28px; }
.cl-nav nav a { font-size: 13px; font-weight: 600; color: var(--muted); transition: color .2s; }
.cl-nav nav a:hover { color: var(--primary); }
.celesta .mm-panel { background: var(--primary); color: #fff; }
.celesta .mm-panel nav a { font-family: var(--heading); font-weight: 700; font-size: 2rem; letter-spacing: -.03em; }
.celesta .mm-book { background: #fff; color: var(--primary); border-radius: 999px; font-weight: 700; }

.cl-hero { margin-block-start: 6px; border-radius: 25px; color: #fff; overflow: hidden; position: relative; display: grid; grid-template-columns: 56% 44%; min-height: 540px; padding: 72px 0 40px; padding-inline-start: 64px;
  background: radial-gradient(ellipse at 75% 35%, color-mix(in srgb, var(--light) 35%, transparent), transparent 53%), linear-gradient(112deg, color-mix(in srgb, var(--primary) 85%, var(--dark)) 0%, var(--sky) 65%, var(--primary) 100%);
  box-shadow: 0 30px 50px color-mix(in srgb, var(--primary) 18%, transparent); }
.cl-hero::before { content: ""; position: absolute; width: 390px; height: 390px; border-radius: 50%; border: 80px solid #ffffff0c; inset-inline-end: -110px; inset-block-start: -70px; }
.cl-hero::after { content: ""; position: absolute; inset-block: 0; inset-inline-end: 0; width: 52%; background-image: linear-gradient(90deg, #ffffff12 1px, transparent 1px), linear-gradient(#ffffff12 1px, transparent 1px); background-size: 38px 38px; mask-image: linear-gradient(90deg, transparent, #000); pointer-events: none; }
[dir=rtl] .cl-hero::after { mask-image: linear-gradient(270deg, transparent, #000); }
.cl-hero-copy { position: relative; z-index: 5; }
.cl-hero h1 { font-size: clamp(40px, 4.6vw, 66px); line-height: 1.04; letter-spacing: -.045em; margin: 16px 0 22px; }
.cl-hero-copy > p { font-size: 15px; max-width: 44ch; color: color-mix(in srgb, #fff 82%, var(--light)); }
.cl-hero-btns { display: flex; flex-wrap: wrap; gap: 10px; margin-block-start: 26px; }
.cl-metrics { display: flex; gap: 36px; margin-block-start: 52px; flex-wrap: wrap; }
.cl-metrics strong { display: block; font: 700 28px var(--heading); letter-spacing: -.03em; }
.cl-metrics span { font-size: 11px; color: color-mix(in srgb, #fff 75%, var(--light)); }
.cl-visual { position: relative; min-height: 430px; isolation: isolate; }
.cl-visual canvas { position: absolute; inset: -12% -8% -16% -10%; width: 118%; height: 128%; z-index: 1; cursor: grab; touch-action: pan-y; filter: drop-shadow(0 20px 22px color-mix(in srgb, var(--dark) 55%, transparent)); }
.cl-visual canvas:active, .cl-studio canvas:active { cursor: grabbing; }
.cl-orbit { position: absolute; z-index: 0; inset-inline-start: 12%; inset-block-start: 10%; width: 330px; height: 330px; max-width: 90%; border: 1px solid #ffffff60; border-radius: 50%; box-shadow: 0 0 0 35px #ffffff09, 0 0 0 77px #ffffff08, 0 0 70px color-mix(in srgb, var(--light) 25%, transparent); transform: rotate(-20deg) scaleY(.82); }
.cl-orbit.two { box-shadow: none; transform: rotate(60deg) scaleY(.78); border-style: dashed; border-color: #ffffff50; }
.cl-scan { position: absolute; z-index: 4; font-size: 9px; letter-spacing: .15em; text-transform: uppercase; white-space: nowrap; color: color-mix(in srgb, #fff 85%, var(--light)); }
.cl-scan.top { inset-block-start: 4px; inset-inline-start: 14px; }
.cl-scan.bottom { inset-block-start: 4px; inset-inline-end: 14px; }
.cl-float { position: absolute; z-index: 5; inset-inline-end: 24px; inset-block-start: 52%; max-width: 180px; padding: 14px 17px; border-radius: 14px; font-size: 11px; line-height: 1.4; color: var(--primary); background: color-mix(in srgb, #fff 85%, transparent); backdrop-filter: blur(15px); box-shadow: 0 16px 45px color-mix(in srgb, var(--dark) 25%, transparent); }
.cl-float strong { display: block; font: 700 24px var(--heading); }
.cl-fallback { display: none; }
.no-3d canvas { display: none; }
.no-3d .cl-fallback { display: block; position: absolute; inset: 8% 14% 12%; border-radius: 30px; overflow: hidden; z-index: 1; }
.no-3d .cl-fallback img { width: 100%; height: 100%; object-fit: cover; }

.cl-section { padding-block-start: 96px; }
.cl-section h2 { font-size: clamp(32px, 4vw, 52px); letter-spacing: -.045em; line-height: 1.06; margin: 14px 0 20px; }
.cl-intro { color: var(--muted); max-width: 52ch; }
.cl-about { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
.cl-about-body > p { color: var(--muted); margin-block-end: 14px; }
.cl-about-body ul { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-block-start: 26px; }
.cl-about-body li { display: flex; gap: 10px; align-items: center; padding: 14px 16px; border-radius: 14px; background: #fff; border: 1px solid var(--line); font-weight: 600; font-size: 14px; }
.cl-about-body li svg { color: var(--primary); flex: none; }

.cl-doctors { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-block-start: 30px; }
.cl-doctor { background: #fff; border: 1px solid var(--line); border-radius: 18px; overflow: hidden; transition: transform .3s, box-shadow .3s; }
.cl-doctor:hover { transform: translateY(-7px); box-shadow: 0 22px 40px color-mix(in srgb, var(--primary) 18%, transparent); }
.cl-doc-photo { height: 260px; display: grid; place-items: center; background: linear-gradient(145deg, color-mix(in srgb, var(--light) 80%, #fff), color-mix(in srgb, var(--primary) 40%, #fff)); }
.cl-doctor.t1 .cl-doc-photo { background: linear-gradient(145deg, color-mix(in srgb, var(--accent) 30%, #fff), color-mix(in srgb, var(--accent) 60%, var(--primary))); }
.cl-doctor.t2 .cl-doc-photo { background: linear-gradient(145deg, color-mix(in srgb, var(--primary) 20%, #fff), color-mix(in srgb, var(--primary) 70%, var(--dark))); }
.cl-doc-photo img { width: 100%; height: 100%; object-fit: cover; }
.cl-doc-photo span { font: 700 84px var(--heading); letter-spacing: -.06em; color: #ffffffd9; }
.cl-doc-details { padding: 23px; }
.cl-doc-details strong { font: 700 19px var(--heading); letter-spacing: -.02em; }
.cl-doc-details p { font-size: 13px; color: var(--muted); margin: 6px 0 16px; }
.cl-doc-details a { color: var(--primary); font-weight: 700; font-size: 13px; }

.cl-process { background: #fff; border-radius: 23px; padding: 44px; margin-block-start: 30px; display: grid; grid-template-columns: .85fr 1.15fr; gap: 42px; align-items: center; box-shadow: 0 20px 55px color-mix(in srgb, var(--primary) 12%, transparent); }
.cl-process h2 { margin-block-start: 0; }
.cl-steps { display: grid; gap: 11px; margin-block-start: 26px; }
.cl-steps a { display: flex; align-items: center; gap: 16px; padding: 18px; border: 1px solid var(--line); background: var(--soft); border-radius: 12px; transition: transform .2s, background .2s; }
.cl-steps a:hover { transform: translateX(4px); background: color-mix(in srgb, var(--light) 60%, #fff); }
[dir=rtl] .cl-steps a:hover { transform: translateX(-4px); }
.cl-steps .n { font: 700 26px var(--heading); color: var(--primary); }
.cl-steps b { display: block; font-size: 15px; }
.cl-steps small { display: block; font-size: 12.5px; color: var(--muted); line-height: 1.5; }
.cl-studio { height: 440px; border-radius: 19px; position: relative; overflow: hidden; isolation: isolate; background: radial-gradient(circle at center, color-mix(in srgb, var(--light) 55%, var(--primary)) 0%, var(--primary) 70%, color-mix(in srgb, var(--primary) 80%, var(--dark)) 100%); box-shadow: inset 0 0 65px #ffffff30; }
.cl-grid { position: absolute; inset: 0; background-image: linear-gradient(90deg, #ffffff18 1px, transparent 1px), linear-gradient(#ffffff18 1px, transparent 1px); background-size: 38px 38px; }
.cl-studio canvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; cursor: grab; touch-action: pan-y; filter: drop-shadow(0 15px 20px color-mix(in srgb, var(--dark) 35%, transparent)); }
.cl-studio-head, .cl-studio-foot { position: absolute; z-index: 5; inset-inline: 23px; display: flex; justify-content: space-between; align-items: center; gap: 12px; color: #fff; font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
.cl-studio-head { inset-block-start: 23px; }
.cl-studio-foot { inset-block-end: 23px; }
.cl-studio-foot button { background: #ffffffeb; border-radius: 6px; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--primary); padding: 10px 13px; transition: transform .2s; }
.cl-studio-foot button:hover { transform: translateY(-1px); background: #fff; }
.cl-live { color: color-mix(in srgb, var(--accent) 50%, #d1ffe1); }
.cl-marks { position: absolute; inset-inline-start: 10%; inset-block-start: 47%; font-size: 38px; color: #ffffff40; letter-spacing: 2.4em; white-space: nowrap; pointer-events: none; }

.cl-head { display: flex; justify-content: space-between; align-items: end; gap: 30px; }
.cl-head .cl-intro { margin-block-end: 24px; max-width: 40ch; }
.cl-services { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-block-start: 20px; }
.cl-services a { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 26px; display: flex; flex-direction: column; min-height: 220px; transition: transform .25s, box-shadow .25s, border-color .25s; }
.cl-services a:last-child:nth-child(3n+2) { grid-column: span 2; }
.cl-services a:hover { transform: translateY(-5px); border-color: var(--primary); box-shadow: 0 18px 40px color-mix(in srgb, var(--primary) 14%, transparent); }
.cl-icon { width: 54px; height: 54px; border-radius: 14px; display: grid; place-items: center; color: var(--primary); background: color-mix(in srgb, var(--light) 70%, #fff); }
.cl-services h3 { font-size: 18px; letter-spacing: -.02em; margin: 20px 0 6px; }
.cl-services p { font-size: 13px; color: var(--muted); line-height: 1.6; margin: 0 0 18px; }
.cl-meta { margin-block-start: auto; display: flex; justify-content: space-between; gap: 12px; font-size: 12px; color: var(--muted); padding-block-start: 14px; border-block-start: 1px solid var(--line); }
.cl-meta b { color: var(--primary); }

.cl-insure ul { list-style: none; display: flex; flex-wrap: wrap; gap: 10px; }
.cl-insure li { padding: 10px 16px; border-radius: 999px; background: #fff; border: 1px solid var(--line); font-weight: 600; font-size: 13px; }
.cl-insure .cl-intro { margin-block-start: 16px; font-size: 13px; }

.cl-rated { margin-block-end: 24px; font-weight: 700; color: var(--primary); }
.cl-reviews { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(300px, 1fr); gap: 16px; overflow-x: auto; scrollbar-width: none; padding-block: 6px 10px; margin-block-start: 10px; }
.cl-reviews::-webkit-scrollbar { display: none; }
.cl-reviews figure { margin: 0; background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 26px; display: flex; flex-direction: column; gap: 14px; }
.cl-reviews figure.lead { background: var(--primary); color: #fff; border-color: transparent; }
.cl-stars { color: var(--accent); letter-spacing: .15em; }
.cl-reviews blockquote { margin: 0; font-size: 15px; line-height: 1.6; flex: 1; }
.cl-reviews figcaption { font-weight: 700; font-size: 13px; }

.cl-faq { display: grid; grid-template-columns: 38% 1fr; gap: 50px; align-items: start; }
.cl-faq details { background: #fff; border: 1px solid var(--line); border-radius: 14px; margin-block-end: 10px; }
.cl-faq summary { list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 20px; font-weight: 600; cursor: pointer; }
.cl-faq summary::-webkit-details-marker { display: none; }
.cl-faq summary span { width: 28px; height: 28px; flex: none; border-radius: 50%; display: grid; place-items: center; background: var(--soft); color: var(--primary); font-size: 18px; transition: transform .2s; }
.cl-faq details[open] summary span { transform: rotate(45deg); }
.cl-faq details p { padding: 0 20px 18px; margin: 0; color: var(--muted); font-size: 14px; }

.cl-last { padding: 44px 50px; border-radius: 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; color: #fff; background: linear-gradient(112deg, color-mix(in srgb, var(--primary) 85%, var(--dark)), var(--sky)); }
.cl-last h2 { font-size: clamp(28px, 3vw, 40px); margin: 8px 0 0; }
.cl-visit { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-block-start: 16px; }
.cl-card { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 28px; display: grid; gap: 12px; align-content: start; }
.cl-card h3 { font-size: 20px; letter-spacing: -.02em; margin: 0; }
.cl-card p { margin: 0; color: var(--muted); }
.cl-open { font-size: 13px; font-weight: 600; }
.cl-links { display: flex; flex-wrap: wrap; gap: 18px; }
.cl-links a { display: inline-flex; gap: 8px; align-items: center; color: var(--primary); font-weight: 700; }
.cl-card dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 9px; border-block-end: 1px solid var(--line); font-size: 14px; }
.cl-card dl div:last-child { border: 0; }
.cl-card dd { margin: 0; font-weight: 600; }

.cl-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding-block: 40px; margin-block-start: 60px; border-block-start: 1px solid var(--line); font-size: 12px; color: var(--muted); }
.cl-footer .cl-logo { margin: 0; font-size: 18px; color: var(--ink); }
.cl-footer > div { display: flex; gap: 22px; }
.cl-sticky { display: none; }

@media (max-width: 960px) {
  .cl-nav nav { gap: 18px; }
  .cl-hero { grid-template-columns: 1fr; padding: 48px 28px 28px; }
  .cl-visual { min-height: 360px; margin-block-start: 20px; }
  .cl-visual canvas { inset: -14% -8%; width: 116%; height: 128%; }
  .cl-orbit { inset-inline-start: 22%; width: 260px; height: 260px; }
  .cl-process { grid-template-columns: 1fr; }
  .cl-doctors, .cl-services { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cl-services a:last-child:nth-child(3n+2) { grid-column: auto; }
  .cl-services a:last-child:nth-child(odd) { grid-column: span 2; }
}
@media (max-width: 760px) {
  .cl-width { width: calc(100% - 32px); }
  .cl-nav { --mm-top: 80px; }
  .cl-hero { padding: 40px 22px 24px; border-radius: 22px; }
  .cl-hero h1 { font-size: clamp(34px, 9.5vw, 46px); }
  .cl-metrics { display: grid; grid-template-columns: repeat(3, auto); justify-content: start; gap: 22px; margin-block-start: 34px; }
  .cl-metrics strong { font-size: 24px; }
  .cl-metrics span { display: block; max-width: 11ch; line-height: 1.3; }
  .cl-visual { min-height: 320px; }
  .cl-scan.top { display: none; }
  .cl-scan.bottom { inset-inline: 0 auto; }
  .cl-float { inset-block-start: auto; inset-block-end: 30px; inset-inline-end: 0; }
  .cl-section { padding-block-start: 72px; }
  .cl-about, .cl-faq { grid-template-columns: 1fr; gap: 20px; }
  .cl-about-body ul { grid-template-columns: 1fr; }
  .cl-doctors, .cl-services { grid-template-columns: 1fr; }
  .cl-services a:last-child:nth-child(odd) { grid-column: auto; }
  .cl-process { padding: 22px; }
  .cl-studio { height: 340px; }
  .cl-studio-head, .cl-studio-foot { inset-inline: 15px; font-size: 8px; }
  .cl-head { display: block; }
  .cl-reviews { grid-auto-columns: 84%; }
  .cl-last { padding: 32px 26px; flex-direction: column; align-items: flex-start; }
  .cl-visit { grid-template-columns: 1fr; }
  .cl-footer { flex-direction: column; text-align: center; padding-block-end: 100px; }
  .cl-sticky { display: flex; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; justify-content: center; padding: 16px; border-radius: 999px; background: var(--primary); color: #fff; font-weight: 700; font-size: 14px; transform: translateY(150%); transition: transform .4s; box-shadow: 0 14px 30px color-mix(in srgb, var(--primary) 35%, transparent); }
  .celesta[data-scrolled] .cl-sticky { transform: none; }
}
`;
