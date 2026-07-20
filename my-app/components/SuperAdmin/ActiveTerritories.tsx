"use client";

export default function ActiveTerritories() {
  return (
    <div className="h-full rounded-2xl border border-[#E8C7B4] bg-white p-6 flex flex-col">
      <h2 className="text-2xl font-semibold mb-5">
        Active Territories
      </h2>

      {/* Map Placeholder */}
      <div className="relative h-64 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 overflow-hidden">
        {/* Pins */}
        <div className="absolute top-8 left-16 h-4 w-4 rounded-full bg-[#B54A00] border-2 border-white shadow" />
        <div className="absolute top-20 right-16 h-4 w-4 rounded-full bg-[#B54A00] border-2 border-white shadow" />
        <div className="absolute bottom-12 left-1/2 h-4 w-4 rounded-full bg-[#B54A00] border-2 border-white shadow" />
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-[#B54A00]" />
            <span>New York Metro</span>
          </div>

          <span className="font-mono text-sm">
            142 Units
          </span>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-[#0A5C8D]" />
            <span>California Coast</span>
          </div>

          <span className="font-mono text-sm">
            98 Units
          </span>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            <span>Texas Triangle</span>
          </div>

          <span className="font-mono text-sm">
            74 Units
          </span>
        </div>
      </div>
    </div>
  );
}