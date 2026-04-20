"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AppPageHeader,
  AppSidebarPanel,
  AppSidebarPanelBody,
  AppSidebarSectionLabel,
  AppSurface,
  AppWorkspaceSwitcher,
  BodyText,
  Button,
  CanopyHeader,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Eyebrow,
  PageTitle,
  sidebarNavItemClass,
  cn,
} from "@canopy/ui";
import { supabase } from "@/lib/supabase-client";
import { writeStoredWorkspaceId } from "@/lib/workspace-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrgOption = { id: string; name: string; slug: string };
type LauncherProductKey = "photovault" | "stories_canopy" | "reach_canopy";
type AppSessionPayload = {
  user: { id: string; email: string; displayName: string };
  isPlatformOperator: boolean;
  workspaces: OrgOption[];
  activeWorkspace: OrgOption | null;
};

type NavKey = "home" | "projects" | "stories" | "assets" | "settings" | "help";

type StoriesShellProps = {
  activeNav: NavKey;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  headerMeta?: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://app.usecanopy.school";

async function waitForSessionTokens() {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token && data.session.refresh_token) {
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  return new Promise<{ accessToken: string; refreshToken: string } | null>((resolve) => {
    const timeout = window.setTimeout(() => {
      subscription.unsubscribe();
      resolve(null);
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token && session.refresh_token) {
        window.clearTimeout(timeout);
        subscription.unsubscribe();
        resolve({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        });
      }
    });
  });
}

// ─── Nav items ────────────────────────────────────────────────────────────────

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M7 3.5h7l4 4v13A2.5 2.5 0 0 1 15.5 23h-8A2.5 2.5 0 0 1 5 20.5v-14A2.5 2.5 0 0 1 7.5 4Z" />
      <path d="M14 3.5V8h4.5" />
      <path d="M8.5 12h7M8.5 16h7" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="M5.5 17l4.5-4.5 3.5 3.5 2.5-2.5 2.5 3.5" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 3.5l2.1 1.2 2.4-.2 1.2 2.1 2 1.3-.2 2.4L20.5 12l-1.2 2.1.2 2.4-2.1 1.2-1.3 2-2.4-.2L12 20.5l-2.1 1.2-2.4-.2-1.2-2.1-2-1.3.2-2.4L3.5 12l1.2-2.1-.2-2.4 2.1-1.2 1.3-2 2.4.2Z" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2.2-2.4 4" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

const navItems: Array<{ key: NavKey; href: string; label: string; icon: (p: { className?: string }) => ReactNode }> = [
  { key: "home", href: "/", label: "Dashboard", icon: DashboardIcon },
  { key: "projects", href: "/projects", label: "Projects", icon: FolderIcon },
  { key: "stories", href: "/stories", label: "Stories", icon: FileIcon },
  { key: "assets", href: "/assets", label: "Assets", icon: ImageIcon },
  { key: "settings", href: "/settings", label: "Settings", icon: SettingsIcon },
  { key: "help", href: "/help", label: "Help", icon: HelpIcon },
];

function navClass(active: boolean) {
  return sidebarNavItemClass(active);
}

function withWorkspaceContext(path: string, workspaceSlug?: string | null, isPlatformOperator = false) {
  if (!isPlatformOperator || !workspaceSlug) {
    return path;
  }

  const params = new URLSearchParams({ workspace: workspaceSlug });
  return `${path}?${params.toString()}`;
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export function StoriesShell({
  activeNav,
  eyebrow,
  title,
  subtitle,
  headerMeta,
  headerActions,
  children,
}: StoriesShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // User state
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isPlatformOperator, setIsPlatformOperator] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Org state
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null);
  const [launcherProductKeys, setLauncherProductKeys] = useState<LauncherProductKey[]>([]);
  const [loadingSession, setLoadingSession] = useState(true);
  const [launchingProductKey, setLaunchingProductKey] = useState<LauncherProductKey | null>(null);
  const [returningToPortal, setReturningToPortal] = useState(false);

  const activeOrg = useMemo(() => orgs.find((o) => o.id === activeOrgId) ?? null, [orgs, activeOrgId]);

  const initials = useMemo(() => {
    if (userName.trim()) {
      return userName.split(" ").map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase();
    }
    return (userEmail[0] ?? "U").toUpperCase();
  }, [userName, userEmail]);

  const displayName = userName.trim() || userEmail || "Canopy User";

  // Workspace initials for sidebar lockup
  const orgInitials = activeOrg
    ? activeOrg.name.split(" ").map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase()
    : "W";

  useEffect(() => {
    if (!activeOrgId) {
      setLauncherProductKeys([]);
      return;
    }
    const workspaceId = activeOrgId;

    const controller = new AbortController();

    async function loadLauncherProducts() {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          setLauncherProductKeys([]);
          return;
        }

        const response = await fetch(`/api/launcher-products?workspaceId=${encodeURIComponent(workspaceId)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          setLauncherProductKeys([]);
          return;
        }

        const payload = (await response.json()) as { products?: LauncherProductKey[] };
        setLauncherProductKeys(
          (payload.products ?? []).filter((value): value is LauncherProductKey =>
            value === "photovault" || value === "stories_canopy" || value === "reach_canopy"
          )
        );
      } catch {
        if (!controller.signal.aborted) {
          setLauncherProductKeys([]);
        }
      }
    }

    void loadLauncherProducts();
    return () => controller.abort();
  }, [activeOrgId]);

  // Load session + orgs on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingSession(true);
      try {
        const launchCode = searchParams.get("launch")?.trim();
        if (launchCode) {
          const exchangeResponse = await fetch("/api/auth/exchange-handoff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: launchCode }),
          });

          if (!exchangeResponse.ok) {
            window.location.assign(PORTAL_URL);
            return;
          }

          const exchangePayload = (await exchangeResponse.json()) as {
            accessToken?: string;
            refreshToken?: string;
            workspaceSlug?: string | null;
          };

          if (!exchangePayload.accessToken || !exchangePayload.refreshToken) {
            window.location.assign(PORTAL_URL);
            return;
          }

          await supabase.auth.setSession({
            access_token: exchangePayload.accessToken,
            refresh_token: exchangePayload.refreshToken,
          });

          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.delete("launch");
            if (exchangePayload.workspaceSlug) {
              url.searchParams.set("workspace", exchangePayload.workspaceSlug);
            }
            window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
          }
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          window.location.assign(PORTAL_URL);
          return;
        }

        const requestedWorkspaceSlug = searchParams.get("workspace")?.trim() || "";
        const sessionResponse = await fetch(
          `/api/app-session${requestedWorkspaceSlug ? `?workspace=${encodeURIComponent(requestedWorkspaceSlug)}` : ""}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );

        if (!sessionResponse.ok) {
          window.location.assign(PORTAL_URL);
          return;
        }

        const appSession = (await sessionResponse.json()) as AppSessionPayload;
        if (cancelled) { setLoadingSession(false); return; }

        // Platform operators (super admins) can access multiple workspaces, so we
        // must always have a workspace slug in the URL to ensure server-side queries
        // are correctly scoped. If the slug is missing, redirect to add it.
        // School users only ever have one workspace and are protected by RLS, so
        // we skip the redirect for them to avoid unnecessary redirects.
        if (appSession.isPlatformOperator && !requestedWorkspaceSlug && appSession.activeWorkspace?.slug) {
          const url = new URL(window.location.href);
          url.searchParams.set("workspace", appSession.activeWorkspace.slug);
          window.location.replace(url.toString());
          return;
        }

        setUserEmail(appSession.user.email);
        setUserName(appSession.user.displayName);
        setIsPlatformOperator(appSession.isPlatformOperator);
        setOrgs(appSession.workspaces);
        setActiveOrgIdState(appSession.activeWorkspace?.id ?? null);
        writeStoredWorkspaceId(appSession.activeWorkspace?.id ?? null);
      } catch {
        // session not available — show unauthenticated state
      } finally {
        if (!cancelled) setLoadingSession(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [searchParams]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await supabase.auth.signOut({ scope: "local" });
      window.location.assign(PORTAL_URL);
    } finally {
      setSigningOut(false);
    }
  }

  async function launchProduct(productKey: Exclude<LauncherProductKey, "stories_canopy">) {
    if (launchingProductKey) {
      return;
    }

    setLaunchingProductKey(productKey);
    try {
      const tokens = await waitForSessionTokens();

      if (!tokens) {
        window.location.assign(PORTAL_URL);
        return;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = `${portalBase}/auth/product-launch`;
      form.style.display = "none";

      const fields = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        productKey,
        workspaceSlug: activeOrg?.slug ?? "",
      };

      for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } finally {
      setLaunchingProductKey(null);
    }
  }

  async function returnToPortal() {
    if (returningToPortal) {
      return;
    }

    setReturningToPortal(true);
    try {
      const tokens = await waitForSessionTokens();

      if (!tokens) {
        window.location.assign(PORTAL_URL);
        return;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = `${portalBase}/auth/portal-return`;
      form.style.display = "none";

      const fields = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        workspaceSlug: activeOrg?.slug ?? "",
      };

      for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } finally {
      setReturningToPortal(false);
    }
  }

  const workspaceLabel = activeOrg?.name ?? (loadingSession ? "Loading..." : "Select workspace");
  const workspaceLinks = isPlatformOperator
    ? orgs.map((org) => ({
        id: org.id,
        label: org.name,
        href: `${pathname}?workspace=${encodeURIComponent(org.slug)}`,
        active: org.id === activeOrgId,
      }))
    : [];
  const portalBase = PORTAL_URL.replace(/\/$/, "");
  const portalHomeHref = activeOrg?.slug
    ? `${portalBase}/?workspace=${encodeURIComponent(activeOrg.slug)}`
    : portalBase;
  const launcherItems: Array<{ key: string; label: string; href?: string; current?: boolean; productKey?: Exclude<LauncherProductKey, "stories_canopy">; portal?: boolean }> = [
    { key: "portal", label: "Canopy Portal", portal: true },
    ...(launcherProductKeys.includes("photovault")
      ? [{ key: "photovault", label: "PhotoVault", productKey: "photovault" as const }]
      : []),
    ...(launcherProductKeys.includes("reach_canopy")
      ? [{ key: "reach_canopy", label: "Canopy Reach", productKey: "reach_canopy" as const }]
      : []),
    ...(launcherProductKeys.includes("stories_canopy")
      ? [{ key: "stories_canopy", label: "Canopy Stories", href: withWorkspaceContext("/", activeOrg?.slug, isPlatformOperator), current: true }]
      : []),
  ];

  return (
    <main className="min-h-screen bg-[var(--app-shell-bg)] md:h-screen md:overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <CanopyHeader
        brandHref={portalHomeHref}
        onBrandSelect={() => void returnToPortal()}
        workspaceLabel={workspaceLabel}
        workspaceContextLabel="School"
        workspaceLinks={workspaceLinks}
        isPlatformOperator={isPlatformOperator}
        platformOverviewHref={PORTAL_URL}
        onPlatformOverviewSelect={() => void returnToPortal()}
        userInitials={loadingSession ? "…" : initials}
        displayName={displayName}
        email={userName ? userEmail : null}
        roleLabel={isPlatformOperator ? "operator" : null}
        accountMenuItems={[
          { label: "Portal overview", onSelect: () => void returnToPortal() },
          { label: "Questions / feedback", href: "mailto:info@akkedisdigital.com?subject=Canopy%20Stories%20Feedback" },
        ]}
        onSignOut={() => void signOut()}
        signOutLabel={signingOut ? "Signing out…" : "Sign out"}
      />

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="md:grid md:h-[calc(100vh-3.5rem)] md:grid-cols-[280px_minmax(0,1fr)]">

        {/* Sidebar */}
        <aside className="hidden border-r border-[var(--app-divider)] bg-transparent md:block">
          <div className="flex h-full flex-col">

            {/* Workspace lockup */}
            <AppWorkspaceSwitcher
              leading={
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-soft)] bg-[var(--accent)] text-[1.05rem] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-sm)]">
                  {loadingSession ? "…" : orgInitials}
                </div>
              }
              title={activeOrg?.name ?? (loadingSession ? "Loading…" : "No workspace")}
              subtitle="Canopy Stories"
              menuLabel={activeOrg?.name ?? "Workspace"}
            >
              <DropdownMenuGroup>
                    {launcherItems.map((item) =>
                      item.current ? (
                        <DropdownMenuItem key={item.key} className="font-medium">
                          {item.label}
                          <span className="ml-auto text-[11px] text-[var(--text-muted)]">current</span>
                        </DropdownMenuItem>
                      ) : item.productKey ? (
                        <DropdownMenuItem
                          key={item.key}
                          onSelect={(event) => {
                            event.preventDefault();
                            void launchProduct(item.productKey!);
                          }}
                        >
                          {item.label}
                          {launchingProductKey === item.productKey ? (
                            <span className="ml-auto text-[11px] text-[var(--text-muted)]">opening…</span>
                          ) : null}
                        </DropdownMenuItem>
                      ) : item.portal ? (
                        <DropdownMenuItem
                          key={item.key}
                          onSelect={(event) => {
                            event.preventDefault();
                            void returnToPortal();
                          }}
                        >
                          {item.label}
                          {returningToPortal ? (
                            <span className="ml-auto text-[11px] text-[var(--text-muted)]">opening…</span>
                          ) : null}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem key={item.key} asChild>
                          <a href={item.href}>{item.label}</a>
                        </DropdownMenuItem>
                      )
                    )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  void returnToPortal();
                }}
              >
                Back to portal home
                {returningToPortal ? (
                  <span className="ml-auto text-[11px] text-[var(--text-muted)]">opening…</span>
                ) : null}
              </DropdownMenuItem>
            </AppWorkspaceSwitcher>

            {/* Nav */}
            <AppSidebarPanel>
              <AppSidebarPanelBody>
                <AppSidebarSectionLabel>Navigation</AppSidebarSectionLabel>
                <div className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.key}
                        href={withWorkspaceContext(item.href, activeOrg?.slug, isPlatformOperator)}
                        className={navClass(activeNav === item.key)}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </AppSidebarPanelBody>
            </AppSidebarPanel>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 overflow-y-auto bg-[var(--app-content-bg)]">
          <div className="mx-auto flex min-h-full w-full max-w-[1340px] flex-col gap-6 px-4 py-6 sm:px-6">
            {title ? (
              <AppPageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} meta={headerMeta} actions={headerActions} />
            ) : null}

            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Public form frame (unchanged) ───────────────────────────────────────────

type PublicStoriesFrameProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function PublicStoriesFrame({ eyebrow, title, subtitle, children }: PublicStoriesFrameProps) {
  return (
    <main className="min-h-screen bg-[var(--app-shell-bg)]">
      <div className="border-b border-[var(--border)] bg-white/95">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div
              className="grid h-8 w-8 place-items-center rounded-[7px] bg-[#0f1f3d] text-[0.95rem] font-extrabold tracking-[-0.02em] text-white"
              aria-hidden="true"
            >
              C
            </div>
            <span className="text-[0.95rem] font-bold tracking-[-0.01em] text-[var(--foreground)]">Canopy Stories</span>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-[5px] text-[0.8rem] font-medium text-[var(--foreground)]">
            Public form
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <AppSurface padding="md" variant="clear" className="sm:p-8">
          <Eyebrow className="text-[#2f76dd]">{eyebrow}</Eyebrow>
          <PageTitle className="mt-3 text-[#172033]">{title}</PageTitle>
          <BodyText muted className="mt-3 max-w-3xl text-[#617286] sm:text-[15px]">{subtitle}</BodyText>
        </AppSurface>
        {children}
      </div>
    </main>
  );
}
