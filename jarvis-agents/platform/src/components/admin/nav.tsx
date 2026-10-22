"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Today" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/team", label: "Team & hours" },
  { href: "/admin/website", label: "My website" },
  { href: "/admin/settings", label: "Settings" },
];

export function Nav({ unread }: { unread: number }) {
  const path = usePathname();
  const on = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href}
          className={`flex shrink-0 items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium ${on(i.href) ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-200/60"}`}>
          {i.label}
          {i.href === "/admin/messages" && unread > 0 && (
            <span className={`rounded-full px-2 text-xs font-bold ${on(i.href) ? "bg-white text-stone-900" : "bg-amber-400 text-stone-900"}`}>{unread}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
