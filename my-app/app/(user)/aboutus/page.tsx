import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Calendar, Users } from "lucide-react";

import Footer from "@/components/Footer";
import { getAboutStats, formatStat } from "@/lib/user/about";
import { getSession } from "@/lib/session";

export default async function AboutUsPage() {
  const [stats, session] = await Promise.all([getAboutStats(), getSession()]);

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative h-[420px] w-full overflow-hidden bg-gradient-to-br from-orange-900 via-orange-700 to-amber-600">
        <Image
          src="/back.png"
          alt=""
          fill
          priority
          className="object-cover opacity-90"
        />
        {/* Soft highlight so the gradient still looks intentional if the photo is missing/broken */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 lg:px-10">
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            The Future of <span className="text-orange-400">Hospitality</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
            MenuTap is the unified platform connecting food lovers with the best hotels, restaurants,
            and cafes. We empower local businesses with digital tools while providing an effortless
            discovery and ordering experience for customers.
          </p>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Our Mission &amp; Vision
            </p>
            <h2 className="mt-2 text-2xl font-extrabold leading-snug text-gray-900 sm:text-3xl">
              Empowering local businesses with digital tools.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              At MenuTap, we believe in democratizing technology for the hospitality industry. We equip
              restaurants, cafes, and hotels with comprehensive digital tools like dynamic QR menus,
              integrated POS systems, and unified order management.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              By streamlining operations and increasing digital visibility, we help our partners focus
              on what they do best: delivering exceptional culinary and hospitality experiences to
              their guests.
            </p>
          </div>
          <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 sm:h-80">
            <Image src="/Image+Shadow.png" alt="" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* ── Stats (real data) ────────────────────────────── */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-500 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 sm:grid-cols-3 lg:px-10">
          <StatCard value={formatStat(stats.partnerBusinesses)} label="Partner Businesses" />
          <StatCard value={formatStat(stats.monthlyOrders)} label="Monthly Orders" />
          <StatCard value={formatStat(stats.cities)} label="Cities" />
        </div>
      </section>

      {/* ── Ecosystem ────────────────────────────────────── */}
      {/* <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <h2 className="text-center text-2xl font-extrabold text-gray-900">Ecosystem for Everyone</h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Calendar className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-bold text-gray-900">For Partners</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Increase your visibility and streamline operations by joining the MenuTap platform.
              Access our suite of tools designed for modern hospitality management.
            </p>
            <ul className="mt-4 space-y-1.5 text-[13px] text-gray-600">
              <li className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-orange-500" /> Unified POS &amp; Order Management
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-orange-500" /> Dynamic QR Menus &amp; Analytics
              </li>
            </ul>
            <Link
              href="/partners"
              className="mt-5 block rounded-full bg-orange-500 py-2.5 text-center text-sm font-bold text-white hover:bg-orange-600"
            >
              Join as a Partner
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Users className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-bold text-gray-900">For Customers</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Enjoy a unified discovery and ordering experience. Browse local favorites, track your
              orders in real-time, and discover new culinary experiences all in one app.
            </p>
            <ul className="mt-4 space-y-1.5 text-[13px] text-gray-600">
              <li className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-blue-500" /> Single Platform Discovery
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-blue-500" /> Seamless Ordering &amp; Tracking
              </li>
            </ul>
            <Link
              href="/Kitchens"
              className="mt-5 block rounded-full bg-blue-600 py-2.5 text-center text-sm font-bold text-white hover:bg-blue-700"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section> */}

      <Footer />
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-orange-600/40 py-6 text-center">
      <p className="text-3xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-orange-100">{label}</p>
    </div>
  );
}
