"use client";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useOrder } from "@/components/OrderContext";

type CardsProps = {
  name: string;
  description: string;
  image: string | StaticImageData;
  price: number;
  originalPrice: number;
  rating?: string;
  category: string;
};

export default function Cards({ name, description, image, price, originalPrice, rating, category }: CardsProps) {
  const { items, addItem, incrementQty, decrementQty } = useOrder();
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const cartItem = items.find((i) => i.name === name && i.category === category);
  const safeImage = image || "/placeholder.jpg";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={safeImage}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
            -{discount}%
          </span>
        )}
        {rating && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-gray-800 shadow">
            ⭐ {rating}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{description}</p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">Rs. {price}</span>
          {originalPrice > price && (
            <span className="text-sm text-gray-400 line-through">Rs. {originalPrice}</span>
          )}
        </div>

        <div className="mt-3">
          {!cartItem ? (
            <button
              onClick={() => addItem({ name, description, image, price, originalPrice, category })}
              className="w-full rounded-full bg-orange-500 py-1.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Add to order
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-full border border-orange-200 bg-orange-50 px-2 py-1">
              <button
                onClick={() => decrementQty(name, category)}
                aria-label={`Decrease ${name} quantity`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm hover:bg-orange-100"
              >
                −
              </button>
              <span className="text-sm font-semibold text-gray-800">{cartItem.quantity}</span>
              <button
                onClick={() => incrementQty(name, category)}
                aria-label={`Increase ${name} quantity`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm hover:bg-orange-100"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}