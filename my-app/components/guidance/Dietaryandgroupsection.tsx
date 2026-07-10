"use client";

import { UtensilsCrossed, Users } from "lucide-react";

const dietaryTags = ["Gluten Free", "Dairy Free", "Nut Free"];

export default function DietaryAndGroupSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-3 pb-6 sm:px-4">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Dietary Filters — wide card */}
        <div className="relative overflow-hidden rounded-2xl bg-orange-800 p-8 text-white sm:col-span-2">
          <div className="max-w-md">
            <h3 className="text-xl font-bold sm:text-2xl">
              Dietary Filters Built-in
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-orange-100">
              Never wonder &ldquo;is it gluten free?&rdquo; again. Our
              digital menu automatically flags items containing allergens,
              so you can order with confidence.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <UtensilsCrossed
            className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-white/10"
            strokeWidth={1}
          />
        </div>

        {/* Group Ordering — small card */}
        <div className="flex flex-col justify-center rounded-2xl bg-neutral-100 p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-neutral-700 shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-neutral-900">
            Group Ordering
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Order together, pay separately. Split the bill instantly with
            friends and family, no more awkward math.
          </p>
        </div>
      </div>
    </section>
  );
}