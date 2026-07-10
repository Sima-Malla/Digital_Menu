"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards, Apple Pay, Google Pay, and select digital wallets directly through the app.",
  },
  {
    question: "How does group ordering work?",
    answer:
      "Anyone at the table can join the shared order from their own phone. Each person adds their items and pays for their own share at checkout.",
  },
  {
    question: "Can I filter the menu for allergies?",
    answer:
      "Yes. Every dish is tagged for common allergens, and you can filter the entire menu by gluten free, dairy free, nut free, and more.",
  },
  {
    question: "What if I make a mistake in my order?",
    answer:
      "You can edit your order right up until it's sent to the kitchen. After that, just reach out through Instant Support and we'll sort it out.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-4">
      <h2 className="text-center text-2xl font-bold text-neutral-900 sm:text-3xl">
        Frequently Asked Questions
      </h2>

      <div className="mt-8 flex flex-col gap-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className="rounded-2xl bg-white ring-1 ring-neutral-200"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-neutral-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <p className="px-5 pb-4 text-sm leading-relaxed text-neutral-500">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}