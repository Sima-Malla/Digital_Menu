"use client";

import Image from "next/image";
import { Wine, Users, Clock } from "lucide-react";

export default function InRoomDining() {
  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center">
            <p className="mb-2 text-xs font-semibold tracking-wide text-orange-500">
              GOURMET AT YOUR DOOR
            </p>
            <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
              In-Room Dining: The Chef's Table Experience
            </h2>

            <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
              Why leave your sanctuary? We bring the city's most celebrated kitchens to you.
              From white-glove table setup to curated wine pairings, enjoy a full restaurant
              experience without the commute.
            </p>

            {/* Features */}
            <div className="mt-8 space-y-6">
              {/* Feature 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Wine className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                    <span className="text-sm font-bold text-orange-500">SILVERWARE</span>
                    White-Glove Setup
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    Professional table setting and course-by-course service in your suite.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Users className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Sommelier Selection</h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    Expertly paired vintages delivered at the perfect temperature.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Timed Delivery</h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    Each course arrives perfectly synchronized for an seamless experience.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition-all hover:bg-orange-700 hover:shadow-lg">
                Order In-Room Now
              </button>
              <button className="rounded-lg border border-neutral-300 px-6 py-3 font-semibold text-neutral-900 transition-all hover:border-orange-500 hover:text-orange-500">
                View Premium Menus
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full h-80 sm:h-96 lg:h-full overflow-hidden rounded-2xl min-h-[320px]">
            {/* Container Background */}
            <Image
              src="/container.png"
              alt="Dining Container"
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              className="object-cover"
              priority
            />

            {/* Hotel Image */}
            <Image
              src="/hotel1.png"
              alt="Hotel Dining Room"
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              className="absolute inset-0 object-cover"
            />

            {/* Overlay for premium effect */}
            <Image
              src="/hotel1.png"
              alt="Premium Overlay"
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              className="absolute inset-0 object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
