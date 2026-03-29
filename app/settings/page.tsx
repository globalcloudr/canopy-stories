export const dynamic = "force-dynamic";
import type { ReactNode } from "react";
import { BodyText, Button, Card, CardTitle, Eyebrow, PageTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";

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
        <BodyText muted className="mt-2">{description}</BodyText>
      </div>
      <div className="shrink-0">{trailing}</div>
    </div>
  );
}

function SettingCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card padding="md" className="sm:p-7">
      <Eyebrow className="text-[#4f46e5]">{eyebrow}</Eyebrow>
      <PageTitle className="mt-3 text-[2rem]">{title}</PageTitle>
      <BodyText muted className="mt-3">{description}</BodyText>
      <div className="mt-5 divide-y divide-[var(--border)]">{children}</div>
    </Card>
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
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <SettingCard
          eyebrow="Automation"
          title="Automation Settings"
          description="Configure how the automation pipeline processes stories"
        >
          <SettingRow
            title="Auto-generate content on submission"
            description="Automatically trigger AI content generation when forms are submitted"
          />
          <SettingRow
            title="Create packages automatically"
            description="Bundle content into packages as soon as all assets are ready"
          />
          <div className="py-4">
            <CardTitle className="text-base">Processing timeout (minutes)</CardTitle>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[15px]">15</div>
            <BodyText muted className="mt-3">Maximum time to wait before marking a story as failed</BodyText>
          </div>
        </SettingCard>

        <SettingCard
          eyebrow="Notifications"
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
          <div className="py-4">
            <CardTitle className="text-base">Notification email</CardTitle>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[15px]">
              admin@akkedisdigital.com
            </div>
          </div>
        </SettingCard>

        <SettingCard
          eyebrow="Branding"
          title="Branding"
          description="Customize how your organization appears to clients"
        >
          <div className="py-4">
            <CardTitle className="text-base">Organization name</CardTitle>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[15px]">
              Akkedis Digital
            </div>
          </div>
          <div className="py-4">
            <CardTitle className="text-base">Primary brand color</CardTitle>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-md border border-[var(--border)] bg-[#2563eb]" />
              <div className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[15px]">#2563eb</div>
            </div>
          </div>
          <div className="py-4">
            <CardTitle className="text-base">Logo URL</CardTitle>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[15px]">
              https://example.com/logo.png
            </div>
          </div>
        </SettingCard>

        <SettingCard
          eyebrow="API Keys"
          title="API Keys"
          description="Manage integrations and API access"
        >
          <div className="py-4">
            <CardTitle className="text-base">OpenAI API</CardTitle>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 font-mono text-[14px]">
                Connected via Stories automation
              </div>
              <Button variant="secondary" size="sm">
                Configure
              </Button>
            </div>
            <BodyText muted className="mt-3">Content generation will use the configured OpenAI key when the automation pipeline is restored.</BodyText>
          </div>
          <div className="py-4">
            <CardTitle className="text-base">Video Generation API</CardTitle>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 font-mono text-[14px]">
                Not configured
              </div>
              <Button variant="secondary" size="sm">
                Setup Guide
              </Button>
            </div>
            <BodyText muted className="mt-3">Add a provider key for JSON2Video or Creatomate when the video pipeline is restored.</BodyText>
          </div>
        </SettingCard>

        <div className="flex justify-end gap-3">
          <Button variant="secondary">Reset to Defaults</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </div>
    </StoriesShell>
  );
}
