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

export default function DrinkCard({
  name,
  description,
  image,
  price,
  originalPrice,
  category,
  rating = "4.8",
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useOrder();

  const subtotal = price * quantity;
  const tax = Math.round(subtotal * 0.13);
  const total = subtotal + tax;

  return (
    <Card className="mx-auto w-full overflow-hidden rounded-2xl border-0 shadow-xl flex flex-row py-0">
      {/* Image — left side */}
      <div className="relative w-32 sm:w-40 shrink-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent to-black/10" />
        <img src={image} alt={name} className="absolute inset-0 h-full w-full object-cover" />
        {/* Rating */}
        <div className="absolute left-1.5 top-1.5 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-white text-xs font-medium">{rating}</span>
        </div>
        {/* Category */}
        <div className="absolute left-1.5 bottom-1.5 z-20 bg-orange-500 text-white text-xs font-semibold rounded-full px-2.5 py-0.5">
          {category}
        </div>
      </div>

      {/* Content — right side */}
      <div className="flex flex-col flex-1 px-3 py-3 justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-gray-900">{name}</h2>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-0.5">{description}</p>
        </div>

        <CardFooter className="p-0 mt-2 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 line-through">Rs. {originalPrice * quantity}</span>
            <span className="text-base sm:text-lg font-bold text-gray-900">Rs. {total}</span>
            <span className="text-xs text-emerald-600 font-medium">Save Rs. {(originalPrice - price) * quantity}</span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2 py-0.5">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="text-gray-500 hover:text-orange-500 font-bold text-base leading-none transition">−</button>
              <span className="text-xs font-semibold w-4 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="text-gray-500 hover:text-orange-500 font-bold text-base leading-none transition">+</button>
            </div>
            <Button
              onClick={() => addItem({ name, price, quantity })}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-1.5 text-xs font-semibold shadow-md shadow-orange-200 transition"
            >
              Order
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
