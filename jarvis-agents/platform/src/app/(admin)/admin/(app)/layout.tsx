import { and, count, eq } from "drizzle-orm";
import { db, t } from "@/db";
import { currentBusiness, logout, switchBusiness } from "@/lib/auth";
import { Nav } from "@/components/admin/nav";
import { redirect } from "next/navigation";

async function signOut() {
  "use server";
  await logout();
  redirect("/admin/login");
}

async function pickBusiness(form: FormData) {
  "use server";
  await switchBusiness(String(form.get("id")));
  redirect("/admin");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { biz, user, all } = await currentBusiness();
  const [{ n }] = await db.select({ n: count() }).from(t.enquiries)
    .where(and(eq(t.enquiries.businessId, biz.id), eq(t.enquiries.status, "new")));
  const siteUrl = `/s/${biz.slug}`;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 z-10 border-b border-stone-200 bg-[#f6f6f4]/95 px-3 py-3 backdrop-blur md:h-screen md:border-r md:border-b-0 md:px-4 md:py-6">
        <div className="mb-3 flex items-center justify-between gap-2 px-1 md:mb-6 md:block">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{biz.name}</div>
            <a href={siteUrl} target="_blank" className="text-sm text-stone-500 underline-offset-2 hover:underline">View website ↗</a>
          </div>
          {all.length > 1 && (
            <form action={pickBusiness} className="md:mt-3">
              <select name="id" defaultValue={biz.id} className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm" >
                {all.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <button className="mt-1 text-xs font-semibold text-stone-600">Switch</button>
            </form>
          )}
        </div>
        <Nav unread={n} />
        <form action={signOut} className="mt-6 hidden px-1 md:block">
          <div className="truncate text-sm text-stone-500">{user.email}</div>
          <button className="mt-1 text-sm font-semibold text-stone-700 hover:underline">Sign out</button>
        </form>
      </aside>
      <main>{children}</main>
    </div>
  );
}
