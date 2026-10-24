// Styles for the section library. Skeleton quality on purpose: clean and solid,
// to be restyled from the reference sites later. Rules:
//  - colours and fonts come from the business (--primary, --accent, --dark,
//    --light, --heading, --body), the template's style settings come in as
//    data attributes on .site
//  - start/end, never left/right, so Arabic and Hebrew sites mirror properly

import type { SectionType } from "./sections";

export const BASE = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button, input, select, textarea { font: inherit; color: inherit; }

.site {
  --r: 14px; --r-lg: 22px; --btn-r: 999px;
  --pad: clamp(72px, 9vw, 112px);
  --bg: #fff; --surface: var(--light); --card: #fff; --ink: var(--dark);
  --muted: color-mix(in srgb, currentColor 66%, transparent);
  --line: color-mix(in srgb, currentColor 13%, transparent);
  --soft: color-mix(in srgb, var(--primary) 9%, transparent);
  --hw: 600; --hcase: none; --hls: -0.015em;
  position: relative; overflow-x: clip;
  font-family: var(--body); line-height: 1.6; -webkit-font-smoothing: antialiased;
  background: var(--bg); color: var(--ink); min-height: 100vh;
}
.site[data-radius=sharp] { --r: 2px; --r-lg: 4px; }
.site[data-radius=soft] { --r: 10px; --r-lg: 16px; }
.site[data-radius=round] { --r: 20px; --r-lg: 32px; }
.site[data-buttons=square] { --btn-r: 3px; }
.site[data-buttons=soft] { --btn-r: 10px; }
.site[data-density=airy] { --pad: clamp(88px, 11vw, 150px); }
.site[data-density=compact] { --pad: clamp(56px, 7vw, 84px); }
.site[data-mood=tinted] { --bg: var(--light); --surface: #fff; }
.site[data-mood=dark] { --bg: color-mix(in srgb, var(--dark) 92%, black); --surface: var(--dark); --card: color-mix(in srgb, var(--dark) 82%, white); --ink: var(--light); }
.site[data-heads=upper] { --hcase: uppercase; --hls: 0.01em; --hw: 700; }
.site[data-heads=light] { --hw: 400; }

.wrap { width: min(1180px, 100% - 40px); margin-inline: auto; }
.wrap.narrow { width: min(820px, 100% - 40px); }
h1, h2, h3, h4 { font-family: var(--heading); line-height: 1.08; font-weight: var(--hw); letter-spacing: var(--hls); text-transform: var(--hcase); }
h1 { font-size: clamp(2.4rem, 5.6vw, 4.4rem); overflow-wrap: break-word; hyphens: auto; }
h2 { font-size: clamp(1.9rem, 3.8vw, 3rem); overflow-wrap: break-word; hyphens: auto; }
h3 { font-size: 1.2rem; line-height: 1.25; }
p { overflow-wrap: break-word; }

.sec { padding-block: var(--pad); }
.tone-alt { background: var(--surface); }
.tone-inv, .tone-brand { --ink: var(--light); --card: color-mix(in srgb, currentColor 7%, transparent); color: var(--ink); background: var(--dark); }
.tone-brand { --ink: #fff; background: var(--primary); }
.site[data-mood=dark] .tone-inv { background: var(--light); --ink: var(--dark); --card: #fff; }

.kicker { display: inline-flex; align-items: center; gap: 10px; font-size: .78rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--primary); }
.kicker::before { content: ""; width: 22px; height: 2px; background: var(--accent); border-radius: 2px; }
.tone-inv .kicker, .tone-brand .kicker, .site[data-mood=dark] .kicker { color: var(--accent); }
.head { max-width: 680px; margin-block-end: 48px; display: grid; gap: 14px; }
.head p { color: var(--muted); font-size: 1.06rem; }
.head.center { text-align: center; margin-inline: auto; justify-items: center; }
.head-row { display: flex; justify-content: space-between; align-items: end; gap: 20px; flex-wrap: wrap; margin-block-end: 40px; }
.head-row .head { margin: 0; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 15px 26px; border-radius: var(--btn-r); font-weight: 600; font-size: .98rem; border: 1.5px solid transparent; cursor: pointer; transition: transform .2s, box-shadow .2s, background .2s, border-color .2s; white-space: nowrap; }
.btn:hover { transform: translateY(-2px); }
.btn-sm { padding: 11px 18px; font-size: .92rem; }
.btn-block { width: 100%; }
.btn-main { background: var(--primary); color: #fff; box-shadow: 0 12px 26px -14px var(--primary); }
.btn-alt { border-color: var(--line); color: inherit; background: transparent; }
.btn-alt:hover { border-color: var(--primary); color: var(--primary); }
.btn-light { background: #fff; color: var(--dark); }
.btn-ghost-light { border-color: rgba(255,255,255,.45); color: #fff; }
.tone-brand .btn-main { background: #fff; color: var(--primary); }
.actions { display: flex; flex-wrap: wrap; gap: 12px; }

.card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r-lg); }
.media { position: relative; border-radius: var(--r-lg); overflow: hidden; background: linear-gradient(150deg, var(--primary), color-mix(in srgb, var(--primary) 50%, var(--accent))); min-height: 220px; }
.media img, .media video { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
.media .art { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(255,255,255,.88); }
.media .art::before { content: ""; position: absolute; width: 62%; aspect-ratio: 1; border-radius: 50%; border: 1px solid rgba(255,255,255,.28); }
.ticks { list-style: none; display: grid; gap: 12px; }
.ticks li { display: flex; gap: 10px; align-items: center; font-weight: 500; }
.ticks svg { color: var(--accent); flex: none; }
.ticks.row { display: flex; flex-wrap: wrap; gap: 10px 24px; color: var(--muted); font-size: .94rem; }
.ticks.row.center { justify-content: center; }
.ticks.grid2 { grid-template-columns: 1fr 1fr; margin-block-start: 28px; }
.stars { display: inline-flex; gap: 2px; color: #f5a623; }
.rating-chip { display: inline-flex; align-items: center; gap: 12px; }
.rating-chip strong { font-family: var(--heading); font-size: 2rem; line-height: 1; }
.rating-chip small { display: block; color: var(--muted); font-size: .85rem; }
.avatar { width: 84px; height: 84px; border-radius: 50%; display: grid; place-items: center; background: var(--soft); color: var(--primary); font-family: var(--heading); font-size: 1.6rem; font-weight: 600; }
.avatar.sm { width: 34px; height: 34px; font-size: .8rem; }
.chips { display: flex; flex-wrap: wrap; gap: 10px; }
.chips span { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: var(--btn-r); border: 1px solid var(--line); background: var(--card); font-weight: 500; }
.chips svg { color: var(--primary); }

.lines { display: grid; gap: 4px; margin-block-end: 18px; }
.lines > div { display: flex; gap: 12px; align-items: flex-start; padding-block: 8px; }
.lines svg { color: var(--accent); flex: none; margin-block-start: 3px; }
.hours { display: grid; margin-block-end: 26px; }
.hours div { display: flex; justify-content: space-between; gap: 16px; padding-block: 11px; border-block-end: 1px solid var(--line); }

form { display: grid; gap: 12px; }
input, select, textarea { width: 100%; padding: 14px 16px; border-radius: var(--r); border: 1px solid var(--line); background: var(--bg); color: var(--ink); }
.card input, .card select, .card textarea { background: transparent; }
select option { color: #111; }
input:focus, select:focus, textarea:focus { outline: 2px solid color-mix(in srgb, var(--primary) 45%, transparent); border-color: var(--primary); }
[data-note] { font-size: .9rem; color: var(--primary); min-height: 1.2em; }

@media (max-width: 900px) { .ticks.grid2 { grid-template-columns: 1fr; } }
`;

export const SECTION_CSS: Record<SectionType, string> = {
  topbar: `
.topbar { background: var(--dark); color: #fff; font-size: .86rem; }
.site[data-mood=dark] .topbar { background: var(--primary); }
.topbar .wrap { display: flex; gap: 10px 26px; align-items: center; flex-wrap: wrap; padding-block: 9px; }
.topbar span, .topbar a { display: inline-flex; align-items: center; gap: 7px; opacity: .9; }
.topbar .topbar-phone { margin-inline-start: auto; font-weight: 700; opacity: 1; }
@media (max-width: 700px) { .topbar span:nth-child(2) { display: none; } }
`,
  nav: `
.nav { position: sticky; top: 0; z-index: 50; background: color-mix(in srgb, var(--bg) 90%, transparent); backdrop-filter: blur(12px); border-block-end: 1px solid var(--line); }
.nav .wrap { display: flex; align-items: center; justify-content: space-between; min-height: 76px; gap: 24px; }
.brand { display: flex; align-items: center; gap: 12px; font-family: var(--heading); font-weight: 600; font-size: 1.2rem; }
.brand img { height: 42px; width: auto; }
.mark { width: 40px; height: 40px; border-radius: var(--r); display: grid; place-items: center; color: #fff; background: linear-gradient(135deg, var(--primary), var(--accent)); font-size: 1.15rem; }
.nav .links { display: flex; gap: 28px; font-size: .95rem; color: var(--muted); }
.nav .links a:hover { color: var(--primary); }
.nav-cta { display: flex; align-items: center; gap: 18px; }
.nav-phone { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; color: var(--primary); }
.nav.v-centered .wrap { display: grid; grid-template-columns: 1fr auto 1fr; }
.nav.v-centered .links.end { justify-content: flex-end; align-items: center; }
.nav.v-centered .brand { flex-direction: column; gap: 4px; font-size: 1.35rem; }
.nav.v-centered .mark { display: none; }
.nav.v-overlay { position: absolute; top: auto; inset-inline: 0; background: transparent; backdrop-filter: none; border: 0; color: #fff; }
.nav.v-overlay .links { color: rgba(255,255,255,.85); }
.nav.v-overlay .links a:hover { color: #fff; }
@media (max-width: 900px) {
  .nav .links, .nav-phone { display: none; }
  .nav.v-centered .wrap { grid-template-columns: 1fr auto; }
  .nav.v-centered .links:first-child { display: none; }
  .nav.v-centered .links.end { display: flex; }
  .nav.v-centered .links.end a:not(.btn) { display: none; }
  .nav.v-centered .brand { flex-direction: row; }
}
`,
  hero: `
.hero { position: relative; padding-block: clamp(56px, 8vw, 104px); }
.hero .copy { display: grid; gap: 22px; align-content: center; justify-items: start; }
.hero .lead { font-size: 1.15rem; color: var(--muted); max-width: 40ch; }
.hero .wrap { position: relative; }
.hero.v-split { background: radial-gradient(900px 420px at 90% -10%, var(--soft), transparent 70%); }
.hero.v-split .wrap, .hero.v-form .wrap, .hero.v-card .wrap { display: grid; grid-template-columns: 1.05fr .95fr; gap: clamp(32px, 5vw, 64px); align-items: center; }
.hero.v-split .visual { position: relative; }
.hero.v-split .media { aspect-ratio: 4 / 4.5; }
.hero .float { position: absolute; inset-inline-start: -24px; inset-block-end: 28px; background: var(--card); color: var(--ink); padding: 16px 20px; border-radius: var(--r-lg); box-shadow: 0 24px 50px -24px rgba(0,0,0,.4); }
.hero.v-photo { min-height: min(86vh, 820px); display: grid; align-items: end; color: #fff; padding-block: 160px 72px; }
.hero.v-photo .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero.v-photo .art-bg { background: radial-gradient(800px 500px at 80% 20%, color-mix(in srgb, var(--accent) 45%, transparent), transparent), linear-gradient(160deg, var(--primary), var(--dark)); }
.hero.v-photo::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.72), rgba(0,0,0,.18) 70%); }
.hero.v-photo .wrap { z-index: 1; }
.hero.v-photo .copy { max-width: 760px; }
.hero.v-photo .lead, .hero.v-photo .rating-chip small, .hero.v-photo .ticks.row { color: rgba(255,255,255,.82); }
.hero.v-photo .kicker { color: #fff; }
.hero .under { display: flex; flex-wrap: wrap; gap: 18px 32px; align-items: center; }
.hero.v-centered { text-align: center; background: radial-gradient(900px 400px at 50% 0%, var(--soft), transparent 70%); }
.hero.v-centered .copy { justify-items: center; max-width: 860px; margin-inline: auto; }
.hero.v-centered .actions, .hero.v-centered .under { justify-content: center; }
.hero.v-centered .under { margin-block-start: 30px; }
.hero.v-centered .media.wide { margin-block-start: 56px; aspect-ratio: 21 / 9; }
.hero.v-collage .wrap { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 5vw, 72px); align-items: center; }
.hero.v-collage .frames { position: relative; aspect-ratio: 1 / 1.05; }
.hero.v-collage .f1 { position: absolute; inset-block: 0 12%; inset-inline: 0 22%; }
.hero.v-collage .f2 { position: absolute; inset-block: 46% 0; inset-inline: 48% 0; min-height: 0; border: 6px solid var(--bg); }
.hero.v-collage .seal { position: absolute; inset-inline-end: 4%; inset-block-start: 6%; width: 116px; aspect-ratio: 1; border-radius: 50%; background: var(--accent); color: var(--dark); display: grid; place-content: center; text-align: center; font-size: .78rem; text-transform: uppercase; letter-spacing: .1em; }
.hero.v-collage .seal b { font-family: var(--heading); font-size: 2rem; letter-spacing: 0; display: block; }
.hero.v-form { background: linear-gradient(160deg, var(--surface), var(--bg)); }
.hero .quote { padding: 30px; display: grid; gap: 8px; box-shadow: 0 30px 70px -40px rgba(0,0,0,.45); }
.hero .quote p { color: var(--muted); margin-block-end: 8px; }
.hero.v-card { background: linear-gradient(180deg, var(--soft), transparent); }
.hero .menu-card { padding: 28px; box-shadow: 0 30px 70px -40px rgba(0,0,0,.45); display: grid; gap: 18px; }
.hero .menu-card ul { list-style: none; display: grid; }
.hero .menu-card li { display: flex; gap: 14px; align-items: center; padding-block: 12px; border-block-end: 1px solid var(--line); }
.hero .menu-card .ico { width: 38px; height: 38px; border-radius: var(--r); background: var(--soft); color: var(--primary); display: grid; place-items: center; flex: none; }
.hero .menu-card .name { flex: 1; font-weight: 600; }
.hero .menu-card small { display: block; color: var(--muted); font-weight: 400; }
@media (max-width: 900px) {
  .hero.v-split .wrap, .hero.v-form .wrap, .hero.v-card .wrap, .hero.v-collage .wrap { grid-template-columns: 1fr; }
  .hero .float { inset-inline-start: 12px; }
  .hero.v-split .media { aspect-ratio: 4 / 3.4; }
}
`,
  trust: `
.trust .wrap { display: flex; flex-wrap: wrap; gap: 14px 40px; align-items: center; justify-content: space-between; }
.trust .wrap > div { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.trust svg { color: var(--accent); flex: none; }
.trust.v-strip { padding-block: 26px; border-block: 1px solid var(--line); }
.trust.v-cards { padding-block: 0 20px; margin-block-start: -28px; position: relative; z-index: 2; }
.trust.v-cards .wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; }
.trust.v-cards .card { padding: 22px; box-shadow: 0 20px 40px -30px rgba(0,0,0,.4); }
`,
  services: `
.services .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px; }
.svc { padding: 28px; display: flex; flex-direction: column; gap: 10px; position: relative; transition: transform .25s, box-shadow .25s; }
.svc:hover { transform: translateY(-4px); box-shadow: 0 30px 60px -36px color-mix(in srgb, var(--primary) 60%, black); }
.svc .ico { width: 52px; height: 52px; border-radius: var(--r); display: grid; place-items: center; background: var(--soft); color: var(--primary); margin-block-end: 8px; }
.svc p { color: var(--muted); font-size: .97rem; }
.svc .foot { margin-block-start: auto; padding-block-start: 14px; display: flex; justify-content: space-between; gap: 10px; color: var(--muted); font-size: .9rem; }
.svc .foot b { color: var(--primary); font-size: 1rem; }
.services.v-numbered .num { position: absolute; inset-inline-end: 24px; inset-block-start: 20px; font-family: var(--heading); font-size: 2.4rem; line-height: 1; color: var(--line); font-weight: 700; }
.menu-list { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 64px; }
.menu-list .item { padding-block: 22px; border-block-end: 1px solid var(--line); }
.menu-list .row { display: flex; align-items: baseline; gap: 12px; }
.menu-list .dots { flex: 1; border-block-end: 1px dotted var(--muted); transform: translateY(-5px); }
.menu-list b { color: var(--primary); white-space: nowrap; }
.menu-list p { color: var(--muted); margin-block-start: 6px; font-size: .95rem; }
.rows { display: grid; border-block-start: 1px solid var(--line); }
.rows .row { display: grid; grid-template-columns: 70px 1fr auto; gap: 24px; align-items: center; padding-block: 28px; border-block-end: 1px solid var(--line); transition: background .2s, padding .2s; }
.rows .row:hover { background: var(--soft); padding-inline: 16px; }
.rows .num { font-family: var(--heading); font-size: 1.6rem; color: var(--primary); }
.rows h3 { font-size: 1.45rem; }
.rows p { color: var(--muted); margin-block-start: 4px; }
.rows .meta { display: inline-flex; align-items: center; gap: 12px; font-weight: 700; color: var(--primary); }
.tiers { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; align-items: start; }
.tier { padding: 30px; display: grid; gap: 18px; position: relative; }
.tier.featured { border: 2px solid var(--primary); box-shadow: 0 30px 70px -40px var(--primary); }
.tier .pill { position: absolute; inset-block-start: -13px; inset-inline-start: 24px; background: var(--primary); color: #fff; font-size: .75rem; font-weight: 700; padding: 5px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: .08em; }
.tier h3 { font-size: 1.5rem; }
.tier dl { display: grid; gap: 8px; }
.tier dl div { display: flex; justify-content: space-between; gap: 12px; padding-block-end: 8px; border-block-end: 1px dashed var(--line); }
.tier dt { color: var(--muted); }
.tier dd { font-weight: 700; font-size: 1.1rem; }
.extras { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-block-start: 34px; }
.extras span { display: inline-flex; gap: 8px; align-items: center; padding: 9px 15px; border: 1px solid var(--line); border-radius: var(--btn-r); font-size: .92rem; }
.extras b { color: var(--primary); }
@media (max-width: 800px) { .menu-list { grid-template-columns: 1fr; } .rows .row { grid-template-columns: 44px 1fr; } .rows .meta { grid-column: 2; } }
`,
  about: `
.about.v-split .wrap { display: grid; grid-template-columns: .9fr 1.1fr; gap: clamp(32px, 6vw, 72px); align-items: center; }
.about.v-split .media { aspect-ratio: 1; }
.about h2 { margin-block: 14px 18px; }
.about p { color: var(--muted); font-size: 1.05rem; margin-block-end: 14px; }
.about.v-statement { text-align: center; }
.about.v-statement h2 { font-size: clamp(2rem, 4.4vw, 3.4rem); }
.about.v-statement p { font-size: 1.15rem; }
.about.v-statement .ticks { margin-block-start: 26px; }
.about.v-stats .wrap { display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(32px, 6vw, 80px); align-items: center; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.stats div { padding: 26px; border-radius: var(--r-lg); background: var(--card); border: 1px solid var(--line); display: grid; gap: 6px; }
.stats b { font-family: var(--heading); font-size: clamp(2.2rem, 4vw, 3.2rem); line-height: 1; color: var(--primary); }
.stats span { color: var(--muted); font-size: .92rem; }
@media (max-width: 900px) { .about.v-split .wrap, .about.v-stats .wrap { grid-template-columns: 1fr; } }
`,
  steps: `
.steps ol { list-style: none; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.steps li { display: grid; gap: 10px; align-content: start; }
.steps li p { color: var(--muted); }
.steps .n { width: 44px; height: 44px; border-radius: 50%; background: var(--primary); color: #fff; display: grid; place-items: center; font-weight: 700; }
.steps.v-row li { padding: 30px; }
.steps.v-line ol { position: relative; text-align: center; }
.steps.v-line ol::before { content: ""; position: absolute; inset-block-start: 22px; inset-inline: 16%; border-block-start: 2px dashed var(--line); }
.steps.v-line li { justify-items: center; position: relative; }
.steps.v-line .n { box-shadow: 0 0 0 8px var(--bg); }
.tone-alt.steps.v-line .n { box-shadow: 0 0 0 8px var(--surface); }
@media (max-width: 800px) { .steps ol { grid-template-columns: 1fr; } .steps.v-line ol::before { display: none; } }
`,
  team: `
.people { display: flex; flex-wrap: wrap; justify-content: center; gap: 36px 56px; }
.person { display: grid; justify-items: center; gap: 8px; text-align: center; min-width: 150px; }
.person .avatar { width: 112px; height: 112px; font-size: 2rem; margin-block-end: 6px; }
.person p { color: var(--muted); font-size: .94rem; }
`,
  gallery: `
.gallery .photos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.gallery .photos img { width: 100%; min-width: 0; aspect-ratio: 1; object-fit: cover; border-radius: var(--r); }
.gallery.feature .photos img:first-child { grid-row: span 2; aspect-ratio: auto; height: 100%; }
.gallery.v-strip .photos { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; padding-block-end: 8px; }
.gallery.v-strip .photos img { flex: 0 0 min(340px, 78%); width: auto; aspect-ratio: 4 / 5; scroll-snap-align: start; }
.pairs { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 22px; }
.pairs figure { display: grid; gap: 10px; }
.pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; border-radius: var(--r-lg); overflow: hidden; }
.pair div { position: relative; }
.pair img { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; }
.pair span { position: absolute; inset-block-start: 10px; inset-inline-start: 10px; background: rgba(0,0,0,.6); color: #fff; font-size: .75rem; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: .08em; }
.pairs figcaption { color: var(--muted); font-size: .94rem; }
@media (max-width: 700px) { .gallery .photos { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`,
  reviews: `
.reviews .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 18px; }
.review { padding: 28px; display: flex; flex-direction: column; gap: 14px; }
.review blockquote { font-size: 1.02rem; }
.review figcaption { margin-block-start: auto; display: flex; gap: 10px; align-items: center; font-weight: 600; }
.reviews.v-spotlight { text-align: center; }
.reviews.v-spotlight .big { font-family: var(--heading); font-size: clamp(1.6rem, 3.4vw, 2.6rem); line-height: 1.25; margin-block: 22px 18px; }
.reviews.v-spotlight cite { font-style: normal; font-weight: 600; color: var(--muted); }
.reviews.v-spotlight .grid { margin-block-start: 56px; text-align: start; }
.reviews.v-rating .wrap { display: grid; grid-template-columns: 300px 1fr; gap: clamp(28px, 5vw, 64px); align-items: start; }
.reviews.v-rating .wrap:has(> :only-child) { grid-template-columns: 1fr; }
.score { padding: 36px; border-radius: var(--r-lg); background: var(--primary); color: #fff; display: grid; gap: 10px; justify-items: start; position: sticky; top: 100px; }
.score b { font-family: var(--heading); font-size: 5rem; line-height: 1; }
.score .stars { color: #ffd166; }
@media (max-width: 900px) { .reviews.v-rating .wrap { grid-template-columns: 1fr; } .score { position: static; } }
`,
  faq: `
.faq details { border-block-end: 1px solid var(--line); padding-block: 22px; }
.faq summary { cursor: pointer; font-weight: 600; font-size: 1.08rem; list-style: none; display: flex; justify-content: space-between; gap: 20px; }
.faq summary::-webkit-details-marker { display: none; }
.faq summary::after { content: "+"; color: var(--primary); font-size: 1.4rem; line-height: 1; }
.faq details[open] summary::after { content: "−"; }
.faq details p { color: var(--muted); margin-block-start: 12px; }
.faq.v-split .wrap { display: grid; grid-template-columns: .8fr 1.2fr; gap: clamp(28px, 5vw, 72px); align-items: start; }
.faq.v-split .list { border-block-start: 1px solid var(--line); }
@media (max-width: 800px) { .faq.v-split .wrap { grid-template-columns: 1fr; } }
`,
  areas: `
.areas .wrap { display: grid; gap: 22px; justify-items: center; text-align: center; }
.areas h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); }
.areas .chips { justify-content: center; }
`,
  insurance: `
.insurance .wrap { display: grid; grid-template-columns: .8fr 1.2fr; gap: clamp(24px, 5vw, 64px); align-items: center; }
.insurance h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); }
.insurance p { color: var(--muted); margin-block-start: 10px; }
@media (max-width: 800px) { .insurance .wrap { grid-template-columns: 1fr; } }
`,
  guarantee: `
.guarantee .wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 22px; align-items: center; }
.warranty { padding: 30px; display: flex; gap: 20px; align-items: center; border: 2px solid var(--primary); }
.warranty svg { color: var(--primary); flex: none; }
.warranty p { color: var(--muted); margin-block-start: 6px; font-size: 1.05rem; }
.creds { display: grid; gap: 14px; }
`,
  cta: `
.cta { padding-block: var(--pad); }
.cta .band { border-radius: calc(var(--r-lg) + 10px); padding: clamp(48px, 7vw, 84px) 24px; text-align: center; color: #fff; display: grid; gap: 16px; justify-items: center; background: radial-gradient(600px 300px at 15% 0%, color-mix(in srgb, var(--accent) 55%, transparent), transparent), var(--primary); }
.cta .band p { opacity: .86; max-width: 48ch; }
.cta .band .actions { justify-content: center; margin-block-start: 10px; }
.cta.v-phone { padding-block: clamp(56px, 8vw, 96px); text-align: center; }
.cta.v-phone .wrap { display: grid; gap: 20px; justify-items: center; }
.phone-big { display: inline-flex; align-items: center; gap: 16px; font-family: var(--heading); font-size: clamp(2rem, 6vw, 4rem); font-weight: 700; line-height: 1; }
.cta.v-split .wrap { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 28px; padding-block: 40px; border-block: 1px solid var(--line); }
.cta.v-split p { color: var(--muted); margin-block-start: 10px; max-width: 52ch; }
`,
  contact: `
.contact h2 { margin-block: 14px 24px; }
.contact h3 { font-size: 1.35rem; margin-block-end: 18px; }
.contact.v-panels .wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.contact .panel { padding: clamp(28px, 4vw, 44px); border-radius: var(--r-lg); }
.contact .panel.dark { background: var(--dark); color: var(--light); }
.site[data-mood=dark] .contact .panel.dark { background: var(--primary); color: #fff; }
.contact.v-map .wrap { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 5vw, 64px); align-items: start; }
.map-link { display: flex; align-items: center; gap: 14px; padding: 22px; margin-block-end: 30px; font-weight: 700; color: var(--primary); background: var(--soft); border: 0; }
.form-card { padding: clamp(26px, 4vw, 40px); }
.contact.v-simple { text-align: center; }
.contact.v-simple .lines > div { justify-content: center; }
.contact.v-simple .hours { max-width: 460px; margin-inline: auto; margin-block-end: 30px; }
.contact.v-simple .actions { justify-content: center; }
@media (max-width: 900px) { .contact.v-panels .wrap, .contact.v-map .wrap { grid-template-columns: 1fr; } }
`,
  footer: `
.footer { padding-block: 40px 56px; font-size: .92rem; }
.footer > .wrap { color: var(--muted); }
.site[data-mood=dark] .footer.tone-inv { background: color-mix(in srgb, var(--dark) 70%, black); --ink: var(--light); }
.footer .wrap { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.footer .social { display: inline-flex; gap: 18px; font-weight: 600; }
.footer.v-columns { padding-block: 64px 40px; }
.footer.v-columns .wrap:first-child { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 40px; }
.footer.v-columns h4 { font-size: 1.1rem; margin-block-end: 14px; color: var(--ink); }
.footer.v-columns p { margin-block-end: 14px; }
.footer.v-columns .hours { margin: 0; }
.footer .legal { margin-block-start: 40px; padding-block-start: 22px; border-block-start: 1px solid var(--line); }
@media (max-width: 800px) { .footer.v-columns .wrap:first-child { grid-template-columns: 1fr; } }
`,
  fab: `
.fab { display: none; }
@media (max-width: 800px) {
  .fab { position: fixed; inset-inline-end: 16px; inset-block-end: 16px; z-index: 60; display: inline-flex; align-items: center; gap: 8px; padding: 14px 20px; border-radius: 999px; background: var(--primary); color: #fff; font-weight: 700; box-shadow: 0 16px 30px -12px rgba(0,0,0,.5); }
}
`,
};
