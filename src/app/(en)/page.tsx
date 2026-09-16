import { fetchListings } from "@/lib/listings";
import HomeView from "@/components/views/HomeView";

export default async function Home() {
  const listings = await fetchListings().catch(() => []);
  return <HomeView locale="en" featured={listings} />;
}
