"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Info, HelpCircle, X, Phone, MessageSquare,
  Star, Loader2, CheckCircle2, Settings, type LucideIcon,
} from "lucide-react";
import { sendSupportMessageAction } from "@/app/actions/support";
import { submitReviewAction } from "@/app/actions/review";

/* ─── Contact Modal ──────────────────────────────────────── */
function ContactModal({
  businessName,
  businessPhone,
  onClose,
}: {
  businessName: string;
  businessPhone?: string;
  onClose: () => void;
}) {
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-base font-bold text-gray-900">Message sent!</h3>
            <p className="mt-1 text-sm text-gray-500">
              The team at <span className="font-semibold">{businessName}</span> will get back to you shortly.
            </p>
            <button onClick={onClose} className="mt-6 w-full rounded-full bg-gray-900 py-2.5 text-sm font-bold text-white hover:bg-gray-700">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Contact {businessName}</h3>
                <p className="mt-0.5 text-xs text-gray-400">Send a message or call directly</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            {businessPhone && (
              <a
                href={`tel:${businessPhone}`}
                className="mt-4 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
              >
                <Phone className="h-4 w-4 shrink-0" />
                <span>Call {businessPhone}</span>
              </a>
            )}

            <p className="mt-4 mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">Or send a message</p>

            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300" />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What do you need help with?" rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300" />
              <button type="submit" disabled={isPending}
                className="flex items-center justify-center gap-2 rounded-full bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60">
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

/* ─── Review Modal ───────────────────────────────────────── */
function ReviewModal({
  businessId,
  businessName,
  onClose,
}: {
  businessId: string;
  businessName: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating."); return; }
    setError(null);
    startTransition(async () => {
      const res = await submitReviewAction({ businessId, name, rating, comment });
      if (!res.success) { setError(res.message ?? "Something went wrong."); return; }
      setDone(true);
    });
  };

  const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-gray-900">Thank you!</h3>
            <p className="mt-1 text-sm text-gray-500">Your review for <span className="font-semibold">{businessName}</span> has been submitted.</p>
            <button onClick={onClose} className="mt-6 w-full rounded-full bg-gray-900 py-2.5 text-sm font-bold text-white hover:bg-gray-700">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Rate & Review</h3>
                <p className="mt-0.5 text-xs text-gray-400">{businessName}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            {/* Star picker */}
            <div className="mt-5 flex flex-col items-center gap-2">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s} type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className="h-9 w-9"
                      strokeWidth={1.5}
                      fill={(hovered || rating) >= s ? "#FBBF24" : "none"}
                      color={(hovered || rating) >= s ? "#FBBF24" : "#D1D5DB"}
                    />
                  </button>
                ))}
              </div>
              {(hovered || rating) > 0 && (
                <span className="text-sm font-semibold text-yellow-500">{LABELS[hovered || rating]}</span>
              )}
            </div>

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300" />
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience (optional)" rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300" />
              <button type="submit" disabled={isPending}
                className="flex items-center justify-center gap-2 rounded-full bg-yellow-400 py-2.5 text-sm font-bold text-gray-900 hover:bg-yellow-500 disabled:opacity-60">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Sidebar ────────────────────────────────────────────── */
export default function Sidebar({
  isOpen,
  onClose,
  businessId,
  businessName,
  businessPhone,
}: {
  isOpen: boolean;
  onClose: () => void;
  businessId?: string;
  businessName?: string;
  businessPhone?: string;
}) {
  const pathname = usePathname();
  const [contactOpen, setContactOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const isMenuPage = !!businessId;

  const generalNav: { label: string; href: string; icon: LucideIcon }[] = [
 
    
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const openContact = () => { onClose(); setContactOpen(true); };
  const openReview = () => { onClose(); setReviewOpen(true); };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#12141d] shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <span className="text-sm font-bold text-white">
            {isMenuPage ? businessName : "Menu"}
          </span>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            {/* General nav — always shown */}
            {generalNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-white/10 text-[#e8821a]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>
                  <Icon size={18} strokeWidth={2} className={active ? "text-[#e8821a]" : "text-white/50"} />
                  {item.label}
                </Link>
              );
            })}

            {/* Business-specific section — only on Menu page */}
            {isMenuPage && (
              <div className="mt-4">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
                  This Restaurant
                </p>

                <button onClick={openContact}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white">
                  <MessageSquare size={18} strokeWidth={2} className="text-white/50" />
                  Contact Staff
                </button>

                {businessPhone && (
                  <a href={`tel:${businessPhone}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white">
                    <Phone size={18} strokeWidth={2} className="text-white/50" />
                    Call Restaurant
                  </a>
                )}

                <button onClick={openReview}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white">
                  <Star size={18} strokeWidth={2} className="text-white/50" />
                  Rate & Review
                </button>
              </div>
            )}
          </div>

          {/* Settings pinned to bottom */}
          <Link href="/settings" onClick={onClose}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${pathname === "/settings" ? "bg-white/10 text-[#e8821a]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>
            <Settings size={18} className="text-white/50" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Modals — rendered outside drawer so they're not clipped */}
      {contactOpen && businessId && (
        <ContactModal
          businessName={businessName ?? "the restaurant"}
          businessPhone={businessPhone}
          onClose={() => setContactOpen(false)}
        />
      )}
      {reviewOpen && businessId && (
        <ReviewModal
          businessId={businessId}
          businessName={businessName ?? "the restaurant"}
          onClose={() => setReviewOpen(false)}
        />
      )}
    </>
  );
}
