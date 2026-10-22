import { DemoRibbon, Icon, Paragraphs, Stars, tel } from "@/components/site/bits";
import { EnquiryForm } from "@/components/site/enquiry-form";
import type { SiteData } from "@/lib/site";
import { fill } from "@/lib/labels";

export default function Clinic({ d }: { d: SiteData }) {
  const { biz, c, services, L } = d;
  const phone = biz.phone;
  return (
    <>
      <DemoRibbon text={fill(L.demo_ribbon, { name: biz.name })} show={d.isDemo} />

      <nav>
        <div className="wrap">
          <a href={`${d.base}/`} className="brand">
            {c.logoUrl ? <img src={c.logoUrl} alt={`${biz.name} logo`} /> : <span className="mark">{biz.name.slice(0, 1)}</span>}
            {biz.name}
          </a>
          <div className="links">
            <a href="#services">{L.nav_services}</a><a href="#about">{L.nav_about}</a>
            {c.reviews.length > 0 && <a href="#reviews">{L.nav_reviews}</a>}
            <a href="#visit">{L.nav_visit}</a>
          </div>
          <div className="nav-cta">
            {phone && <a className="nav-phone" href={`tel:${tel(phone)}`}><Icon name="phone" size={18} />{phone}</a>}
            <a className="btn btn-primary" href={d.bookHref}>{c.ctaLabel}</a>
          </div>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="wrap">
          <div>
            <span className="eyebrow">{c.tagline}</span>
            <h1 style={{ marginTop: 18 }}>{c.headline}</h1>
            <p className="lead">{c.subheadline}</p>
            <div className="actions">
              <a className="btn btn-primary" href={d.bookHref}><Icon name="calendar" size={18} />{c.ctaLabel}</a>
              {phone && <a className="btn btn-ghost" href={`tel:${tel(phone)}`}><Icon name="phone" size={18} />{L.call} {phone}</a>}
            </div>
            <div className="trust">
              {c.highlights.slice(0, 3).map((h) => <span key={h}><Icon name="check" size={18} />{h}</span>)}
            </div>
          </div>
          <div className="visual">
            <div className="photo">
              {c.heroImage ? <img src={c.heroImage} alt={biz.name} />
                : <div className="art"><Icon name={services[0]?.icon ?? "heart"} size={96} /></div>}
            </div>
            {c.rating != null && (
              <div className="float b">
                <div>
                  <strong>{c.rating.toFixed(1)} <Stars n={Math.round(c.rating)} /></strong>
                  <small>{c.reviewCount ? fill(L.google_reviews, { n: c.reviewCount }) : L.google_rating}</small>
                </div>
              </div>
            )}
            <div className="float a">
              <span className="dot"><Icon name="calendar" size={22} /></span>
              <div><strong>{L.clinic_book_online}</strong><small>{L.clinic_book_online_sub}</small></div>
            </div>
          </div>
        </div>
      </header>

      <section id="services">
        <div className="wrap">
          <div className="head">
            <span className="eyebrow">{L.clinic_what_we_do}</span>
            <h2 style={{ marginTop: 14 }}>{L.clinic_services_title}</h2>
            <p>{L.clinic_services_intro}</p>
          </div>
          <div className="services">
            {services.map((s) => (
              <article className="service" key={s.id}>
                <div className="ico"><Icon name={s.icon} size={26} /></div>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                {s.price && <p style={{ color: "var(--primary)", fontWeight: 600, marginTop: 12 }}>{s.price}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="wrap">
          <div className="about-card">
            {c.gallery[0] ? <img src={c.gallery[0]} alt="" />
              : c.rating != null ? (
                <><div className="big">{c.rating.toFixed(1)}</div>
                  <p>{L.clinic_rating_text}</p></>
              ) : (<><div className="big"><Icon name="heart" size={72} /></div><p>{c.tagline}</p></>)}
          </div>
          <div className="about-text">
            <span className="eyebrow">{L.clinic_about_us}</span>
            <h2 style={{ marginTop: 14 }}>{c.aboutTitle}</h2>
            <Paragraphs text={c.about} />
            <div className="checks">
              {c.highlights.map((h) => <div key={h}><Icon name="check" size={26} />{h}</div>)}
            </div>
          </div>
        </div>
      </section>

      {c.reviews.length > 0 && (
        <section id="reviews">
          <div className="wrap">
            <div className="head center">
              <span className="eyebrow">{L.clinic_stories}</span>
              <h2 style={{ marginTop: 14 }}>{L.clinic_stories_title}</h2>
            </div>
            <div className="reviews">
              {c.reviews.slice(0, 3).map((r, i) => (
                <figure className="review" key={i}>
                  <Stars n={r.rating} />
                  <p>“{r.text}”</p>
                  <figcaption className="who"><span>{r.author.slice(0, 1)}</span>{r.author}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="visit" id="visit">
        <div className="wrap" id="contact">
          <div className="panel dark">
            <h3>{L.clinic_visit_us}</h3>
            {biz.address && <div className="contact-line"><Icon name="map" size={20} /><div>{biz.address}</div></div>}
            {phone && <div className="contact-line"><Icon name="phone" size={20} /><a href={`tel:${tel(phone)}`}>{phone}</a></div>}
            {biz.email && <div className="contact-line"><Icon name="calendar" size={20} /><a href={`mailto:${biz.email}`}>{biz.email}</a></div>}
            <div className="hours" style={{ marginTop: 20 }}>
              {d.hours.map((h) => <div key={h.days}><span>{h.days}</span><span>{h.time}</span></div>)}
            </div>
            <a className="btn btn-primary" href={d.bookHref} style={{ marginTop: 28 }}><Icon name="calendar" size={18} />{c.ctaLabel}</a>
          </div>
          <div className="panel">
            <h3>{L.clinic_message_title}</h3>
            <EnquiryForm slug={biz.slug} services={services.map((s) => s.name)} button={L.form_send}
              buttonClass="btn btn-primary" messagePlaceholder={L.clinic_no_medical} L={L} />
          </div>
        </div>
      </section>

      {c.faqs.length > 0 && (
        <section className="faq" style={{ paddingTop: 0 }}>
          <div className="wrap" style={{ maxWidth: 820 }}>
            <div className="head center"><h2>{L.clinic_faq_title}</h2></div>
            {c.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          </div>
        </section>
      )}

      <div className="band">
        <h2>{L.clinic_band_title}</h2>
        <p>{c.subheadline}</p>
        <a className="btn" href={d.bookHref}><Icon name="calendar" size={18} />{c.ctaLabel}</a>
      </div>

      <footer>
        <div className="wrap">
          <span>© {d.year} {biz.name}{biz.city ? `, ${biz.city}` : ""}</span>
          <span>
            {c.instagram && <a href={c.instagram}>Instagram</a>}
            {c.facebook && <> · <a href={c.facebook}>Facebook</a></>}
          </span>
        </div>
      </footer>
    </>
  );
}
