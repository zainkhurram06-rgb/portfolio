"use client";

import { useActionState } from "react";
import { saveWebsite, type WebsiteState } from "@/app/(admin)/admin/(app)/actions";
import type { SiteContent } from "@/lib/content";
import { BODY_FONTS, HEADING_FONTS } from "@/lib/content";
import { Card, Field, btn, input } from "./ui";

type Props = {
  c: SiteContent;
  theme: string;
  themes: { name: string; label: string }[];
  niche: string;
  siteUrl: string;
};

export function WebsiteForm({ c, theme, themes, niche, siteUrl }: Props) {
  const [state, action, pending] = useActionState<WebsiteState, FormData>(saveWebsite, {});
  const lines = (a: string[]) => a.join("\n");

  return (
    <form action={action} className="grid gap-5">
      <Card title="Look">
        <div className="grid gap-4">
          <Field name="Design">
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <label key={t.name} className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-300 px-3.5 py-2.5 has-[:checked]:border-stone-900 has-[:checked]:bg-stone-900 has-[:checked]:text-white">
                  <input type="radio" name="theme" value={t.name} defaultChecked={t.name === theme} className="sr-only" /> {t.label}
                </label>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(["primary", "accent", "dark", "light"] as const).map((k) => (
              <Field key={k} name={{ primary: "Main colour", accent: "Second colour", dark: "Text colour", light: "Background" }[k]}>
                <input type="color" name={k} defaultValue={c.palette[k]} className="h-12 w-full cursor-pointer rounded-xl border border-stone-300 bg-white p-1" />
              </Field>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="Heading font">
              <select className={input} name="headingFont" defaultValue={c.headingFont}>{HEADING_FONTS.map((f) => <option key={f}>{f}</option>)}</select>
            </Field>
            <Field name="Text font">
              <select className={input} name="bodyFont" defaultValue={c.bodyFont}>{BODY_FONTS.map((f) => <option key={f}>{f}</option>)}</select>
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Words">
        <div className="grid gap-4">
          <Field name="Short tagline" hint="Sits above the headline, e.g. Family and cosmetic dentistry">
            <input className={input} name="tagline" defaultValue={c.tagline} maxLength={80} required />
          </Field>
          <Field name="Headline"><input className={input} name="headline" defaultValue={c.headline} maxLength={120} required /></Field>
          <Field name="Under the headline"><textarea className={input} name="subheadline" rows={2} defaultValue={c.subheadline} maxLength={280} required /></Field>
          <Field name="Main button text"><input className={input} name="ctaLabel" defaultValue={c.ctaLabel} maxLength={40} required /></Field>
          <Field name="About title"><input className={input} name="aboutTitle" defaultValue={c.aboutTitle} maxLength={120} required /></Field>
          <Field name="About you" hint="Leave an empty line between paragraphs.">
            <textarea className={input} name="about" rows={6} defaultValue={c.about} maxLength={2000} required />
          </Field>
          <Field name="Highlights" hint="3 or 4 short points, one per line.">
            <textarea className={input} name="highlights" rows={4} defaultValue={lines(c.highlights)} required />
          </Field>
          {["homeservices", "carwash", "autorepair"].includes(niche) && (
            <Field name="Areas you cover" hint="One per line.">
              <textarea className={input} name="areasServed" rows={4} defaultValue={lines(c.areasServed)} />
            </Field>
          )}
          <Field name="Questions and answers" hint="One per line: question | answer">
            <textarea className={input} name="faqs" rows={4} defaultValue={c.faqs.map((f) => `${f.q} | ${f.a}`).join("\n")} />
          </Field>
          <Field name="Reviews" hint="Real reviews only. One per line: name | stars 1-5 | what they said">
            <textarea className={input} name="reviews" rows={4} defaultValue={c.reviews.map((r) => `${r.author} | ${r.rating} | ${r.text}`).join("\n")} />
          </Field>
        </div>
      </Card>

      <Card title="Photos and links">
        <div className="grid gap-4">
          <Field name="Logo (image link)"><input className={input} name="logoUrl" type="url" defaultValue={c.logoUrl ?? ""} /></Field>
          <Field name="Main photo (image link)"><input className={input} name="heroImage" type="url" defaultValue={c.heroImage ?? ""} /></Field>
          <Field name="More photos" hint="Image links, one per line.">
            <textarea className={input} name="gallery" rows={3} defaultValue={lines(c.gallery)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="Instagram link"><input className={input} name="instagram" type="url" defaultValue={c.instagram ?? ""} /></Field>
            <Field name="Facebook link"><input className={input} name="facebook" type="url" defaultValue={c.facebook ?? ""} /></Field>
          </div>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-stone-200 bg-[#f6f6f4]/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-2xl md:border">
        <button className={btn} disabled={pending}>{pending ? "Saving..." : "Save and publish"}</button>
        <a className="text-sm font-semibold underline underline-offset-2" href={siteUrl} target="_blank">Open website ↗</a>
        {state.ok && !pending && <span className="text-sm font-semibold text-emerald-700">Saved. Your website is updated.</span>}
        {state.error && <span className="text-sm font-semibold text-red-700">{state.error}</span>}
      </div>
    </form>
  );
}
