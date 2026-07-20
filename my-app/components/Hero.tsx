import Image from "next/image";
import { Search, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[660px] min-h-[660px] overflow-hidden">
      <Image
        src="/banner.png"
        alt="Restaurant"
        fill
        priority
        className="object-cover"
      />
      {/* Gradient overlay — darker at edges/bottom for text contrast, lighter center */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />

      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <span className="mb-8 inline-block tracking-[0.45em] uppercase text-sm font-medium text-[#D4AF37]">
            Fine Dining Experience
          </span>

          <h1 className="text-6xl font-light leading-[1.05] tracking-tight text-white md:text-8xl">
            Crafted With
            <br />
            <span className="font-semibold italic text-[#D4AF37]">
              Passion
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/80">
            Every dish is prepared with seasonal ingredients,
            authentic flavors, and exceptional attention to detail.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-600" />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines..."
                  className="w-full rounded-full bg-white py-4 pl-12 pr-4 text-neutral-900 placeholder-neutral-600 shadow-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-600" />
                <input
                  type="text"
                  placeholder="Your location..."
                  className="w-full rounded-full bg-white py-4 pl-12 pr-4 text-neutral-900 placeholder-neutral-600 shadow-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <button className="rounded-full bg-[#D4AF37] px-9 py-4 uppercase tracking-widest text-sm font-semibold text-black shadow-lg shadow-black/30 transition hover:bg-[#c19d2e] hover:shadow-xl hover:-translate-y-0.5">
              Explore Menu
            </button>
            <button className="rounded-full border border-white/70 px-9 py-4 uppercase tracking-widest text-sm font-medium text-white transition hover:border-[#D4AF37] hover:text-[#D4AF37] hover:-translate-y-0.5">
              Reserve Table →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}