import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/Sidebar";

export const metadata = {
  title: "Admin · Esenza",
  robots: "noindex,nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login page bypasses the sidebar
  if (!user) {
    return <>{children}</>;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single<{ full_name: string | null; email: string; role: "owner" | "staff" }>();

  if (!profileData) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar
        user={{
          name: profileData.full_name || profileData.email,
          email: profileData.email,
          role: profileData.role,
        }}
      />
      <main className="flex-1 p-8 md:p-12">{children}</main>
    </div>
  );
}
