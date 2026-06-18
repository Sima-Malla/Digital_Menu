"use client";
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardFooter } from "@/Components/ui/card";
import { useOrder } from "@/Components/OrderContext/OrderContext";

type Props = {
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  category: string;
  rating?: string;
};

export default function Cards({
  name,
  description,
  image,
  price,
  originalPrice,
  category,
  rating = "4.9",
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useOrder();

  return (
    <Card className="mx-auto w-full max-w-xs sm:max-w-sm overflow-hidden rounded-2xl border-0 shadow-xl pt-0">
      {/* Image */}
      <div className="relative h-36 sm:h-48 w-full">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <img src={image} alt={name} className="absolute inset-0 h-full w-full object-cover" />
        {/* Category */}
        <div className="absolute left-2 top-2 z-20 bg-orange-500 text-white text-xs font-semibold rounded-full px-2.5 py-0.5">
          {category}
        </div>
        {/* Rating */}
        <div className="absolute right-2 top-2 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-white text-xs font-medium">{rating}</span>
        </div>
        {/* Title */}
        <div className="absolute bottom-2 left-2 z-20">
          <h2 className="text-white text-sm sm:text-lg font-bold drop-shadow">{name}</h2>
        </div>
      </div>

      {/* Description */}
      <div className="px-3 sm:px-4 pt-2 pb-1">
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">{description}</p>
      </div>

      {/* Price + Order */}
      <CardFooter className="px-3 sm:px-4 pt-2 pb-3 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 line-through">Rs. {originalPrice}</span>
          <span className="text-lg sm:text-2xl font-bold text-gray-900">Rs. {price}</span>
          <span className="text-xs text-emerald-600 font-medium">Save Rs. {originalPrice - price}</span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-2 py-0.5">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="text-gray-500 hover:text-orange-500 font-bold text-base leading-none transition">−</button>
            <span className="text-xs font-semibold w-4 text-center">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="text-gray-500 hover:text-orange-500 font-bold text-base leading-none transition">+</button>
          </div>
          <Button
            onClick={() => addItem({ name, price, quantity })}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-1.5 text-xs sm:text-sm font-semibold shadow-md shadow-orange-200 transition"
          >
            Order
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
