"use client";

import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import StoryBanner from "@/components/StoryBanner";
import WhyUs from "@/components/WhyUs";
import PopularCategories from "@/components/PopularCategories";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <Hero />
      <PopularCategories />
      <FeaturedRestaurants />
      <WhyUs />
      <StoryBanner />
      <Footer />
    </div>
  );
}