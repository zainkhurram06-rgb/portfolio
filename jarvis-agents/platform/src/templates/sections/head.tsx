// The top of the page: info bar, menu and hero.

import { Icon, tel } from "@/components/site/bits";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { fill } from "@/lib/labels";
import { isHealth } from "@/lib/niches";
import { BookButton, CallButton, Media, Num, RatingChip, Ticks, Video, cls, type SectionProps } from "./parts";

export function Topbar({ d, v, tone }: SectionProps) {
  const { biz, c, L } = d;
  const areas = c.areasServed.length > 0
    ? `${fill(L.serving, { areas: c.areasServed.slice(0, 3).join(", ") })}${c.areasServed.length > 3 ? ` ${L.and_nearby}` : ""}`
    : null;
  const first = d.hours.find((h) => h.time !== L.closed);
  return (
    <div className={cls("topbar", `v-${v}`, tone)}>
      <div className="wrap">
        {v === "contact" ? (
          <>
            {biz.address && <span><Icon name="map" size={15} />{biz.address}</span>}
            {biz.email && <a href={`mailto:${biz.email}`}>{biz.email}</a>}
          </>
        ) : (
          <>
            <span><Icon name="clock" size={15} />{first ? `${first.days}: ${first.time}` : L.fast_response}</span>
            {areas && <span><Icon name="map" size={15} />{areas}</span>}
          </>
        )}
        {biz.phone && <a className="topbar-phone" href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={15} /><Num>{biz.phone}</Num></a>}
      </div>
    </div>
  );
}

export function Nav({ d, v, tone, present }: SectionProps) {
  const { biz, c, L } = d;
  const links = [
    present.has("services") && <a key="s" href="#services">{L.nav_services}</a>,
    (present.has("about") || present.has("team")) && <a key="a" href={present.has("about") ? "#about" : "#team"}>{L.nav_about}</a>,
    present.has("reviews") && <a key="r" href="#reviews">{L.nav_reviews}</a>,
    present.has("contact") && <a key="c" href="#contact">{L.nav_contact}</a>,
  ].filter(Boolean);
  const brand = (
    <a className="brand" href={`${d.base}/`}>
      {c.logoUrl ? <img src={c.logoUrl} alt={`${biz.name} logo`} /> : <span className="mark">{biz.name.slice(0, 1)}</span>}
      <span>{biz.name}</span>
    </a>
  );
  if (v === "centered") {
    const half = Math.ceil(links.length / 2);
    return (
      <nav className={cls("nav", "v-centered", tone)}>
        <div className="wrap">
          <div className="links">{links.slice(0, half)}</div>
          {brand}
          <div className="links end">{links.slice(half)}<a className="btn btn-main btn-sm" href={d.bookHref}>{c.ctaLabel}</a></div>
        </div>
      </nav>
    );
  }
  return (
    <nav className={cls("nav", `v-${v}`, tone)}>
      <div className="wrap">
        {brand}
        <div className="links">{links}</div>
        <div className="nav-cta">
          {v === "phone" && biz.phone
            ? <a className="btn btn-main btn-sm" href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={17} /><Num>{biz.phone}</Num></a>
            : <>
                {v === "classic" && biz.phone && <a className="nav-phone" href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={17} /><Num>{biz.phone}</Num></a>}
                <a className={cls("btn btn-sm", v === "overlay" ? "btn-light" : "btn-main")} href={d.bookHref}>{c.ctaLabel}</a>
              </>}
        </div>
      </div>
    </nav>
  );
}

export function Hero({ d, v, tone }: SectionProps) {
  const { biz, c, L, services } = d;
  const icon = services[0]?.icon ?? "sparkle";
  const intro = (
    <>
      <span className="kicker">{c.tagline}{biz.city ? ` · ${biz.city}` : ""}</span>
      <h1>{c.headline}</h1>
      <p className="lead">{c.subheadline}</p>
      <div className="actions">
        <BookButton d={d} className={cls("btn", v === "photo" ? "btn-light" : "btn-main")} />
        <CallButton d={d} className={cls("btn", v === "photo" ? "btn-ghost-light" : "btn-alt")} />
      </div>
    </>
  );

  if (v === "photo") {
    return (
      <header className={cls("hero", "v-photo", tone)} id="top">
        {c.heroVideo ? <Video className="bg" src={c.heroVideo} poster={c.heroImage} />
          : c.heroImage ? <img className="bg" src={c.heroImage} alt="" /> : <div className="bg art-bg" />}
        <div className="wrap">
          <div className="copy">{intro}<div className="under"><RatingChip d={d} /><Ticks items={c.highlights.slice(0, 3)} className="row" /></div></div>
        </div>
      </header>
    );
  }

  if (v === "centered") {
    return (
      <header className={cls("hero", "v-centered", tone)} id="top">
        <div className="wrap">
          <div className="copy">{intro}</div>
          <div className="under"><RatingChip d={d} /><Ticks items={c.highlights.slice(0, 3)} className="row" /></div>
          {(c.heroImage || c.heroVideo) && <Media src={c.heroImage} video={c.heroVideo} icon={icon} alt={biz.name} className="wide" />}
        </div>
      </header>
    );
  }

  if (v === "collage") {
    return (
      <header className={cls("hero", "v-collage", tone)} id="top">
        <div className="wrap">
          <div className="copy">{intro}</div>
          <div className="frames">
            <Media src={c.heroImage} icon={icon} alt={biz.name} className="f1" />
            <Media src={c.gallery[0]} icon="sparkle" className="f2" />
            {c.rating != null && <div className="seal"><b>{c.rating.toFixed(1)}</b><span>{L.stars}</span></div>}
          </div>
        </div>
      </header>
    );
  }

  if (v === "form") {
    return (
      <header className={cls("hero", "v-form", tone)} id="top">
        <div className="wrap">
          <div className="copy">{intro}<Ticks items={c.highlights.slice(0, 3)} className="row" /></div>
          <div className="quote card">
            <h3>{L.quote_title}</h3>
            <p>{L.quote_sub}</p>
            <EnquiryForm slug={biz.slug} services={services.map((s) => s.name)} button={L.quote_button}
              buttonClass="btn btn-main" messagePlaceholder={isHealth(biz.niche) ? L.form_message_health : L.quote_message} compact L={L} />
          </div>
        </div>
      </header>
    );
  }

  if (v === "card") {
    return (
      <header className={cls("hero", "v-card", tone)} id="top">
        <div className="wrap">
          <div className="copy">{intro}<RatingChip d={d} /></div>
          <div className="menu-card card">
            <h3>{L.sec_services_title}</h3>
            <ul>
              {services.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <span className="ico"><Icon name={s.icon} size={20} /></span>
                  <span className="name">{s.name}<small>{s.durationMin} {L.min}</small></span>
                  {s.price && <b>{s.price}</b>}
                </li>
              ))}
            </ul>
            <BookButton d={d} className="btn btn-main btn-block" />
          </div>
        </div>
      </header>
    );
  }

  // split
  return (
    <header className={cls("hero", "v-split", tone)} id="top">
      <div className="wrap">
        <div className="copy">{intro}<Ticks items={c.highlights.slice(0, 3)} className="row" /></div>
        <div className="visual">
          <Media src={c.heroImage} video={c.heroVideo} icon={icon} alt={biz.name} />
          {c.rating != null && <div className="float"><RatingChip d={d} /></div>}
        </div>
      </div>
    </header>
  );
}
