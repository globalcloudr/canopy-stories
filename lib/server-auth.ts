import "server-only";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

type ProfileRow = {
  is_super_admin?: boolean | null;
  platform_role?: string | null;
};

type MembershipRow = {
  org_id: string;
  role?: string | null;
};

type OrganizationRow = {
  id: string;
  name: string | null;
  slug: string | null;
};

export class RouteAuthError extends Error {
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

function getBearerToken(request: Request): string {
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

function isWorkspaceAdminRole(role: string | null | undefined) {
  return role === "owner" || role === "admin";
}

export async function requireAuthenticatedUser(request: Request): Promise<{ user: User }> {
  const token = getBearerToken(request);
  const { url, anonKey } = getConfig();
  const authClient = createClient(url, anonKey);

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    throw new RouteAuthError(401, "Authentication required.");
  }

  return { user: data.user };
}

export async function getRequestAccess(request: Request): Promise<{
  user: User;
  isPlatformOperator: boolean;
  memberships: MembershipRow[];
}> {
  const { user } = await requireAuthenticatedUser(request);
  const { url, serviceRoleKey } = getConfig();
  const serviceClient = createClient(url, serviceRoleKey);

  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("is_super_admin,platform_role")
    .eq("user_id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    throw new Error(profileError.message);
  }

  const operator = isPlatformOperator((profile as ProfileRow | null) ?? null);
  if (operator) {
    return { user, isPlatformOperator: true, memberships: [] };
  }

  const { data: memberships, error: membershipError } = await serviceClient
    .from("memberships")
    .select("org_id,role")
    .eq("user_id", user.id);

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  return {
    user,
    isPlatformOperator: false,
    memberships: ((memberships as MembershipRow[] | null) ?? []).filter((row) => Boolean(row.org_id)),
  };
}

export async function requireWorkspaceAccess(request: Request, workspaceId: string) {
  const access = await getRequestAccess(request);

  if (access.isPlatformOperator) {
    return {
      ...access,
      membershipRole: null,
    };
  }

  const membership = access.memberships.find((row) => row.org_id === workspaceId);
  if (!membership) {
    throw new RouteAuthError(403, "You do not have access to this workspace.");
  }

  return {
    ...access,
    membershipRole: membership.role ?? null,
  };
}

export async function requireWorkspaceAdminAccess(request: Request, workspaceId: string) {
  const access = await requireWorkspaceAccess(request, workspaceId);

  if (access.isPlatformOperator) {
    return access;
  }

  if (!isWorkspaceAdminRole(access.membershipRole)) {
    throw new RouteAuthError(403, "You do not have permission to manage this workspace.");
  }

  return access;
}

export async function resolveAccessibleOrganizations(request: Request): Promise<OrganizationRow[]> {
  const access = await getRequestAccess(request);
  const { url, serviceRoleKey } = getConfig();
  const serviceClient = createClient(url, serviceRoleKey);

  if (access.isPlatformOperator) {
    const { data, error } = await serviceClient
      .from("organizations")
      .select("id,name,slug")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data as OrganizationRow[] | null) ?? [];
  }

  const workspaceIds = [...new Set(access.memberships.map((membership) => membership.org_id))];
  if (workspaceIds.length === 0) {
    return [];
  }

  const { data, error } = await serviceClient
    .from("organizations")
    .select("id,name,slug")
    .in("id", workspaceIds)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as OrganizationRow[] | null) ?? [];
}

export async function resolveEntityWorkspaceId(
  table: string,
  idColumn: string,
  id: string,
  workspaceColumn = "workspace_id"
) {
  const { url, serviceRoleKey } = getConfig();
  const serviceClient = createClient(url, serviceRoleKey);
  const { data, error } = await serviceClient
    .from(table)
    .select(`${idColumn},${workspaceColumn}`)
    .eq(idColumn, id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const workspaceId = (data as Record<string, string | null> | null)?.[workspaceColumn] ?? null;
  return workspaceId;
}

export function toErrorResponse(err: unknown, fallbackMessage: string) {
  if (err instanceof RouteAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  console.error(err);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
