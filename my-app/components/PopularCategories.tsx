"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

type Category = {
  name: string;
  meta: string;
  image: string;
};

const categories: Category[] = [
  {
    name: "Sushi",
    meta: "24 Premium Spots",
    image:
      "/vegmomo.jpg",
  },
  {
    name: "Artisan Pizza",
    meta: "18 Authentic Pizzerias",
    image:
      "/vegmomo.jpg",
  },
  {
    name: "Fine Dining",
    meta: "Exclusive Curated Selection",
    image:
      "/vegmomo.jpg",
    // spans two columns on desktop
  },
];

export default function PopularCategories() {
  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-4">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-orange-500">
            CRAVE-WORTHY
          </p>
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Popular Categories
          </h2>
        </div>
        <button className="hidden items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 sm:flex">
          View All
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {/* First two cards take 1 column each */}
        {categories.slice(0, 2).map((cat) => (
          <CategoryCard key={cat.name} category={cat} className="sm:col-span-1" />
        ))}
        {/* Third card spans two columns */}
        <CategoryCard
          category={categories[2]}
          className="sm:col-span-2"
        />
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  className = "",
}: {
  category: Category;
  className?: string;
}) {
  return (
    <div
      className={`group relative h-44 overflow-hidden rounded-2xl ${className}`}
    >
      <Image
        src={category.image}
        alt={category.name}
        fill
        sizes="(max-width: 640px) 100vw, 400px"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
        <p className="text-sm text-white/70">{category.meta}</p>
      </div>
    </div>
  );
}