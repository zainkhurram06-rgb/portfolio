// Pieces every hand-built design shares. Everything interactive is plain
// JavaScript in a <script> tag, so it works on the platform and in the saved
// website files alike, and every page still reads fine with scripts off.

import { tel } from "@/components/site/bits";
import { ENQUIRY_JS } from "@/components/site/enquiry-form";
import { fill } from "@/lib/labels";
import type { SiteData } from "@/lib/site-data";

export type DesignProps = { d: SiteData };

export const Num = ({ children }: { children: React.ReactNode }) => <span dir="ltr">{children}</span>;

// a phone menu that needs no script: <details> opens and closes on its own
export function MobileMenu({ d, links, className = "" }: { d: SiteData; links: [string, string][]; className?: string }) {
  return (
    <details className={`mm ${className}`}>
      <summary aria-label={d.L.menu}><span className="mm-bars" aria-hidden="true"><i /><i /><i /></span><span className="mm-word">{d.L.menu}</span></summary>
      <div className="mm-panel">
        <nav>{links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}</nav>
        <a className="mm-book" href={d.bookHref}>{d.c.ctaLabel}</a>
        {d.biz.phone && <a className="mm-call" href={`tel:${tel(d.biz.phone)}`}><Num>{d.biz.phone}</Num></a>}
      </div>
    </details>
  );
}

// "Open now, closes 8 pm" worked out live in the business's own timezone
export function OpenBadge({ d, className = "" }: { d: SiteData; className?: string }) {
  if (!d.opening.length) return null;
  const words = { open: d.L.open_now, closes: d.L.closes_at, opens: d.L.opens_at, closed: d.L.closed_now };
  return <span className={`open-badge ${className}`} data-open={JSON.stringify(d.opening)} data-tz={d.biz.timezone}
    data-lang={`${d.biz.language}-${d.biz.country}`} data-words={JSON.stringify(words)} />;
}

export function navLinks(d: SiteData, has: { about?: boolean; work?: boolean; reviews?: boolean }): [string, string][] {
  const L = d.L;
  return [
    ["#services", L.nav_services] as [string, string],
    ...(has.about ? [["#about", L.nav_about] as [string, string]] : []),
    ...(has.work && d.c.gallery.length >= 3 ? [["#work", L.made_by_hand] as [string, string]] : []),
    ...(has.reviews && (d.c.reviews.length > 0 || d.c.rating != null) ? [["#reviews", L.nav_reviews] as [string, string]] : []),
    ["#visit", L.nav_visit] as [string, string],
  ];
}

export const ratingLine = (d: SiteData) =>
  d.c.rating != null ? fill(d.L.rated, { rating: d.c.rating.toFixed(1), n: d.c.reviewCount ?? "" }).replace(/\s+from\s+reviews/, "") : null;

// a giant wordmark that fits the width whatever the name's length
export const fitSize = (text: string, widthVw = 92, max = "15rem") => `min(${(widthVw / Math.max(text.length * 0.56, 4)).toFixed(2)}vw, ${max})`;

export function Script({ js }: { js: string }) {
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

// open badge, lightbox, menu closing, scroll reveal, drag to scroll, contact form
export const SHARED_JS = ENQUIRY_JS + `
(function () {
  var two = function (n) { return (n < 10 ? "0" : "") + n; };
  document.querySelectorAll("[data-open]").forEach(function (el) {
    try {
      var rows = JSON.parse(el.getAttribute("data-open")), w = JSON.parse(el.getAttribute("data-words"));
      var tz = el.getAttribute("data-tz"), lang = el.getAttribute("data-lang");
      var parts = {};
      new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
        .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      var day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(parts.weekday) + 1;
      var mins = (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10);
      var time = function (m) { return new Intl.DateTimeFormat(lang, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1, Math.floor(m / 60) % 24, m % 60))); };
      var dayName = function (wd) { return new Intl.DateTimeFormat(lang, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, wd))); };
      var today = rows.filter(function (r) { return r.weekday === day; })[0];
      if (today && mins >= today.start && mins < today.end) {
        el.textContent = w.open + " \\u00b7 " + w.closes.replace("{time}", time(today.end));
        el.classList.add("is-open");
      } else {
        var next = null;
        for (var i = 0; i < 8 && !next; i++) {
          var wd = ((day - 1 + i) % 7) + 1;
          var r = rows.filter(function (x) { return x.weekday === wd; })[0];
          if (r && (i > 0 || mins < r.start)) next = { wd: wd, r: r, today: i === 0 };
        }
        el.textContent = w.closed + (next ? " \\u00b7 " + w.opens.replace("{day}", next.today ? "" : dayName(next.wd)).replace("{time}", time(next.r.start)).replace("  ", " ") : "");
        el.classList.add("is-closed");
      }
    } catch (e) { el.remove(); }
  });

  document.querySelectorAll(".mm a").forEach(function (a) {
    a.addEventListener("click", function () { var m = a.closest("details"); if (m) m.removeAttribute("open"); });
  });

  var box = null;
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-lightbox]") : null;
    if (!t) return;
    e.preventDefault();
    box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = '<img alt="">';
    box.firstChild.src = t.getAttribute("data-lightbox");
    box.addEventListener("click", function () { box.remove(); });
    document.body.appendChild(box);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box) box.remove(); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) { el.classList.add("in"); });
  }

  var site = document.querySelector(".dsite");
  if (site) {
    var onScroll = function () { site.toggleAttribute("data-scrolled", window.scrollY > window.innerHeight * 0.7); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  document.querySelectorAll("[data-drag]").forEach(function (el) {
    var down = false, x0 = 0, s0 = 0;
    el.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; x0 = e.clientX; s0 = el.scrollLeft; el.classList.add("dragging"); });
    window.addEventListener("pointerup", function () { down = false; el.classList.remove("dragging"); });
    el.addEventListener("pointermove", function (e) { if (down) el.scrollLeft = s0 - (e.clientX - x0); });
  });
})();
`;

// base rules every design starts from. designs add their own look on top
export const SHARED_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
img, video { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
.dsite { overflow-x: clip; min-height: 100vh; -webkit-font-smoothing: antialiased; }
.dsite :focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.mm { position: relative; display: none; }
.mm summary { list-style: none; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; }
.mm summary::-webkit-details-marker { display: none; }
.mm-bars { display: inline-grid; gap: 5px; width: 22px; }
.mm-bars i { display: block; height: 1.5px; background: currentColor; transition: transform .25s, opacity .25s; }
.mm[open] .mm-bars i:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.mm[open] .mm-bars i:nth-child(2) { opacity: 0; }
.mm[open] .mm-bars i:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
.mm-panel { position: fixed; inset: 0; top: var(--mm-top, 64px); z-index: 80; display: flex; flex-direction: column; gap: 28px; padding: 36px 24px; overflow-y: auto; }
.mm-panel nav { display: grid; gap: 4px; }
.mm-panel nav a { font-size: 1.9rem; padding-block: 8px; }
.mm-book { display: inline-flex; justify-content: center; padding: 16px 24px; }
@media (max-width: 860px) { .mm { display: block; } .desk { display: none !important; } }
.open-badge { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
.open-badge:empty { display: none; }
.open-badge::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; flex: none; }
.open-badge.is-open::before { background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,.18); }
.lightbox { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.88); display: grid; place-items: center; padding: 24px; cursor: zoom-out; animation: fadein .2s; }
.lightbox img { max-height: 90vh; width: auto; border-radius: 6px; }
@keyframes fadein { from { opacity: 0; } }
[data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity .8s ease, transform .8s ease; }
[data-reveal].in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { [data-reveal] { opacity: 1; transform: none; transition: none; } * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }
[data-drag] { cursor: grab; scrollbar-width: none; }
[data-drag]::-webkit-scrollbar { display: none; }
[data-drag].dragging { cursor: grabbing; scroll-snap-type: none !important; }
[data-drag].dragging * { pointer-events: none; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
`;
