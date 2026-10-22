// Styles for the clinic theme. Brand colours and fonts come in as CSS variables.
export const css = `
:root {
  --ink: var(--dark);
  --muted: color-mix(in srgb, var(--dark) 62%, white);
  --line: color-mix(in srgb, var(--dark) 10%, white);
  --soft: color-mix(in srgb, var(--primary) 7%, white);
  --radius: 22px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: var(--body); color: var(--ink); background: #fff; line-height: 1.6; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
.wrap { width: min(1160px, 100% - 40px); margin-inline: auto; }
h1, h2, h3 { font-family: var(--heading); line-height: 1.1; font-weight: 600; letter-spacing: -0.01em; }
h1 { font-size: clamp(2.4rem, 5.4vw, 4.1rem); }
h2 { font-size: clamp(1.9rem, 3.6vw, 2.8rem); }
h3 { font-size: 1.2rem; }
.eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: .8rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--primary); }
.eyebrow::before { content: ""; width: 22px; height: 2px; background: var(--accent); border-radius: 2px; }
.btn { display: inline-flex; align-items: center; gap: 10px; padding: 15px 26px; border-radius: 999px; font-weight: 600; font-size: .98rem; transition: transform .2s, box-shadow .2s, background .2s; cursor: pointer; border: 0; font-family: var(--body); }
.btn-primary { background: var(--primary); color: #fff; box-shadow: 0 10px 24px -10px var(--primary); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -12px var(--primary); }
.btn-ghost { background: #fff; color: var(--ink); border: 1px solid var(--line); }
.btn-ghost:hover { border-color: var(--primary); color: var(--primary); }

/* nav */
nav { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,.88); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
nav .wrap { display: flex; align-items: center; justify-content: space-between; height: 76px; gap: 24px; }
.brand { display: flex; align-items: center; gap: 12px; font-family: var(--heading); font-weight: 600; font-size: 1.25rem; }
.brand img { height: 42px; width: auto; }
.mark { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; color: #fff; background: linear-gradient(135deg, var(--primary), var(--accent)); font-family: var(--heading); font-size: 1.2rem; }
.links { display: flex; gap: 30px; font-size: .95rem; color: var(--muted); }
.links a:hover { color: var(--primary); }
.nav-cta { display: flex; align-items: center; gap: 18px; }
.nav-phone { font-weight: 600; font-size: .95rem; display: flex; align-items: center; gap: 8px; color: var(--primary); }
@media (max-width: 900px) { .links, .nav-phone { display: none; } }

/* hero */
.hero { position: relative; padding: 72px 0 96px; overflow: hidden; background: radial-gradient(1200px 500px at 85% -10%, var(--soft), transparent 70%), linear-gradient(180deg, #fff, var(--light)); }
.hero .wrap { display: grid; grid-template-columns: 1.05fr .95fr; gap: 56px; align-items: center; }
.hero p.lead { font-size: 1.15rem; color: var(--muted); margin: 22px 0 34px; max-width: 34ch; }
.hero .actions { display: flex; flex-wrap: wrap; gap: 14px; }
.hero h1 em { font-style: italic; color: var(--primary); }
.trust { display: flex; flex-wrap: wrap; gap: 22px; margin-top: 40px; color: var(--muted); font-size: .92rem; }
.trust span { display: inline-flex; align-items: center; gap: 8px; }
.trust svg { color: var(--accent); }
.visual { position: relative; aspect-ratio: 4 / 4.4; }
.visual .photo { position: absolute; inset: 0 0 0 8%; border-radius: 200px 200px var(--radius) var(--radius); overflow: hidden; background: linear-gradient(160deg, var(--primary), color-mix(in srgb, var(--primary) 55%, var(--accent))); box-shadow: 0 40px 80px -40px color-mix(in srgb, var(--primary) 70%, black); }
.visual .photo img { width: 100%; height: 100%; object-fit: cover; }
.visual .photo .art { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(255,255,255,.9); }
.visual .photo .art::before, .visual .photo .art::after { content: ""; position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,.25); }
.visual .photo .art::before { width: 70%; aspect-ratio: 1; }
.visual .photo .art::after { width: 45%; aspect-ratio: 1; border-color: rgba(255,255,255,.4); }
.float { position: absolute; background: #fff; border-radius: 18px; padding: 16px 18px; box-shadow: 0 24px 50px -24px rgba(0,0,0,.35); display: flex; align-items: center; gap: 12px; font-size: .9rem; }
.float strong { display: block; font-size: 1rem; }
.float small { color: var(--muted); }
.float .dot { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; background: var(--soft); color: var(--primary); flex: none; }
.float.a { left: -2%; bottom: 14%; }
.float.b { right: -3%; top: 10%; }
.stars { display: inline-flex; gap: 2px; color: #f5a623; }
@media (max-width: 900px) {
  .hero .wrap { grid-template-columns: 1fr; }
  .visual { max-width: 460px; width: 100%; margin-inline: auto; }
  .float.b { right: 0; }
  .float.a { left: 0; }
}

/* sections */
section { padding: 100px 0; }
.head { max-width: 640px; margin-bottom: 52px; }
.head p { color: var(--muted); margin-top: 14px; font-size: 1.05rem; }
.head.center { text-align: center; margin-inline: auto; }

.services { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
.service { padding: 30px; border-radius: var(--radius); border: 1px solid var(--line); background: #fff; transition: transform .25s, box-shadow .25s, border-color .25s; }
.service:hover { transform: translateY(-4px); box-shadow: 0 30px 60px -36px color-mix(in srgb, var(--primary) 60%, black); border-color: transparent; }
.service .ico { width: 54px; height: 54px; border-radius: 16px; display: grid; place-items: center; background: var(--soft); color: var(--primary); margin-bottom: 20px; }
.service p { color: var(--muted); margin-top: 8px; font-size: .97rem; }

.about { background: var(--light); }
.about .wrap { display: grid; grid-template-columns: .9fr 1.1fr; gap: 64px; align-items: center; }
.about-card { border-radius: var(--radius); overflow: hidden; aspect-ratio: 1; background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black), var(--primary)); position: relative; color: #fff; padding: 40px; display: flex; flex-direction: column; justify-content: flex-end; }
.about-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.about-card .big { font-family: var(--heading); font-size: 4.5rem; line-height: 1; position: relative; }
.about-card p { position: relative; opacity: .85; }
.about-text p { color: var(--muted); margin-top: 18px; font-size: 1.05rem; }
.checks { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 30px; }
.checks div { display: flex; gap: 10px; align-items: center; font-weight: 500; }
.checks svg { color: var(--primary); background: #fff; border-radius: 50%; padding: 4px; flex: none; }
@media (max-width: 900px) { .about .wrap { grid-template-columns: 1fr; } .checks { grid-template-columns: 1fr; } }

.reviews { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.review { padding: 30px; border-radius: var(--radius); background: #fff; border: 1px solid var(--line); display: flex; flex-direction: column; gap: 16px; }
.review p { font-size: 1.02rem; }
.review .who { margin-top: auto; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.review .who span { width: 36px; height: 36px; border-radius: 50%; background: var(--soft); color: var(--primary); display: grid; place-items: center; font-size: .9rem; }

.visit .wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.panel { border-radius: var(--radius); padding: 40px; border: 1px solid var(--line); }
.panel.dark { background: var(--dark); color: #fff; border: 0; }
.panel h3 { font-size: 1.5rem; margin-bottom: 22px; }
.hours div { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.12); }
.contact-line { display: flex; gap: 14px; align-items: flex-start; padding: 12px 0; }
.contact-line svg { color: var(--primary); flex: none; margin-top: 3px; }
form { display: grid; gap: 12px; margin-top: 10px; }
input, select, textarea { width: 100%; padding: 14px 16px; border-radius: 14px; border: 1px solid var(--line); font: inherit; background: #fff; color: var(--ink); }
input:focus, select:focus, textarea:focus { outline: 2px solid color-mix(in srgb, var(--primary) 40%, white); border-color: var(--primary); }
[data-note] { font-size: .9rem; color: var(--primary); min-height: 1.2em; }
@media (max-width: 900px) { .visit .wrap { grid-template-columns: 1fr; } .panel { padding: 28px; } }

.faq details { border-bottom: 1px solid var(--line); padding: 22px 0; }
.faq summary { cursor: pointer; font-weight: 600; font-size: 1.08rem; list-style: none; display: flex; justify-content: space-between; gap: 20px; }
.faq summary::after { content: "+"; color: var(--primary); font-size: 1.4rem; line-height: 1; }
.faq details[open] summary::after { content: "−"; }
.faq details p { color: var(--muted); margin-top: 12px; }

.band { margin: 0 20px 20px; border-radius: 32px; padding: 72px 20px; text-align: center; color: #fff; background: radial-gradient(600px 300px at 20% 0%, color-mix(in srgb, var(--accent) 60%, transparent), transparent), var(--primary); }
.band p { opacity: .85; margin: 14px auto 30px; max-width: 46ch; }
.band .btn { background: #fff; color: var(--primary); }

footer { padding: 40px 0 60px; color: var(--muted); font-size: .9rem; }
footer .wrap { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
`;
