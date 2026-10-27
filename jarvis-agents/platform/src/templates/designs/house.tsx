// HOUSE: the home services flagship. A cut-away 3D house with its roof
// floating off; scrolling lifts the roof away, and tapping a room lights it
// up and shows the service that fixes things there, with a price and a quote
// button. Call-first throughout: a big phone number, a real quote form, and a
// sticky call bar on phones.

import { DemoRibbon, Icon, Paragraphs, tel } from "@/components/site/bits";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { fill } from "@/lib/labels";
import { MobileMenu, Num, OpenBadge, SHARED_CSS, SHARED_JS, Script, type DesignProps } from "./shared";
import { STAGE_JS, stageScene } from "./stage3d";
import { HOUSE } from "./scenes";

// where each room sits over the 3:2 house picture (kitchen, bathroom, living room)
const SPOTS: [number, number][] = [[27, 40], [71, 40], [54, 64]];

const ROOMS_JS = `
document.querySelectorAll("[data-rooms]").forEach(function (box) {
  var canvas = box.querySelector("canvas"), spots = box.querySelectorAll("[data-room]");
  var pick = function (i) {
    spots.forEach(function (s) { s.classList.toggle("on", s.getAttribute("data-room") === String(i)); });
    if (canvas) canvas.dispatchEvent(new CustomEvent("stage-focus", { detail: i }));
  };
  spots.forEach(function (s) {
    var i = Number(s.getAttribute("data-room"));
    s.addEventListener("mouseenter", function () { pick(i); });
    s.addEventListener("click", function () { pick(s.classList.contains("on") && matchMedia("(hover: hover)").matches ? -1 : i); });
  });
  box.addEventListener("mouseleave", function () { pick(-1); });
});
`;

export function House({ d }: DesignProps) {
  const { biz, c, L, services } = d;
  const rooms = services.slice(0, 3);
  const links: [string, string][] = [
    ["#services", L.nav_services], ["#about", L.nav_why],
    ...(c.reviews.length ? [["#reviews", L.nav_reviews] as [string, string]] : []),
    ["#quote", L.free_quote],
  ];
  return (
    <div className="dsite house" dir={d.dir}>
      <style dangerouslySetInnerHTML={{ __html: SHARED_CSS + css }} />
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <header className="hs-nav hs-width">
        <a className="hs-logo" href="#top">{c.logoUrl ? <img src={c.logoUrl} alt="" /> : <span className="hs-mark"><Icon name="home" size={18} /></span>}<span>{biz.name}</span></a>
        <nav className="desk">{links.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        {biz.phone && <a className="hs-btn desk" href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={16} /><Num>{biz.phone}</Num></a>}
        <MobileMenu d={d} links={links} />
      </header>

      <section className="hs-hero hs-width" id="top">
        <div className="hs-hero-copy">
          <span className="hs-live"><OpenBadge d={d} /></span>
          <h1>{c.headline}</h1>
          <p>{c.subheadline}</p>
          <div className="hs-buttons">
            {biz.phone && <a className="hs-btn big" href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={18} />{L.call_now}</a>}
            <a className="hs-btn line" href="#quote">{L.free_quote} →</a>
          </div>
          <ul className="hs-ticks">{c.highlights.slice(0, 3).map((h) => <li key={h}><Icon name="check" size={16} />{h}</li>)}</ul>
        </div>
        <div className="hs-stage" data-rooms data-3d-host>
          <div className="hs-pic" dir="ltr">
            <canvas id="hs-house" data-stage="house" data-scroll="leave" data-yaw="-.7" data-pitch="-.5" data-spin="0" data-scale=".86" data-drag="off" tabIndex={-1} aria-hidden="true" />
            <div className="hs-fallback">{c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : null}</div>
            {rooms.map((s, i) => (
              <div key={s.id} className="hs-spot" data-room={i} style={{ ["--x" as string]: `${SPOTS[i][0]}%`, ["--y" as string]: `${SPOTS[i][1]}%` }}>
                <button type="button" aria-label={s.name}><span>{i + 1}</span></button>
                <div className="hs-card" dir={d.dir}>
                  <b>{s.name}</b>
                  <small>{s.description}</small>
                  <span><i>{s.price ?? L.free_quote}</i><a href="#quote">{L.free_quote} →</a></span>
                </div>
              </div>
            ))}
          </div>
          <p className="hs-hint">↖ {L.tap_room}</p>
        </div>
      </section>

      {c.rating != null && (
        <div className="hs-proof hs-width">
          <b>★ {c.rating.toFixed(1)}</b><span>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</span>
          {c.areasServed.length > 0 && <span className="hs-serving"><Icon name="map" size={16} />{fill(L.serving, { areas: c.areasServed.slice(0, 4).join(", ") })}</span>}
        </div>
      )}

      <section className="hs-width hs-section" id="services">
        <div className="hs-head"><span className="hs-kicker">{L.sec_services_kicker}</span><h2>{L.sec_services_title}</h2><p>{L.sec_services_intro}</p></div>
        <div className="hs-services">
          {services.map((s) => (
            <a key={s.id} href="#quote" data-reveal>
              <span className="hs-ico"><Icon name={s.icon} size={24} /></span>
              <b>{s.name}</b>
              <small>{s.description}</small>
              <span className="hs-price">{s.price ?? L.free_quote}<i>→</i></span>
            </a>
          ))}
        </div>
      </section>

      <section className="hs-width hs-section hs-about" id="about">
        <div data-reveal>
          <span className="hs-kicker">{L.sec_about_kicker}</span>
          <h2>{c.aboutTitle}</h2>
          <Paragraphs text={c.about} />
        </div>
        <div className="hs-trust">
          {c.warranty && <div className="hs-guarantee" data-reveal><Icon name="shield" size={30} /><b>{L.sec_warranty_title}</b><p>{c.warranty}</p></div>}
          {c.credentials.length > 0 && <ul>{c.credentials.map((x) => <li key={x}><Icon name="award" size={18} />{x}</li>)}</ul>}
          {c.areasServed.length > 0 && (
            <div className="hs-areas"><b>{L.sec_areas_title}</b><div>{c.areasServed.map((a) => <span key={a}>{a}</span>)}</div></div>
          )}
        </div>
      </section>

      <section className="hs-width hs-section">
        <div className="hs-head"><span className="hs-kicker">{L.sec_steps_kicker}</span><h2>{L.sec_steps_title}</h2></div>
        <ol className="hs-steps">
          {[[L.step1_title, L.step1], [L.step2_title, L.step2], [L.step3_title, L.step3]].map(([t, p], i) => (
            <li key={i} data-reveal><span>{i + 1}</span><b>{t}</b><p>{p}</p></li>
          ))}
        </ol>
      </section>

      {c.reviews.length > 0 && (
        <section className="hs-width hs-section" id="reviews">
          <div className="hs-head"><span className="hs-kicker">{L.sec_reviews_kicker}</span><h2>{L.sec_reviews_title}</h2></div>
          <div className="hs-reviews">
            {c.reviews.slice(0, 3).map((r, i) => (
              <figure key={i} data-reveal><span>{"★".repeat(r.rating)}</span><blockquote>“{r.text}”</blockquote><figcaption data-review-author={r.author}>{r.author}</figcaption></figure>
            ))}
          </div>
        </section>
      )}

      {c.faqs.length > 0 && (
        <section className="hs-width hs-section hs-faq">
          <h2>{L.sec_faq_title}</h2>
          <div>{c.faqs.map((f) => <details key={f.q}><summary>{f.q}<span>+</span></summary><p>{f.a}</p></details>)}</div>
        </section>
      )}

      <section className="hs-width hs-section" id="quote">
        <div className="hs-quote">
          <div>
            <span className="hs-kicker">{L.sec_contact_kicker}</span>
            <h2>{L.quote_title}</h2>
            <p>{L.quote_sub}</p>
            {biz.phone && <a className="hs-call" href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={22} /><Num>{biz.phone}</Num></a>}
            {biz.address && <p className="hs-addr"><Icon name="map" size={16} />{biz.address}</p>}
            <dl>{d.hours.map((h) => <div key={h.days}><dt>{h.days}</dt><dd>{h.time}</dd></div>)}</dl>
          </div>
          <div className="hs-form">
            <EnquiryForm slug={biz.slug} services={services.map((s) => s.name)} button={`${L.quote_button} →`} buttonClass="hs-btn"
              messagePlaceholder={L.quote_message} L={L} />
          </div>
        </div>
      </section>

      <footer className="hs-width hs-footer">
        <span className="hs-logo">{biz.name}</span>
        <span>© {d.year} · {c.tagline}</span>
        <div>{c.facebook && <a href={c.facebook}>Facebook</a>}{c.instagram && <a href={c.instagram}>Instagram</a>}<a href="#top">↑</a></div>
      </footer>

      <div className="hs-sticky">
        {biz.phone && <a href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={16} />{L.call}</a>}
        <a href="#quote">{L.free_quote} →</a>
      </div>
      <Script js={SHARED_JS + ROOMS_JS + stageScene("house", HOUSE) + STAGE_JS} />
    </div>
  );
}

export const css = `
.house {
  --paper: color-mix(in srgb, var(--light) 70%, #fbfaf6); --ink: color-mix(in srgb, var(--dark) 92%, #111);
  --muted: color-mix(in srgb, var(--dark) 50%, #8f968f); --line: color-mix(in srgb, var(--dark) 12%, transparent);
  --leaf: var(--primary); --sun: var(--accent); --card: #fff;
  background: var(--paper); color: var(--ink); font: 16px/1.6 var(--body); -webkit-font-smoothing: antialiased;
}
.house h1, .house h2 { font-family: var(--heading); font-weight: 400; letter-spacing: -.02em; }
.hs-width { width: min(1240px, calc(100% - 80px)); margin-inline: auto; }
.hs-kicker { font-size: 12px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; color: var(--leaf); }
.hs-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 12px 24px; border-radius: 14px; background: var(--leaf); color: #fff; font-weight: 700; font-size: 15px; white-space: nowrap; transition: transform .2s, filter .2s; }
.hs-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
.hs-btn.big { min-height: 58px; padding-inline: 30px; font-size: 17px; background: var(--sun); color: var(--ink); }
.hs-btn.line { background: transparent; color: var(--ink); box-shadow: inset 0 0 0 2px var(--ink); }

.hs-nav { display: flex; align-items: center; gap: 28px; padding-block: 20px; --mm-top: 88px; }
.hs-logo { display: inline-flex; align-items: center; gap: 10px; font: 400 22px var(--heading); margin-inline-end: auto; }
.hs-logo img { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; }
.hs-mark { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: var(--leaf); color: #fff; }
.hs-nav nav { display: flex; gap: 26px; }
.hs-nav nav a { font-size: 14px; font-weight: 600; color: var(--muted); }
.hs-nav nav a:hover { color: var(--ink); }
.house .mm-panel { background: var(--paper); color: var(--ink); }
.house .mm-panel nav a { font: 400 2.2rem var(--heading); }
.house .mm-book { background: var(--leaf); color: #fff; border-radius: 14px; }

.hs-hero { display: grid; grid-template-columns: .85fr 1.15fr; gap: 30px; align-items: center; padding-block: 30px 40px; }
.hs-live { display: inline-flex; padding: 8px 14px; border-radius: 999px; background: var(--card); box-shadow: 0 4px 14px #0000000f; font-size: 14px; font-weight: 600; }
.hs-hero h1 { font-size: clamp(44px, 5.4vw, 84px); line-height: 1; margin: 22px 0 18px; }
.hs-hero-copy > p { color: var(--muted); font-size: 18px; max-width: 40ch; }
.hs-buttons { display: flex; flex-wrap: wrap; gap: 10px; margin-block-start: 26px; }
.hs-ticks { list-style: none; display: grid; gap: 8px; margin-block-start: 28px; }
.hs-ticks li { display: flex; gap: 10px; align-items: center; font-weight: 600; font-size: 15px; }
.hs-ticks svg { color: #fff; background: var(--leaf); border-radius: 50%; padding: 3px; width: 22px; height: 22px; flex: none; }
.hs-stage { position: relative; }
.hs-pic { position: relative; aspect-ratio: 3 / 2; border-radius: 28px; background: radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--sun) 25%, var(--card)), color-mix(in srgb, var(--light) 60%, var(--card)) 70%); box-shadow: inset 0 0 0 1px var(--line); }
.hs-pic canvas { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 28px; }
.hs-fallback { display: none; }
.no-3d canvas { display: none; }
.no-3d .hs-fallback { display: block; position: absolute; inset: 0; border-radius: 28px; overflow: hidden; }
.no-3d .hs-fallback img { width: 100%; height: 100%; object-fit: cover; }
.hs-spot { position: absolute; inset-inline-start: var(--x); inset-block-start: var(--y); z-index: 3; }
.hs-spot button { position: relative; width: 44px; height: 44px; margin: -22px; border-radius: 50%; background: var(--card); color: var(--leaf); font-weight: 800; box-shadow: 0 6px 18px #00000026; display: grid; place-items: center; }
.hs-spot button::before { content: ""; position: absolute; inset: -6px; border-radius: 50%; border: 2px solid var(--sun); animation: hs-ping 2.2s ease-out infinite; }
.hs-spot.on button { background: var(--leaf); color: #fff; }
.hs-card { position: absolute; inset-inline-start: 34px; inset-block-start: -30px; width: 250px; background: var(--card); border-radius: 16px; padding: 16px 18px; box-shadow: 0 20px 40px #0000002a; display: grid; gap: 6px; opacity: 0; transform: translateY(8px); pointer-events: none; transition: opacity .25s, transform .25s; }
[dir=ltr] > .hs-spot[data-room="1"] .hs-card { inset-inline-start: auto; inset-inline-end: 34px; }
.hs-spot.on .hs-card { opacity: 1; transform: none; pointer-events: auto; }
.hs-card b { font: 400 20px/1.15 var(--heading); }
.hs-card small { color: var(--muted); font-size: 13px; line-height: 1.45; }
.hs-card span { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-block-start: 6px; }
.hs-card i { font-style: normal; font-weight: 800; }
.hs-card a { color: var(--leaf); font-weight: 700; font-size: 14px; }
.hs-hint { margin: 12px 0 0; font-size: 13px; color: var(--muted); text-align: center; }

.hs-proof { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 26px; padding: 20px 26px; border-radius: 18px; background: var(--card); box-shadow: 0 10px 30px #0000000d; }
.hs-proof b { font: 400 30px var(--heading); color: var(--leaf); }
.hs-proof span { color: var(--muted); font-size: 14px; }
.hs-serving { display: inline-flex; gap: 8px; align-items: center; margin-inline-start: auto; }

.hs-section { padding-block-start: 110px; }
.hs-head { max-width: 640px; margin-block-end: 36px; }
.hs-section h2 { font-size: clamp(36px, 4.4vw, 64px); line-height: 1.02; margin: 12px 0 14px; }
.hs-head p { color: var(--muted); margin: 0; }
.hs-services { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.hs-services a { background: var(--card); border-radius: 22px; padding: 26px; display: flex; flex-direction: column; gap: 8px; min-height: 240px; box-shadow: 0 1px 0 var(--line); transition: transform .25s, box-shadow .25s; }
.hs-services a:hover { transform: translateY(-5px); box-shadow: 0 22px 40px #00000014; }
.hs-ico { width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center; background: color-mix(in srgb, var(--leaf) 12%, var(--card)); color: var(--leaf); margin-block-end: 8px; }
.hs-services b { font: 400 22px/1.15 var(--heading); }
.hs-services small { color: var(--muted); font-size: 14px; flex: 1; }
.hs-price { display: flex; justify-content: space-between; align-items: center; font-weight: 800; padding-block-start: 12px; border-block-start: 1px solid var(--line); }
.hs-price i { font-style: normal; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: var(--sun); color: var(--ink); transition: transform .25s; }
.hs-services a:hover .hs-price i { transform: translateX(4px); }

.hs-about { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
.hs-about p { color: var(--muted); }
.hs-trust { display: grid; gap: 14px; }
.hs-guarantee { background: var(--leaf); color: #fff; border-radius: 22px; padding: 28px; display: grid; gap: 6px; }
.hs-guarantee b { font: 400 26px var(--heading); }
.hs-guarantee p { margin: 0; color: color-mix(in srgb, #fff 80%, transparent); }
.hs-trust ul { list-style: none; display: grid; gap: 8px; }
.hs-trust li { display: flex; gap: 10px; align-items: center; background: var(--card); padding: 14px 18px; border-radius: 14px; font-weight: 600; }
.hs-trust li svg { color: var(--leaf); }
.hs-areas { background: var(--card); border-radius: 22px; padding: 22px; }
.hs-areas div { display: flex; flex-wrap: wrap; gap: 8px; margin-block-start: 12px; }
.hs-areas span { padding: 7px 14px; border-radius: 999px; background: var(--paper); font-size: 14px; }

.hs-steps { list-style: none; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.hs-steps li { background: var(--card); border-radius: 22px; padding: 28px; display: grid; gap: 8px; align-content: start; }
.hs-steps span { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--sun); font-weight: 800; margin-block-end: 8px; }
.hs-steps b { font: 400 22px var(--heading); }
.hs-steps p { margin: 0; color: var(--muted); font-size: 15px; }

.hs-reviews { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.hs-reviews figure { margin: 0; background: var(--card); border-radius: 22px; padding: 26px; display: flex; flex-direction: column; gap: 14px; }
.hs-reviews figure > span { color: var(--sun); letter-spacing: .14em; }
.hs-reviews blockquote { margin: 0; flex: 1; font: 400 19px/1.4 var(--heading); }
.hs-reviews figcaption { font-weight: 700; font-size: 14px; }

.hs-faq { display: grid; grid-template-columns: 40% 1fr; gap: 50px; }
.hs-faq h2 { margin: 0; }
.hs-faq details { background: var(--card); border-radius: 16px; margin-block-end: 10px; }
.hs-faq summary { list-style: none; display: flex; justify-content: space-between; gap: 16px; padding: 20px 22px; font-weight: 700; cursor: pointer; }
.hs-faq summary::-webkit-details-marker { display: none; }
.hs-faq summary span { width: 30px; height: 30px; flex: none; border-radius: 50%; display: grid; place-items: center; background: var(--sun); transition: transform .2s; }
.hs-faq details[open] summary span { transform: rotate(45deg); }
.hs-faq details p { color: var(--muted); padding: 0 22px 20px; margin: 0; }

.hs-quote { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; padding: clamp(28px, 5vw, 60px); border-radius: 30px; background: var(--ink); color: var(--paper); }
.hs-quote .hs-kicker { color: var(--sun); }
.hs-quote h2 { margin-block-start: 12px; }
.hs-quote p { color: color-mix(in srgb, var(--paper) 72%, transparent); }
.hs-call { display: inline-flex; gap: 12px; align-items: center; font: 400 clamp(28px, 3vw, 40px) var(--heading); color: var(--sun); margin-block: 6px 14px; }
.hs-addr { display: flex; gap: 8px; align-items: center; font-size: 14px; }
.hs-quote dl div { display: flex; justify-content: space-between; gap: 16px; padding-block: 8px; border-block-end: 1px solid #ffffff22; font-size: 14px; }
.hs-form form { display: grid; gap: 10px; }
.hs-form input, .hs-form select, .hs-form textarea { width: 100%; padding: 14px 16px; border-radius: 12px; border: 0; background: color-mix(in srgb, var(--paper) 96%, transparent); color: var(--ink); }
.hs-form button { justify-self: start; margin-block-start: 6px; background: var(--sun); color: var(--ink); }
.hs-form [data-note] { font-size: 14px; }

.hs-footer { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; padding-block: 40px; font-size: 13px; color: var(--muted); }
.hs-footer .hs-logo { margin: 0; font-size: 18px; color: var(--ink); }
.hs-footer > div { display: flex; gap: 20px; }
.hs-sticky { display: none; }
@keyframes hs-ping { from { transform: scale(.9); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }

@media (max-width: 960px) {
  .hs-hero, .hs-about, .hs-faq, .hs-quote { grid-template-columns: 1fr; gap: 30px; }
  .hs-steps { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .hs-width { width: calc(100% - 32px); }
  .hs-nav { --mm-top: 80px; }
  .hs-hero { padding-block-start: 10px; }
  .hs-hero h1 { font-size: clamp(38px, 10.5vw, 54px); }
  .hs-pic { margin-inline: -16px; border-radius: 0; }
  .hs-pic canvas { border-radius: 0; }
  .hs-spot button { width: 38px; height: 38px; margin: -19px; }
  .hs-card { position: fixed; inset-inline: 16px !important; inset-block: auto 86px; width: auto; z-index: 75; }
  .hs-proof { padding: 18px; }
  .hs-serving { margin-inline-start: 0; }
  .hs-section { padding-block-start: 80px; }
  .hs-footer { flex-direction: column; text-align: center; padding-block-end: 110px; }
  .hs-sticky { display: flex; gap: 8px; position: fixed; inset-inline: 16px; inset-block-end: 16px; z-index: 70; }
  .hs-sticky a { flex: 1; display: flex; gap: 8px; justify-content: center; align-items: center; padding: 15px; border-radius: 14px; background: var(--leaf); color: #fff; font-weight: 700; font-size: 15px; box-shadow: 0 12px 30px #0000002a; }
  .hs-sticky a:first-child:not(:last-child) { background: var(--sun); color: var(--ink); }
}
`;
