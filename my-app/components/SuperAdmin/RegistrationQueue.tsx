"use client";

import { Eye, Check } from "lucide-react";

const businesses = [
  {
    initials: "UM",
    name: "Urban Morsels",
    id: "#REG-8821",
    type: "Fine Dining",
    location: "Chicago, IL",
    status: "Pending Review",
    color: "orange",
  },
  {
    initials: "LB",
    name: "Le Bistro Parisian",
    id: "#REG-8819",
    type: "Cafe",
    location: "Austin, TX",
    status: "Verifying Info",
    color: "blue",
  },
  {
    initials: "GK",
    name: "Green Kitchen Co.",
    id: "#REG-8815",
    type: "Cloud Kitchen",
    location: "Denver, CO",
    status: "Pending Review",
    color: "orange",
  },
];

export default function RegistrationQueue() {
  return (
    <div className="h-full rounded-2xl border border-[#E8C7B4] bg-white overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-2xl font-semibold">
          Business Registration Queue
        </h2>

        <button className="text-xs font-semibold tracking-[0.2em] text-[#0A5C8D]">
          VIEW ALL
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 bg-[#F6F4F2] px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
        <p>Business Name</p>
        <p>Type</p>
        <p>Location</p>
        <p>Status</p>
        <p className="text-center">Actions</p>
      </div>

      {/* Rows */}
      {businesses.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-5 items-center px-6 py-5 border-t border-[#F2DDD2]"
        >
          {/* Business */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center font-semibold text-xs">
              {item.initials}
            </div>

            <div>
              <p className="font-medium leading-5">
                {item.name}
              </p>

              <p className="text-sm text-gray-500">
                ID: {item.id}
              </p>
            </div>
          </div>

          {/* Type */}
          <p className="text-sm">{item.type}</p>

          {/* Location */}
          <p className="text-sm">{item.location}</p>

          {/* Status */}
          <div>
            <span
              className={`px-4 py-2 rounded-full text-xs font-semibold ${
                item.color === "orange"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {item.status}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-2">
            <button className="h-10 w-10 rounded-lg border border-[#E8C7B4] flex items-center justify-center">
              <Eye size={18} />
            </button>

            <button className="h-10 w-10 rounded-lg bg-[#0A5C8D] text-white flex items-center justify-center">
              <Check size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}