// Small pieces every theme uses.

import { ICON_PATHS } from "./icon-paths";

export function Icon({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] ?? '<circle cx="12" cy="12" r="9"/>' }}
    />
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
        </svg>
      ))}
    </span>
  );
}

// a thin bar so nobody mistakes a demo for the business's real site
export function DemoRibbon({ text, show }: { text: string; show: boolean }) {
  if (!show) return null;
  return (
    <div style={{ background: "#111", color: "#fff", font: "500 13px/1.4 system-ui,sans-serif", textAlign: "center", padding: "8px 16px", position: "relative", zIndex: 100 }}>
      {text}
    </div>
  );
}

export const tel = (phone?: string | null) => (phone ?? "").replace(/[^\d+]/g, "");

export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return <>{text.split(/\n\s*\n/).map((p, i) => <p key={i} className={className}>{p}</p>)}</>;
}
