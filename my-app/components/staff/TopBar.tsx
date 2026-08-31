"use client";

import { useState } from "react";
import Image from "next/image";

import { Search } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function TopBar({
  businessName,
  profileImage,
}: {
  businessName: string;
  profileImage: string;
}) {
  const [query, setQuery] = useState("");
 
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 lg:px-8">
      <h1 className="text-xl font-extrabold text-orange-600">{businessName}</h1>
      <div className="flex items-center gap-4">
       
        
        <NotificationBell />
        <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
          <Image src={profileImage} alt="Profile" width={36} height={36} className="h-full w-full object-cover" />
        </div>
      </div>
    </header>
  );
}