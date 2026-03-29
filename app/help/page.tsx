import Link from "next/link";
import { BodyText, Button, Card, CardTitle } from "@canopy/ui";
import { StoriesShell } from "@/app/_components/stories-shell";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-[1.4rem] font-bold tracking-[-0.02em] text-[var(--foreground)]">{title}</h2>
      {children}
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1e40af] text-[13px] font-bold text-white">
        {number}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="font-semibold text-[var(--foreground)]">{title}</p>
        <BodyText muted className="mt-1 text-[14px]">{description}</BodyText>
      </div>
    </div>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="py-4">
      <p className="font-semibold text-[var(--foreground)]">{question}</p>
      <BodyText muted className="mt-1.5 text-[14px]">{answer}</BodyText>
    </div>
  );
}

export default function HelpPage() {
  return (
    <StoriesShell
      activeNav="help"
      eyebrow="Help"
      title="User guide"
      subtitle="How Canopy Stories works and how to get the most out of it"
    >
      <div className="mx-auto max-w-3xl space-y-10">

        {/* How it works */}
        <Section title="How Canopy Stories works">
          <Card padding="md" className="sm:p-8">
            <BodyText className="mb-6 text-[15px]">
              Canopy Stories automates the production of success stories — from collecting submissions to
              delivering a ready-to-publish package of blog posts, social captions, press releases, and
              graphics. Each story moves through six stages automatically.
            </BodyText>
            <div className="space-y-5">
              <Step number={1} title="Form sent" description="You create an intake form and share the link with your subject — a student, graduate, employer, or partner. The form collects their story in their own words." />
              <Step number={2} title="Response received" description="When the form is submitted, Canopy Stories creates a story record and queues it for production. You can track all submissions in the Submissions view." />
              <Step number={3} title="Writing content" description="The AI writer drafts a blog post, social captions, a newsletter feature, and a press release based on the submission. This usually takes under a minute." />
              <Step number={4} title="Creating graphics" description="Branded graphic assets and short-form video clips are generated for social media and your website." />
              <Step number={5} title="Packaging" description="All content and assets are bundled into a delivery package with download links." />
              <Step number={6} title="Delivered" description="The package is ready. Your team receives an email notification and can review, approve, and download everything from the story detail page." />
            </div>
          </Card>
        </Section>

        {/* Getting started */}
        <Section title="Getting started">
          <Card padding="md" className="sm:p-8">
            <div className="space-y-6">
              <div>
                <CardTitle className="text-base">1. Add your API keys</CardTitle>
                <BodyText muted className="mt-2 text-[14px]">
                  Go to <Link href="/settings" className="underline underline-offset-2">Settings</Link> and add
                  your OpenAI API key and video generation API key. These power the content and graphics
                  production pipeline. You can also set a notification email so your team is alerted when
                  each package is ready.
                </BodyText>
              </div>
              <div>
                <CardTitle className="text-base">2. Create a project</CardTitle>
                <BodyText muted className="mt-2 text-[14px]">
                  Projects group related stories together — for example, an ESL program cohort or an
                  employer partnership campaign. Set a story goal and deadline to track your progress.
                  Go to <Link href="/projects" className="underline underline-offset-2">Projects</Link> to create one.
                </BodyText>
              </div>
              <div>
                <CardTitle className="text-base">3. Build and share an intake form</CardTitle>
                <BodyText muted className="mt-2 text-[14px]">
                  Inside your project, create an intake form. Each form is tailored to a story type (ESL,
                  HSD/GED, CTE, employer, etc.). Copy the public link and share it with your subject by
                  email or text message.
                </BodyText>
              </div>
              <div>
                <CardTitle className="text-base">4. Review and approve content</CardTitle>
                <BodyText muted className="mt-2 text-[14px]">
                  Once a story is delivered, open it from
                  the <Link href="/stories" className="underline underline-offset-2">Stories</Link> view.
                  Review each content piece and click <strong>Approve</strong> or <strong>Flag for revision</strong>.
                  Approved content is ready to copy and publish.
                </BodyText>
              </div>
              <div>
                <CardTitle className="text-base">5. Download the package</CardTitle>
                <BodyText muted className="mt-2 text-[14px]">
                  Click <strong>View Package</strong> on any delivered story to access the full delivery
                  bundle — blog post, captions, press release, newsletter copy, and all media files.
                </BodyText>
              </div>
            </div>
          </Card>
        </Section>

        {/* FAQs */}
        <Section title="Frequently asked questions">
          <Card padding="md" className="sm:p-8">
            <div className="divide-y divide-[var(--border)]">
              <Faq
                question="Why isn't my story moving past 'Writing content'?"
                answer="This usually means your OpenAI API key is missing or invalid. Check Settings to confirm the key is saved. If it's saved, verify that the key has an active billing plan in your OpenAI dashboard."
              />
              <Faq
                question="Can I edit the AI-generated content before publishing?"
                answer="Yes. The content in each story package is meant to be a strong first draft. Copy it into your website CMS, email tool, or social platform and make any adjustments you need before publishing."
              />
              <Faq
                question="How do I send a form to multiple people?"
                answer="Each intake form has a single public link that can be shared with anyone. The same link works for multiple submissions — every submission creates a separate story record."
              />
              <Faq
                question="What story types are supported?"
                answer="ESL/English Language Learner, HSD/GED, Career and Technical Education (CTE), employer partnership, staff highlight, community partner, and program overview. Each type uses a tailored prompt set."
              />
              <Faq
                question="Where are the video assets stored?"
                answer="Video assets are generated via your video API key (JSON2Video or Creatomate) and stored as links in the story package. They are available to download from the package page."
              />
              <Faq
                question="Who receives the 'package ready' email notification?"
                answer="The email address saved under Settings → Package ready notifications. Only one address is supported per workspace. Make sure it's the inbox your team monitors."
              />
              <Faq
                question="Can I delete a story or project?"
                answer="Yes. Stories can be deleted from the project's Content tab. Projects cannot currently be deleted from the UI — contact your Canopy administrator if you need a project removed."
              />
            </div>
          </Card>
        </Section>

        {/* Quick links */}
        <Section title="Quick links">
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/projects">Projects</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/stories">Stories</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/settings">Settings</Link>
            </Button>
            <Button asChild variant="secondary">
              <a href="mailto:info@akkedisdigital.com?subject=Canopy%20Stories%20Support">
                Contact support
              </a>
            </Button>
          </div>
        </Section>

      </div>
    </StoriesShell>
  );
}
