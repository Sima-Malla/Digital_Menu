import HomeContent from "./HomeContent";
import { getTrendingBusinesses } from "@/lib/queries/trending";

export default async function Home() {
  const trendingBusinesses = await getTrendingBusinesses();

  return <HomeContent trendingBusinesses={trendingBusinesses} />;
}