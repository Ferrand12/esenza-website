import { createAdminClient } from "@/lib/supabase/admin";

const ensuredBuckets = new Set<string>();

/**
 * Asegura que exista un bucket público.
 * Cachea por proceso para no consultar en cada request.
 */
export async function ensurePublicBucket(name: string): Promise<void> {
  if (ensuredBuckets.has(name)) return;

  const admin = createAdminClient();
  const { data, error } = await admin.storage.getBucket(name);
  if (!error && data) {
    ensuredBuckets.add(name);
    return;
  }

  const { error: createErr } = await admin.storage.createBucket(name, {
    public: true,
  });
  if (createErr && !createErr.message.includes("already exists")) {
    console.error(`[storage] create bucket ${name}:`, createErr.message);
    return;
  }
  ensuredBuckets.add(name);
}

export function publicUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
