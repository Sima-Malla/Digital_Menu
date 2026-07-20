import {
  ShoppingBag,
  DollarSign,
  Store,
  AlertTriangle,
} from "lucide-react";

const stats = [
  {
    title: "Total Orders",
    value: "12,845",
    change: "+12.5%",
    icon: ShoppingBag,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Gross Revenue",
    value: "$184,520",
    change: "+8.2%",
    icon: DollarSign,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Active Businesses",
    value: "248",
    change: "+15",
    icon: Store,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Pending Issues",
    value: "18",
    change: "-4",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {item.value}
                </h2>

                <p className="mt-3 text-sm font-medium text-green-600">
                  {item.change} this month
                </p>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${item.color}`}
              >
                <Icon size={28} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}