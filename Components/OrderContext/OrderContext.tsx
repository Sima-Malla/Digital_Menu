"use client";
import { createContext, useContext, useState } from "react";

export type OrderItem = { name: string; price: number; quantity: number };

type OrderContextType = {
  items: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (name: string) => void;
  clearAll: () => void;
};

const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);

  const addItem = (item: OrderItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (name: string) =>
    setItems((prev) => prev.filter((i) => i.name !== name));

  const clearAll = () => setItems([]);

  return (
    <OrderContext.Provider value={{ items, addItem, removeItem, clearAll }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
