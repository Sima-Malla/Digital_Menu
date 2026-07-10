"use client";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useOrder } from "@/components/OrderContext";

type DrinkCardProps = {
  name: string;
  description: string;
  image: string | StaticImageData;
  price: number;
  originalPrice: number;
  rating?: string;
  category: string;
};

export default function DrinkCard({ name, description, image, price, originalPrice, rating, category }: DrinkCardProps) {
  const { items, addItem, incrementQty, decrementQty } = useOrder();
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const cartItem = items.find((i) => i.name === name && i.category === category);

  return (
    <div className="group flex gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-28">
        <Image
          src={image}
          alt={name}
          fill
          sizes="112px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-1 top-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">{name}</h3>
          {rating && <span className="shrink-0 text-xs font-semibold text-gray-500">⭐ {rating}</span>}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 sm:text-sm">{description}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-gray-900 sm:text-base">Rs. {price}</span>
            {originalPrice > price && (
              <span className="text-xs text-gray-400 line-through">Rs. {originalPrice}</span>
            )}
          </div>

          {!cartItem ? (
            <button
              onClick={() => addItem({ name, description, image, price, originalPrice, category })}
              className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-orange-600 sm:text-sm"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-1.5 py-1">
              <button
                onClick={() => decrementQty(name, category)}
                aria-label={`Decrease ${name} quantity`}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm hover:bg-orange-100"
              >
                −
              </button>
              <span className="text-xs font-semibold text-gray-800">{cartItem.quantity}</span>
              <button
                onClick={() => incrementQty(name, category)}
                aria-label={`Increase ${name} quantity`}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm hover:bg-orange-100"
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