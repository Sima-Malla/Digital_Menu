"use client";

import { Phone, Mail } from "lucide-react";

export default function ContactCtaBanner() {
  return (
    <section className="mx-auto w-full max-w-5xl px-3 pb-10 sm:px-4">
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-neutral-900 p-8 sm:flex-row sm:items-center sm:p-10">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Still have questions?
          </h2>
          <p className="mt-2 max-w-md text-sm text-neutral-400">
            Our support team is available around the clock to help with
            anything you need, from menu questions to order issues.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
            <Phone className="h-4 w-4" />
            Call Support
          </button>
          <button className="flex items-center justify-center gap-2 rounded-full border border-neutral-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-neutral-400 hover:bg-neutral-800">
            <Mail className="h-4 w-4" />
            Email Us
          </button>
        </div>
      </div>
    </section>
  );
}