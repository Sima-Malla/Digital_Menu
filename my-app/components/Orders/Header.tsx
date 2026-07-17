"use client";

import { Bell, CircleHelp, Download, Search } from "lucide-react";

export default function OrdersHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white">
      <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Orders Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage all customer orders.
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search orders..."
              className="h-11 w-72 rounded-lg border border-gray-200 pl-10 pr-4 outline-none focus:border-[#0A5C8D]"
            />
          </div>

          {/* Export */}
          <button className="flex h-11 items-center gap-2 rounded-lg bg-[#B54A00] px-5 text-white hover:bg-[#9d3f00]">
            <Download size={18} />
            Export
          </button>

          {/* Notification */}
          <button className="flex h-11 w-11 items-center justify-center rounded-lg border hover:bg-gray-100">
            <Bell size={18} />
          </button>

          {/* Help */}
          <button className="flex h-11 w-11 items-center justify-center rounded-lg border hover:bg-gray-100">
            <CircleHelp size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}