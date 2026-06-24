"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, FileText, FileDown, Check } from "lucide-react";
import { repository, shareRelease } from "@/data/mock-release";
import { SectionHeading } from "./SectionHeading";

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-7-6.2 7H1.3l8.1-9.3L1 2h7l4.9 6.4L18.9 2Zm-2.4 18h1.9L7.6 4H5.6l10.9 16Z" />
    </svg>
  );
}

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM3.56 20.45h3.56V9H3.56v11.45Z" />
    </svg>
  );
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ShareRelease() {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${repository.url}/releases/tag/${repository.latestVersion}`;
  const tweetText = encodeURIComponent(shareRelease.socialPost);
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    downloadFile(
      `${repository.name}-${repository.latestVersion}.md`,
      shareRelease.markdownPreview,
      "text/markdown"
    );
  };

  const handleDownloadPdf = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>${repository.name} ${repository.latestVersion}</title></head>
        <body style="font-family: ui-sans-serif, system-ui; padding: 2rem; white-space: pre-wrap;">
          ${shareRelease.markdownPreview.replace(/</g, "&lt;")}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const actions = [
    { label: "Share to X", icon: XLogo, onClick: () => window.open(twitterUrl, "_blank") },
    { label: "Share to LinkedIn", icon: LinkedInLogo, onClick: () => window.open(linkedInUrl, "_blank") },
    { label: copied ? "Copied!" : "Copy Link", icon: copied ? Check : Link2, onClick: handleCopy },
    { label: "Download Markdown", icon: FileText, onClick: handleDownloadMarkdown },
    { label: "Download PDF", icon: FileDown, onClick: handleDownloadPdf },
  ];

  return (
    <section className="relative mx-auto w-full max-w-5xl px-6 py-24 sm:px-10">
      <SectionHeading
        eyebrow="Share Release"
        title="Broadcast it"
        description="Send these release notes anywhere your team or users are watching."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-white/70 transition-colors group-hover:text-white">
                <action.icon className="size-4" />
              </span>
              {action.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl"
        >
          <p className="mb-3 text-xs font-medium tracking-wide text-white/40 uppercase">
            Social preview
          </p>
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
                IQ
              </span>
              <div className="text-sm">
                <p className="font-medium text-white">ReleaseIQ</p>
                <p className="text-xs text-white/40">@releaseiq · now</p>
              </div>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">
              {shareRelease.socialPost}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
