// The middle of the page. Every section that depends on optional facts (reviews,
// photos, insurers...) has a shows() check, and stays hidden without them.

import { Icon, Paragraphs, Stars } from "@/components/site/bits";
import { fill } from "@/lib/labels";
import type { SiteData } from "@/lib/site-data";
import { BookButton, Head, Media, RatingChip, Ticks, cls, initials, type SectionProps } from "./parts";

const TRUST_ICONS = ["shield", "clock", "check", "star"];

export function Trust({ d, v, tone }: SectionProps) {
  const { c } = d;
  return (
    <div className={cls("trust", `v-${v}`, tone)}>
      <div className="wrap">
        {c.highlights.slice(0, 4).map((h, i) => (
          <div key={h} className={v === "cards" ? "card" : undefined}><Icon name={TRUST_ICONS[i]} size={22} /><span>{h}</span></div>
        ))}
        {v === "strip" && <RatingChip d={d} />}
      </div>
    </div>
  );
}

export function Services({ d, v, tone }: SectionProps) {
  const { services, L } = d;
  if (v === "packages" && d.packages.length > 0) {
    // services that aren't already a package show underneath as add-ons
    const tiers = new Set(d.packages.map((p) => p.name.trim().toLowerCase()));
    const extras = services.filter((s) => !tiers.has(s.name.trim().toLowerCase()));
    return (
      <section className={cls("sec services v-packages", tone)} id="services">
        <div className="wrap">
          <Head kicker={L.sec_services_kicker} title={L.sec_packages_title} intro={L.sec_packages_intro} center />
          <div className="tiers">
            {d.packages.map((p, i) => (
              <article key={p.name} className={cls("tier card", d.packages.length > 1 && i === 1 && "featured")}>
                {d.packages.length > 1 && i === 1 && <span className="pill">{L.most_popular}</span>}
                <h3>{p.name}</h3>
                <dl>{p.prices.map((x) => <div key={x.size}><dt>{x.size}</dt><dd>{x.price}</dd></div>)}</dl>
                <Ticks items={p.includes} />
                <BookButton d={d} className={cls("btn btn-block", i === 1 ? "btn-main" : "btn-alt")} />
              </article>
            ))}
          </div>
          {extras.length > 0 && (
            <div className="extras">
              {extras.map((s) => <span key={s.id}><Icon name={s.icon} size={16} />{s.name}{s.price && <b>{s.price}</b>}</span>)}
            </div>
          )}
        </div>
      </section>
    );
  }

  const head = <Head kicker={L.sec_services_kicker} title={L.sec_services_title} intro={L.sec_services_intro} center={v === "menu"} />;
  if (v === "menu") {
    return (
      <section className={cls("sec services v-menu", tone)} id="services">
        <div className="wrap">
          {head}
          <div className="menu-list">
            {services.map((s) => (
              <a className="item" key={s.id} href={d.bookHref}>
                <div className="row"><h3>{s.name}</h3><span className="dots" /><b>{s.price ?? `${s.durationMin} ${L.min}`}</b></div>
                <p>{s.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (v === "list") {
    return (
      <section className={cls("sec services v-list", tone)} id="services">
        <div className="wrap">
          {head}
          <div className="rows">
            {services.map((s, i) => (
              <a className="row" key={s.id} href={d.bookHref}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <div><h3>{s.name}</h3><p>{s.description}</p></div>
                <span className="meta">{s.price ?? `${s.durationMin} ${L.min}`}<Icon name="calendar" size={18} /></span>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // cards, numbered, and packages without any packages yet
  return (
    <section className={cls("sec services", v === "numbered" ? "v-numbered" : "v-cards", tone)} id="services">
      <div className="wrap">
        {head}
        <div className="grid">
          {services.map((s, i) => (
            <article className="svc card" key={s.id}>
              {v === "numbered" && <span className="num">{String(i + 1).padStart(2, "0")}</span>}
              <div className="ico"><Icon name={s.icon} size={26} /></div>
              <h3>{s.name}</h3>
              <p>{s.description}</p>
              <div className="foot"><span>{s.durationMin} {L.min}</span>{s.price && <b>{s.price}</b>}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function stats(d: SiteData) {
  const { c, L } = d;
  return [
    c.rating != null && { n: c.rating.toFixed(1), label: L.rating_text },
    c.reviewCount != null && c.reviewCount > 0 && { n: String(c.reviewCount), label: L.stat_reviews },
    d.services.length > 0 && { n: String(d.services.length), label: L.stat_services },
    d.staff.length > 1 && { n: String(d.staff.length), label: L.stat_team },
  ].filter(Boolean) as { n: string; label: string }[];
}

export function About({ d, v, tone }: SectionProps) {
  const { c, L, services } = d;
  if (v === "statement") {
    return (
      <section className={cls("sec about v-statement", tone)} id="about">
        <div className="wrap narrow">
          <span className="kicker">{L.sec_about_kicker}</span>
          <h2>{c.aboutTitle}</h2>
          <Paragraphs text={c.about} />
          <Ticks items={c.highlights} className="row center" />
        </div>
      </section>
    );
  }
  if (v === "stats") {
    const s = stats(d);
    return (
      <section className={cls("sec about v-stats", tone)} id="about">
        <div className="wrap">
          <div><span className="kicker">{L.sec_about_kicker}</span><h2>{c.aboutTitle}</h2><Paragraphs text={c.about} /></div>
          <div className="stats">{s.map((x) => <div key={x.label}><b>{x.n}</b><span>{x.label}</span></div>)}</div>
        </div>
      </section>
    );
  }
  return (
    <section className={cls("sec about v-split", tone)} id="about">
      <div className="wrap">
        <Media src={c.gallery[0] ?? null} icon={services[1]?.icon ?? "heart"} />
        <div>
          <span className="kicker">{L.sec_about_kicker}</span>
          <h2>{c.aboutTitle}</h2>
          <Paragraphs text={c.about} />
          <Ticks items={c.highlights} className="grid2" />
        </div>
      </div>
    </section>
  );
}

export function Steps({ d, v, tone }: SectionProps) {
  const { L } = d;
  const steps = [[L.step1_title, L.step1], [L.step2_title, L.step2], [L.step3_title, L.step3]];
  return (
    <section className={cls("sec steps", `v-${v}`, tone)}>
      <div className="wrap">
        <Head kicker={L.sec_steps_kicker} title={L.sec_steps_title} center={v === "line"} />
        <ol>{steps.map(([t, p], i) => <li key={i} className={v === "row" ? "card" : undefined}><span className="n">{i + 1}</span><h3>{t}</h3><p>{p}</p></li>)}</ol>
      </div>
    </section>
  );
}

const realTeam = (d: SiteData) => d.staff.filter((s) => s.name.trim().toLowerCase() !== "team");
export function Team({ d, v, tone }: SectionProps) {
  const { L } = d;
  return (
    <section className={cls("sec team", `v-${v}`, tone)} id="team">
      <div className="wrap">
        <Head kicker={L.sec_team_kicker} title={L.sec_team_title} center />
        <div className="people">
          {realTeam(d).map((p) => (
            <div key={p.id} className="person">
              <span className="avatar">{initials(p.name)}</span>
              <h3>{p.name}</h3>
              {p.title && <p>{p.title}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
Team.shows = (d: SiteData) => realTeam(d).length > 0;

const galleryPhotos = (d: SiteData) => d.c.gallery.slice(d.c.gallery.length > 4 ? 1 : 0, 9);
export function Gallery({ d, v, tone }: SectionProps) {
  const { c, L } = d;
  if (v === "beforeafter") {
    return (
      <section className={cls("sec gallery v-beforeafter", tone)}>
        <div className="wrap">
          <Head kicker={L.sec_gallery_kicker} title={L.sec_beforeafter_title} center />
          <div className="pairs">
            {c.beforeAfter.map((p, i) => (
              <figure key={i}>
                <div className="pair">
                  <div><img src={p.before} alt="" loading="lazy" /><span>{L.before}</span></div>
                  <div><img src={p.after} alt="" loading="lazy" /><span>{L.after}</span></div>
                </div>
                {p.caption && <figcaption>{p.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      </section>
    );
  }
  // the grid shows one big photo and four small ones, a whole number of rows
  const all = galleryPhotos(d);
  const photos = v === "grid" ? all.slice(0, all.length >= 5 ? 5 : 3) : all;
  return (
    <section className={cls("sec gallery", `v-${v}`, v === "grid" && photos.length === 5 && "feature", tone)}>
      <div className="wrap">
        <div className="head-row">
          <Head kicker={L.sec_gallery_kicker} title={L.sec_gallery_title} />
          {c.instagram && <a className="btn btn-alt" href={c.instagram}>{L.follow_instagram}</a>}
        </div>
        <div className="photos">{photos.map((src) => <img key={src} src={src} alt="" loading="lazy" />)}</div>
      </div>
    </section>
  );
}
Gallery.shows = (d: SiteData, v: string) => (v === "beforeafter" ? d.c.beforeAfter.length > 0 : galleryPhotos(d).length >= 3);

export function Reviews({ d, v, tone }: SectionProps) {
  const { c, L } = d;
  const [top, ...more] = c.reviews;
  const card = (r: (typeof c.reviews)[number], i: number) => (
    <figure className="review card" key={i}>
      <Stars n={r.rating} />
      <blockquote>“{r.text}”</blockquote>
      <figcaption><span className="avatar sm">{initials(r.author)}</span>{r.author}</figcaption>
    </figure>
  );
  if (v === "spotlight" && top) {
    return (
      <section className={cls("sec reviews v-spotlight", tone)} id="reviews">
        <div className="wrap narrow">
          <span className="kicker">{L.sec_reviews_kicker}</span>
          <blockquote className="big">“{top.text}”</blockquote>
          <cite>{top.author}</cite>
          {more.length > 0 && <div className="grid">{more.slice(0, 3).map(card)}</div>}
        </div>
      </section>
    );
  }
  if (v === "rating") {
    return (
      <section className={cls("sec reviews v-rating", tone)} id="reviews">
        <div className="wrap">
          {c.rating != null && (
            <div className="score">
              <b>{c.rating.toFixed(1)}</b>
              <Stars n={Math.round(c.rating)} />
              <span>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</span>
            </div>
          )}
          <div>
            <Head kicker={L.sec_reviews_kicker} title={L.sec_reviews_title} />
            <div className="grid">{c.reviews.slice(0, 4).map(card)}</div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={cls("sec reviews v-cards", tone)} id="reviews">
      <div className="wrap">
        <Head kicker={L.sec_reviews_kicker} title={L.sec_reviews_title} center />
        <div className="grid">{c.reviews.slice(0, 3).map(card)}</div>
      </div>
    </section>
  );
}
// the rating version also works with just a Google score and no quotes
Reviews.shows = (d: SiteData, v: string) => d.c.reviews.length > 0 || (v === "rating" && d.c.rating != null);

export function Faq({ d, v, tone }: SectionProps) {
  const { c, L } = d;
  const list = c.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>);
  return (
    <section className={cls("sec faq", `v-${v}`, tone)} id="faq">
      <div className={cls("wrap", v === "accordion" && "narrow")}>
        <Head title={L.sec_faq_title} center={v === "accordion"} />
        <div className="list">{list}</div>
      </div>
    </section>
  );
}
Faq.shows = (d: SiteData) => d.c.faqs.length > 0;

export function Areas({ d, v, tone }: SectionProps) {
  const { c, L } = d;
  return (
    <section className={cls("sec areas", `v-${v}`, tone)} id="areas">
      <div className="wrap">
        <h2>{L.sec_areas_title}</h2>
        <div className="chips">{c.areasServed.map((a) => <span key={a}><Icon name="map" size={15} />{a}</span>)}</div>
      </div>
    </section>
  );
}
Areas.shows = (d: SiteData) => d.c.areasServed.length > 0;

export function Insurance({ d, v, tone }: SectionProps) {
  const { c, L } = d;
  return (
    <section className={cls("sec insurance", `v-${v}`, tone)} id="insurance">
      <div className="wrap">
        <div><h2>{L.sec_insurance_title}</h2><p>{L.sec_insurance_note}</p></div>
        <div className="chips">{c.insurers.map((a) => <span key={a}><Icon name="shield" size={15} />{a}</span>)}</div>
      </div>
    </section>
  );
}
Insurance.shows = (d: SiteData) => d.c.insurers.length > 0;

export function Guarantee({ d, v, tone }: SectionProps) {
  const { c, L } = d;
  return (
    <section className={cls("sec guarantee", `v-${v}`, tone)}>
      <div className="wrap">
        {c.warranty && (
          <div className="warranty card">
            <Icon name="shield" size={40} />
            <div><h3>{L.sec_warranty_title}</h3><p>{c.warranty}</p></div>
          </div>
        )}
        {c.credentials.length > 0 && (
          <div className="creds">
            <h3>{L.sec_trust_title}</h3>
            <div className="chips">{c.credentials.map((x) => <span key={x}><Icon name="award" size={16} />{x}</span>)}</div>
          </div>
        )}
      </div>
    </section>
  );
}
Guarantee.shows = (d: SiteData) => !!d.c.warranty || d.c.credentials.length > 0;
