"use client";

import Image from "next/image";
import { Globe } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12a10 10 0 1 0-11.5 9.95v-7.04H7.9v-2.9h2.6V9.8c0-2.57 1.53-3.99 3.87-3.99 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62v1.95h2.86l-.46 2.9h-2.4v7.04A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37a4 4 0 1 1-7.914 1.174A4 4 0 0 1 16 11.37Z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.84 11.84 0 0 0 5.64 1.44h.01c6.54 0 11.85-5.3 11.85-11.85 0-3.17-1.24-6.15-3.38-8.43ZM12.05 21.4h-.01a9.6 9.6 0 0 1-4.89-1.34l-.35-.21-3.63.95.97-3.54-.23-.36a9.56 9.56 0 0 1-1.46-5.07c0-5.29 4.31-9.6 9.61-9.6 2.56 0 4.97 1 6.78 2.81a9.53 9.53 0 0 1 2.81 6.79c0 5.3-4.31 9.6-9.6 9.6Zm5.24-7.19c-.29-.14-1.7-.84-1.96-.94-.26-.1-.46-.14-.65.14-.19.29-.75.94-.92 1.13-.17.19-.34.22-.63.07-.29-.14-1.2-.44-2.29-1.41-.85-.76-1.42-1.69-1.59-1.97-.17-.29-.02-.44.13-.58.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.65-1.56-.89-2.14-.24-.57-.48-.49-.65-.5h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43 0 1.44 1.03 2.83 1.17 3.02.14.19 2.02 3.08 4.89 4.32.68.29 1.22.47 1.63.6.68.22 1.31.19 1.8.11.55-.08 1.7-.7 1.94-1.37.24-.68.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34Z" />
    </svg>
  );
}

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedinIcon },
  { label: "WhatsApp", href: "https://wa.me/", icon: WhatsappIcon },
];

const columns = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Partner with Us", href: "/partner" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Support", href: "/support" },
      { label: "Download App", href: "/download" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-900 text-neutral-300">
      <div className="mx-auto max-w-5xl px-3 py-8 sm:px-4">
        <div className="flex flex-col gap-12 sm:flex-row sm:gap-20 lg:gap-28">
          {/* Brand */}
          <div className="max-w-xs">
            <Image
              src="/logo.png"
              alt="GourmetFlow"
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
            />
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">
              Gourmet quality, fluid logistics. We bridge the gap between
              world-class kitchens and your dining table.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-3 gap-8 sm:gap-12">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold text-white">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-neutral-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-neutral-800 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-neutral-400">
            © 2024 GourmetFlow. Gourmet quality, fluid logistics.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-neutral-300">
            <Globe className="h-3.5 w-3.5" />
            English (US)
          </div>
        </div>
      </div>
    </footer>
  );
}