"use client";

// The contact / quote form on every theme. Sends to the business's Messages inbox.

import { useState } from "react";

type Props = {
  slug: string;
  services: string[];
  button: string;
  buttonClass: string;
  messagePlaceholder?: string;
  compact?: boolean;
};

export function EnquiryForm({ slug, services, button, buttonClass, messagePlaceholder, compact }: Props) {
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
      <input name="name" placeholder="Your name" required maxLength={80} />
      <input name="phone" placeholder="Phone" type="tel" required maxLength={40} />
      {!compact && <input name="email" placeholder="Email (optional)" type="email" maxLength={120} />}
      <select name="service" defaultValue="">
        <option value="">What do you need?</option>
        {services.map((s) => <option key={s}>{s}</option>)}
      </select>
      <textarea name="message" rows={compact ? 2 : 3} placeholder={messagePlaceholder ?? "Anything we should know?"} maxLength={1000} />
      <button className={buttonClass} type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending..." : button}
      </button>
      <div data-note aria-live="polite">
        {state === "sent" && "Thanks, we've got your message and will get back to you soon."}
        {state === "error" && "That didn't send. Please call us instead."}
      </div>
    </form>
  );
}
