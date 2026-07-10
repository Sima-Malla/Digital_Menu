"use client";

import Image from "next/image";

const steps = [
  {
    number: 1,
    title: "Scan Your Table",
    description:
      "Open your camera or QR scanner and scan the code at your table to instantly access the digital menu.",
    image: "/scan.png",
  },
  {
    number: 2,
    title: "Browse & Select",
    description:
      "Explore rich photos and detailed descriptions of every dish, filtered by your dietary needs.",
    image: "/select.png",
  },
  {
    number: 3,
    title: "Order & Pay",
    description:
      "Customize your order and pay securely right from the app. Split the bill with friends easily.",
    image: "/payment.png",
  },
  {
    number: 4,
    title: "Live Tracking",
    description:
      "Track your order in real time from the kitchen to your table, so you know exactly when it arrives.",
    image: "/tracking.png",
  },
];

export default function StepsSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-4">
      <h2 className="text-center text-2xl font-bold text-neutral-900 sm:text-3xl">
        4 Simple Steps to Gourmet Bliss
      </h2>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="relative rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100"
          >
            <span className="absolute -top-3 left-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-sm">
              {step.number}
            </span>

            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src={step.image}
                alt={step.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-neutral-900">
              {step.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}