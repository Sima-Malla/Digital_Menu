// lib/fonts.ts
// Wire these into app/layout.tsx:
//
//   import { fraunces, workSans } from "@/lib/fonts";
//   <body className={`${fraunces.variable} ${workSans.variable} font-sans`}>
//
// Display face: Fraunces — a warm, high-contrast serif with real character at
// large sizes, used sparingly for headlines (echoes the hand-set feel of a
// menu board without tipping into cliché).
// Body face: Work Sans — clean and humanist, does the actual reading work in
// nav, cards, and body copy.

import { Fraunces, Work_Sans } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-work-sans",
  display: "swap",
});