"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination() {
  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row">
      {/* Left */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold">1–8</span> of{" "}
        <span className="font-semibold">248</span> orders
      </div>

      {/* Center */}
      <div className="flex items-center gap-2">
        <button className="rounded-lg border p-2 hover:bg-gray-100">
          <ChevronLeft size={18} />
        </button>

        <button className="h-10 w-10 rounded-lg bg-[#0A5C8D] text-white">
          1
        </button>

        <button className="h-10 w-10 rounded-lg border hover:bg-gray-100">
          2
        </button>

        <button className="h-10 w-10 rounded-lg border hover:bg-gray-100">
          3
        </button>

        <span className="px-2">...</span>

        <button className="h-10 w-10 rounded-lg border hover:bg-gray-100">
          12
        </button>

        <button className="rounded-lg border p-2 hover:bg-gray-100">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Rows per page</span>

        <select className="rounded-lg border px-3 py-2 outline-none">
          <option>10</option>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>
      </div>
    </div>
  );
}