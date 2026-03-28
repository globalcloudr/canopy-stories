import type { ReactNode } from "react";
import { Avatar, AvatarFallback, BodyText, Button, Card, Eyebrow, PageTitle, cn } from "@canopy/ui";
import Link from "next/link";

type NavKey = "home" | "projects" | "forms";

type StoriesShellProps = {
  activeNav: NavKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  headerMeta?: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

const navItems: Array<{ key: NavKey; href: string; label: string }> = [
  { key: "home", href: "/", label: "Overview" },
  { key: "projects", href: "/projects", label: "Projects" },
  { key: "forms", href: "/forms", label: "Forms" },
];

function navClass(active: boolean) {
  return cn(
    "flex items-center gap-2.5 rounded-2xl px-4 py-3 font-outfit text-sm font-medium tracking-[-0.01em] transition",
    active
      ? "bg-white text-[var(--foreground)] shadow-[var(--shadow-control)]"
      : "text-[var(--muted-foreground)] hover:bg-white/70 hover:text-[var(--foreground)]"
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

      <div className="md:grid md:h-[calc(100vh-3.5rem)] md:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--border)] bg-[rgba(255,255,255,0.46)] md:block">
          <div className="flex h-full flex-col p-3">
            <section className="p-2">
              <div className="grid h-14 w-14 place-items-center rounded-[18px] bg-[#0f1f3d] text-xl font-extrabold tracking-[-0.03em] text-white">
                S
              </div>
              <p className="mt-4 font-outfit text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                Canopy Stories
              </p>
              <BodyText muted className="mt-1">Story production workspace</BodyText>
            </section>

            <nav className="mt-4 space-y-1.5">
              <section className="p-1">
                <p className="px-3 pb-2 font-outfit text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Workspace
                </p>
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link key={item.key} href={item.href} className={navClass(activeNav === item.key)}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            </nav>

            <div className="mt-auto p-2">
              <Card padding="sm" className="rounded-[24px]">
                <p className="font-outfit text-sm font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                  Platform contract
                </p>
                <BodyText muted className="mt-2">
                  Canopy owns launch and entitlement state. Stories owns projects, forms, submissions, and delivery.
                </BodyText>
              </Card>
            </div>
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
