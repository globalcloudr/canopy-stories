"use client";

import { useState, useEffect } from "react";
import { BodyText, Button, CardTitle, Input } from "@canopy/ui";
import { apiFetch } from "@/lib/api-client";
import { useStoriesWorkspaceId } from "@/lib/workspace-client";

type KeyStatus = {
  hasOpenaiKey: boolean;
  hasVideoKey: boolean;
  videoApiProvider: string;
  videoTemplateId: string | null;
  imageTemplateId: string | null;
  notificationEmail: string | null;
};

function MaskedKeyField({
  label,
  description,
  isSet,
  value,
  onChange,
  placeholder,
  onSubmit,
  onRemove,
  saving = false,
  removing = false,
  feedback,
}: {
  label: string;
  description: string;
  isSet: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onSubmit: (value: string) => Promise<boolean>;
  onRemove: () => void;
  saving?: boolean;
  removing?: boolean;
  feedback?: { type: "success" | "error"; text: string } | null;
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
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium ${isSet ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#d7e3f3] bg-[#edf3fb] text-[var(--text-muted)]"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isSet ? "bg-emerald-500" : "bg-slate-400"}`} />
                {isSet ? "Key saved" : "Not configured"}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 pt-1">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onChange("");
                      setEditing(false);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      const saved = await onSubmit(value);
                      if (saved) {
                        setEditing(false);
                      }
                    }}
                    disabled={saving || value.trim().length === 0}
                  >
                    {saving ? "Saving…" : "Save key"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  {isSet ? "Replace" : "Add key"}
                </Button>
              )}
              {isSet && !editing ? (
                <Button variant="secondary" size="sm" onClick={onRemove} disabled={removing}>
                  {removing ? "Removing…" : "Remove"}
                </Button>
              ) : null}
            </div>
            {feedback ? (
              <BodyText className={`text-[12px] ${feedback.type === "success" ? "text-emerald-700" : "text-rose-600"}`}>
                {feedback.text}
              </BodyText>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApiKeysSection() {
  const workspaceId = useStoriesWorkspaceId();
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [openaiKey, setOpenaiKey] = useState("");
  const [videoKey, setVideoKey] = useState("");
  const [videoProvider, setVideoProvider] = useState("creatomate");
  const [videoTemplateId, setVideoTemplateId] = useState("");
  const [imageTemplateId, setImageTemplateId] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [savingKey, setSavingKey] = useState<"openai" | "video" | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [removingKey, setRemovingKey] = useState<"openai" | "video" | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [templateMessage, setTemplateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [keyFeedback, setKeyFeedback] = useState<
    Partial<Record<"openai" | "video", { type: "success" | "error"; text: string } | null>>
  >({});

  useEffect(() => {
    if (!workspaceId) {
      setStatus(null);
      return;
    }

    apiFetch(`/api/settings/api-keys?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        const s = data as KeyStatus;
        setStatus(s);
        setVideoProvider(s.videoApiProvider ?? "creatomate");
        setVideoTemplateId(s.videoTemplateId ?? "");
        setImageTemplateId(s.imageTemplateId ?? "");
        setNotificationEmail(s.notificationEmail ?? "");
      })
      .catch(() => {});
  }, [workspaceId]);

  async function handleSaveTemplates() {
    if (!workspaceId) return;
    setSavingTemplates(true);
    setTemplateMessage(null);
    try {
      const res = await apiFetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          videoApiProvider: videoProvider,
          videoTemplateId: videoTemplateId.trim() || null,
          imageTemplateId: imageTemplateId.trim() || null,
        }),
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Save failed.");
      setStatus((prev) => prev ? {
        ...prev,
        videoApiProvider: videoProvider,
        videoTemplateId: videoTemplateId.trim() || null,
        imageTemplateId: imageTemplateId.trim() || null,
      } : prev);
      setTemplateMessage({ type: "success", text: "Video settings saved." });
    } catch (err) {
      setTemplateMessage({ type: "error", text: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setSavingTemplates(false);
    }
  }

  async function handleSaveNotificationEmail() {
    if (!workspaceId) return;
    const hasEmailChange = notificationEmail.trim() !== (status?.notificationEmail ?? "");
    if (!hasEmailChange) return;

    setSavingEmail(true);
    setSaveMessage(null);
    try {
      const body: Record<string, string> = { workspaceId };
      body.notificationEmail = notificationEmail.trim();

      const res = await apiFetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Save failed.");

      setStatus((prev) => ({
        hasOpenaiKey: prev?.hasOpenaiKey ?? false,
        hasVideoKey: prev?.hasVideoKey ?? false,
        videoApiProvider: prev?.videoApiProvider ?? "creatomate",
        videoTemplateId: prev?.videoTemplateId ?? null,
        imageTemplateId: prev?.imageTemplateId ?? null,
        notificationEmail: notificationEmail.trim() || null,
      }));
      setSaveMessage({ type: "success", text: "Notification email saved." });
    } catch (err) {
      setSaveMessage({ type: "error", text: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleSaveKey(target: "openai" | "video", rawValue: string) {
    if (!workspaceId) return false;

    const value = rawValue.trim();
    if (!value) return false;

    setSavingKey(target);
    setSaveMessage(null);
    setKeyFeedback((prev) => ({ ...prev, [target]: null }));
    try {
      const body: {
        workspaceId: string;
        openaiApiKey?: string;
        videoApiKey?: string;
      } = { workspaceId };

      if (target === "openai") {
        body.openaiApiKey = value;
      } else {
        body.videoApiKey = value;
      }

      const res = await apiFetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Save failed.");

      setStatus((prev) => ({
        hasOpenaiKey: target === "openai" ? true : (prev?.hasOpenaiKey ?? false),
        hasVideoKey: target === "video" ? true : (prev?.hasVideoKey ?? false),
        videoApiProvider: prev?.videoApiProvider ?? "creatomate",
        videoTemplateId: prev?.videoTemplateId ?? null,
        imageTemplateId: prev?.imageTemplateId ?? null,
        notificationEmail: prev?.notificationEmail ?? null,
      }));
      if (target === "openai") {
        setOpenaiKey("");
      } else {
        setVideoKey("");
      }
      setSaveMessage({ type: "success", text: `${target === "openai" ? "OpenAI" : "Video"} API key saved.` });
      setKeyFeedback((prev) => ({
        ...prev,
        [target]: { type: "success", text: "Saved just now." },
      }));
      return true;
    } catch (err) {
      const text = err instanceof Error ? err.message : "Save failed.";
      setSaveMessage({ type: "error", text });
      setKeyFeedback((prev) => ({
        ...prev,
        [target]: { type: "error", text },
      }));
      return false;
    } finally {
      setSavingKey(null);
    }
  }

  async function handleRemoveKey(target: "openai" | "video") {
    if (!workspaceId) return;

    setRemovingKey(target);
    setSaveMessage(null);
    setKeyFeedback((prev) => ({ ...prev, [target]: null }));
    try {
      const body: {
        workspaceId: string;
        openaiApiKey?: null;
        videoApiKey?: null;
      } = { workspaceId };

      if (target === "openai") {
        body.openaiApiKey = null;
      } else {
        body.videoApiKey = null;
      }

      const res = await apiFetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Remove failed.");

      setStatus((prev) => ({
        hasOpenaiKey: target === "openai" ? false : (prev?.hasOpenaiKey ?? false),
        hasVideoKey: target === "video" ? false : (prev?.hasVideoKey ?? false),
        videoApiProvider: prev?.videoApiProvider ?? "creatomate",
        videoTemplateId: prev?.videoTemplateId ?? null,
        imageTemplateId: prev?.imageTemplateId ?? null,
        notificationEmail: prev?.notificationEmail ?? null,
      }));
      if (target === "openai") {
        setOpenaiKey("");
      } else {
        setVideoKey("");
      }
      setSaveMessage({ type: "success", text: `${target === "openai" ? "OpenAI" : "Video"} API key removed.` });
      setKeyFeedback((prev) => ({
        ...prev,
        [target]: { type: "success", text: "Removed." },
      }));
    } catch (err) {
      const text = err instanceof Error ? err.message : "Remove failed.";
      setSaveMessage({ type: "error", text });
      setKeyFeedback((prev) => ({
        ...prev,
        [target]: { type: "error", text },
      }));
    } finally {
      setRemovingKey(null);
    }
  }

  const hasEmailChanges = notificationEmail.trim() !== (status?.notificationEmail ?? "");

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
        onSubmit={(value) => handleSaveKey("openai", value)}
        onRemove={() => void handleRemoveKey("openai")}
        saving={savingKey === "openai"}
        removing={removingKey === "openai"}
        feedback={keyFeedback.openai ?? null}
      />
      <MaskedKeyField
        label="Video generation API key"
        description="Used to create short-form video assets for each story. Supports JSON2Video and Creatomate."
        isSet={status?.hasVideoKey ?? false}
        value={videoKey}
        onChange={setVideoKey}
        placeholder="Your video API key"
        onSubmit={(value) => handleSaveKey("video", value)}
        onRemove={() => void handleRemoveKey("video")}
        saving={savingKey === "video"}
        removing={removingKey === "video"}
        feedback={keyFeedback.video ?? null}
      />

      <div className="py-4">
        <CardTitle className="text-base">Video provider settings</CardTitle>
        <BodyText muted className="mt-1 text-[13px]">
          Configure your Creatomate templates. Create templates in your Creatomate dashboard, then paste the template IDs here.
        </BodyText>
        <div className="mt-3 space-y-3">
          <div>
            <BodyText className="mb-1 text-[13px] font-medium">Provider</BodyText>
            <select
              value={videoProvider}
              onChange={(e) => setVideoProvider(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-[13px] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="creatomate">Creatomate</option>
              <option value="json2video">JSON2Video (legacy)</option>
            </select>
          </div>
          <div>
            <BodyText className="mb-1 text-[13px] font-medium">Video template ID</BodyText>
            <BodyText muted className="mb-1.5 text-[12px]">
              15-second vertical story video (9:16). Variables: Name, Highlight 1, Highlight 2, Highlight 3, Photo.
            </BodyText>
            <Input
              type="text"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={videoTemplateId}
              onChange={(e) => setVideoTemplateId(e.target.value)}
              className="max-w-sm font-mono text-[13px]"
            />
          </div>
          <div>
            <BodyText className="mb-1 text-[13px] font-medium">Highlight card template ID</BodyText>
            <BodyText muted className="mb-1.5 text-[12px]">
              1:1 social share card. Variables: Name, Quote, Photo.
            </BodyText>
            <Input
              type="text"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={imageTemplateId}
              onChange={(e) => setImageTemplateId(e.target.value)}
              className="max-w-sm font-mono text-[13px]"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={handleSaveTemplates} disabled={savingTemplates}>
            {savingTemplates ? "Saving…" : "Save video settings"}
          </Button>
          {templateMessage ? (
            <BodyText className={`text-[12px] ${templateMessage.type === "success" ? "text-emerald-700" : "text-rose-600"}`}>
              {templateMessage.text}
            </BodyText>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-4">
        {saveMessage ? (
          <BodyText className={`text-[13px] ${saveMessage.type === "success" ? "text-emerald-700" : "text-rose-600"}`}>
            {saveMessage.text}
          </BodyText>
        ) : (
          <BodyText muted className="text-[13px]">
            API keys save from each row immediately. Notification email changes save here.
          </BodyText>
        )}
        <Button variant="primary" size="sm" onClick={handleSaveNotificationEmail} disabled={savingEmail || !hasEmailChanges}>
          {savingEmail ? "Saving…" : "Save email"}
        </Button>
      </div>
    </div>
  );
}
