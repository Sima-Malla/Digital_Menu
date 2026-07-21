"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Sidebar from "@/components/SideBar";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import TrendingNow from "@/components/TrendingNow";
import InRoomDining from "@/components/InRoomDining";
import Footer from "@/components/Footer";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#F3EAD9]">
      <Nav
        menuOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Hero />
      <FeaturedRestaurants />
      <TrendingNow />
      <InRoomDining />
      <Footer />
    </div>
  );
}