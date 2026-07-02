/**
 * One-time backfill: encrypt existing plaintext workspace_api_keys secrets
 * (openai_api_key, video_api_key) at rest. Safe to re-run (already-encrypted
 * values are skipped).
 *
 * Usage (from the canopy-stories repo root):
 *   NEXT_PUBLIC_SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   SECRETS_ENCRYPTION_KEY=... \
 *   npx tsx scripts/backfill-encrypt-keys.ts
 *
 * Run AFTER deploying the encrypted read/write code and setting
 * SECRETS_ENCRYPTION_KEY on Vercel.
 */
import { createClient } from "@supabase/supabase-js";
import { encryptSecret, isEncrypted } from "../lib/secret-crypto";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase env vars are required.");
  if (!process.env.SECRETS_ENCRYPTION_KEY) throw new Error("SECRETS_ENCRYPTION_KEY is required.");

  const supabase = createClient(url, serviceRoleKey);
  const { data, error } = await supabase
    .from("workspace_api_keys")
    .select("id,openai_api_key,video_api_key");
  if (error) throw new Error(error.message);

  let updated = 0;
  let skipped = 0;
  for (const row of data ?? []) {
    const r = row as { id: string; openai_api_key: string | null; video_api_key: string | null };
    const patch: Record<string, string> = {};
    if (r.openai_api_key && !isEncrypted(r.openai_api_key)) {
      patch.openai_api_key = encryptSecret(r.openai_api_key);
    }
    if (r.video_api_key && !isEncrypted(r.video_api_key)) {
      patch.video_api_key = encryptSecret(r.video_api_key);
    }
    if (Object.keys(patch).length === 0) {
      skipped += 1;
      continue;
    }
    const { error: updateError } = await supabase
      .from("workspace_api_keys")
      .update(patch)
      .eq("id", r.id);
    if (updateError) throw new Error(`Failed to update ${r.id}: ${updateError.message}`);
    updated += 1;
  }

  console.log(`Done. Updated ${updated} row(s), skipped ${skipped} (empty or already encrypted).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
