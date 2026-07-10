"use client";
import Image from "next/image";
import { UtensilsCrossed, Globe, Lightbulb, Leaf, ShieldCheck, Check } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/* ─── Stats bar ───────────────────────────────────────── */
const stats = [
  { value: "500+", label: "Partner Restaurants" },
  { value: "50k+", label: "Items Served (Digital Menu)" },
  { value: "1M+", label: "Happy Diners" },
];

/* ─── Core values ─────────────────────────────────────── */
const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    desc: "We never stop pushing the boundaries of what's possible in food-tech and digital dining.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    desc: "A commitment to paperless menus and carbon-conscious logistics that reduce our carbon footprint.",
  },
  {
    icon: ShieldCheck,
    title: "Quality",
    desc: "From the code we write to the meals we deliver, quality and reliability are applied non-negotiable.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Nav />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-4">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          {/* Text */}
          <div className="flex-1">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-orange-500">
              Our Mission
            </p>
            <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              Bridging the gap between world-class kitchens and diners.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              We believe that high-end culinary experiences shouldn't be limited by logistics.
              GourmetHub leverages state-of-the-art AI to streamline the connection between artisanal
              restaurants and discerning diners.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              By removing the friction of traditional ordering and delivery, we allow chefs to focus on
              their craft while diners enjoy effortless discovery and seamless service, anywhere they are.
            </p>
          </div>

          {/* Image */}
          <div className="relative h-56 w-full overflow-hidden rounded-2xl lg:h-64 lg:w-96 lg:shrink-0">
            <Image
              src="/vegmomo.jpg"
              alt="Chef at work"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <section className="w-full bg-orange-500 py-8">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4 px-3 sm:px-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[11px] text-orange-100 sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ecosystem ────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-4">
        <h2 className="mb-6 text-center text-xl font-bold text-gray-900 sm:text-2xl">
          Ecosystem for Everyone
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* For Restaurants */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-gray-900">For Restaurants</h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Maximize kitchen efficiency with our AI-driven management suite. From QR code dynamic menus
              to real-time inventory tracking, we provide the tools to run a future-proof establishment.
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {["AI Revenue Pricing & Availability", "Interactive Digital Table Management"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                  <Check className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="mt-5 w-full rounded-full bg-orange-800 py-2.5 text-xs font-bold text-white transition hover:bg-orange-900">
              Explore Admin Solutions
            </button>
          </div>

          {/* For Diners */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-500">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-gray-900">For Diners</h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Discover your next favorite meal with personalized recommendations. Experience fast logistics
              where your order arrives exactly when and how you want it.
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {["Personalized Your Palate", "Real-Time Marketplace Tracking"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                  <Check className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="mt-5 w-full rounded-full bg-blue-600 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700">
              Start Discovering
            </button>
          </div>
        </div>
      </section>

      {/* ── Core Values ──────────────────────────────────── */}
      <section className="mx-auto w-full max-w-5xl px-3 pb-10 sm:px-4">
        <h2 className="mb-2 text-center text-xl font-bold text-gray-900 sm:text-2xl">
          Guided by Our Core Values
        </h2>
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-orange-500" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-gray-900">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="w-full bg-neutral-800 py-12">
        <div className="mx-auto max-w-5xl px-3 sm:px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-white sm:text-3xl">
            Ready to flow with us?
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Partner */}
            <div className="rounded-2xl bg-neutral-700 p-6">
              <h3 className="text-base font-bold text-white">Partner with Us</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Elevate your restaurant with the world's most advanced digital menu system.
              </p>
              <button className="mt-5 rounded-full bg-orange-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600">
                Become a Partner
              </button>
            </div>

            {/* Download */}
            <div className="rounded-2xl bg-neutral-700 p-6">
              <h3 className="text-base font-bold text-white">Download the App</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Unlock premium dining experiences delivered with GourmetHub.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-900 transition hover:bg-gray-100">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  App Store
                </button>
                <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-900 transition hover:bg-gray-100">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.76c.3.17.64.22.99.14l12.12-6.99-2.54-2.54-10.57 9.39zm-1.1-20.1a1.5 1.5 0 0 0-.08.5v15.68c0 .18.03.35.08.5l.07.07 8.78-8.78v-.2L2.15 3.59l-.07.07zm18.4 8.56-2.5-1.44-2.85 2.85 2.85 2.85 2.52-1.45c.72-.41.72-1.39-.02-1.81zm-17.3 9.54 10.57-9.39-2.54-2.54-8.03 4.63v7.3z" />
                  </svg>
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
