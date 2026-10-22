// Styles for the salon theme. Brand colours and fonts come in as CSS variables.
export const css = `
:root {
  --cream: var(--light);
  --muted: color-mix(in srgb, var(--dark) 58%, var(--light));
  --line: color-mix(in srgb, var(--dark) 14%, var(--light));
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: var(--body); color: var(--dark); background: var(--cream); line-height: 1.65; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
.wrap { width: min(1240px, 100% - 40px); margin-inline: auto; }
h1, h2, h3 { font-family: var(--heading); font-weight: 400; line-height: 1.04; letter-spacing: -0.015em; }
h1 { font-size: clamp(3rem, 8vw, 6.6rem); }
h2 { font-size: clamp(2.2rem, 5vw, 4rem); }
h3 { font-size: 1.5rem; }
em { font-style: italic; color: var(--primary); }
.kicker { font-size: .78rem; letter-spacing: .28em; text-transform: uppercase; font-weight: 600; color: var(--muted); }
.btn { display: inline-flex; align-items: center; gap: 10px; padding: 16px 30px; border-radius: 999px; font-weight: 600; letter-spacing: .02em; font-size: .95rem; border: 0; cursor: pointer; font-family: var(--body); transition: background .25s, color .25s, transform .25s; }
.btn-solid { background: var(--dark); color: var(--cream); }
.btn-solid:hover { background: var(--primary); transform: translateY(-2px); }
.btn-outline { border: 1px solid var(--dark); }
.btn-outline:hover { background: var(--dark); color: var(--cream); }

nav { position: absolute; left: 0; right: 0; z-index: 30; }
nav .wrap { display: flex; align-items: center; justify-content: space-between; height: 92px; }
.brand { font-family: var(--heading); font-size: 1.7rem; letter-spacing: -0.01em; display: flex; align-items: center; gap: 12px; }
.brand img { height: 48px; }
.links { display: flex; gap: 34px; font-size: .9rem; letter-spacing: .06em; }
.links a { position: relative; }
.links a::after { content: ""; position: absolute; left: 0; right: 100%; bottom: -4px; height: 1px; background: currentColor; transition: right .3s; }
.links a:hover::after { right: 0; }
@media (max-width: 900px) { .links { display: none; } }

.hero { padding: 150px 0 80px; position: relative; overflow: hidden; }
.hero .wrap { display: grid; grid-template-columns: 1.1fr .9fr; gap: 60px; align-items: end; }
.hero p.lead { font-size: 1.15rem; color: var(--muted); max-width: 36ch; margin: 30px 0 38px; }
.hero .actions { display: flex; gap: 14px; flex-wrap: wrap; }
.collage { position: relative; height: 600px; }
.collage .p { position: absolute; overflow: hidden; background: var(--primary); }
.collage .p img { width: 100%; height: 100%; object-fit: cover; }
.collage .p1 { inset: 0 18% 14% 0; border-radius: 300px 300px 8px 8px; background: linear-gradient(170deg, color-mix(in srgb, var(--primary) 75%, white), var(--primary)); }
.collage .p2 { width: 46%; height: 42%; right: 0; bottom: 0; border-radius: 8px; border: 10px solid var(--cream); background: linear-gradient(160deg, var(--accent), color-mix(in srgb, var(--accent) 60%, var(--dark))); }
.collage .art { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(255,255,255,.85); }
.collage .seal { position: absolute; left: -26px; bottom: 22%; width: 120px; height: 120px; border-radius: 50%; background: var(--cream); display: grid; place-items: center; text-align: center; font-family: var(--heading); font-size: 1.05rem; line-height: 1.1; box-shadow: 0 20px 40px -20px rgba(0,0,0,.3); }
.collage .seal b { display: block; font-size: 2rem; font-weight: 400; }
@media (max-width: 900px) { .hero .wrap { grid-template-columns: 1fr; } .collage { height: 440px; } .collage .seal { left: 0; } }

.marquee { border-block: 1px solid var(--line); overflow: hidden; white-space: nowrap; padding: 22px 0; }
.marquee div { display: inline-flex; gap: 48px; animation: slide 30s linear infinite; font-family: var(--heading); font-size: 1.6rem; font-style: italic; }
.marquee span { display: inline-flex; gap: 48px; align-items: center; }
.marquee span::after { content: "✦"; color: var(--primary); font-style: normal; font-size: 1rem; }
@keyframes slide { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .marquee div { animation: none; } }

section { padding: 120px 0; }
.intro { display: grid; grid-template-columns: .8fr 1.2fr; gap: 80px; }
.intro p { color: var(--muted); font-size: 1.08rem; margin-top: 20px; }
@media (max-width: 900px) { .intro { grid-template-columns: 1fr; gap: 20px; } }

.menu { background: var(--dark); color: var(--cream); }
.menu .kicker { color: color-mix(in srgb, var(--cream) 60%, transparent); }
.menu-list { margin-top: 56px; border-top: 1px solid rgba(255,255,255,.15); }
.item { display: grid; grid-template-columns: 70px 1fr 1.2fr; gap: 30px; padding: 30px 0; border-bottom: 1px solid rgba(255,255,255,.15); align-items: start; transition: padding .3s; }
.item:hover { padding-left: 14px; }
.item .ico { color: var(--accent); }
.item h3 { font-size: 1.9rem; }
.item p { color: color-mix(in srgb, var(--cream) 70%, transparent); }
@media (max-width: 800px) { .item { grid-template-columns: 50px 1fr; } .item p { grid-column: 2; } }

.gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 50px; }
.gallery div { aspect-ratio: 3 / 4; border-radius: 6px; overflow: hidden; background: color-mix(in srgb, var(--primary) 25%, var(--cream)); display: grid; place-items: center; color: var(--primary); }
.gallery div:nth-child(even) { margin-top: 40px; background: color-mix(in srgb, var(--accent) 30%, var(--cream)); }
.gallery img { width: 100%; height: 100%; object-fit: cover; }
@media (max-width: 800px) { .gallery { grid-template-columns: 1fr 1fr; } }

.words { text-align: center; }
.words blockquote { font-family: var(--heading); font-size: clamp(1.6rem, 3.4vw, 2.6rem); line-height: 1.25; max-width: 26ch; margin: 30px auto 24px; }
.words cite { font-style: normal; letter-spacing: .2em; text-transform: uppercase; font-size: .8rem; color: var(--muted); }
.words .more { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 30px; margin-top: 70px; text-align: left; }
.words .more p { color: var(--muted); }
.stars { display: inline-flex; gap: 2px; color: var(--primary); }

.book { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: 10px; overflow: hidden; background: #fff; }
.book .info { padding: 60px; background: var(--primary); color: #fff; }
.book .info p { opacity: .85; margin-top: 16px; }
.book .info .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.2); gap: 20px; }
.book form { display: grid; gap: 14px; align-content: start; margin-top: 10px; }
input, select, textarea { width: 100%; padding: 15px 0; border: 0; border-bottom: 1px solid var(--line); font: inherit; background: transparent; color: var(--dark); }
input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary); }
[data-note] { font-size: .9rem; color: var(--primary); min-height: 1.2em; }
@media (max-width: 900px) { .book { grid-template-columns: 1fr; } .book .info, .book .book-form { padding: 36px 26px !important; } }

footer { padding: 70px 0 50px; text-align: center; }
footer .brand { justify-content: center; font-size: 3rem; }
footer p { color: var(--muted); margin-top: 12px; font-size: .92rem; }
footer .social { display: flex; justify-content: center; gap: 22px; margin-top: 18px; font-size: .9rem; letter-spacing: .1em; text-transform: uppercase; }
`;
