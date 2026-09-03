"use client";

import { useState } from "react";
import { LifeBuoy, Plus, X, ChevronDown, MessageCircleMore, Mail } from "lucide-react";

type TicketStatus = "open" | "pending" | "closed";
type Ticket = { id: string; subject: string; details: string; status: TicketStatus; updated: string };

const STATUS_STYLE: Record<TicketStatus, string> = {
  open: "bg-orange-100 text-orange-600",
  pending: "bg-yellow-100 text-yellow-700",
  closed: "bg-green-100 text-green-700",
};

const FAQS = [
  { q: "How do I add a new menu item?", a: "Go to Menu Editor → click '+ Add Menu Item', fill in the details and save." },
  { q: "How do I manage table / floor areas?", a: "Go to Floor Plan in the sidebar to add, edit, or remove tables and areas." },
  { q: "How do I view live orders?", a: "Click 'Orders' in the sidebar to see all live and recent orders in real time." },
  { q: "How do I invite a staff member?", a: "Go to Settings → Team, click 'Add Team Member', fill in their details and send the invite." },
  { q: "How do I change payment methods?", a: "Go to Settings → Payment Settings to enable or disable payment methods and gateways." },
];

const INITIAL_TICKETS: Ticket[] = [
  { id: "TK-001", subject: "Menu not updating", details: "", status: "open", updated: "2h ago" },
  { id: "TK-002", subject: "Payment gateway error", details: "", status: "pending", updated: "1d ago" },
  { id: "TK-003", subject: "Staff login issue", details: "", status: "closed", updated: "3d ago" },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fireToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = () => {
    if (!subject.trim()) return;
    const t: Ticket = {
      id: `TK-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: subject.trim(),
      details: details.trim(),
      status: "open",
      updated: "Just now",
    };
    setTickets((prev) => [t, ...prev]);
    setSubject("");
    setDetails("");
    setShowModal(false);
    fireToast("Ticket submitted successfully.");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1080px] px-6 py-8">

          {toast && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
              <span className="text-[13px] font-medium text-green-700">{toast}</span>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-200/60">
                <LifeBuoy className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Support</h1>
                <p className="mt-0.5 text-[12px] text-gray-400">Submit a ticket or browse common questions</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-orange-200/60 transition hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              New Ticket
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            {/* Left — Tickets + FAQ */}
            <div className="flex flex-col gap-6">

              {/* Tickets */}
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="text-[14px] font-bold text-gray-900">My Tickets</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {tickets.map((t) => (
                    <div key={t.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">{t.subject}</p>
                        <p className="mt-0.5 text-[11px] text-gray-400">#{t.id} · {t.updated}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[t.status]}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <p className="px-6 py-8 text-center text-[13px] text-gray-400">No tickets yet.</p>
                  )}
                </div>
              </section>

              {/* FAQ */}
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="text-[14px] font-bold text-gray-900">Frequently Asked Questions</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="px-6 py-4">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="flex w-full items-center justify-between gap-4 text-left"
                      >
                        <span className="text-[13px] font-semibold text-gray-800">{faq.q}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                      </button>
                      {openFaq === i && (
                        <p className="mt-2.5 text-[12px] leading-5 text-gray-500">{faq.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right — Contact */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-sm">
                <h3 className="text-[15px] font-bold">Need Help?</h3>
                <p className="mt-1.5 text-[12px] leading-5 text-orange-100/90">
                  Contact your Super Admin for account, billing, or platform-level issues.
                </p>
                <div className="mt-4 flex flex-col gap-2.5">
                  <button
                    onClick={() => fireToast("Message sent to Super Admin.")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[13px] font-semibold text-orange-600 transition hover:bg-orange-50"
                  >
                    <MessageCircleMore className="h-4 w-4" />
                    Message Super Admin
                  </button>
                  <button
                    onClick={() => fireToast("Email sent to support.")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-700/40 py-2.5 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/20 transition hover:bg-orange-700/60"
                  >
                    <Mail className="h-4 w-4" />
                    Email Support
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-[13px] font-bold text-gray-900">Ticket Status Guide</h3>
                <div className="mt-3 flex flex-col gap-2">
                  {(["open", "pending", "closed"] as TicketStatus[]).map((s) => (
                    <div key={s} className="flex items-center gap-2.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_STYLE[s]}`}>{s}</span>
                      <span className="text-[12px] text-gray-500">
                        {s === "open" ? "Awaiting review" : s === "pending" ? "In progress" : "Resolved"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-gray-900">Submit New Ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Subject</label>
                <input
                  autoFocus
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Menu not loading"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Details</label>
                <textarea
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!subject.trim()}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
