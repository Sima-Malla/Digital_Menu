"use client";

import { useEffect, useState } from "react";
import {
  Search, LayoutGrid, List, Eye, Pencil, Trash2,
  Mail, Phone, DollarSign, X,
  Plus, Building2, CheckCircle2, Clock3, Ban, Loader2,
} from "lucide-react";
import {
  getSuperadminBusinesses,
  createBusinessAction,
  updateBusinessAction,
  deleteBusinessAction,
  SuperadminBusiness,
} from "@/app/actions/superadmin-businesses";

// A logo can be an emoji/short string OR an image URL (e.g. Uploadcare/CDN link).
// Render accordingly instead of dumping raw text into a fixed-size box.
function isImageUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function BusinessLogo({ logo, name, sizeClass }: { logo: string; name: string; sizeClass: string }) {
  if (logo && isImageUrl(logo)) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-xl bg-[#F6F4F2] ${sizeClass}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback if the image fails to load — hide broken icon, show initial instead.
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-xl bg-[#F6F4F2] ${sizeClass}`}>
      <span className="leading-none">{logo?.trim() ? logo : "🍽️"}</span>
    </div>
  );
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<SuperadminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [viewItem, setViewItem] = useState<SuperadminBusiness | null>(null);
  const [editForm, setEditForm] = useState<SuperadminBusiness | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ logo: "🍽️", name: "", owner: "", email: "", phone: "", plan: "Basic", status: "Active" });
  const [submitting, setSubmitting] = useState(false);

  // Server-side fetch — search/status/plan are sent to the DB query, not filtered in the browser.
  async function loadData(currentSearch: string, currentStatus: string, currentPlan: string) {
    setLoading(true);
    const data = await getSuperadminBusinesses({
      search: currentSearch || undefined,
      status: currentStatus || undefined,
      plan: currentPlan || undefined,
    });
    setBusinesses(data);
    setLoading(false);
  }

  // Initial load
  useEffect(() => {
    loadData("", "", "");
  }, []);

  // Status/plan filter — refetch immediately
  useEffect(() => {
    loadData(search, status, plan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, plan]);

  // Search text — debounce so we're not hitting the DB on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadData(search, status, plan);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleAdd() {
    if (!addForm.name || !addForm.owner || !addForm.email) return;
    setSubmitting(true);
    const res = await createBusinessAction(addForm);
    setSubmitting(false);

    if (res.success) {
      setAddForm({ logo: "🍽️", name: "", owner: "", email: "", phone: "", plan: "Basic", status: "Active" });
      setAddOpen(false);
      loadData(search, status, plan);
    } else {
      alert(res.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this business?")) return;
    const previous = businesses;
    setBusinesses((prev) => prev.filter((b) => b.id !== id)); // optimistic
    const res = await deleteBusinessAction(id);
    if (!res.success) {
      setBusinesses(previous); // revert on failure
      alert(res.message);
    }
  }

  async function handleSave() {
    if (!editForm) return;
    setSubmitting(true);
    const res = await updateBusinessAction(editForm.id, editForm);
    setSubmitting(false);

    if (res.success) {
      setBusinesses((prev) => prev.map((b) => (b.id === editForm.id ? editForm : b)));
      setEditForm(null);
    } else {
      alert(res.message);
    }
  }

  const statusColor = (s: string) =>
    s === "Active" ? "bg-green-100 text-green-700" :
    s === "Pending" ? "bg-yellow-100 text-yellow-700" :
    "bg-red-100 text-red-700";

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Business Management</h1>
          <p className="mt-1 text-sm text-gray-500">Oversee and manage registered restaurants from database.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e06610] md:w-auto"
        >
          <Plus size={18} /> Add New Business
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {[
          { title: "Total Businesses", value: businesses.length.toString(), subtitle: "Registered in system", icon: Building2 },
          { title: "Active", value: businesses.filter((b) => b.status === "Active").length.toString(), subtitle: "Verified & Operating", icon: CheckCircle2 },
          { title: "Pending", value: businesses.filter((b) => b.status === "Pending").length.toString(), subtitle: "Awaiting Approval", icon: Clock3 },
          { title: "Suspended", value: businesses.filter((b) => b.status === "Suspended").length.toString(), subtitle: "Policy Violations", icon: Ban },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border border-[#E8C7B4] bg-white p-3.5 shadow-sm transition hover:shadow-md hover:border-[#B54A00]/50 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:text-xs">{item.title}</p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:mt-3 sm:text-4xl">{item.value}</h2>
                  <p className="mt-1 hidden text-sm text-gray-500 sm:mt-2 sm:block">{item.subtitle}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6F4F2] sm:h-12 sm:w-12">
                  <Icon className="h-4 w-4 text-[#B54A00] sm:h-6 sm:w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-[#E8C7B4] bg-white p-3.5 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search business, owner or email..."
                className="h-11 w-full rounded-xl border border-[#E8C7B4] pl-10 pr-4 text-sm outline-none focus:border-[#B54A00]"
              />
            </div>
            <div className="flex gap-3">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 flex-1 rounded-xl border border-[#E8C7B4] px-3 text-sm outline-none focus:border-[#B54A00] sm:flex-none sm:px-4">
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className="h-11 flex-1 rounded-xl border border-[#E8C7B4] px-3 text-sm outline-none focus:border-[#B54A00] sm:flex-none sm:px-4">
                <option value="">All Plans</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </div>
          <div className="flex overflow-hidden rounded-xl border border-[#E8C7B4] self-start">
            <button onClick={() => setView("list")} className={`flex items-center gap-2 px-4 py-2 text-sm transition ${view === "list" ? "bg-[#F97316] text-white" : "bg-white text-gray-600 hover:bg-[#F97316]/10 hover:text-[#F97316]"}`}>
              <List size={18} /> <span className="hidden sm:inline">List</span>
            </button>
            <button onClick={() => setView("grid")} className={`flex items-center gap-2 px-4 py-2 text-sm transition ${view === "grid" ? "bg-[#F97316] text-white" : "bg-white text-gray-600 hover:bg-[#F97316]/10 hover:text-[#F97316]"}`}>
              <LayoutGrid size={18} /> <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-[#E8C7B4] bg-white sm:h-96">
          <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
          <span className="mt-2 text-sm font-medium text-gray-500">Loading businesses...</span>
        </div>
      ) : (
        <>
          {/* List View */}
          {view === "list" && (
            <div className="overflow-hidden rounded-2xl border border-[#E8C7B4] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-[720px] w-full text-sm">
                  <thead className="bg-[#F6F4F2] text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-4 sm:px-6">Business Info</th>
                      <th className="px-4 py-4 sm:px-6">Owner</th>
                      <th className="px-4 py-4 sm:px-6">Contact</th>
                      <th className="px-4 py-4 sm:px-6">Plan</th>
                      <th className="px-4 py-4 sm:px-6">Status</th>
                      <th className="px-4 py-4 sm:px-6">Revenue</th>
                      <th className="px-4 py-4 text-center sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.length > 0 ? businesses.map((b) => (
                      <tr key={b.id} className="border-t border-[#F2DDD2] hover:bg-[#F6F4F2] transition">
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex min-w-0 max-w-[220px] items-center gap-3 sm:max-w-[260px]">
                            <BusinessLogo logo={b.logo} name={b.name} sizeClass="h-11 w-11 text-xl" />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900" title={b.name}>{b.name}</p>
                              <p className="text-xs text-gray-500">Restaurant</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <p className="max-w-[160px] truncate font-medium" title={b.owner}>{b.owner}</p>
                          <p className="text-xs text-gray-500">Business Owner</p>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <p className="max-w-[180px] truncate" title={b.email}>{b.email}</p>
                          <p className="text-xs text-gray-500">{b.phone}</p>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">{b.plan}</span>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span>
                        </td>
                        <td className="px-4 py-4 font-semibold sm:px-6">{b.revenue}</td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setViewItem(b)} className="rounded-lg p-2 hover:bg-[#F97316]/10 hover:text-[#F97316] transition"><Eye size={18} /></button>
                            <button onClick={() => setEditForm({ ...b })} className="rounded-lg p-2 hover:bg-[#F97316]/10 hover:text-[#F97316] transition"><Pencil size={18} /></button>
                            <button onClick={() => handleDelete(b.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-100 transition"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={7} className="py-16 text-center text-gray-500">No businesses found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Grid View */}
          {view === "grid" && (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {businesses.length > 0 ? businesses.map((b) => (
                <div key={b.id} className="rounded-2xl border border-[#E8C7B4] bg-white p-5 shadow-sm transition hover:shadow-lg hover:border-[#B54A00]/50 sm:p-6">
                  <div className="flex flex-col items-center gap-3 border-b pb-5 text-center">
                    <BusinessLogo logo={b.logo} name={b.name} sizeClass="h-20 w-20 text-5xl sm:h-24 sm:w-24 sm:text-6xl" />
                    <div className="min-w-0 w-full">
                      <h3 className="truncate text-lg font-semibold text-gray-900" title={b.name}>{b.name}</h3>
                      <p className="truncate text-sm text-gray-500" title={b.owner}>{b.owner}</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600"><Mail size={16} className="shrink-0" /><span className="truncate">{b.email}</span></div>
                    <div className="flex items-center gap-2 text-gray-600"><Phone size={16} className="shrink-0" />{b.phone}</div>
                    <div className="flex items-center gap-2 font-medium"><DollarSign size={16} className="shrink-0" />{b.revenue}</div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">{b.plan}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span>
                  </div>
                  <div className="mt-6 flex justify-between border-t border-[#F2DDD2] pt-4">
                    <button onClick={() => setViewItem(b)} className="rounded-lg p-2 hover:bg-[#F97316]/10 hover:text-[#F97316] transition"><Eye size={18} /></button>
                    <button onClick={() => setEditForm({ ...b })} className="rounded-lg p-2 hover:bg-[#F97316]/10 hover:text-[#F97316] transition"><Pencil size={18} /></button>
                    <button onClick={() => handleDelete(b.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-100 transition"><Trash2 size={18} /></button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-16 text-center text-gray-500">No businesses found.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-5 sm:p-6">
              <h2 className="text-xl font-bold">Business Details</h2>
              <button onClick={() => setViewItem(null)}><X size={22} /></button>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex min-w-0 items-center gap-4">
                <BusinessLogo logo={viewItem.logo} name={viewItem.name} sizeClass="h-16 w-16 text-4xl" />
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-semibold" title={viewItem.name}>{viewItem.name}</h3>
                  <p className="truncate text-gray-500" title={viewItem.owner}>Owner: {viewItem.owner}</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p className="truncate"><span className="font-medium">Email:</span> {viewItem.email}</p>
                <p className="truncate"><span className="font-medium">Phone:</span> {viewItem.phone}</p>
                <p><span className="font-medium">Plan:</span> {viewItem.plan}</p>
                <p><span className="font-medium">Status:</span> {viewItem.status}</p>
              </div>
              <div className="rounded-xl bg-[#F97316]/10 p-4">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h2 className="text-3xl font-bold text-[#F97316]">{viewItem.revenue}</h2>
              </div>
            </div>
            <div className="flex justify-end border-t p-5 sm:p-6">
              <button onClick={() => setViewItem(null)} className="rounded-xl bg-[#F97316] px-5 py-2 text-white hover:bg-[#e06610] transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-5 sm:p-6">
              <h2 className="text-xl font-bold">Edit Business</h2>
              <button onClick={() => setEditForm(null)}><X size={22} /></button>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Logo (emoji or image URL)</label>
                <div className="flex items-center gap-3">
                  <BusinessLogo logo={editForm.logo} name={editForm.name} sizeClass="h-10 w-10 text-lg" />
                  <input
                    value={editForm.logo}
                    onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                    className="h-10 w-full rounded-lg border border-[#E8C7B4] px-3 text-sm outline-none focus:border-[#B54A00]"
                    placeholder="e.g. 🍔 or https://..."
                  />
                </div>
              </div>
              {(["name", "owner", "email", "phone"] as const).map((field) => (
                <div key={field}>
                  <label className="mb-1 block text-sm font-medium capitalize text-gray-700">{field}</label>
                  <input
                    value={editForm[field]}
                    onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                    className="h-10 w-full rounded-lg border border-[#E8C7B4] px-3 text-sm outline-none focus:border-[#B54A00]"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="h-10 w-full rounded-lg border border-[#E8C7B4] px-3 text-sm outline-none focus:border-[#B54A00]">
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Plan</label>
                <select value={editForm.plan} onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })} className="h-10 w-full rounded-lg border border-[#E8C7B4] px-3 text-sm outline-none focus:border-[#B54A00]">
                  <option>Basic</option>
                  <option>Standard</option>
                  <option>Premium</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
              <button onClick={() => setEditForm(null)} className="rounded-xl border px-5 py-2 text-sm hover:bg-gray-100 transition">Cancel</button>
              <button onClick={handleSave} disabled={submitting} className="rounded-xl bg-[#F97316] px-5 py-2 text-sm text-white hover:bg-[#e06610] transition disabled:opacity-50">
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Business Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-5 sm:p-6">
              <h2 className="text-xl font-bold">Add New Business</h2>
              <button onClick={() => setAddOpen(false)}><X size={22} /></button>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Logo Emoji</label>
                <input value={addForm.logo} onChange={(e) => setAddForm({ ...addForm, logo: e.target.value })} className="h-10 w-full rounded-lg border border-[#E8C7B4] px-3 text-sm outline-none focus:border-[#F97316]" placeholder="e.g. 🍔" />
              </div>
              {(["name", "owner", "email", "phone"] as const).map((field) => (
                <div key={field}>
                  <label className="mb-1 block text-sm font-medium capitalize text-gray-700">{field}</label>
                  <input value={addForm[field]} onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })} className="h-10 w-full rounded-lg border border-[#E8C7B4] px-3 text-sm outline-none focus:border-[#F97316]" />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })} className="h-10 w-full rounded-lg border border-[#E8C7B4] px-3 text-sm outline-none focus:border-[#F97316]">
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Plan</label>
                <select value={addForm.plan} onChange={(e) => setAddForm({ ...addForm, plan: e.target.value })} className="h-10 w-full rounded-lg border border-[#E8C7B4] px-3 text-sm outline-none focus:border-[#F97316]">
                  <option>Basic</option>
                  <option>Standard</option>
                  <option>Premium</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
              <button onClick={() => setAddOpen(false)} className="rounded-xl border px-5 py-2 text-sm hover:bg-gray-100 transition">Cancel</button>
              <button onClick={handleAdd} disabled={submitting} className="rounded-xl bg-[#F97316] px-5 py-2 text-sm text-white hover:bg-[#e06610] transition disabled:opacity-50">
                {submitting ? "Adding..." : "Add Business"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
