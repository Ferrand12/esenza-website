"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

type Result =
  | { ok: true; imported: number; skipped: number }
  | { ok: false; error: string };

/**
 * Triggers the cron endpoint from the admin panel.
 * The user is already authenticated as admin (enforced by layout),
 * so we forward the CRON_SECRET internally.
 */
export async function runAirbnbSync(): Promise<Result> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return { ok: false, error: "CRON_SECRET no configurado en el servidor" };
  }

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  if (!host) return { ok: false, error: "Host header missing" };
  const url = `${proto}://${host}/api/cron/sync-airbnb`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
  } catch (e) {
    return {
      ok: false,
      error: `Error de red: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    return {
      ok: false,
      error: (body.error as string) || `HTTP ${res.status}`,
    };
  }

  revalidatePath("/admin/sync");
  revalidatePath("/admin/calendario");
  return {
    ok: true,
    imported: Number(body.imported) || 0,
    skipped: Number(body.skipped) || 0,
  };
}
