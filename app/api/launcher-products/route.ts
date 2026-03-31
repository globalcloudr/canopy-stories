import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type LauncherProductKey = "photovault" | "stories_canopy" | "reach_canopy";

type ProfileRow = {
  is_super_admin?: boolean | null;
  platform_role?: string | null;
};

type MembershipRow = {
  org_id: string;
};

type EntitlementRow = {
  workspace_id?: string | null;
  organization_id?: string | null;
  org_id?: string | null;
  product_key?: string | null;
  status?: string | null;
  setup_state?: string | null;
};

class RouteAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return { url, anonKey, serviceRoleKey };
}

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new RouteAuthError(401, "Authentication required.");
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    throw new RouteAuthError(401, "Authentication required.");
  }

  return token;
}

function isPlatformOperator(profile: ProfileRow | null) {
  return (
    profile?.is_super_admin === true ||
    profile?.platform_role === "super_admin" ||
    profile?.platform_role === "platform_staff"
  );
}

function isLauncherProductKey(value: string | null | undefined): value is LauncherProductKey {
  return value === "photovault" || value === "stories_canopy" || value === "reach_canopy";
}

function canLaunchProduct(row: EntitlementRow) {
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

async function requireWorkspaceAccess(request: Request, workspaceId: string) {
  const token = getBearerToken(request);
  const { url, anonKey, serviceRoleKey } = getConfig();
  const authClient = createClient(url, anonKey);
  const serviceClient = createClient(url, serviceRoleKey);

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    throw new RouteAuthError(401, "Authentication required.");
  }

  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("is_super_admin,platform_role")
    .eq("user_id", data.user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    throw new Error(profileError.message);
  }

  if (isPlatformOperator((profile as ProfileRow | null) ?? null)) {
    return;
  }

  const { data: membership, error: membershipError } = await serviceClient
    .from("memberships")
    .select("org_id")
    .eq("user_id", data.user.id)
    .eq("org_id", workspaceId)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership) {
    throw new RouteAuthError(403, "You do not have access to this workspace.");
  }
}

async function getLaunchableProducts(workspaceId: string): Promise<LauncherProductKey[]> {
  const { url, serviceRoleKey } = getConfig();
  const serviceClient = createClient(url, serviceRoleKey);
  const attempts = [
    { select: "organization_id,product_key,status,setup_state", column: "organization_id" },
    { select: "org_id,product_key,status,setup_state", column: "org_id" },
    { select: "workspace_id,product_key,status,setup_state", column: "workspace_id" },
  ] as const;

  for (const attempt of attempts) {
    const { data, error } = await serviceClient
      .from("product_entitlements")
      .select(attempt.select)
      .eq(attempt.column, workspaceId);

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

    return (((data as EntitlementRow[] | null) ?? [])
      .flatMap((row) => (isLauncherProductKey(row.product_key) && canLaunchProduct(row) ? [row.product_key] : []))
      .filter((value, index, array) => array.indexOf(value) === index));
  }

  return [];
}

function toErrorResponse(err: unknown, fallbackMessage: string) {
  if (err instanceof RouteAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  return NextResponse.json(
    { error: err instanceof Error ? err.message : fallbackMessage },
    { status: 500 }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId")?.trim();

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
  }

  try {
    await requireWorkspaceAccess(request, workspaceId);
    const products = await getLaunchableProducts(workspaceId);
    return NextResponse.json({ products });
  } catch (error) {
    return toErrorResponse(error, "Failed to load launcher products.");
  }
}
