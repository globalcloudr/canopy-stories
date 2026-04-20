export const dynamic = "force-dynamic";
import type { ReactNode } from "react";
import { BodyText, CardTitle } from "@globalcloudr/canopy-ui";
import { StoriesShell } from "@/app/_components/stories-shell";
import { ApiKeysSection } from "@/app/settings/api-keys-section";

function SettingRow({
  title,
  description,
  trailing = (
    <div className="flex h-7 w-11 items-center rounded-full bg-[#2f76dd] px-1">
      <div className="ml-auto h-5 w-5 rounded-full bg-white shadow-sm" />
    </div>
  ),
}: {
  title: string;
  description: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <BodyText muted className="mt-1 text-[13px]">{description}</BodyText>
      </div>
      <div className="shrink-0">{trailing}</div>
    </div>
  );
}

function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-8 border-b border-[#dfe7f4] pb-8 md:grid-cols-[200px_1fr]">
      <div className="pt-4">
        <h2 className="text-[0.95rem] font-semibold text-[var(--foreground)]">{title}</h2>
        <BodyText muted className="mt-1 text-[13px] leading-relaxed">{description}</BodyText>
      </div>
      <div className="rounded-[24px] border border-[#dfe7f4] bg-transparent shadow-none divide-y divide-[var(--border)] px-5">{children}</div>
    </div>
  );
}

function StaticField({ label, value, trailing }: { label: string; value: string; trailing?: ReactNode }) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <CardTitle className="text-base">{label}</CardTitle>
          <BodyText muted className="mt-1 text-[13px]">{value}</BodyText>
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <StoriesShell
      activeNav="settings"
      eyebrow="Settings"
      title="Settings"
      subtitle="Manage your team setup, alerts, and story workflow"
    >
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <SettingSection
          title="Story workflow"
          description="Choose how Canopy Stories handles drafts, graphics, and delivery"
        >
          <SettingRow
            title="Start drafts automatically"
            description="Begin drafting content as soon as someone submits a form"
          />
          <SettingRow
            title="Build ready-to-publish packages automatically"
            description="Prepare the full download package as soon as graphics and video are ready"
          />
          <StaticField
            label="Processing window"
            value="Up to 15 minutes before a story is marked for follow-up"
          />
        </SettingSection>

        <SettingSection
          title="Notifications"
          description="Choose which updates your team receives"
        >
          <SettingRow
            title="Email notifications"
            description="Receive updates about story completion and errors"
          />
          <SettingRow
            title="Ready-to-publish package alerts"
            description="Send an email when a story is ready for review and download"
          />
          <StaticField
            label="Notification email"
            value="admin@akkedisdigital.com"
          />
        </SettingSection>

        <SettingSection
          title="Branding"
          description="Customize how your school appears in story materials"
        >
          <StaticField label="Organization name" value="Akkedis Digital" />
          <StaticField
            label="Primary brand color"
            value="#2563eb"
            trailing={<div className="h-6 w-6 rounded-md border border-[var(--border)] bg-[#2563eb]" />}
          />
          <StaticField label="Logo URL" value="https://example.com/logo.png" />
        </SettingSection>

        <div className="grid gap-8 border-b border-[#dfe7f4] pb-8 md:grid-cols-[200px_1fr]">
          <div className="pt-4">
            <h2 className="text-[0.95rem] font-semibold text-[var(--foreground)]">API Keys</h2>
            <BodyText muted className="mt-1 text-[13px] leading-relaxed">
              Add your own keys for content generation and video creation. Keys are encrypted and only used within your workspace.
            </BodyText>
          </div>
          <div className="rounded-[24px] border border-[#dfe7f4] bg-transparent shadow-none p-5">
            <ApiKeysSection />
          </div>
        </div>
      </div>
    </StoriesShell>
  );
}
