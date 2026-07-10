"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const LabelContext = createContext<{ show: boolean; toggle: () => void }>({
  show: true,
  toggle: () => {}
});

export function LabelProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(true);
  return (
    <LabelContext.Provider value={{ show, toggle: () => setShow((s) => !s) }}>
      {children}
    </LabelContext.Provider>
  );
}

export function LabelLegend() {
  const { show, toggle } = useContext(LabelContext);
  return (
    <div className="fixed top-3.5 right-3.5 z-50 flex items-center gap-3.5 rounded-lg bg-charcoal px-3.5 py-2.5 font-mono text-[11px] text-cream shadow-lg">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-olive" /> Static content
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-chili" /> Fetch from backend
      </span>
      <button
        onClick={toggle}
        className="rounded bg-marigold px-2.5 py-1 font-mono text-[10px] font-semibold text-charcoal"
      >
        {show ? "Hide labels" : "Show labels"}
      </button>
    </div>
  );
}

export function DataBadge({
  type,
  children,
  className = ""
}: {
  type: "static" | "dynamic";
  children: ReactNode;
  className?: string;
}) {
  const { show } = useContext(LabelContext);
  if (!show) return null;
  return (
    <span
      className={`pointer-events-none z-10 rounded-md px-2 py-1 font-mono text-[9.5px] leading-tight text-white shadow ${
        type === "static" ? "bg-olive" : "bg-chili"
      } ${className}`}
    >
      {children}
    </span>
  );
}
