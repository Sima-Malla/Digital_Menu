"use client";

import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import StoryBanner from "@/components/StoryBanner";
import WhyUs from "@/components/WhyUs";
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">    
  <Nav />

  <Hero/>
  <WhyUs/>
  <StoryBanner/>
</div>)}