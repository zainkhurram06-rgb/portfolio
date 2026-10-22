"use client";

// The contact / quote form on every theme. Sends to the business's Messages inbox.

import { useState } from "react";
import type { Labels } from "@/lib/labels";

type Props = {
  slug: string;
  services: string[];
  button: string;
  buttonClass: string;
  messagePlaceholder?: string;
  compact?: boolean;
  L: Pick<Labels, "form_name" | "form_phone" | "form_email" | "form_service" | "form_message" | "form_sending" | "form_sent" | "form_error">;
};

export function EnquiryForm({ slug, services, button, buttonClass, messagePlaceholder, compact, L }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    const res = await fetch(`/api/sites/${slug}/enquiries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    }).catch(() => null);
    setState(res?.ok ? "sent" : "error");
    if (res?.ok) (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={submit}>
      {/* bots fill every field, people never see this one */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <input name="name" placeholder={L.form_name} required maxLength={80} />
      <input name="phone" placeholder={L.form_phone} type="tel" required maxLength={40} />
      {!compact && <input name="email" placeholder={L.form_email} type="email" maxLength={120} />}
      <select name="service" defaultValue="">
        <option value="">{L.form_service}</option>
        {services.map((s) => <option key={s}>{s}</option>)}
      </select>
      <textarea name="message" rows={compact ? 2 : 3} placeholder={messagePlaceholder ?? L.form_message} maxLength={1000} />
      <button className={buttonClass} type="submit" disabled={state === "sending"}>
        {state === "sending" ? L.form_sending : button}
      </button>
      <div data-note aria-live="polite">
        {state === "sent" && L.form_sent}
        {state === "error" && L.form_error}
      </div>
    </form>
  );
}
