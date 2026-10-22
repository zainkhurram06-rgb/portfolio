// The dashboard's building blocks. Big, plain and touch friendly: the people
// using this run a salon or a clinic, not a software company.

import Link from "next/link";

export function Page({ title, sub, action, children }: { title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          {sub && <p className="mt-1 text-stone-500">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="grid gap-5">{children}</div>
    </div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-stone-200 bg-white p-5 md:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export const btn = "inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-50";
export const btnLight = "inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold hover:border-stone-900";
export const btnDanger = "inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50";
export const input = "w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-stone-900";
export const label = "grid gap-1.5 text-sm font-medium text-stone-700";

export function Field({ name, children, hint }: { name: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className={label}>
      <span>{name}</span>
      {children}
      {hint && <span className="text-xs font-normal text-stone-500">{hint}</span>}
    </label>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-stone-50 px-4 py-6 text-center text-stone-500">{children}</p>;
}

export function Badge({ tone = "stone", children }: { tone?: "stone" | "green" | "amber" | "red" | "blue"; children: React.ReactNode }) {
  const tones = {
    stone: "bg-stone-100 text-stone-700", green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800", red: "bg-red-50 text-red-700", blue: "bg-sky-50 text-sky-700",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Stat({ label: l, value, href }: { label: string; value: React.ReactNode; href?: string }) {
  const body = (
    <div className="rounded-2xl border border-stone-200 bg-white p-3 sm:p-5">
      <div className="text-xs text-stone-500 sm:text-sm">{l}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
