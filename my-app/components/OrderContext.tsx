"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { checkoutAction, type CheckoutState } from "@/app/actions/orders";

export type CartItem = {
  menuItemId: string;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
};

type CheckoutDetails = {
  orderType: "dine-in" | "pickup" | "delivery";
  locationLabel?: string;
  isWalkIn?: boolean;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
};

type OrderContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  incrementQty: (menuItemId: string) => void;
  decrementQty: (menuItemId: string) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  businessId: string;
  checkout: (details: CheckoutDetails) => Promise<CheckoutState>;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({
  businessId,
  children,
}: {
  businessId: string;
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const incrementQty = (menuItemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i))
    );
  };

  const decrementQty = (menuItemId: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  const checkout = async (details: CheckoutDetails) => {
    const result = await checkoutAction({
      businessId,
      orderType: details.orderType,
      locationLabel: details.locationLabel || "",
      isWalkIn: details.isWalkIn ?? false,
      customerName: details.customerName,
      customerPhone: details.customerPhone,
      customerEmail: details.customerEmail || "",
      items: items.map((i) => ({
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        notes: undefined,
      })),
    });

    if (result.success) {
      clearCart();
    }

    return result;
  };

  return (
    <OrderContext.Provider
      value={{
        items,
        addItem,
        incrementQty,
        decrementQty,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
        businessId,
        checkout,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside an OrderProvider.");
  return ctx;
}