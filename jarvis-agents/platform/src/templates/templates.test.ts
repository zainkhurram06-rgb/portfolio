import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BODY_FONTS, HEADING_FONTS, siteContentSchema } from "@/lib/content";
import { NICHE_KEYS } from "@/lib/niches";
import { BASE, SECTION_CSS } from "./css";
import { DESIGNS } from "./designs";
import { SHARED_CSS } from "./designs/shared";
import LIBRARY from "./library.json";
import { SECTIONS, TONES } from "./sections";
import { TEMPLATE_LIST, TemplatePage, cssFor, templateFor, templatesFor, visibleSteps } from "./index";
import { sampleSite } from "./samples";

const render = (...a: Parameters<typeof TemplatePage>) => renderToStaticMarkup(createElement(TemplatePage, a[0]));

test("every recipe only uses sections, versions and tones that exist", () => {
  const ids = new Set<string>();
  for (const t of LIBRARY.templates) {
    assert.ok(!ids.has(t.id), `duplicate template ${t.id}`);
    ids.add(t.id);
    for (const step of t.sections) {
      const [type, variant, tone = ""] = step.split(":");
      const block = SECTIONS[type as keyof typeof SECTIONS];
      assert.ok(block, `${t.id}: no section called ${type}`);
      assert.ok(block.variants.includes(variant), `${t.id}: ${type} has no version ${variant}`);
      assert.ok((TONES as readonly string[]).includes(tone), `${t.id}: unknown tone ${tone}`);
    }
    assert.ok((HEADING_FONTS as readonly string[]).includes(t.fonts[0]), `${t.id}: heading font ${t.fonts[0]}`);
    assert.ok((BODY_FONTS as readonly string[]).includes(t.fonts[1]), `${t.id}: body font ${t.fonts[1]}`);
    for (const c of Object.values(t.palette)) assert.match(c, /^#[0-9a-f]{6}$/i, `${t.id}: colour ${c}`);
  }
});

test("every trade has at least four templates, and every template a trade", () => {
  for (const n of NICHE_KEYS) assert.ok(templatesFor(n).length >= 4, `only ${templatesFor(n).length} templates for ${n}`);
  for (const t of TEMPLATE_LIST) assert.ok(t.niches.length > 0 && t.niches.every((n) => NICHE_KEYS.includes(n)), t.id);
});

test("every page has a way to book or call, and a footer", () => {
  for (const t of TEMPLATE_LIST) {
    const types = t.sections.map((s) => s.type);
    assert.equal(types[0] === "topbar" ? types[1] : types[0], "nav", `${t.id}: should start with the menu`);
    assert.ok(types.includes("hero"), `${t.id}: no hero`);
    assert.ok(types.includes("footer"), `${t.id}: no footer`);
    assert.ok(types.includes("services"), `${t.id}: no services`);
  }
});

test("each template renders for each of its trades, with and without photos, in three languages", () => {
  for (const t of TEMPLATE_LIST) {
    for (const n of t.niches) {
      for (const photos of [true, false]) {
        for (const lang of ["en", "de", "ar"]) {
          const d = sampleSite(n, { photos, lang, palette: t.palette, fonts: t.fonts });
          const html = render({ t, d });
          const where = `${t.id} / ${n} / photos ${photos} / ${lang}`;
          assert.ok(html.includes(d.biz.name.replace(/&/g, "&amp;")), `${where}: business name missing`);
          assert.ok(html.includes(d.bookHref), `${where}: no booking link`);
          assert.doesNotMatch(html, /undefined|NaN|\[object Object\]/, `${where}: broken value`);
          assert.doesNotMatch(html, /src=""/, `${where}: empty image`);
          assert.ok(html.includes(`dir="${lang === "ar" ? "rtl" : "ltr"}"`), `${where}: wrong direction`);
          if (!photos) assert.doesNotMatch(html, /\/samples\/photo/, `${where}: photo shown with no photos`);
        }
      }
    }
  }
});

test("sections with missing facts stay hidden, and the menu skips them", () => {
  const t = TEMPLATE_LIST.find((x) => x.id === "clinic-calm")!;
  const d = sampleSite("dental", { photos: false });
  d.c.reviews = [];
  d.c.insurers = [];
  d.c.faqs = [];
  const types = visibleSteps(t, d).map((s) => s.type);
  for (const gone of ["reviews", "insurance", "faq"]) assert.ok(!types.includes(gone as never), `${gone} should be hidden`);
  const html = render({ t, d });
  assert.doesNotMatch(html, /href="#reviews"/);
  assert.match(html, /href="#services"/);
});

test("a Google rating alone still fills the rating version of reviews", () => {
  const t = TEMPLATE_LIST.find((x) => x.sections.some((s) => s.type === "reviews" && s.variant === "rating"))!;
  const d = sampleSite(t.niches[0], { photos: false });
  d.c.reviews = [];
  assert.ok(visibleSteps(t, d).some((s) => s.type === "reviews"));
  assert.match(render({ t, d }), new RegExp(`${d.c.rating!.toFixed(1)}`));
});

test("car wash packages show their prices per vehicle size", () => {
  const t = TEMPLATE_LIST.find((x) => x.sections.some((s) => s.type === "services" && s.variant === "packages"))!;
  const html = render({ t, d: sampleSite("carwash") });
  assert.match(html, /Full detail/);
  assert.match(html, /\$249/);
  assert.match(html, /SUV/);
});

test("healthcare contact forms ask people to keep medical details out", () => {
  for (const n of ["dental", "medical", "dermatology"] as const) {
    for (const t of templatesFor(n)) {
      const html = render({ t, d: sampleSite(n) });
      if (html.includes('name="message"')) assert.match(html, /include medical details/, `${t.id} / ${n}`);
    }
  }
});

test("styles use start and end, never left and right, so right-to-left sites mirror", () => {
  const all = BASE + Object.values(SECTION_CSS).join("") + SHARED_CSS + Object.values(DESIGNS).map((x) => x.css).join("");
  for (const bad of [/margin-(left|right)\s*:/, /padding-(left|right)\s*:/, /(^|[\s;{])(left|right)\s*:/m, /text-align:\s*(left|right)/, /border-(left|right)/]) {
    assert.doesNotMatch(all, bad, `found ${bad} in template styles`);
  }
  for (const t of TEMPLATE_LIST) assert.ok(cssFor(t).length > BASE.length, t.id);
});

test("phone numbers stay left to right on right-to-left sites", () => {
  const d = sampleSite("salon", { lang: "ar" });
  const html = render({ t: templatesFor("salon")[0], d });
  const shown = html.split(d.biz.phone!).length - 1;
  const wrapped = html.split(`<span dir="ltr">${d.biz.phone}</span>`).length - 1;
  assert.ok(shown > 0);
  assert.equal(wrapped, shown, "every phone number on the page should be wrapped");
});

test("hand-built designs have a phone menu, live hours, their script, and no long dashes", () => {
  const built = TEMPLATE_LIST.filter((t) => t.design);
  assert.ok(built.length >= 5);
  for (const t of built) {
    assert.ok(DESIGNS[t.design!], `${t.id}: no design called ${t.design}`);
    const html = render({ t, d: sampleSite(t.niches[0], { palette: t.palette, fonts: t.fonts }) });
    assert.match(html, /<details class="mm/, `${t.id}: no phone menu`);
    assert.match(html, /data-open=/, `${t.id}: no live opening hours`);
    assert.match(html, /<script>/, `${t.id}: no script`);
    assert.doesNotMatch(html, /—/, `${t.id}: long dash on the page`);
  }
  const ids = TEMPLATE_LIST.filter((t) => t.design).map((t) => t.design);
  assert.equal(new Set(ids).size, ids.length, "two templates share one design");
});

test("old theme names and wrong trades fall back to a template that fits", () => {
  assert.equal(templateFor("clinic", "dental").id, templatesFor("dental")[0].id);
  assert.equal(templateFor("salon-noir", "dental").id, templatesFor("dental")[0].id);
  assert.equal(templateFor("salon-noir", "salon").id, "salon-noir");
});

test("trade details are optional, and old saved websites still load", () => {
  const old = sampleSite("salon").c as Record<string, unknown>;
  for (const k of ["credentials", "warranty", "insurers", "packages", "beforeAfter"]) delete old[k];
  const parsed = siteContentSchema.parse({ ...old, heroImage: null, gallery: [], beforeAfter: undefined });
  assert.deepEqual(parsed.packages, []);
  assert.equal(parsed.warranty, null);
});
