"use client";

import { useState, useTransition } from "react";
import { Phone, Mail, X, Loader2, CheckCircle2 } from "lucide-react";
import { sendSupportMessageAction } from "@/app/actions/support";

const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "+977-9800000000";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com";

function ChatModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await sendSupportMessageAction({ name, email, message });
      if (!res.success) { setError(res.message ?? "Something went wrong."); return; }
      setDone(true);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900">Message sent!</h3>
            <p className="mt-1 text-sm text-neutral-500">We'll get back to you as soon as possible.</p>
            <button onClick={onClose} className="mt-6 w-full rounded-full bg-neutral-900 py-2.5 text-sm font-bold text-white hover:bg-neutral-700">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900">Contact Support</h3>
              <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-1 text-xs text-neutral-400">Leave a message and our team will respond shortly.</p>

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
              />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
              />
              <textarea
                value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                rows={4}
                className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
              />
              <button
                type="submit" disabled={isPending}
                className="flex items-center justify-center gap-2 rounded-full bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Sending…" : "Send Message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ContactCtaBanner() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-3 pb-10 sm:px-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-neutral-900 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">Still have questions?</h2>
            <p className="mt-2 max-w-md text-sm text-neutral-400">
              Our support team is available around the clock to help with
              anything you need, from menu questions to order issues.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              <Phone className="h-4 w-4" />
              Call Support
            </a>
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center justify-center gap-2 rounded-full border border-neutral-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-neutral-400 hover:bg-neutral-800"
            >
              <Mail className="h-4 w-4" />
              Email Us
            </button>
          </div>
        </div>
      </section>

      {chatOpen && <ChatModal onClose={() => setChatOpen(false)} />}
    </>
  );
}
