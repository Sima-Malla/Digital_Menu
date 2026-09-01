"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Heart, Trash2, MapPin, Coffee, Utensils, Hotel, ArrowRight, Store } from "lucide-react";
import type { PublicBusinessListing } from "@/lib/queries/businesses";

export type SavedPlace = PublicBusinessListing;

export default function SavedRoomsDrawer({
  isOpen,
  onClose,
  savedBusinesses = [],
  onRemovePlace,
}: {
  isOpen: boolean;
  onClose: () => void;
  savedBusinesses?: PublicBusinessListing[];
  onRemovePlace?: (id: string) => void;
}) {
  if (!isOpen) return null;

  const getCategoryBadgeClass = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes("cafe") || lower.includes("bakery")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    if (lower.includes("hotel") || lower.includes("room") || lower.includes("resort")) {
      return "bg-indigo-50 text-indigo-800 border-indigo-200";
    }
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  };

  const getCategoryIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes("cafe") || lower.includes("bakery")) {
      return <Coffee className="h-3 w-3" />;
    }
    if (lower.includes("hotel") || lower.includes("room") || lower.includes("resort")) {
      return <Hotel className="h-3 w-3" />;
    }
    return <Utensils className="h-3 w-3" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-[#FAFAFA] px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-neutral-900">
                Saved Businesses
              </h2>
              <p className="text-xs text-neutral-500">
                {savedBusinesses.length} favorite{savedBusinesses.length === 1 ? "" : "s"} saved
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {savedBusinesses.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-400 mb-4">
                <Heart className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-base font-bold text-neutral-800">
                No Saved Businesses Yet
              </h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-xs leading-relaxed">
                Click the heart icon on any restaurant, cafe, or hotel card to save your favorite businesses for quick access!
              </p>
              <Link
                href="/Kitchens"
                onClick={onClose}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition"
              >
                Explore Businesses <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            savedBusinesses.map((b) => (
              <div
                key={b.id}
                className="group relative flex gap-4 rounded-xl border border-neutral-100 bg-neutral-50/80 p-3.5 shadow-sm transition hover:border-orange-200 hover:bg-white hover:shadow-md"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-200">
                  <Image
                    src={b.imageUrl || "/hotel.png"}
                    alt={b.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-neutral-900 line-clamp-1">
                        {b.name}
                      </h4>
                      {onRemovePlace && (
                        <button
                          onClick={() => onRemovePlace(b.id)}
                          className="text-neutral-400 hover:text-red-500 transition p-0.5"
                          title="Remove from saved"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${getCategoryBadgeClass(b.type)}`}>
                        {getCategoryIcon(b.type)}
                        {b.type}
                      </span>
                    </div>

                    {b.address && (
                      <p className="mt-1.5 text-[11px] text-neutral-500 truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0 text-neutral-400" />
                        {b.address}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-end pt-2 border-t border-neutral-100">
                    <Link
                      href={`/Menu/${b.id}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-orange-600 transition"
                    >
                      View Menu <Store className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {savedBusinesses.length > 0 && (
          <div className="border-t border-neutral-100 bg-[#FAFAFA] p-4 text-center">
            <Link
              href="/Kitchens"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-neutral-800 transition"
            >
              Explore All Businesses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
