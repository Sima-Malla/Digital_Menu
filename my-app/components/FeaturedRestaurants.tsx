"use client";

import Image from "next/image";
import { Star } from "lucide-react";

type Restaurant = {
  name: string;
  rating: number;
  cuisine: string;
  time: string;
  distance: string;
  price: "$" | "$$" | "$$$";
  tags: string[];
  image: string;
};

const restaurants: Restaurant[] = [
  {
    name: "L'Essence Moderne",
    rating: 4.9,
    cuisine: "French Fusion",
    time: "20-35 min",
    distance: "2.4 miles",
    price: "$$$",
    tags: ["Michelin Guide", "Free Delivery"],
    image:
      "/vegmomo.jpg",
  },
  {
    name: "Azure Coastal Eats",
    rating: 4.7,
    cuisine: "Mediterranean",
    time: "15-25 min",
    distance: "1.1 miles",
    price: "$$",
    tags: ["Popular Nearby", "Healthy Choice"],
    image:
      "/vegmomo.jpg",
  },
  {
    name: "The Burger Atelier",
    rating: 4.8,
    cuisine: "Craft Burgers",
    time: "25-40 min",
    distance: "3.6 miles",
    price: "$$",
    tags: ["Award Winning", "Flame Grilled"],
    image:
      "/vegmomo.jpg",
  },
];

export default function FeaturedRestaurants() {
  return (
    <section className="w-full bg-neutral-50 py-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
          Featured Restaurants
        </h2>
        <p className="mt-1 max-w-md text-sm text-neutral-500">
          Hand-picked selections based on quality, consistency, and culinary
          innovation.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {restaurants.map((r) => (
            <RestaurantCard key={r.name} restaurant={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100 transition-shadow hover:shadow-md">
      <div className="relative h-40 w-full">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          sizes="(max-width: 640px) 100vw, 400px"
          className="object-cover"
        />
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-neutral-800 shadow">
          <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
          {restaurant.rating}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">{restaurant.name}</h3>
          <span className="text-sm text-orange-500">{restaurant.price}</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {restaurant.cuisine} &middot; {restaurant.time} &middot;{" "}
          {restaurant.distance}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {restaurant.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <button className="mt-4 w-full rounded-full border border-orange-500 py-2 text-sm font-semibold text-orange-500 transition-colors hover:bg-orange-500 hover:text-white">
          Order Now
        </button>
      </div>
    </div>
  );
}