"use client";

import { useState, useEffect } from "react";
import { BodyText, Button, CardTitle, Input } from "@canopy/ui";

type KeyStatus = {
  hasOpenaiKey: boolean;
  hasVideoKey: boolean;
  videoApiProvider: string;
  notificationEmail: string | null;
};

const ACTIVE_ORG_KEY = "cs_active_org_id_v1";

function MaskedKeyField({
  label,
  description,
  isSet,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  description: string;
  isSet: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base">{label}</CardTitle>
          <BodyText muted className="mt-1 text-[13px]">{description}</BodyText>
          <div className="mt-3">
            {editing ? (
              <Input
                type="password"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoFocus
                className="font-mono text-[13px]"
              />
            ) : (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium ${isSet ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isSet ? "bg-emerald-500" : "bg-slate-400"}`} />
                {isSet ? "Key saved" : "Not configured"}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (editing) onChange("");
              setEditing(!editing);
            }}
          >
            {editing ? "Cancel" : isSet ? "Replace" : "Add key"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ApiKeysSection() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [openaiKey, setOpenaiKey] = useState("");
  const [videoKey, setVideoKey] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    try {
      const id = window.localStorage.getItem(ACTIVE_ORG_KEY);
      setWorkspaceId(id);
    } catch { /* */ }
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/settings/api-keys?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        const s = data as KeyStatus;
        setStatus(s);
        if (s.notificationEmail) setNotificationEmail(s.notificationEmail);
      })
      .catch(() => {});
  }, [workspaceId]);

  async function handleSave() {
    if (!workspaceId) return;
    const hasKeyChange = openaiKey.trim() || videoKey.trim();
    const hasEmailChange = notificationEmail.trim() !== (status?.notificationEmail ?? "");
    if (!hasKeyChange && !hasEmailChange) return;

    setSaving(true);
    setSaveMessage(null);
    try {
      const body: Record<string, string> = { workspaceId };
      if (openaiKey.trim()) body.openaiApiKey = openaiKey.trim();
      if (videoKey.trim()) body.videoApiKey = videoKey.trim();
      body.notificationEmail = notificationEmail.trim();

      const res = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Save failed.");

      setStatus((prev) => ({
        hasOpenaiKey: openaiKey.trim() ? true : (prev?.hasOpenaiKey ?? false),
        hasVideoKey: videoKey.trim() ? true : (prev?.hasVideoKey ?? false),
        videoApiProvider: prev?.videoApiProvider ?? "json2video",
        notificationEmail: notificationEmail.trim() || null,
      }));
      setOpenaiKey("");
      setVideoKey("");
      setSaveMessage({ type: "success", text: "Settings saved." });
    } catch (err) {
      setSaveMessage({ type: "error", text: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  const hasChanges =
    openaiKey.trim().length > 0 ||
    videoKey.trim().length > 0 ||
    notificationEmail.trim() !== (status?.notificationEmail ?? "");

  return (
    <div className="divide-y divide-[var(--border)]">
      <div className="py-4">
        <CardTitle className="text-base">Package ready notifications</CardTitle>
        <BodyText muted className="mt-1 text-[13px]">
          Where to send an email when a story package is ready to review and download.
        </BodyText>
        <div className="mt-3">
          <Input
            type="email"
            placeholder="you@school.org"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <MaskedKeyField
        label="OpenAI API key"
        description="Used to generate blog posts, social captions, press releases, and newsletter content."
        isSet={status?.hasOpenaiKey ?? false}
        value={openaiKey}
        onChange={setOpenaiKey}
        placeholder="sk-..."
      />
      <MaskedKeyField
        label="Video generation API key"
        description="Used to create short-form video assets for each story. Supports JSON2Video and Creatomate."
        isSet={status?.hasVideoKey ?? false}
        value={videoKey}
        onChange={setVideoKey}
        placeholder="Your video API key"
      />

      <div className="flex items-center justify-between gap-4 py-4">
        {saveMessage ? (
          <BodyText className={`text-[13px] ${saveMessage.type === "success" ? "text-emerald-700" : "text-rose-600"}`}>
            {saveMessage.text}
          </BodyText>
        ) : (
          <BodyText muted className="text-[13px]">
            API keys are encrypted and never exposed outside your workspace.
          </BodyText>
        )}
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
