"use client";

import { Filter, Search } from "lucide-react";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  business: string;
  setBusiness: (v: string) => void;
};

export default function FilterBar({ search, setSearch, status, setStatus, business, setBusiness }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
        <div className="relative lg:col-span-2">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID or Customer..."
            className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-4 outline-none focus:border-[#0A5C8D]"
          />
        </div>

        <select className="h-11 rounded-lg border border-gray-300 px-3 outline-none focus:border-[#0A5C8D]">
          <option>Last 30 Days</option>
          <option>Today</option>
          <option>Last 7 Days</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>

        <select
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          className="h-11 rounded-lg border border-gray-300 px-3 outline-none focus:border-[#0A5C8D]"
        >
          <option>All Businesses</option>
          <option>Bistro Central</option>
          <option>Pizza House</option>
          <option>Food Hub</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 rounded-lg border border-gray-300 px-3 outline-none focus:border-[#0A5C8D]"
        >
          <option>All Status</option>
          <option>Pending</option>
          <option>Preparing</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>

        <button className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0A5C8D] text-white hover:bg-[#084d74]">
          <Filter size={18} />
          Apply Filters
        </button>
      </div>
    </div>
  );
}
