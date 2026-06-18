"use client";
import { useOrder } from "@/Components/OrderContext/OrderContext";
import { Button } from "@/Components/ui/button";

export default function OrderSummary() {
  const { items, removeItem, clearAll } = useOrder();
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-8">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Your Order</h2>
      <p className="text-xs text-gray-400 mb-4">Select items to order</p>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No items added yet.</p>
      ) : (
        <>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                <th className="text-left py-1 w-6">SN.</th>
                <th className="text-left py-1">Particulars</th>
                <th className="text-right py-1">Qty</th>
                <th className="text-right py-1">Amt</th>
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.name} className="border-b last:border-0">
                  <td className="py-2 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="py-2 text-gray-700 font-medium">{item.name}</td>
                  <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-800 font-semibold">{item.price * item.quantity}</td>
                  <td className="py-2 pl-2">
                    <button
                      onClick={() => removeItem(item.name)}
                      className="text-xs border border-orange-400 text-orange-500 rounded px-1.5 py-0.5 hover:bg-orange-50 transition"
                    >
                      -1
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between mb-4 pt-1">
            <span className="text-sm text-gray-500 font-medium">Final Amount:</span>
            <span className="text-lg font-bold text-gray-900">Rs.{total}</span>
          </div>

          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl py-2 mb-2 shadow-md shadow-orange-100">
            Complete Order
          </Button>
          <button
            onClick={clearAll}
            className="w-full text-sm text-orange-500 font-semibold hover:underline"
          >
            Reset All
          </button>
        </>
      )}
    </div>
  );
}
