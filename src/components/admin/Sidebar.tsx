"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/reservas", label: "Reservas", icon: "event" },
  { href: "/admin/calendario", label: "Calendario", icon: "calendar_month" },
  { href: "/admin/huespedes", label: "Huéspedes", icon: "group" },
  { href: "/admin/fotos", label: "Fotos", icon: "photo_library" },
  { href: "/admin/sync", label: "Sync Airbnb", icon: "sync" },
  { href: "/admin/config", label: "Configuración", icon: "settings" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "manage_accounts" },
];

export default function AdminSidebar({
  user,
}: {
  user: { name: string | null; email: string; role: string };
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
      <div className="p-6 border-b border-stone-200">
        <Link href="/admin" className="font-script text-3xl text-primary">
          Esenza
        </Link>
        <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">
          Admin
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-200">
        <div className="px-2 mb-3">
          <p className="text-sm font-medium text-stone-900 truncate">
            {user.name}
          </p>
          <p className="text-xs text-stone-500 truncate">{user.email}</p>
          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">
            {user.role}
          </p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
