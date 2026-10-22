import { DemoRibbon, Icon, Paragraphs, Stars, tel } from "@/components/site/bits";
import { EnquiryForm } from "@/components/site/enquiry-form";
import type { SiteData } from "@/lib/site";

export default function HomeServices({ d }: { d: SiteData }) {
  const { biz, c, services } = d;
  const phone = biz.phone;
  const proofIcons = ["shield", "clock", "check", "star"];
  return (
    <>
      <DemoRibbon name={biz.name} show={d.isDemo} />

      <div className="strip">
        <div className="wrap">
          <span><Icon name="clock" size={16} />{d.hours[0] ? `${d.hours[0].days}: ${d.hours[0].time}` : "Fast response, call any time"}</span>
          {c.areasServed.length > 0 && (
            <span><Icon name="map" size={16} />Serving {c.areasServed.slice(0, 3).join(", ")}{c.areasServed.length > 3 ? " and nearby" : ""}</span>
          )}
        </div>
      </div>

      <nav>
        <div className="wrap">
          <a className="brand" href={`${d.base}/`}>
            {c.logoUrl ? <img src={c.logoUrl} alt={`${biz.name} logo`} /> : <span className="mark"><Icon name={services[0]?.icon ?? "wrench"} size={24} /></span>}
            {biz.name}
          </a>
          <div className="links">
            <a href="#services">Services</a><a href="#why">Why us</a>
            {c.reviews.length > 0 && <a href="#reviews">Reviews</a>}
            <a href="#contact">Contact</a>
          </div>
          {phone
            ? <a className="btn btn-accent" href={`tel:${tel(phone)}`}><Icon name="phone" size={18} />{phone}</a>
            : <a className="btn btn-accent" href={d.bookHref}>{c.ctaLabel}</a>}
        </div>
      </nav>

      <header className="hero" id="top">
        {c.heroImage && <div className="bg"><img src={c.heroImage} alt="" /></div>}
        <div className="wrap">
          <div>
            <span className="tag">{c.tagline}</span>
            <h1 style={{ marginTop: 16 }}>{c.headline}</h1>
            <p className="lead">{c.subheadline}</p>
            <div className="actions">
              <a className="btn btn-accent" href={d.bookHref}><Icon name="calendar" size={18} />{c.ctaLabel}</a>
              {phone && <a className="btn btn-line" href={`tel:${tel(phone)}`}><Icon name="phone" size={18} />Call {phone}</a>}
            </div>
          </div>
          <div className="quote">
            <h3>Get a free quote</h3>
            <p>Tell us what&apos;s going on and we&apos;ll get back to you fast.</p>
            <EnquiryForm slug={biz.slug} services={services.map((s) => s.name)} button="Request a quote"
              buttonClass="btn btn-dark" messagePlaceholder="Address or short description" compact />
          </div>
        </div>
      </header>

      <div className="proof">
        <div className="wrap">
          {c.highlights.slice(0, 4).map((h, i) => <div key={h}><Icon name={proofIcons[i]} size={22} />{h}</div>)}
        </div>
      </div>

      <section id="services">
        <div className="wrap">
          <div className="head">
            <div><span className="tag">Services</span><h2 style={{ marginTop: 12 }}>What we fix, install<br />and look after</h2></div>
            <p>Straight answers, clear pricing before any work starts, and a job done right the first time{biz.city ? ` for homes across ${biz.city}` : ""}.</p>
          </div>
          <div className="grid">
            {services.map((s, i) => (
              <article className="svc" key={s.id}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <div className="ico"><Icon name={s.icon} size={28} /></div>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <p style={{ color: "var(--dark)", fontWeight: 700, marginTop: 14 }}>{s.price ?? "Free quote"}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="why" id="why">
        <div className="wrap">
          <div className="why-visual">
            {c.gallery[0] ? <img src={c.gallery[0]} alt="" /> : <Icon name={services[1]?.icon ?? "home"} size={120} />}
            {c.rating != null && (
              <div className="badge">
                <strong>{c.rating.toFixed(1)}</strong>
                <div><Stars n={Math.round(c.rating)} />
                  <div style={{ fontSize: ".9rem", color: "var(--muted)" }}>{c.reviewCount ? `${c.reviewCount} reviews on Google` : "Google rating"}</div>
                </div>
              </div>
            )}
          </div>
          <div>
            <span className="tag">Why {biz.name}</span>
            <h2 style={{ marginTop: 12 }}>{c.aboutTitle}</h2>
            <Paragraphs text={c.about} className="body" />
            <ul>{c.highlights.map((h) => <li key={h}><Icon name="check" size={26} />{h}</li>)}</ul>
            {c.areasServed.length > 0 && (
              <div className="areas">{c.areasServed.map((a) => <span key={a}><Icon name="map" size={14} />{a}</span>)}</div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="head"><div><span className="tag">How it works</span><h2 style={{ marginTop: 12 }}>Three steps. No runaround.</h2></div></div>
          <div className="steps">
            <div className="step"><h3>Book online or call</h3><p>Pick a time that suits you, or tell us what&apos;s wrong and we&apos;ll fit you in.</p></div>
            <div className="step"><h3>We come to you</h3><p>We turn up when we say, look at the problem and explain your options and the price.</p></div>
            <div className="step"><h3>Fixed, and cleaned up</h3><p>Work done properly, your home left tidy, and we&apos;re a phone call away if you need us.</p></div>
          </div>
        </div>
      </section>

      {c.reviews.length > 0 && (
        <section id="reviews" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="head"><div><span className="tag">Reviews</span><h2 style={{ marginTop: 12 }}>Neighbours who called us</h2></div></div>
            <div className="reviews">
              {c.reviews.slice(0, 3).map((r, i) => (
                <figure className="review" key={i}><Stars n={r.rating} /><p>“{r.text}”</p><cite>{r.author}</cite></figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="cta" id="contact">
        <div className="wrap">
          <h2>Need it sorted today?</h2>
          {phone
            ? <a className="phone-big" href={`tel:${tel(phone)}`}><Icon name="phone" size={40} />{phone}</a>
            : <a className="btn btn-dark" href={d.bookHref}>{c.ctaLabel}</a>}
        </div>
      </div>

      {c.faqs.length > 0 && (
        <section>
          <div className="wrap" style={{ maxWidth: 860 }}>
            <div className="head"><h2>Common questions</h2></div>
            {c.faqs.map((f) => (
              <details key={f.q} style={{ borderBottom: "2px solid var(--line)", padding: "20px 0" }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "1.1rem" }}>{f.q}</summary>
                <p style={{ color: "var(--muted)", marginTop: 10 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <footer>
        <div className="wrap">
          <div><h4>{biz.name}</h4><p>{c.tagline}.{biz.address && <><br />{biz.address}</>}</p></div>
          <div><h4>Contact</h4>
            {phone && <p><a href={`tel:${tel(phone)}`}>{phone}</a></p>}
            {biz.email && <p><a href={`mailto:${biz.email}`}>{biz.email}</a></p>}
          </div>
          <div><h4>Hours</h4>{d.hours.map((h) => <div className="row" key={h.days}><span>{h.days}</span><span>{h.time}</span></div>)}</div>
        </div>
        <div className="wrap" style={{ display: "block", marginTop: 40, fontSize: ".85rem" }}>© {d.year} {biz.name}</div>
      </footer>

      {phone && <a className="call-fab" href={`tel:${tel(phone)}`}><Icon name="phone" size={18} />Call now</a>}
    </>
  );
}
