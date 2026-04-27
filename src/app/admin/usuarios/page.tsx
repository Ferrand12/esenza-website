import { createClient } from "@/lib/supabase/server";
import UsuariosManager, {
  type UserRow,
} from "@/components/admin/UsuariosManager";

export default async function UsuariosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // layout will have redirected to /admin/login
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: "owner" | "staff" }>();

  if (me?.role !== "owner") {
    return (
      <div className="max-w-2xl">
        <h1 className="font-editorial text-4xl text-primary">Usuarios</h1>
        <div className="mt-8 bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-300">
            lock
          </span>
          <p className="mt-4 text-stone-700 font-medium">
            Acceso restringido
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Solo los usuarios con rol <strong>owner</strong> pueden administrar
            usuarios. Pedile a alguien del equipo con ese rol que te dé acceso.
          </p>
        </div>
      </div>
    );
  }

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .returns<UserRow[]>();

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-editorial text-4xl text-primary">Usuarios</h1>
        <p className="mt-1 text-stone-600 text-sm">
          Invitá staff, gestioná roles y revocá accesos.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">
          Error cargando usuarios: {error.message}
        </div>
      ) : (
        <UsuariosManager
          currentUserId={user.id}
          users={users ?? []}
        />
      )}
    </div>
  );
}
