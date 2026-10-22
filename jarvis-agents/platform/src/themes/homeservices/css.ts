// Styles for the homeservices theme. Brand colours and fonts come in as CSS variables.
export const css = `
:root {
  --muted: color-mix(in srgb, var(--dark) 60%, white);
  --line: color-mix(in srgb, var(--dark) 12%, white);
  --tint: color-mix(in srgb, var(--accent) 14%, white);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: var(--body); color: var(--dark); background: #fff; line-height: 1.55; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
.wrap { width: min(1200px, 100% - 40px); margin-inline: auto; }
h1, h2, h3 { font-family: var(--heading); line-height: 1.02; font-weight: 700; letter-spacing: -0.02em; text-transform: none; }
h1 { font-size: clamp(2.6rem, 6.4vw, 5rem); }
h2 { font-size: clamp(2rem, 4vw, 3.1rem); }
h3 { font-size: 1.25rem; letter-spacing: -0.01em; }
.tag { display: inline-block; font-size: .78rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 17px 28px; border-radius: 10px; font-weight: 700; font-size: 1rem; border: 0; cursor: pointer; font-family: var(--body); transition: transform .15s, filter .15s; }
.btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
.btn-accent { background: var(--accent); color: var(--dark); }
.btn-line { border: 2px solid rgba(255,255,255,.35); color: #fff; }
.btn-dark { background: var(--dark); color: #fff; }

/* top strip + nav */
.strip { background: var(--accent); color: var(--dark); font-weight: 700; font-size: .9rem; }
.strip .wrap { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; gap: 16px; flex-wrap: wrap; }
.strip span { display: inline-flex; align-items: center; gap: 8px; }
nav { background: var(--dark); color: #fff; position: sticky; top: 0; z-index: 40; }
nav .wrap { display: flex; align-items: center; justify-content: space-between; height: 78px; gap: 20px; }
.brand { display: flex; align-items: center; gap: 12px; font-family: var(--heading); font-weight: 800; font-size: 1.3rem; letter-spacing: -0.02em; }
.brand img { height: 44px; }
.mark { width: 44px; height: 44px; border-radius: 10px; background: var(--primary); display: grid; place-items: center; color: #fff; }
.links { display: flex; gap: 28px; font-weight: 500; opacity: .85; }
.links a:hover { color: var(--accent); }
@media (max-width: 900px) { .links { display: none; } nav .btn { padding: 12px 16px; font-size: .9rem; } }

/* hero */
.hero { background: var(--dark); color: #fff; position: relative; overflow: hidden; }
.hero::before { content: ""; position: absolute; inset: 0; background: radial-gradient(800px 500px at 90% 20%, color-mix(in srgb, var(--primary) 70%, transparent), transparent 70%); }
.hero .bg { position: absolute; inset: 0; opacity: .32; }
.hero .bg img { width: 100%; height: 100%; object-fit: cover; }
.hero .wrap { position: relative; display: grid; grid-template-columns: 1.25fr .75fr; gap: 48px; padding: 96px 0 110px; align-items: center; }
.hero h1 span { color: var(--accent); }
.hero p.lead { font-size: 1.2rem; opacity: .82; margin: 24px 0 36px; max-width: 40ch; }
.hero .actions { display: flex; gap: 14px; flex-wrap: wrap; }
.quote { background: #fff; color: var(--dark); border-radius: 16px; padding: 30px; box-shadow: 0 40px 80px -30px rgba(0,0,0,.6); }
.quote h3 { margin-bottom: 6px; }
.quote p { color: var(--muted); font-size: .95rem; margin-bottom: 18px; }
form { display: grid; gap: 10px; }
input, select, textarea { width: 100%; padding: 14px 15px; border-radius: 10px; border: 1.5px solid var(--line); font: inherit; color: var(--dark); background: #fff; }
input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary); }
[data-note] { font-size: .88rem; color: var(--primary); min-height: 1.1em; }
@media (max-width: 900px) { .hero .wrap { grid-template-columns: 1fr; padding: 64px 0 72px; } }

/* proof bar */
.proof { background: var(--primary); color: #fff; }
.proof .wrap { display: grid; grid-template-columns: repeat(4, 1fr); }
.proof div { padding: 26px 20px; display: flex; gap: 12px; align-items: center; font-weight: 600; border-left: 1px solid rgba(255,255,255,.15); }
.proof div:first-child { border-left: 0; }
.proof svg { color: var(--accent); flex: none; }
@media (max-width: 900px) { .proof .wrap { grid-template-columns: 1fr 1fr; } .proof div { border-left: 0; border-top: 1px solid rgba(255,255,255,.15); } }

section { padding: 100px 0; }
.head { display: flex; justify-content: space-between; align-items: end; gap: 30px; margin-bottom: 48px; flex-wrap: wrap; }
.head p { color: var(--muted); max-width: 46ch; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.svc { background: #fff; padding: 34px 30px; position: relative; transition: background .2s, border-color .2s; border: 2px solid var(--line); border-radius: 16px; }
.svc:hover { border-color: var(--primary); }
.svc:hover { background: var(--tint); }
.svc .ico { width: 58px; height: 58px; border-radius: 14px; background: var(--dark); color: var(--accent); display: grid; place-items: center; margin-bottom: 22px; }
.svc p { color: var(--muted); margin-top: 10px; }
.svc .num { position: absolute; top: 26px; right: 28px; font-family: var(--heading); font-weight: 800; color: var(--line); font-size: 1.6rem; }

.why { background: var(--tint); }
.why .wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.why p.body { color: var(--muted); margin-top: 18px; font-size: 1.05rem; }
.why ul { list-style: none; display: grid; gap: 14px; margin-top: 28px; }
.why li { display: flex; gap: 14px; align-items: center; background: #fff; padding: 16px 18px; border-radius: 12px; font-weight: 600; }
.why li svg { color: #fff; background: var(--primary); border-radius: 8px; padding: 5px; flex: none; }
.why-visual { border-radius: 20px; overflow: hidden; aspect-ratio: 4 / 5; background: var(--dark); position: relative; display: grid; place-items: center; color: var(--accent); }
.why-visual img { width: 100%; height: 100%; object-fit: cover; }
.why-visual .badge { position: absolute; left: 24px; bottom: 24px; right: 24px; background: #fff; color: var(--dark); border-radius: 14px; padding: 18px 20px; display: flex; gap: 14px; align-items: center; }
.why-visual .badge strong { font-family: var(--heading); font-size: 1.8rem; }
.stars { display: inline-flex; gap: 2px; color: #f5a623; }
@media (max-width: 900px) { .why .wrap { grid-template-columns: 1fr; } }

.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; counter-reset: step; }
.step { padding: 32px; border-radius: 16px; border: 2px solid var(--line); }
.step::before { counter-increment: step; content: "0" counter(step); display: block; font-family: var(--heading); font-weight: 800; font-size: 2.6rem; color: var(--primary); margin-bottom: 14px; }
.step p { color: var(--muted); margin-top: 8px; }
@media (max-width: 900px) { .steps { grid-template-columns: 1fr; } }

.areas { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
.areas span { padding: 10px 16px; border-radius: 999px; background: #fff; border: 1.5px solid var(--line); font-weight: 600; font-size: .92rem; display: inline-flex; gap: 6px; align-items: center; }
.areas svg { color: var(--primary); }

.reviews { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 20px; }
.review { background: var(--dark); color: #fff; border-radius: 16px; padding: 30px; display: flex; flex-direction: column; gap: 16px; }
.review p { opacity: .9; }
.review cite { font-style: normal; font-weight: 700; margin-top: auto; color: var(--accent); }

.cta { background: var(--accent); }
.cta .wrap { display: flex; justify-content: space-between; align-items: center; gap: 30px; padding: 64px 0; flex-wrap: wrap; }
.cta h2 { max-width: 18ch; }
.cta .phone-big { font-family: var(--heading); font-weight: 800; font-size: clamp(1.8rem, 4vw, 2.8rem); display: flex; gap: 14px; align-items: center; }

footer { background: var(--dark); color: rgba(255,255,255,.7); padding: 56px 0; font-size: .93rem; }
footer .wrap { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; }
footer h4 { color: #fff; margin-bottom: 12px; font-family: var(--heading); }
footer .row { display: flex; justify-content: space-between; padding: 6px 0; gap: 12px; }
@media (max-width: 900px) { footer .wrap { grid-template-columns: 1fr; } }

/* phone button that follows you on mobile */
.call-fab { position: fixed; right: 16px; bottom: 16px; z-index: 60; display: none; background: var(--accent); color: var(--dark); border-radius: 999px; padding: 15px 20px; font-weight: 800; box-shadow: 0 12px 30px -10px rgba(0,0,0,.5); gap: 8px; align-items: center; }
@media (max-width: 700px) { .call-fab { display: inline-flex; } }
`;
