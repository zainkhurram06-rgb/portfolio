import { DemoRibbon, Icon, Paragraphs, Stars, tel } from "@/components/site/bits";
import { EnquiryForm } from "@/components/site/enquiry-form";
import type { SiteData } from "@/lib/site";

export default function Salon({ d }: { d: SiteData }) {
  const { biz, c, services } = d;
  const phone = biz.phone;
  const [top, ...more] = c.reviews;
  return (
    <>
      <DemoRibbon name={biz.name} show={d.isDemo} />

      <nav style={{ top: d.isDemo ? 37 : 0 }}>
        <div className="wrap">
          <a className="brand" href={`${d.base}/`}>{c.logoUrl && <img src={c.logoUrl} alt={`${biz.name} logo`} />}{biz.name}</a>
          <div className="links">
            <a href="#menu">Services</a><a href="#about">About</a>
            {c.reviews.length > 0 && <a href="#words">Reviews</a>}
            <a href="#visit">Visit</a>
          </div>
          <a className="btn btn-outline" href={d.bookHref}>{c.ctaLabel}</a>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="wrap">
          <div>
            <span className="kicker">{c.tagline}{biz.city ? ` · ${biz.city}` : ""}</span>
            <h1 style={{ marginTop: 22 }}>{c.headline}</h1>
            <p className="lead">{c.subheadline}</p>
            <div className="actions">
              <a className="btn btn-solid" href={d.bookHref}>{c.ctaLabel}</a>
              {c.instagram
                ? <a className="btn btn-outline" href={c.instagram}>See our work</a>
                : <a className="btn btn-outline" href="#menu">View services</a>}
            </div>
          </div>
          <div className="collage">
            <div className="p p1">{c.heroImage ? <img src={c.heroImage} alt={biz.name} /> : <div className="art"><Icon name={services[0]?.icon ?? "scissors"} size={110} /></div>}</div>
            <div className="p p2">{c.gallery[0] ? <img src={c.gallery[0]} alt="" /> : <div className="art"><Icon name="sparkle" size={64} /></div>}</div>
            {c.rating != null && <div className="seal"><div><b>{c.rating.toFixed(1)}</b>stars</div></div>}
          </div>
        </div>
      </header>

      <div className="marquee" aria-hidden="true">
        <div>{[...services, ...services].map((s, i) => <span key={i}>{s.name}</span>)}</div>
      </div>

      <section id="about">
        <div className="wrap intro">
          <div><span className="kicker">The studio</span><h2 style={{ marginTop: 18 }}>{c.aboutTitle}</h2></div>
          <div>
            <Paragraphs text={c.about} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px", marginTop: 30 }}>
              {c.highlights.map((h) => (
                <span key={h} style={{ display: "inline-flex", gap: 8, alignItems: "center", fontWeight: 600 }}><Icon name="sparkle" size={18} />{h}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="menu" id="menu">
        <div className="wrap">
          <span className="kicker">The menu</span>
          <h2 style={{ marginTop: 18 }}>Services, done <em>beautifully</em></h2>
          <div className="menu-list">
            {services.map((s) => (
              <a className="item" key={s.id} href={d.bookHref}>
                <span className="ico"><Icon name={s.icon} size={34} /></span>
                <h3>{s.name}</h3>
                <p>{s.description}{s.price && <><br /><strong style={{ color: "var(--accent)" }}>{s.price}</strong></>}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 60 }}>
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, flexWrap: "wrap" }}>
            <div><span className="kicker">Recent work</span><h2 style={{ marginTop: 18 }}>Fresh from the <em>chair</em></h2></div>
            {c.instagram && <a className="btn btn-outline" href={c.instagram}>Follow on Instagram</a>}
          </div>
          <div className="gallery">
            {["scissors", "brush", "sparkle", "mirror"].map((ic, i) => (
              <div key={ic}>{c.gallery[i + 1] ? <img src={c.gallery[i + 1]} alt="" /> : <Icon name={ic} size={44} />}</div>
            ))}
          </div>
        </div>
      </section>

      {top && (
        <section className="words" id="words">
          <div className="wrap">
            <span className="kicker">Kind words</span>
            <blockquote>“{top.text}”</blockquote>
            <cite>{top.author}</cite>
            {more.length > 0 && (
              <div className="more">
                {more.slice(0, 3).map((r, i) => (
                  <div key={i}><Stars n={r.rating} /><p style={{ margin: "12px 0" }}>“{r.text}”</p><strong>{r.author}</strong></div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section id="visit" style={{ paddingTop: top ? 0 : 60 }}>
        <div className="wrap" id="contact">
          <div className="book">
            <div className="info">
              <span className="kicker" style={{ color: "rgba(255,255,255,.7)" }}>Visit</span>
              <h2 style={{ marginTop: 14 }}>Your chair is waiting</h2>
              {biz.address && <p>{biz.address}</p>}
              {phone && <p><a href={`tel:${tel(phone)}`}>{phone}</a></p>}
              <div style={{ marginTop: 26 }}>{d.hours.map((h) => <div className="row" key={h.days}><span>{h.days}</span><span>{h.time}</span></div>)}</div>
              <a className="btn" href={d.bookHref} style={{ marginTop: 30, background: "#fff", color: "var(--primary)" }}>{c.ctaLabel}</a>
            </div>
            <div style={{ padding: "60px" }} className="book-form">
              <h3>Questions? Message us</h3>
              <EnquiryForm slug={biz.slug} services={services.map((s) => s.name)} button="Send message" buttonClass="btn btn-solid" />
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="brand">{biz.name}</div>
        <p>{c.tagline}{biz.city ? ` · ${biz.city}` : ""}</p>
        <div className="social">
          {c.instagram && <a href={c.instagram}>Instagram</a>}
          {c.facebook && <a href={c.facebook}>Facebook</a>}
        </div>
        <p>© {d.year} {biz.name}</p>
      </footer>
    </>
  );
}
