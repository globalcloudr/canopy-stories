// Email notifications via Resend.
// Requires RESEND_API_KEY in environment and a verified sender domain.
// Falls back silently if not configured — email is non-blocking.

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_ADDRESS = process.env.STORIES_EMAIL_FROM ?? "Canopy Stories <notifications@usecanopy.school>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://canopy-stories.vercel.app";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

async function sendEmail(input: SendEmailInput): Promise<void> {
  if (!RESEND_API_KEY) return; // not configured — skip silently

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    // Log but don't throw — email failure should never block the automation flow
    console.error(`[stories-email] Resend error ${res.status}: ${text}`);
  }
}

export async function sendPackageReadyEmail({
  to,
  subjectName,
  storyTitle,
  storyId,
  workspaceName,
}: {
  to: string;
  subjectName: string | null;
  storyTitle: string;
  storyId: string;
  workspaceName: string;
}): Promise<void> {
  const displayName = subjectName || "a subject";
  const storyUrl = `${APP_URL}/stories/${storyId}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 32px 16px;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background: #1e40af; padding: 28px 32px;">
      <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">Canopy Stories</p>
      <h1 style="margin: 8px 0 0; color: white; font-size: 22px; font-weight: 700;">Package ready</h1>
    </div>
    <div style="padding: 28px 32px;">
      <p style="margin: 0 0 20px; color: #374151; font-size: 15px; line-height: 1.6;">
        The story package for <strong>${displayName}</strong> from <strong>${workspaceName}</strong> is ready to review and download.
      </p>
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">Story</p>
      <p style="margin: 0 0 24px; color: #111827; font-size: 15px; font-weight: 600;">${storyTitle}</p>
      <p style="margin: 0 0 24px; color: #374151; font-size: 14px; line-height: 1.6;">
        Your blog post, social captions, newsletter feature, press release, and media assets are all included.
      </p>
      <a href="${storyUrl}" style="display: inline-block; background: #1e40af; color: white; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600;">
        Open story package →
      </a>
    </div>
    <div style="padding: 20px 32px; border-top: 1px solid #f3f4f6;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        You're receiving this because your workspace has package notifications enabled.
        Manage this in your <a href="${APP_URL}/settings" style="color: #6b7280;">Settings</a>.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  await sendEmail({
    to,
    subject: `Package ready: ${storyTitle}`,
    html,
  });
}
