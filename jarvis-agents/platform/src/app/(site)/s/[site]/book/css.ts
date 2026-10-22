// The booking page looks the same for every theme, dressed in the business's colours.
export const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--body); color: var(--dark); background: var(--light); -webkit-font-smoothing: antialiased; line-height: 1.5; }
button, input, textarea { font: inherit; color: inherit; }
.bk-top { display: flex; justify-content: space-between; gap: 16px; padding: 18px 24px; background: #fff; border-bottom: 1px solid color-mix(in srgb, var(--dark) 10%, white); font-weight: 600; }
.bk-top a { color: var(--dark); text-decoration: none; }
.bk-wrap { width: min(1100px, 100% - 32px); margin: 40px auto 80px; }
.bk-wrap h1 { font-family: var(--heading); font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.1; }
.bk-muted { color: color-mix(in srgb, var(--dark) 60%, white); }
.bk-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 20px; margin-top: 28px; align-items: start; }
.bk-steps { display: grid; gap: 20px; min-width: 0; }
.bk-card { min-width: 0; background: #fff; border-radius: 20px; padding: 26px; box-shadow: 0 1px 0 color-mix(in srgb, var(--dark) 8%, white); }
.bk-card h3 { font-size: 1.1rem; margin-bottom: 16px; display: flex; gap: 10px; align-items: center; }
.bk-card h3 span { width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: grid; place-items: center; font-size: .85rem; }
.bk-list { display: grid; gap: 10px; }
.bk-option { display: flex; justify-content: space-between; gap: 16px; align-items: center; text-align: left; padding: 16px 18px; border-radius: 14px; border: 1.5px solid color-mix(in srgb, var(--dark) 12%, white); background: #fff; cursor: pointer; transition: border-color .15s, background .15s; }
.bk-option small { display: block; color: color-mix(in srgb, var(--dark) 55%, white); margin-top: 2px; }
.bk-option em { font-style: normal; font-weight: 700; color: var(--primary); white-space: nowrap; }
.bk-option.on, .bk-option:hover { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 6%, white); }
.bk-chips, .bk-days, .bk-times { display: flex; flex-wrap: wrap; gap: 8px; }
.bk-days { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 6px; margin-bottom: 16px; }
.bk-chips button, .bk-days button, .bk-times button { padding: 10px 14px; border-radius: 12px; border: 1.5px solid color-mix(in srgb, var(--dark) 12%, white); background: #fff; cursor: pointer; white-space: nowrap; font-weight: 600; }
.bk-chips small { font-weight: 400; color: color-mix(in srgb, var(--dark) 55%, white); }
.bk-chips .on, .bk-days .on, .bk-times .on { background: var(--primary); border-color: var(--primary); color: #fff; }
.bk-chips .on small { color: rgba(255,255,255,.8); }
.bk-times button { min-width: 84px; }
.bk-summary { position: sticky; top: 20px; }
.bk-summary dl { display: grid; gap: 10px; margin-bottom: 18px; }
.bk-summary dl div { display: flex; justify-content: space-between; gap: 16px; }
.bk-summary dt { color: color-mix(in srgb, var(--dark) 55%, white); }
.bk-summary dd { font-weight: 600; text-align: right; }
.bk-summary form { display: grid; gap: 10px; border-top: 1px solid color-mix(in srgb, var(--dark) 10%, white); padding-top: 18px; }
.bk-summary input, .bk-summary textarea, .bk-summary select { width: 100%; font: inherit; color: inherit; padding: 13px 14px; border-radius: 12px; border: 1.5px solid color-mix(in srgb, var(--dark) 12%, white); background: #fff; }
.bk-summary input:focus, .bk-summary textarea:focus, .bk-summary select:focus { outline: none; border-color: var(--primary); }
.bk-btn { display: inline-block; text-align: center; padding: 15px 22px; border-radius: 999px; border: 0; background: var(--primary); color: #fff; font-weight: 700; cursor: pointer; text-decoration: none; }
.bk-btn:disabled { opacity: .6; }
.bk-error { color: #b42318; margin-top: 12px; font-weight: 600; }
.bk-done { max-width: 520px; margin: 30px auto; text-align: center; display: grid; gap: 14px; padding: 40px 28px; }
.bk-done h2 { font-family: var(--heading); font-size: 2rem; }
.bk-tick { width: 64px; height: 64px; margin: 0 auto; border-radius: 50%; background: var(--primary); color: #fff; display: grid; place-items: center; font-size: 1.8rem; }
@media (max-width: 860px) { .bk-grid { grid-template-columns: minmax(0, 1fr); } .bk-summary { position: static; } }
`;
