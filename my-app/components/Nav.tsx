
"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./SideBar";

export default function DashboardHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div>
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-5 py-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center text-[#12141d]"
        >
          <Menu size={22} strokeWidth={1.8} />
        </button>

        {/* rest of your header (page title, avatar, notifications, etc.) */}
     

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    
      <div className="flex flex-col items-center gap-0.5">
    <img src="/logo.png" alt="Logo" className="h-14 w-auto" />
      </div>

      <div className="flex items-center gap-3.5">
        <button aria-label="Account" className="flex h-8 w-8 items-center justify-center opacity-90">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.6" />
            <path d="M4.5 20c1.6-3.6 4.6-5.4 7.5-5.4s5.9 1.8 7.5 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button aria-label="Search menu" className="flex h-8 w-8 items-center justify-center opacity-90">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M20 20l-4.8-4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button aria-label="View order, 2 items" className="relative flex h-8 w-8 items-center justify-center opacity-90">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 8h16l-1.4 10.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          
        </button>
      </div>
       </header>
  
    </div>
    
  );
}
