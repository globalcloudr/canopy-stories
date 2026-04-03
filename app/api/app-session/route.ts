import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getRequestAccess, resolveAccessibleOrganizations, toErrorResponse } from "@/lib/server-auth";

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

function canLaunchStories(row: EntitlementRow) {
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

async function getStoriesEnabledWorkspaceIds() {
  const { url, serviceRoleKey } = getConfig();
  const serviceClient = createClient(url, serviceRoleKey);
  const attempts = [
    { select: "organization_id,product_key,status,setup_state", column: "organization_id" },
    { select: "org_id,product_key,status,setup_state", column: "org_id" },
    { select: "workspace_id,product_key,status,setup_state", column: "workspace_id" },
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

function formatDisplayName(email: string | null | undefined, fullName: string | null | undefined) {
  const value = fullName?.trim();
  if (value) {
    return value;
  }

  const normalizedEmail = email?.trim();
  if (!normalizedEmail) {
    return "Canopy User";
  }

  return normalizedEmail
    .split("@")[0]
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function GET(request: Request) {
  try {
    const requestedWorkspaceSlug = new URL(request.url).searchParams.get("workspace")?.trim() || null;
    const access = await getRequestAccess(request);
    const organizations = await resolveAccessibleOrganizations(request);
    const storiesEnabledWorkspaceIds = await getStoriesEnabledWorkspaceIds();
    const workspaces = organizations
      .filter((org) => org.id && storiesEnabledWorkspaceIds.has(org.id))
      .filter((org) => org.id && org.slug)
      .map((org) => ({
        id: org.id,
        name: org.name?.trim() || org.slug!,
        slug: org.slug!,
      }));

    if (workspaces.length === 0) {
      return NextResponse.json({ error: "Stories is not enabled for any accessible workspaces." }, { status: 403 });
    }

    const requestedWorkspace = requestedWorkspaceSlug
      ? workspaces.find((workspace) => workspace.slug === requestedWorkspaceSlug) ?? null
      : null;

    if (requestedWorkspaceSlug && !requestedWorkspace) {
      return NextResponse.json({ error: "Stories is not enabled for the requested workspace." }, { status: 403 });
    }

    const activeWorkspace = requestedWorkspace ?? workspaces[0] ?? null;

    return NextResponse.json({
      user: {
        id: access.user.id,
        email: access.user.email ?? "",
        displayName: formatDisplayName(
          access.user.email,
          typeof access.user.user_metadata?.full_name === "string"
            ? access.user.user_metadata.full_name
            : typeof access.user.user_metadata?.name === "string"
              ? access.user.user_metadata.name
              : null
        ),
      },
      isPlatformOperator: access.isPlatformOperator,
      workspaces,
      activeWorkspace,
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to load app session.");
  }
}
