// The contact / quote form on the websites. Plain HTML: a small script (in
// ENQUIRY_JS) sends it to the business's Messages inbox, so it works on the
// platform and in saved website files alike.

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
  return (
    <form data-enquiry={`/api/sites/${slug}/enquiries`} data-sending={L.form_sending} data-sent={L.form_sent} data-error={L.form_error}>
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
      <button className={buttonClass} type="submit">{button}</button>
      <div data-note aria-live="polite" />
    </form>
  );
}

export const ENQUIRY_JS = `
document.addEventListener("submit", function (e) {
  var f = e.target;
  if (!f.matches || !f.matches("form[data-enquiry]")) return;
  e.preventDefault();
  var note = f.querySelector("[data-note]"), btn = f.querySelector("button[type=submit]"), label = btn.textContent;
  btn.disabled = true; btn.textContent = f.getAttribute("data-sending");
  var data = {}; new FormData(f).forEach(function (v, k) { data[k] = v; });
  fetch(f.getAttribute("data-enquiry"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) })
    .then(function (r) { if (!r.ok) throw r; note.textContent = f.getAttribute("data-sent"); f.reset(); })
    .catch(function () { note.textContent = f.getAttribute("data-error"); })
    .then(function () { btn.disabled = false; btn.textContent = label; });
});
`;
