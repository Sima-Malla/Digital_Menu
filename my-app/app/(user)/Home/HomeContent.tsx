import Hero from "@/components/Hero";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import TrendingNow from "@/components/TrendingNow";
import InRoomDining from "@/components/InRoomDining";
import Footer from "@/components/Footer";
import type { TrendingBusiness } from "@/lib/queries/trending";

export default function HomeContent({
  trendingBusinesses,
}: {
  trendingBusinesses: TrendingBusiness[];
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3EAD9]">
      <Hero />
      {/* <FeaturedRestaurants /> */}
      <TrendingNow businesses={trendingBusinesses} />
      <InRoomDining />
      <Footer />
    </div>
  );
}