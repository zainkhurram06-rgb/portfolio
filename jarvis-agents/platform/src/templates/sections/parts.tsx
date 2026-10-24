// Small pieces the sections share.

import { Icon, Stars, tel } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import type { SiteData } from "@/lib/site-data";

export type SectionProps = {
  d: SiteData;
  v: string;                 // which version of the section
  tone: string;              // "" | "tone-alt" | "tone-inv" | "tone-brand"
  present: Set<string>;      // sections that actually show on this page, for the menu
};

// phone numbers read left to right even on Arabic and Hebrew sites
export const Num = ({ children }: { children: React.ReactNode }) => <span dir="ltr">{children}</span>;

export const cls =(...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

// a photo, or a soft panel with an icon when the business has no photos yet
export function Media({ src, video, icon, alt = "", className }: { src?: string | null; video?: string | null; icon: string; alt?: string; className?: string }) {
  return (
    <div className={cls("media", className)}>
      {video ? <Video src={video} poster={src} />
        : src ? <img src={src} alt={alt} loading="lazy" /> : <div className="art"><Icon name={icon} size={72} /></div>}
    </div>
  );
}

// a short silent loop, like one of their reels. the photo shows until it plays
export function Video({ src, poster, className }: { src: string; poster?: string | null; className?: string }) {
  return <video className={className} src={src} poster={poster ?? undefined} autoPlay muted loop playsInline preload="metadata" />;
}

export function BookButton({ d, className = "btn btn-main" }: { d: SiteData; className?: string }) {
  return <a className={className} href={d.bookHref}><Icon name="calendar" size={18} />{d.c.ctaLabel}</a>;
}

export function CallButton({ d, className = "btn btn-alt", short }: { d: SiteData; className?: string; short?: boolean }) {
  const phone = d.biz.phone;
  if (!phone) return null;
  return <a className={className} href={`tel:${tel(phone)}`}><Icon name="phone" size={18} />{short ? d.L.call_now : <>{d.L.call} <Num>{phone}</Num></>}</a>;
}

export function RatingChip({ d }: { d: SiteData }) {
  const { c, L } = d;
  if (c.rating == null) return null;
  return (
    <div className="rating-chip">
      <strong>{c.rating.toFixed(1)}</strong>
      <div>
        <Stars n={Math.round(c.rating)} />
        <small>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</small>
      </div>
    </div>
  );
}

export function Ticks({ items, className }: { items: string[]; className?: string }) {
  return <ul className={cls("ticks", className)}>{items.map((h) => <li key={h}><Icon name="check" size={20} />{h}</li>)}</ul>;
}

export function Head({ kicker, title, intro, center }: { kicker?: string; title: string; intro?: string; center?: boolean }) {
  return (
    <div className={cls("head", center && "center")}>
      {kicker && <span className="kicker">{kicker}</span>}
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
    </div>
  );
}

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
