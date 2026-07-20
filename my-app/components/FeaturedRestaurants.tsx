"use client";

import Image from "next/image";
import { Star, Clock, MapPin, ChefHat } from "lucide-react";

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
      "/Overlay.png",
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
      "/Overlay.png",
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
      "/Overlay.png",
  },
];

export default function FeaturedRestaurants() {
  return (
    <section className="w-full bg-gradient-to-b from-neutral-50 to-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="mb-8">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-orange-500">
            <ChefHat className="h-4 w-4" />
            CURATED SELECTION
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
            Featured Fine Dining
          </h2>
          <p className="mt-2 text-neutral-600">
            Hand-picked selections based on quality, consistency, and culinary
            innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
    <div className="group overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-neutral-100 transition-all hover:shadow-xl hover:ring-orange-500/20">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          sizes="(max-width: 640px) 100vw, 400px"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
          <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
          <span className="text-sm font-bold text-neutral-900">
            {restaurant.rating}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 line-clamp-1">
              {restaurant.name}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-600">
              {restaurant.cuisine}
            </p>
          </div>
          <span className="flex-shrink-0 text-lg font-bold text-orange-500">
            {restaurant.price}
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{restaurant.time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{restaurant.distance}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {restaurant.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600 ring-1 ring-orange-200"
            >
              {tag}
            </span>
          ))}
        </div>

        <button className="mt-4 w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-md">
          View Menu
        </button>
      </div>
    </div>
  );
}