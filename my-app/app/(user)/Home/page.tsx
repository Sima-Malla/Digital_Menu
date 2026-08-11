import { getSession } from "@/lib/session";
import HomeContent from "./HomeContent";

export default async function Home() {
  const session = await getSession();
  return <HomeContent session={session} />;
}