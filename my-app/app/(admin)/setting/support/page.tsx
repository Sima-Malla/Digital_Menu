"use client";

import Sidebar from "@/components/HotelAdmin/Sidebar";
import { useMemo, useState } from "react";
import {
  Search,
  Rocket,
  CreditCard,
  UtensilsCrossed,
  QrCode,
  MessageCircleMore,
  Phone,
  PlayCircle,
  Users,
  FileCode2,
  History,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────── */

type TicketStatus = "open" | "pending" | "closed";

type Ticket = {
  id: string;
  subject: string;
  status: TicketStatus;
  updated: string;
  assignedTo: string;
};

/* ─── Status Badge ────────────────────────────────────────── */

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    open: "bg-orange-100 text-orange-600",
    pending: "bg-gray-200 text-gray-600",
    closed: "bg-green-100 text-green-700",
  };
  const labels: Record<TicketStatus, string> = {
    open: "OPEN",
    pending: "PENDING",
    closed: "CLOSED",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

/* ─── Quick Help Card ─────────────────────────────────────── */

function QuickHelpCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
        <Icon className="h-5 w-5 text-orange-500" strokeWidth={2} />
      </div>
      <h3 className="mt-4 text-[14px] font-bold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-[12px] leading-5 text-gray-400">
        {description}
      </p>
    </button>
  );
}

/* ─── Resource Button ─────────────────────────────────────── */

function ResourceButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[13px] font-semibold text-gray-700 transition hover:border-orange-300 hover:bg-orange-50/50 hover:text-orange-600"
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
      {label}
    </button>
  );
}

/* ─── FAQ Item ────────────────────────────────────────────── */

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-5 py-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-[13px] font-semibold text-gray-800">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="mt-2.5 text-[12px] leading-5 text-gray-500">{answer}</p>
      )}
    </div>
  );
}

/* ─── Data ────────────────────────────────────────────────── */

const QUICK_HELP = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Basic workspace setup and initial configuration.",
  },
  {
    icon: CreditCard,
    title: "Billing & Payments",
    description: "Invoices, subscriptions, and payment methods.",
  },
  {
    icon: UtensilsCrossed,
    title: "Digital Menu Editor",
    description: "Categories, item pricing, photos, and availability.",
  },
  {
    icon: QrCode,
    title: "QR & Table Setup",
    description: "Generate table QR codes and map them to menus.",
  },
];

const INITIAL_TICKETS: Ticket[] = [
  { id: "TK-88902", subject: "Kitchen Display Lag", status: "open", updated: "2h ago", assignedTo: "Super Admin" },
  { id: "TK-88741", subject: "Invoice Error June", status: "pending", updated: "1d ago", assignedTo: "Super Admin" },
  { id: "TK-88109", subject: "Staff PIN Sync", status: "closed", updated: "4d ago", assignedTo: "Super Admin" },
];

const FAQS = [
  {
    question: "How do I generate a QR code for a table?",
    answer:
      "Go to Menu Management → Table Setup, select or add a table, then click Generate QR Code. You can download it as a PNG or PDF for printing.",
  },
  {
    question: "Why isn't my menu update showing on the QR code?",
    answer:
      "QR codes point to a live menu link, not a snapshot. If changes aren't visible, clear your browser cache or check that the item's \"Available\" toggle is switched on in the Menu Editor.",
  },
  {
    question: "Exporting monthly tax reports?",
    answer:
      "Navigate to Order History, select your date range, and click 'Export Report'.",
  },
  {
    question: "Multi-location management?",
    answer:
      "Use the 'Business Selector' in the sidebar to toggle between restaurant profiles.",
  },
  {
    question: "How do I add or remove staff PINs?",
    answer:
      "Go to Staff Access, select a team member, and choose Reset PIN or Revoke Access. Changes take effect immediately on all connected devices.",
  },
  {
    question: "What happens after I submit a ticket?",
    answer:
      "Your ticket is routed to the Super Admin (HQ Operations), who oversees every restaurant and hotel on this workspace. You'll see status updates here as it moves from Open to Pending to Closed.",
  },
];

/* ─── Page ────────────────────────────────────────────────── */

export default function SupportCenterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const fireToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return FAQS;
    const q = searchTerm.toLowerCase();
    return FAQS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const handleSubmitTicket = () => {
    if (!newSubject.trim()) return;
    const ticket: Ticket = {
      id: `TK-${Math.floor(80000 + Math.random() * 9000)}`,
      subject: newSubject.trim(),
      status: "open",
      updated: "Just now",
      assignedTo: "Super Admin",
    };
    setTickets((prev) => [ticket, ...prev]);
    setNewSubject("");
    setNewDetails("");
    setShowTicketModal(false);
    fireToast(`Ticket #${ticket.id} sent to the Super Admin. You'll be notified when it's reviewed.`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1180px] px-8 py-8">
          {/* ── Toast ─────────────────────────────────── */}
          {toast && (
            <div
              role="status"
              className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5"
            >
              <span className="text-[13px] font-medium text-green-700">
                {toast}
              </span>
            </div>
          )}

          {/* ── Header ────────────────────────────────── */}
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-bold text-orange-600">
                Support &amp; Help Center
              </h1>
              <p className="mt-1 text-[13px] text-gray-500">
                Browse self-serve guides, or reach out directly to your
                Super Admin for account, billing, or platform-level issues.
              </p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documentation..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-[13px] font-medium text-gray-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* ── Quick Help Grid ───────────────────────── */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {QUICK_HELP.map((item) => (
              <QuickHelpCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                onClick={() => fireToast(`Opening "${item.title}" articles…`)}
              />
            ))}
          </div>

          {/* ── Main Grid ─────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* Support Requests */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-gray-900">
                  Support Requests
                </h2>
                <button
                  type="button"
                  onClick={() => fireToast("Showing all tickets.")}
                  className="text-[11px] font-bold tracking-wide text-orange-500 hover:text-orange-600"
                >
                  VIEW ALL
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
                <div className="grid grid-cols-[1fr_100px_120px_80px] bg-gray-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span>Subject</span>
                  <span>Status</span>
                  <span>Assigned To</span>
                  <span className="text-right">Updated</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      className="grid grid-cols-[1fr_100px_120px_80px] items-center px-4 py-3.5"
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">
                          {t.subject}
                        </p>
                        <p className="text-[11px] text-gray-400">#{t.id}</p>
                      </div>
                      <TicketStatusBadge status={t.status} />
                      <span className="text-[12px] text-gray-500">
                        {t.assignedTo}
                      </span>
                      <span className="text-right text-[12px] text-gray-400">
                        {t.updated}
                      </span>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <p className="px-4 py-6 text-center text-[12px] text-gray-400">
                      No support requests yet.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTicketModal(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-[13px] font-semibold text-white shadow-sm shadow-orange-200/60 transition hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Submit New Ticket
              </button>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              {/* Need Immediate Help */}
              <div className="rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 p-6 text-white shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-[12px] font-bold">
                    SA
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold leading-snug">
                      Need Immediate Help?
                    </h3>
                    <p className="text-[11px] text-orange-100/80">
                      HQ Operations · Super Admin
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[12px] leading-5 text-orange-50/90">
                  For account, billing, or platform issues beyond these
                  guides, message your Super Admin directly — they handle
                  every hotel and restaurant on this workspace.
                </p>
                <div className="mt-4 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      fireToast("Message sent to the Super Admin.")
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[13px] font-semibold text-orange-700 transition hover:bg-orange-50"
                  >
                    <MessageCircleMore className="h-4 w-4" strokeWidth={2} />
                    Message Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      fireToast("Callback requested. The Super Admin will reach out shortly.")
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-800/40 py-2.5 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/30 transition hover:bg-orange-800/60"
                  >
                    <Phone className="h-4 w-4" strokeWidth={2} />
                    Request Callback
                  </button>
                </div>
              </div>

              {/* Common Resources */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-[15px] font-bold text-gray-900">
                  Common Resources
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <ResourceButton
                    icon={PlayCircle}
                    label="Videos"
                    onClick={() => fireToast("Opening video tutorials…")}
                  />
                  <ResourceButton
                    icon={Users}
                    label="Forum"
                    onClick={() => fireToast("Opening community forum…")}
                  />
                  <ResourceButton
                    icon={FileCode2}
                    label="API Docs"
                    onClick={() => fireToast("Opening API documentation…")}
                  />
                  <ResourceButton
                    icon={History}
                    label="Changes"
                    onClick={() => fireToast("Opening changelog…")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── FAQ ───────────────────────────────────── */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-gray-900">FAQ</h2>
              <button
                type="button"
                onClick={() => fireToast("Showing all FAQ topics.")}
                className="flex items-center gap-1 text-[12px] font-semibold text-orange-500 hover:text-orange-600"
              >
                See all questions
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredFaqs.map((faq, index) => (
                <FaqItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  open={openFaqIndex === index}
                  onToggle={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                />
              ))}
              {filteredFaqs.length === 0 && (
                <p className="col-span-2 py-6 text-center text-[13px] text-gray-400">
                  No results for "{searchTerm}". Try a different search term.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── New Ticket Modal ────────────────────────────── */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-900">
                Submit New Ticket
              </h3>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Subject
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. QR code not loading menu"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Details
                </label>
                <textarea
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Describe the issue, including which restaurant location and device this happened on."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitTicket}
                disabled={!newSubject.trim()}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}