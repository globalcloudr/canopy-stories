import { NextResponse } from "next/server";
import { getRequestAccess, resolveAccessibleOrganizations, toErrorResponse } from "@/lib/server-auth";
import { getStoriesEnabledWorkspaceIds } from "@/lib/stories-entitlements";

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
