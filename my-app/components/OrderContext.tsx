"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import type { StaticImageData } from "next/image";

export type OrderItem = {
  name: string;
  category: string;
  image: string | StaticImageData;
  description?: string;
  price: number;
  originalPrice: number;
  quantity: number;
};

type NewOrderItem = Omit<OrderItem, "quantity">;

type OrderContextType = {
  items: OrderItem[];
  addItem: (item: NewOrderItem) => void;
  removeItem: (name: string, category: string) => void;
  incrementQty: (name: string, category: string) => void;
  decrementQty: (name: string, category: string) => void;
  clearOrder: () => void;
  totalItems: number;
  totalPrice: number;
  totalSavings: number;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Items are matched on name + category, since the same dish name can appear
// under different categories (e.g. "Chicken Chowmein" in both Starters and Main Course).
const sameItem = (a: { name: string; category: string }, b: { name: string; category: string }) =>
  a.name === b.name && a.category === b.category;

export function OrderProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);

  const addItem = (item: NewOrderItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameItem(i, item));
      if (existing) {
        return prev.map((i) => (sameItem(i, item) ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (name: string, category: string) => {
    setItems((prev) => prev.filter((i) => !sameItem(i, { name, category })));
  };

  const incrementQty = (name: string, category: string) => {
    setItems((prev) =>
      prev.map((i) => (sameItem(i, { name, category }) ? { ...i, quantity: i.quantity + 1 } : i))
    );
  };

  const decrementQty = (name: string, category: string) => {
    setItems((prev) =>
      prev
        .map((i) => (sameItem(i, { name, category }) ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const clearOrder = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalSavings = items.reduce((sum, i) => sum + (i.originalPrice - i.price) * i.quantity, 0);

  return (
    <OrderContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        incrementQty,
        decrementQty,
        clearOrder,
        totalItems,
        totalPrice,
        totalSavings,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error("useOrder must be used within an <OrderProvider>");
  }
  return ctx;
}