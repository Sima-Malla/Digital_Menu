"use client";

import { Headset, Leaf } from "lucide-react";

export default function SupportAndEcoSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-3 pb-10 sm:px-4">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Instant Support */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Headset className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-neutral-900">
            Instant Support
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Need help? Our support team is available right from your table
            via live chat or phone, no waving down a server required.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button className="flex-1 rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-500 transition-colors hover:bg-orange-500 hover:text-white">
              Call Us
            </button>
            <button className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-100">
              Chat with Us
            </button>
          </div>
        </div>

        {/* Eco-Friendly Dining */}
        <div className="flex flex-col justify-center overflow-hidden rounded-2xl bg-neutral-100 p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-neutral-900">
            Eco-Friendly Dining
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            By eliminating printed menus and paper receipts, we&rsquo;re
            doing our part to reduce waste, one table at a time.
          </p>
        </div>
      </div>
    </section>
  );
}