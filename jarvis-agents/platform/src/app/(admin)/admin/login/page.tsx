import { redirect } from "next/navigation";
import { currentUser, login } from "@/lib/auth";
import { btn, input } from "@/components/admin/ui";

async function signIn(form: FormData) {
  "use server";
  const ok = await login(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  redirect(ok ? "/admin" : "/admin/login?e=wrong");
}

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await currentUser()) redirect("/admin");
  const { e } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form action={signIn} className="grid w-full max-w-sm gap-4 rounded-3xl border border-stone-200 bg-white p-8">
        <div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-stone-500">Manage your bookings and website.</p>
        </div>
        <input className={input} name="email" type="email" placeholder="Email" required autoComplete="email" />
        <input className={input} name="password" type="password" placeholder="Password" required autoComplete="current-password" />
        {e === "wrong" && <p className="text-sm font-medium text-red-700">That email and password don&apos;t match.</p>}
        {e === "nobusiness" && <p className="text-sm font-medium text-red-700">This login isn&apos;t linked to a business yet.</p>}
        <button className={btn + " py-3"}>Sign in</button>
      </form>
    </main>
  );
}
