import type { ReactNode } from "react";
import { Avatar, AvatarFallback, BodyText, Button, Card, Eyebrow, PageTitle, cn } from "@canopy/ui";
import Link from "next/link";

type NavKey = "home" | "projects" | "stories" | "assets" | "settings";

type IconProps = {
  className?: string;
};

function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function FolderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
    </svg>
  );
}

function FileIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M7 3.5h7l4 4v13A2.5 2.5 0 0 1 15.5 23h-8A2.5 2.5 0 0 1 5 20.5v-14A2.5 2.5 0 0 1 7.5 4Z" />
      <path d="M14 3.5V8h4.5" />
      <path d="M8.5 12h7" />
      <path d="M8.5 16h7" />
    </svg>
  );
}

function ImageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="M5.5 17l4.5-4.5 3.5 3.5 2.5-2.5 2.5 3.5" />
    </svg>
  );
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 3.5l2.1 1.2 2.4-.2 1.2 2.1 2 1.3-.2 2.4L20.5 12l-1.2 2.1.2 2.4-2.1 1.2-1.3 2-2.4-.2L12 20.5l-2.1 1.2-2.4-.2-1.2-2.1-2-1.3.2-2.4L3.5 12l1.2-2.1-.2-2.4 2.1-1.2 1.3-2 2.4.2L12 3.5Z" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

type StoriesShellProps = {
  activeNav: NavKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  headerMeta?: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

const navItems: Array<{ key: NavKey; href: string; label: string; icon: (props: IconProps) => ReactNode }> = [
  { key: "home", href: "/", label: "Dashboard", icon: DashboardIcon },
  { key: "projects", href: "/projects", label: "Projects", icon: FolderIcon },
  { key: "stories", href: "/stories", label: "Stories", icon: FileIcon },
  { key: "assets", href: "/assets", label: "Assets", icon: ImageIcon },
  { key: "settings", href: "/settings", label: "Settings", icon: SettingsIcon },
];

function navClass(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium tracking-[-0.01em] transition",
    active
      ? "bg-[#f1f3f5] text-[var(--foreground)]"
      : "text-[#2d2d2d] hover:bg-[#f7f7f8]"
  );
}

export function StoriesShell({
  activeNav,
  eyebrow,
  title,
  subtitle,
  headerMeta,
  headerActions,
  children,
}: StoriesShellProps) {
  return (
    <main className="min-h-screen bg-[var(--background)] md:h-screen md:overflow-hidden">
      <div className="border-b border-[var(--border)] bg-white/95">
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div
              className="grid h-8 w-8 place-items-center rounded-[7px] bg-[#0f1f3d] text-[0.95rem] font-extrabold tracking-[-0.02em] text-white"
              aria-hidden="true"
            >
              C
            </div>
            <span className="text-[0.95rem] font-bold tracking-[-0.01em] text-[var(--foreground)]">Canopy</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" className="hidden gap-1.5 shadow-none sm:inline-flex">
              <span className="mr-0.5 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                App
              </span>
              Stories
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="md:grid md:h-[calc(100vh-3.5rem)] md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#e5e7eb] bg-white md:block">
          <div className="flex h-full flex-col">
            <section className="flex items-center gap-4 border-b border-[#e5e7eb] px-6 py-7">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#2f76dd] text-[1.05rem] font-semibold tracking-[-0.02em] text-white">
                AS
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#202020]">Adult School Stories</p>
                <p className="mt-0.5 text-[13px] text-[#6b7280]">Akkedis Digital</p>
              </div>
            </section>

            <nav className="px-4 py-8">
              <p className="mb-4 text-[13px] font-medium text-[#70757d]">Navigation</p>
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link key={item.key} href={item.href} className={navClass(activeNav === item.key)}>
                      <Icon className="h-[19px] w-[19px]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        <div className="min-w-0 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
            <Card padding="md" className="sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="min-w-0">
                  <Eyebrow className="text-[#4f46e5]">{eyebrow}</Eyebrow>
                  <PageTitle className="mt-3">{title}</PageTitle>
                  <BodyText muted className="mt-3 max-w-3xl sm:text-[15px]">{subtitle}</BodyText>
                </div>
                {headerActions ? <div className="flex flex-wrap gap-3">{headerActions}</div> : null}
              </div>
              {headerMeta ? (
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)]">
                  <span>{headerMeta}</span>
                </div>
              ) : null}
            </Card>

            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

type PublicStoriesFrameProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function PublicStoriesFrame({ eyebrow, title, subtitle, children }: PublicStoriesFrameProps) {
  return (
    <main className="min-h-screen bg-[var(--background)]">
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
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-[5px] font-outfit text-[0.8rem] font-medium text-[var(--foreground)]">
            Public form
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <Card padding="md" className="sm:p-8">
          <Eyebrow className="text-[#4f46e5]">{eyebrow}</Eyebrow>
          <PageTitle className="mt-3">{title}</PageTitle>
          <BodyText muted className="mt-3 max-w-3xl sm:text-[15px]">{subtitle}</BodyText>
        </Card>
        {children}
      </div>
    </main>
  );
}
