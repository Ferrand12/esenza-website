import { redirect } from "next/navigation";

// Soporta el redirect desde el form de consulta: /pqrsf/consultar?code=XYZ
export default async function ConsultarRedirect({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (code && /^PQRSF-\d{4}-\d{4}$/.test(code)) {
    redirect(`/pqrsf/consultar/${code}`);
  }
  redirect("/pqrsf");
}
