"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AppSurface,
  BodyText,
  Button,
  CanopyHeader,
  Eyebrow,
  PageTitle,
  cn,
} from "@canopy/ui";
import { supabase } from "@/lib/supabase-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrgOption = { id: string; name: string; slug: string };

type NavKey = "home" | "projects" | "stories" | "assets" | "settings" | "help";

type StoriesShellProps = {
  activeNav: NavKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  headerMeta?: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVE_ORG_KEY = "cs_active_org_id_v1";
const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://usecanopy.school";

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
  return cn(
    "flex items-center gap-2.5 rounded-2xl px-3.5 py-3 font-medium text-[15px] tracking-[-0.01em] transition",
    active
      ? "bg-white/82 text-[#172033] shadow-[0_10px_24px_rgba(35,74,144,0.08)]"
      : "text-[#506176] hover:bg-white/48 hover:text-[#172033]"
  );
}

// ─── Org localStorage helpers ─────────────────────────────────────────────────

function readStoredOrgId() {
  try { return window.localStorage.getItem(ACTIVE_ORG_KEY); } catch { return null; }
}
function writeStoredOrgId(id: string) {
  try { window.localStorage.setItem(ACTIVE_ORG_KEY, id); } catch { /* */ }
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
  const [loadingSession, setLoadingSession] = useState(true);

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

  function setActiveOrgId(id: string) {
    setActiveOrgIdState(id);
    writeStoredOrgId(id);
  }

  // Load session + orgs on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingSession(true);
      try {
        // Handle token handoff from portal (tokens passed in URL hash)
        if (typeof window !== "undefined") {
          const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
          if (hash) {
            const params = new URLSearchParams(hash);
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");
            if (accessToken && refreshToken) {
              await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
              window.history.replaceState({}, "", window.location.pathname + window.location.search);
            }
          }
        }

        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user || cancelled) { setLoadingSession(false); return; }

        setUserEmail(user.email ?? "");
        const full =
          (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
          (typeof user.user_metadata?.name === "string" && user.user_metadata.name) || "";
        setUserName(full);

        // Check platform role
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_super_admin,platform_role")
          .eq("user_id", user.id)
          .single() as { data: { is_super_admin?: boolean; platform_role?: string } | null };

        const isOperator =
          profileData?.is_super_admin === true ||
          profileData?.platform_role === "super_admin" ||
          profileData?.platform_role === "platform_staff";

        if (!cancelled) setIsPlatformOperator(isOperator);

        // Load workspaces
        let loadedOrgs: OrgOption[] = [];
        if (isOperator) {
          const { data } = await supabase
            .from("organizations")
            .select("id,name,slug")
            .order("name", { ascending: true });
          loadedOrgs = (data ?? []) as OrgOption[];
        } else {
          const { data: memberships } = await supabase
            .from("memberships")
            .select("org_id")
            .eq("user_id", user.id) as { data: { org_id: string }[] | null };
          const ids = [...new Set((memberships ?? []).map((m) => m.org_id).filter(Boolean))] as string[];
          if (ids.length > 0) {
            const { data } = await supabase
              .from("organizations")
              .select("id,name,slug")
              .in("id", ids)
              .order("name", { ascending: true });
            loadedOrgs = (data ?? []) as OrgOption[];
          }
        }

        if (cancelled) return;
        setOrgs(loadedOrgs);

        // Resolve active org: URL param > localStorage > first org
        const slugParam = searchParams.get("workspace");
        const fromUrl = slugParam ? loadedOrgs.find((o) => o.slug === slugParam)?.id ?? null : null;
        const stored = readStoredOrgId();
        const hasStored = stored && loadedOrgs.some((o) => o.id === stored);
        const resolved = fromUrl ?? (hasStored ? stored! : loadedOrgs[0]?.id ?? null);
        setActiveOrgIdState(resolved);
        if (resolved) writeStoredOrgId(resolved);
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

  const workspaceLabel = activeOrg?.name ?? (loadingSession ? "Loading..." : "Select workspace");
  const workspaceLinks = isPlatformOperator
    ? orgs.map((org) => ({
        id: org.id,
        label: org.name,
        onSelect: () => setActiveOrgId(org.id),
        active: org.id === activeOrgId,
      }))
    : [];

  return (
    <main className="min-h-screen bg-[var(--app-shell-bg)] md:h-screen md:overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <CanopyHeader
        brandHref={PORTAL_URL}
        workspaceLabel={workspaceLabel}
        workspaceLinks={workspaceLinks}
        isPlatformOperator={isPlatformOperator}
        platformOverviewHref={PORTAL_URL}
        userInitials={loadingSession ? "…" : initials}
        displayName={displayName}
        email={userName ? userEmail : null}
        roleLabel={isPlatformOperator ? "operator" : null}
        accountMenuItems={[
          { label: "Portal overview", href: PORTAL_URL },
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
            <section className="mx-4 mt-4 flex items-center gap-4 rounded-[28px] bg-transparent px-6 py-6 shadow-none">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#2f76dd_0%,#5c96ea_100%)] text-[1.05rem] font-semibold tracking-[-0.02em] text-white shadow-[0_10px_24px_rgba(47,118,221,0.28)]">
                {loadingSession ? "…" : orgInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#202020]">
                  {activeOrg?.name ?? (loadingSession ? "Loading…" : "No workspace")}
                </p>
                <p className="mt-0.5 text-[13px] text-[#6f7e90]">Canopy Stories</p>
              </div>
            </section>

            {/* Nav */}
            <nav className="px-4 py-6">
              <div className="rounded-[28px] bg-transparent px-4 py-4 shadow-none">
                <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8ea0b7]">Navigation</p>
                <div className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.key} href={item.href} className={navClass(activeNav === item.key)}>
                        <Icon className="h-[18px] w-[18px]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 overflow-y-auto bg-[var(--app-content-bg)]">
          <div className="mx-auto flex min-h-full w-full max-w-[1340px] flex-col gap-6 px-4 py-6 sm:px-6">
            <AppSurface padding="md" variant="clear" className="sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="min-w-0">
                  <Eyebrow className="text-[#4f46e5]">{eyebrow}</Eyebrow>
                  <PageTitle className="mt-3 text-[#172033]">{title}</PageTitle>
                  <BodyText muted className="mt-3 max-w-3xl text-[#617286] sm:text-[15px]">{subtitle}</BodyText>
                </div>
                {headerActions ? <div className="flex flex-wrap gap-3">{headerActions}</div> : null}
              </div>
              {headerMeta ? (
                <div className="mt-5 text-sm text-[#7a8798]">{headerMeta}</div>
              ) : null}
            </AppSurface>

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
          <Eyebrow className="text-[#4f46e5]">{eyebrow}</Eyebrow>
          <PageTitle className="mt-3 text-[#172033]">{title}</PageTitle>
          <BodyText muted className="mt-3 max-w-3xl text-[#617286] sm:text-[15px]">{subtitle}</BodyText>
        </AppSurface>
        {children}
      </div>
    </main>
  );
}
