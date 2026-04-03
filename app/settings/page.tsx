export const dynamic = "force-dynamic";
import type { ReactNode } from "react";
import { BodyText, CardTitle } from "@canopy/ui";
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
      subtitle="Manage your platform preferences and configuration"
    >
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <SettingSection
          title="Automation"
          description="Configure how the pipeline processes stories"
        >
          <SettingRow
            title="Auto-generate content on submission"
            description="Trigger AI content generation when a form is submitted"
          />
          <SettingRow
            title="Create packages automatically"
            description="Bundle content into packages as soon as all assets are ready"
          />
          <StaticField
            label="Processing timeout"
            value="15 minutes — maximum time before marking a story as failed"
          />
        </SettingSection>

        <SettingSection
          title="Notifications"
          description="Choose when and how you receive notifications"
        >
          <SettingRow
            title="Email notifications"
            description="Receive updates about story completion and errors"
          />
          <SettingRow
            title="Package ready notifications"
            description="Alert when content packages are ready for download"
          />
          <StaticField
            label="Notification email"
            value="admin@akkedisdigital.com"
          />
        </SettingSection>

        <SettingSection
          title="Branding"
          description="Customize how your organization appears to clients"
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
