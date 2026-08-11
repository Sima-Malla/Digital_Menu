// lib/orders.ts

export type OrderTag = "PICKUP" | "DELIVERY" | "KITCHEN";
export type OrderStatus = "new" | "preparing" | "ready" | "delayed" | "completed";

export interface OrderItem {
  name: string;
  price?: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  tag: OrderTag;
  meta: string;
  items: OrderItem[];
  heading?: string;      // e.g. "Mesa 4 - VIP"
  customer?: string;     // ready-column
  note?: string;         // ready-column
  issue?: string;        // delayed-column
  createdAt: number;
}

// --- Mock "database" (module-level array). ---
// NOTE: this resets whenever the server process restarts, and in a
// serverless deployment (Vercel etc.) each instance may have its own copy.
// Swap this file's read/write functions for real DB calls (Prisma, etc.)
// when you're ready — the actions.ts API below won't need to change.
let orders: Order[] = [
  {
    id: "#ORD-2849",
    status: "new",
    tag: "PICKUP",
    meta: "2 mins ago",
    items: [
      { name: "2x Truffle Risotto", price: "$48.00" },
      { name: "1x Wagyu Slider Box", price: "$32.00" },
    ],
    createdAt: Date.now(),
  },
  {
    id: "#ORD-2850",
    status: "new",
    tag: "DELIVERY",
    meta: "Just now",
    items: [{ name: "1x Signature Platter", price: "$65.00" }],
    createdAt: Date.now(),
  },
  {
    id: "#ORD-2845",
    status: "preparing",
    tag: "KITCHEN",
    meta: "In kitchen: 12 mins",
    heading: "Mesa 4 - VIP",
    items: [{ name: "3x Lobster Thermidor (No Parsley)" }],
    createdAt: Date.now(),
  },
  {
    id: "#ORD-2842",
    status: "preparing",
    tag: "PICKUP",
    meta: "In kitchen: 18 mins",
    items: [{ name: "1x Vegan Power Bowl" }],
    createdAt: Date.now(),
  },
  {
    id: "#ORD-2839",
    status: "ready",
    tag: "PICKUP",
    meta: "Ready for 5 mins",
    customer: "Johnathan Doe",
    note: "Courier arriving in 2m",
    items: [],
    createdAt: Date.now(),
  },
  {
    id: "#ORD-2830",
    status: "delayed",
    tag: "KITCHEN",
    meta: "Delayed 12m",
    issue: "Issue: Seafood prep backlog",
    items: [{ name: "12x Mixed Oyster Plate" }],
    createdAt: Date.now(),
  },
];

export function getOrders(): Order[] {
  return orders;
}

export function getOrdersByStatus(status: OrderStatus): Order[] {
  return orders.filter((o) => o.status === status);
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  return order;
}

export function removeOrder(id: string): void {
  orders = orders.filter((o) => o.id !== id);
}

export function findOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}