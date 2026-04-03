"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownBody({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children: c }) => <h1 className="mb-3 mt-6 text-2xl font-bold text-[var(--foreground)] first:mt-0">{c}</h1>,
        h2: ({ children: c }) => <h2 className="mb-2 mt-5 text-xl font-semibold text-[var(--foreground)] first:mt-0">{c}</h2>,
        h3: ({ children: c }) => <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--foreground)] first:mt-0">{c}</h3>,
        p: ({ children: c }) => <p className="mb-4 leading-7 text-[var(--foreground)] last:mb-0">{c}</p>,
        strong: ({ children: c }) => <strong className="font-semibold text-[var(--foreground)]">{c}</strong>,
        em: ({ children: c }) => <em className="italic">{c}</em>,
        ul: ({ children: c }) => <ul className="mb-4 ml-5 list-disc space-y-1 leading-7">{c}</ul>,
        ol: ({ children: c }) => <ol className="mb-4 ml-5 list-decimal space-y-1 leading-7">{c}</ol>,
        li: ({ children: c }) => <li className="text-[var(--foreground)]">{c}</li>,
        blockquote: ({ children: c }) => (
          <blockquote className="my-4 border-l-4 border-[var(--border)] pl-4 italic text-[var(--text-muted)]">{c}</blockquote>
        ),
        hr: () => <hr className="my-5 border-[var(--border)]" />,
        a: ({ href, children: c }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{c}</a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
