import { createClient } from "@supabase/supabase-js";

/**
 * Stories product entitlement checks (shared by the app-session route and the
 * server-auth workspace guard).
 *
 * Workspace membership alone does not grant Stories access — a workspace whose
 * `stories_canopy` entitlement is paused, in pilot, or still in setup must not
 * be able to read or write Stories data through the API.
 */

type EntitlementRow = {
  workspace_id?: string | null;
  organization_id?: string | null;
  org_id?: string | null;
  product_key?: string | null;
  status?: string | null;
  setup_state?: string | null;
};

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return { url, serviceRoleKey };
}

export function canLaunchStories(row: EntitlementRow) {
  if (row.product_key !== "stories_canopy") {
    return false;
  }

  const status = row.status ?? "active";
  const setupState = row.setup_state ?? "ready";

  if (status === "paused" || status === "pilot") {
    return false;
  }

  if (setupState === "in_setup" || setupState === "blocked") {
    return false;
  }

  return true;
}

/**
 * Set of workspace ids that currently have Stories enabled. Tolerates the
 * entitlement table using any of organization_id / org_id / workspace_id.
 */
export async function getStoriesEnabledWorkspaceIds(): Promise<Set<string>> {
  const { url, serviceRoleKey } = getConfig();
  const serviceClient = createClient(url, serviceRoleKey);
  const attempts = [
    { select: "organization_id,product_key,status,setup_state" },
    { select: "org_id,product_key,status,setup_state" },
    { select: "workspace_id,product_key,status,setup_state" },
  ] as const;

  const workspaceIds = new Set<string>();

  for (const attempt of attempts) {
    const { data, error } = await serviceClient
      .from("product_entitlements")
      .select(attempt.select)
      .eq("product_key", "stories_canopy");

    if (error) {
      if (
        error.message.includes("product_entitlements") ||
        error.message.includes("workspace_id") ||
        error.message.includes("organization_id") ||
        error.message.includes("org_id")
      ) {
        continue;
      }
      throw new Error(error.message);
    }

    for (const row of ((data as EntitlementRow[] | null) ?? []).filter(canLaunchStories)) {
      const workspaceId = row.workspace_id ?? row.organization_id ?? row.org_id ?? null;
      if (workspaceId) {
        workspaceIds.add(workspaceId);
      }
    }
  }

  return workspaceIds;
}

/** True when Stories is enabled (active + ready) for the given workspace. */
export async function isStoriesEnabledForWorkspace(workspaceId: string): Promise<boolean> {
  if (!workspaceId) return false;
  const enabled = await getStoriesEnabledWorkspaceIds();
  return enabled.has(workspaceId);
}
