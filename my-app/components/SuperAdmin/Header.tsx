"use client";

import { Bell, Search } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white border-b px-8 py-4 flex items-center justify-between">

      {/* Left */}
      <h1 className="text-3xl font-bold text-orange-700">
        Platform-wide Analytics
      </h1>

      {/* Right */}
      <div className="flex items-center gap-6">

        {/* Search */}
        <div className="flex items-center gap-2 border rounded-full px-4 py-2 w-80">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search businesses..."
            className="outline-none w-full"
          />
        </div>

        {/* Notification */}
        <button className="relative">
          <Bell size={22} />

          <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">

          <Image
            src="/man.png"
            width={42}
            height={42}
            alt="Admin"
            className="rounded-full"
          />

          <div>
            <h3 className="font-semibold">
              Sima Malla
            </h3>

            <p className="text-xs text-blue-600">
              SUPER ADMIN
            </p>
          </div>

        </div>

      </div>

    </header>
  );
}