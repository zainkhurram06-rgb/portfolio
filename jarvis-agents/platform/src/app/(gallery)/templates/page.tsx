// Every template at a glance. Click one to open it full size.

import Link from "next/link";
import { NICHES, NICHE_KEYS, type Niche } from "@/lib/niches";
import { TEMPLATE_LIST } from "@/templates";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

const css = `
body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #f4f4f2; color: #1c1917; }
.g-wrap { width: min(1400px, 100% - 32px); margin: 0 auto; padding: 32px 0 80px; }
.g-wrap h1 { font-size: 1.8rem; }
.g-wrap > p { color: #57534e; margin: 6px 0 20px; }
.g-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.g-filters a { padding: 8px 14px; border-radius: 999px; border: 1px solid #d6d3d1; background: #fff; font-size: .9rem; color: inherit; text-decoration: none; }
.g-filters a.on { background: #1c1917; color: #fff; border-color: #1c1917; }
.g-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.g-card { background: #fff; border-radius: 14px; overflow: hidden; border: 1px solid #e7e5e4; }
.g-shot { position: relative; height: 300px; overflow: hidden; background: #eee; }
.g-shot iframe { width: 1280px; height: 1200px; border: 0; transform: scale(.25); transform-origin: 0 0; pointer-events: none; }
.g-meta { padding: 14px 16px; display: grid; gap: 6px; }
.g-meta b { font-size: 1.05rem; }
.g-meta small { color: #78716c; }
.g-links { display: flex; flex-wrap: wrap; gap: 10px; font-size: .85rem; }
.g-links a { color: #1d4ed8; }
`;

export default async function Gallery({ searchParams }: Props) {
  const q = await searchParams;
  const niche = NICHE_KEYS.includes(q.niche as Niche) ? (q.niche as Niche) : null;
  const list = niche ? TEMPLATE_LIST.filter((t) => t.niches.includes(niche)) : TEMPLATE_LIST;
  return (
    <div className="g-wrap">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <h1>Template gallery</h1>
      <p>{TEMPLATE_LIST.length} templates. Example businesses and placeholder photos. Skeleton designs, to be restyled from the references.</p>
      <div className="g-filters">
        <Link href="/templates" className={niche ? "" : "on"}>All</Link>
        {NICHE_KEYS.map((n) => (
          <a key={n} href={`/templates?niche=${n}`} className={niche === n ? "on" : ""}>
            {NICHES[n].label} ({TEMPLATE_LIST.filter((t) => t.niches.includes(n)).length})
          </a>
        ))}
      </div>
      <div className="g-grid">
        {list.map((t) => {
          const n = niche ?? t.niches[0];
          const href = `/templates/${t.id}?niche=${n}`;
          return (
            <div className="g-card" key={t.id}>
              <a className="g-shot" href={href} style={{ display: "block" }}><iframe src={href} loading="lazy" tabIndex={-1} title={t.label} /></a>
              <div className="g-meta">
                <b>{t.label}</b>
                <small>{t.id} · {t.niches.map((x) => NICHES[x].label).join(", ")}{t.needsPhoto ? " · needs a photo" : ""}</small>
                <div className="g-links">
                  <a href={href}>Open</a>
                  <a href={`${href}&photos=0`}>No photos</a>
                  <a href={`${href}&lang=ar`}>Arabic</a>
                  <a href={`${href}&lang=de`}>German</a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
