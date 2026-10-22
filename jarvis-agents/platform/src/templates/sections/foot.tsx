// The bottom of the page: call to action, contact, footer and the call button.

import { Icon, tel } from "@/components/site/bits";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { isHealth } from "@/lib/niches";
import type { SiteData } from "@/lib/site-data";
import { BookButton, CallButton, Num, cls, type SectionProps } from "./parts";

export function Cta({ d, v, tone }: SectionProps) {
  const { biz, c, L } = d;
  if (v === "phone" && biz.phone) {
    return (
      <section className={cls("cta v-phone", tone || "tone-brand")}>
        <div className="wrap">
          <h2>{L.sec_cta_title}</h2>
          <a className="phone-big" href={`tel:${tel(biz.phone)}`}><Icon name="phone" size={36} /><Num>{biz.phone}</Num></a>
        </div>
      </section>
    );
  }
  if (v === "split") {
    return (
      <section className={cls("cta v-split", tone)}>
        <div className="wrap">
          <div><h2>{L.sec_cta_title}</h2><p>{c.subheadline}</p></div>
          <div className="actions"><BookButton d={d} /><CallButton d={d} /></div>
        </div>
      </section>
    );
  }
  return (
    <section className={cls("cta v-band", tone)}>
      <div className="wrap">
        <div className="band">
          <h2>{L.sec_cta_title}</h2>
          <p>{c.subheadline}</p>
          <div className="actions"><BookButton d={d} className="btn btn-light" /><CallButton d={d} className="btn btn-ghost-light" /></div>
        </div>
      </div>
    </section>
  );
}

function Hours({ d }: { d: SiteData }) {
  return <div className="hours">{d.hours.map((h) => <div key={h.days}><span>{h.days}</span><span>{h.time}</span></div>)}</div>;
}

function Lines({ d }: { d: SiteData }) {
  const { biz } = d;
  return (
    <div className="lines">
      {biz.address && <div><Icon name="map" size={19} /><span>{biz.address}</span></div>}
      {biz.phone && <div><Icon name="phone" size={19} /><a href={`tel:${tel(biz.phone)}`}><Num>{biz.phone}</Num></a></div>}
      {biz.email && <div><Icon name="calendar" size={19} /><a href={`mailto:${biz.email}`}>{biz.email}</a></div>}
    </div>
  );
}

export function Contact({ d, v, tone }: SectionProps) {
  const { biz, L, services } = d;
  const form = (
    <EnquiryForm slug={biz.slug} services={services.map((s) => s.name)} button={L.form_send} buttonClass="btn btn-main"
      messagePlaceholder={isHealth(biz.niche) ? L.form_message_health : undefined} L={L} />
  );
  if (v === "simple") {
    return (
      <section className={cls("sec contact v-simple", tone)} id="contact">
        <div className="wrap narrow">
          <span className="kicker">{L.sec_contact_kicker}</span>
          <h2>{L.sec_contact_title}</h2>
          <Lines d={d} />
          <Hours d={d} />
          <div className="actions"><BookButton d={d} />{d.mapsHref && <a className="btn btn-alt" href={d.mapsHref}><Icon name="map" size={18} />{L.get_directions}</a>}</div>
        </div>
      </section>
    );
  }
  if (v === "map") {
    return (
      <section className={cls("sec contact v-map", tone)} id="contact">
        <div className="wrap">
          <div className="info">
            <span className="kicker">{L.sec_contact_kicker}</span>
            <h2>{L.sec_contact_title}</h2>
            <Lines d={d} />
            {d.mapsHref && <a className="map-link card" href={d.mapsHref}><Icon name="map" size={28} /><span>{L.get_directions}</span></a>}
            <h3>{L.sec_hours}</h3>
            <Hours d={d} />
          </div>
          <div className="card form-card"><h3>{L.sec_message_title}</h3>{form}</div>
        </div>
      </section>
    );
  }
  return (
    <section className={cls("sec contact v-panels", tone)} id="contact">
      <div className="wrap">
        <div className="panel dark">
          <h3>{L.sec_contact_title}</h3>
          <Lines d={d} />
          <Hours d={d} />
          <BookButton d={d} className="btn btn-light" />
        </div>
        <div className="panel card"><h3>{L.sec_message_title}</h3>{form}</div>
      </div>
    </section>
  );
}

export function Footer({ d, v, tone }: SectionProps) {
  const { biz, c, L } = d;
  const social = (
    <span className="social">
      {c.instagram && <a href={c.instagram}>Instagram</a>}
      {c.facebook && <a href={c.facebook}>Facebook</a>}
    </span>
  );
  if (v === "columns") {
    return (
      <footer className={cls("footer v-columns", tone || "tone-inv")}>
        <div className="wrap">
          <div><h4>{biz.name}</h4><p>{c.tagline}</p>{social}</div>
          <div><h4>{L.nav_contact}</h4><Lines d={d} /></div>
          <div><h4>{L.sec_hours}</h4><Hours d={d} /></div>
        </div>
        <div className="wrap legal">© {d.year} {biz.name}</div>
      </footer>
    );
  }
  return (
    <footer className={cls("footer v-simple", tone)}>
      <div className="wrap">
        <span>© {d.year} {biz.name}{biz.city ? `, ${biz.city}` : ""}</span>
        {social}
      </div>
    </footer>
  );
}

// a call button that follows you down the page on phones
export function Fab({ d }: SectionProps) {
  if (!d.biz.phone) return null;
  return <a className="fab" href={`tel:${tel(d.biz.phone)}`}><Icon name="phone" size={18} />{d.L.call_now}</a>;
}
