"use client";

type Category = { label: string; image: string };

const CATEGORIES: Category[] = [
  { label: "Authentic Nepali", image: "/cuisines/authentic-nepali.jpg" },
  { label: "Newari Heritage", image: "/cuisines/newari-heritage.jpg" },
  { label: "Thakali", image: "/cuisines/thakali.jpg" },
  { label: "Himalayan", image: "/cuisines/himalayan.jpg" },
  { label: "Street Momos", image: "/cuisines/street-momos.jpg" },
  { label: "Local Chiya", image: "/cuisines/local-chiya.jpg" },
  { label: "Mithai", image: "/cuisines/mithai.jpg" },
];

export default function PopularCategories() {
  return (
    <section className="bg-[#F3EAD9] px-6 py-16 lg:px-10">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B87333]">
          Pick Your Plate
        </p>
        <h2 className="mt-1.5 font-[family-name:var(--font-fraunces)] text-[28px] font-semibold text-[#2A211D] md:text-[34px]">
          Cuisines for Every Mood
        </h2>

        {/* Katori arc — each tile sits like a small bowl set around a thali,
            alternating height rather than sitting in a flat, generic row. */}
        <div className="mt-12 flex flex-wrap items-start justify-center gap-x-6 gap-y-10 sm:gap-x-8">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.label}
              className={`group flex w-20 flex-col items-center gap-3 sm:w-24 ${
                i % 2 === 0 ? "sm:translate-y-0" : "sm:translate-y-5"
              }`}
            >
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full ring-2 ring-[#B87333]/35 ring-offset-4 ring-offset-[#F3EAD9] transition group-hover:ring-[#E3A73B] sm:h-24 sm:w-24">
                <span
                  className="h-full w-full rounded-full bg-cover bg-center shadow-inner"
                  style={{ backgroundImage: `url('${c.image}')` }}
                  role="img"
                  aria-label={c.label}
                />
              </span>
              <span className="text-[12px] font-semibold text-[#2A211D]">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}