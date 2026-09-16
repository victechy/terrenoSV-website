import { fetchListings } from "@/lib/listings";
import HomeView from "@/components/views/HomeView";

export default async function HomeEs() {
  const listings = await fetchListings().catch(() => []);
  return <HomeView locale="es" featured={listings} />;
}
