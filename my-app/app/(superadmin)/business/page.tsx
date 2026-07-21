"use client";

import { useMemo, useState } from "react";
import {
  Search, LayoutGrid, List, Eye, Pencil, Trash2,
  Mail, Phone, DollarSign, MoreHorizontal, X, Download,
  Plus, Building2, CheckCircle2, Clock3, Ban,
} from "lucide-react";

const initialBusinesses = [
  { id: 1, logo: "🍔", name: "Burger House", owner: "Ram Sharma", email: "ram@gmail.com", phone: "9800000001", plan: "Premium", status: "Active", revenue: "Rs. 65,000" },
  { id: 2, logo: "🍕", name: "Pizza Hub", owner: "Sita KC", email: "sita@gmail.com", phone: "9800000002", plan: "Basic", status: "Pending", revenue: "Rs. 28,000" },
  { id: 3, logo: "☕", name: "Coffee Corner", owner: "Hari Bhandari", email: "hari@gmail.com", phone: "9800000003", plan: "Premium", status: "Active", revenue: "Rs. 91,000" },
  { id: 4, logo: "🍜", name: "Momo Station", owner: "Anil Rai", email: "anil@gmail.com", phone: "9800000004", plan: "Standard", status: "Suspended", revenue: "Rs. 14,500" },
];

type Business = typeof initialBusinesses[0];

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [view, setView] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [viewItem, setViewItem] = useState<Business | null>(null);
  const [editForm, setEditForm] = useState<Business | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ logo: "🍽️", name: "", owner: "", email: "", phone: "", plan: "Basic", status: "Active", revenue: "" });

  const filtered = useMemo(() =>
    businesses.filter((b) => {
      const s = search.toLowerCase();
      return (
        (b.name.toLowerCase().includes(s) ||
          b.owner.toLowerCase().includes(s) ||
          b.email.toLowerCase().includes(s)) &&
        (!status || b.status === status) &&
        (!plan || b.plan === plan)
      );
    }),
    [businesses, search, status, plan]
  );

  function handleAdd() {
    if (!addForm.name || !addForm.owner || !addForm.email) return;
    setBusinesses((prev) => [...prev, { ...addForm, id: Date.now() }]);
    setAddForm({ logo: "🍽️", name: "", owner: "", email: "", phone: "", plan: "Basic", status: "Active", revenue: "" });
    setAddOpen(false);
  }

  function handleDelete(id: number) {
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
  }

  function handleSave() {
    if (!editForm) return;
    setBusinesses((prev) => prev.map((b) => (b.id === editForm.id ? editForm : b)));
    setEditForm(null);
  }

  const statusColor = (s: string) =>
    s === "Active" ? "bg-green-100 text-green-700" :
    s === "Pending" ? "bg-yellow-100 text-yellow-700" :
    "bg-red-100 text-red-700";

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Management</h1>
          <p className="mt-1 text-sm text-gray-500">Oversee and manage registered restaurants and multi-location businesses.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 text-sm font-semibold text-white hover:bg-[#e06610] transition">
          <Plus size={18} /> Add New Business
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total Businesses", value: "120", subtitle: "+4% from last month", icon: Building2, color: "text-[#B54A00]", bg: "bg-[#F6F4F2]" },
          { title: "Active", value: "95", subtitle: "Verified & Operating", icon: CheckCircle2, color: "text-[#B54A00]", bg: "bg-[#F6F4F2]" },
          { title: "Pending", value: "15", subtitle: "Awaiting Approval", icon: Clock3, color: "text-[#B54A00]", bg: "bg-[#F6F4F2]" },
          { title: "Suspended", value: "10", subtitle: "Policy Violations", icon: Ban, color: "text-[#B54A00]", bg: "bg-[#F6F4F2]" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border border-[#E8C7B4] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#B54A00]/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.title}</p>
                  <h2 className="mt-3 text-4xl font-bold text-gray-900">{item.value}</h2>
                  <p className="mt-2 text-sm text-gray-500">{item.subtitle}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-[#E8C7B4] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row">
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
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl border border-[#E8C7B4] px-4 text-sm outline-none focus:border-[#B54A00]">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className="h-11 rounded-xl border border-[#E8C7B4] px-4 text-sm outline-none focus:border-[#B54A00]">
              <option value="">All Plans</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-xl border border-[#E8C7B4]">
              <button onClick={() => setView("list")} className={`flex items-center gap-2 px-4 py-2 text-sm transition ${view === "list" ? "bg-[#F97316] text-white" : "bg-white text-gray-600 hover:bg-[#F97316]/10 hover:text-[#F97316]"}`}>
                <List size={18} /> List
              </button>
              <button onClick={() => setView("grid")} className={`flex items-center gap-2 px-4 py-2 text-sm transition ${view === "grid" ? "bg-[#F97316] text-white" : "bg-white text-gray-600 hover:bg-[#F97316]/10 hover:text-[#F97316]"}`}>
                <LayoutGrid size={18} /> Grid
              </button>
            </div>
            <button className="flex h-11 items-center gap-2 rounded-xl border border-[#E8C7B4] px-4 text-sm hover:bg-[#F6F4F2] transition">
              <Download size={18} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="overflow-hidden rounded-2xl border border-[#E8C7B4] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F6F4F2] text-left text-gray-600">
                <tr>
                  <th className="px-6 py-4">Business Info</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((b) => (
                  <tr key={b.id} className="border-t border-[#F2DDD2] hover:bg-[#F6F4F2] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F6F4F2] text-xl">{b.logo}</div>
                        <div>
                          <p className="font-semibold text-gray-900">{b.name}</p>
                          <p className="text-xs text-gray-500">Restaurant</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{b.owner}</p>
                      <p className="text-xs text-gray-500">Business Owner</p>
                    </td>
                    <td className="px-6 py-4">
                      <p>{b.email}</p>
                      <p className="text-xs text-gray-500">{b.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">{b.plan}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{b.revenue}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewItem(b)} className="rounded-lg p-2 hover:bg-[#F97316]/10 hover:text-[#F97316] transition"><Eye size={18} /></button>
                        <button onClick={() => setEditForm({ ...b })} className="rounded-lg p-2 hover:bg-[#F97316]/10 hover:text-[#F97316] transition"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(b.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-100 transition"><Trash2 size={18} /></button>
                        <button className="rounded-lg p-2 hover:bg-gray-100 transition"><MoreHorizontal size={18} /></button>
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.length > 0 ? filtered.map((b) => (
            <div key={b.id} className="rounded-2xl border border-[#E8C7B4] bg-white p-6 shadow-sm transition hover:shadow-lg hover:border-[#B54A00]/50">
              <div className="flex flex-col items-center text-center gap-3 pb-5 border-b">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#F6F4F2] text-6xl">{b.logo}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{b.name}</h3>
                  <p className="text-sm text-gray-500">{b.owner}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600"><Mail size={16} />{b.email}</div>
                <div className="flex items-center gap-2 text-gray-600"><Phone size={16} />{b.phone}</div>
                <div className="flex items-center gap-2 font-medium"><DollarSign size={16} />{b.revenue}</div>
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

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-xl font-bold">Business Details</h2>
              <button onClick={() => setViewItem(null)}><X size={22} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F6F4F2] text-4xl">{viewItem.logo}</div>
                <div>
                  <h3 className="text-xl font-semibold">{viewItem.name}</h3>
                  <p className="text-gray-500">Owner: {viewItem.owner}</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p><span className="font-medium">Email:</span> {viewItem.email}</p>
                <p><span className="font-medium">Phone:</span> {viewItem.phone}</p>
                <p><span className="font-medium">Plan:</span> {viewItem.plan}</p>
                <p><span className="font-medium">Status:</span> {viewItem.status}</p>
              </div>
              <div className="rounded-xl bg-[#F97316]/10 p-4">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h2 className="text-3xl font-bold text-[#F97316]">{viewItem.revenue}</h2>
              </div>
            </div>
            <div className="flex justify-end border-t p-6">
              <button onClick={() => setViewItem(null)} className="rounded-xl bg-[#F97316] px-5 py-2 text-white hover:bg-[#e06610] transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-xl font-bold">Edit Business</h2>
              <button onClick={() => setEditForm(null)}><X size={22} /></button>
            </div>
            <div className="space-y-4 p-6">
              {(["name", "owner", "email", "phone", "revenue"] as const).map((field) => (
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
            <div className="flex justify-end gap-3 border-t p-6">
              <button onClick={() => setEditForm(null)} className="rounded-xl border px-5 py-2 text-sm hover:bg-gray-100 transition">Cancel</button>
              <button onClick={handleSave} className="rounded-xl bg-[#F97316] px-5 py-2 text-sm text-white hover:bg-[#e06610] transition">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {/* Add Business Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-xl font-bold">Add New Business</h2>
              <button onClick={() => setAddOpen(false)}><X size={22} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Logo Emoji</label>
                <input value={addForm.logo} onChange={(e) => setAddForm({ ...addForm, logo: e.target.value })} className="h-10 w-full rounded-lg border border-[#E8C7B4] px-3 text-sm outline-none focus:border-[#F97316]" placeholder="e.g. 🍔" />
              </div>
              {(["name", "owner", "email", "phone", "revenue"] as const).map((field) => (
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
            <div className="flex justify-end gap-3 border-t p-6">
              <button onClick={() => setAddOpen(false)} className="rounded-xl border px-5 py-2 text-sm hover:bg-gray-100 transition">Cancel</button>
              <button onClick={handleAdd} className="rounded-xl bg-[#F97316] px-5 py-2 text-sm text-white hover:bg-[#e06610] transition">Add Business</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
