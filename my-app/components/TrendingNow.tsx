"use client";

import Image from "next/image";
import { Star, Clock, MapPin } from "lucide-react";

type TrendingItem = {
  name: string;
  cuisine: string;
  rating: number;
  time: string;
  distance: string;
  image: string;
  tag?: string;
};

const trendingItems: TrendingItem[] = [
  {
    name: "The Momo Heritage",
    cuisine: "Traditional Nepali",
    rating: 4.9,
    time: "10-15 min",
    distance: "0.8 km",
    image: "/Container.png",
    tag: "Most Popular",
  },
  {
    name: "Spice Garden",
    cuisine: "Modern Indian",
    rating: 4.8,
    time: "15-25 min",
    distance: "1.2 km",
   image: "/Container.png",
    tag: "Trending",
  },
  {
    name: "Coastal Delights",
    cuisine: "Seafood & More",
    rating: 4.7,
    time: "20-30 min",
    distance: "1.5 km",
    image: "/Container.png",
  },
  {
    name: "Flame & Fork",
    cuisine: "BBQ & Grill",
    rating: 4.8,
    time: "15-20 min",
    distance: "0.9 km",
   image: "/Container.png",
    tag: "Chef's Pick",
  },
];

export default function TrendingNow() {
  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold tracking-wide text-orange-500">
            RIGHT NOW
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
            Trending Near You
          </h2>
          <p className="mt-2 text-neutral-600">
            Discover what's hot and trending in your neighborhood
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trendingItems.map((item) => (
            <TrendingCard key={item.name} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrendingCard({ item }: { item: TrendingItem }) {
  return (
    <div className="group overflow-hidden rounded-xl bg-neutral-50 transition-all hover:shadow-lg hover:ring-1 hover:ring-orange-500/20">
      <div className="relative h-32 w-full overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, 200px"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {item.tag && (
          <div className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
            {item.tag}
          </div>
        )}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-white px-2 py-1 shadow-md">
          <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
          <span className="text-xs font-semibold text-neutral-900">
            {item.rating}
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-neutral-900 line-clamp-1">
          {item.name}
        </h3>
        <p className="mt-0.5 text-xs text-neutral-600">{item.cuisine}</p>

        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>{item.time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span>{item.distance}</span>
          </div>
        </div>

        <button className="mt-3 w-full rounded-lg bg-orange-500 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600">
          View Menu
        </button>
      </div>
    </div>
  );
}
