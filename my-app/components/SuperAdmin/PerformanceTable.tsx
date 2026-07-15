const chains = [
  {
    id: 1,
    name: "The Steakhouse Group",
    locations: 45,
    revenue: "$420,500",
    rating: 4.8,
    orders: 1240,
    growth: "+8.2%",
    status: "Stable",
  },
  {
    id: 2,
    name: "Sushi Zen Networks",
    locations: 28,
    revenue: "$310,200",
    rating: 4.6,
    orders: 890,
    growth: "+5.1%",
    status: "Stable",
  },
  {
    id: 3,
    name: "Rustic Pizzas Inc",
    locations: 52,
    revenue: "$295,000",
    rating: 4.2,
    orders: 2105,
    growth: "-2.4%",
    status: "Action Required",
  },
];

export default function PerformanceTable() {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 mt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Chain Performance Index
          </h2>

          <p className="text-sm text-gray-500">
            Cross-reference metrics for top restaurant groups
          </p>
        </div>

        <div className="flex gap-3">
          <button className="border rounded-lg px-4 py-2">
            Filter
          </button>

          <button className="border rounded-lg px-4 py-2">
            Last 30 Days
          </button>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b text-gray-500 text-sm">
            <th className="text-left py-3">Chain Name</th>
            <th>Total Locations</th>
            <th>Revenue</th>
            <th>Rating</th>
            <th>Orders</th>
            <th>Growth</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {chains.map((item) => (
            <tr
              key={item.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="py-4 font-medium">
                {item.name}
              </td>

              <td className="text-center">
                {item.locations}
              </td>

              <td className="text-center">
                {item.revenue}
              </td>

              <td className="text-center">
                ⭐ {item.rating}
              </td>

              <td className="text-center">
                {item.orders}
              </td>

              <td
                className={`text-center font-medium ${
                  item.growth.startsWith("+")
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {item.growth}
              </td>

              <td className="text-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    item.status === "Stable"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}