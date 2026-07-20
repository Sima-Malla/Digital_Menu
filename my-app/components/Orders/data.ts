export const orders = [
  { id: "#ORD-1001", restaurant: "Bistro Central", customer: "John Smith", type: "Dine In", amount: "$45.00", status: "Completed", time: "10:15 AM" },
  { id: "#ORD-1002", restaurant: "Pizza House", customer: "Emma Wilson", type: "Delivery", amount: "$28.50", status: "Preparing", time: "10:22 AM" },
  { id: "#ORD-1003", restaurant: "Burger Point", customer: "David Lee", type: "Take Away", amount: "$19.99", status: "Pending", time: "10:30 AM" },
  { id: "#ORD-1004", restaurant: "Food Hub", customer: "Sophia Brown", type: "Delivery", amount: "$62.80", status: "Cancelled", time: "10:40 AM" },
  { id: "#ORD-1005", restaurant: "Bistro Central", customer: "Michael Scott", type: "Dine In", amount: "$88.40", status: "Completed", time: "11:00 AM" },
  { id: "#ORD-1006", restaurant: "Pizza House", customer: "Sarah Parker", type: "Delivery", amount: "$37.20", status: "Preparing", time: "11:08 AM" },
  { id: "#ORD-1007", restaurant: "Burger Point", customer: "Daniel Kim", type: "Take Away", amount: "$24.90", status: "Pending", time: "11:16 AM" },
  { id: "#ORD-1008", restaurant: "Food Hub", customer: "Olivia Martin", type: "Delivery", amount: "$72.10", status: "Completed", time: "11:35 AM" },
];

export type Order = typeof orders[0];
