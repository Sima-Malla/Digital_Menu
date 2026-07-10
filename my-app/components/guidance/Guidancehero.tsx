"use client";

import { Play } from "lucide-react";

export default function GuidanceHero() {
  return (
    <section className="relative w-full overflow-hidden bg-neutral-50">
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_right,rgba(234,88,12,0.08),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-3 py-16 text-center sm:px-4 sm:py-20">
        <h1 className="text-3xl font-bold leading-tight text-neutral-900 sm:text-5xl">
          Seamless Dining at Your Fingertips
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-neutral-500 sm:text-base">
          Experience the future of ordering: browse, customize, and pay right
          from your table. No app download, no waiting for the server, just
          seamless dining.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button className="flex items-center gap-2 rounded-full bg-orange-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-900">
            <Play className="h-4 w-4 fill-white" />
            How It Works
          </button>
          <button className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-400 hover:bg-neutral-100">
            View Sample Menu
          </button>
        </div>
      </div>
    </section>
  );
}