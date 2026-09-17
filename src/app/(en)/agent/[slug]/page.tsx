import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchAgents, fetchAgentBySlug } from "@/lib/agents";
import { fetchListings } from "@/lib/listings";
import AgentView from "@/components/views/AgentView";

export async function generateStaticParams() {
  const agents = await fetchAgents().catch(() => []);
  // `output: "export"` requires at least one static path per dynamic route —
  // this unreachable placeholder (see the page component below) keeps the
  // build working before any agent has been added yet.
  if (agents.length === 0) return [{ slug: "_placeholder" }];
  return agents.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = await fetchAgentBySlug(slug).catch(() => null);
  if (!agent) return {};

  return {
    title: agent.displayName,
    description: `${agent.displayName}'s listings on terrenoSV.`,
    alternates: { languages: { en: `/agent/${slug}`, es: `/es/agent/${slug}` } },
  };
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = await fetchAgentBySlug(slug).catch(() => null);
  if (!agent) notFound();

  const allListings = await fetchListings().catch(() => []);
  const listings = allListings.filter((l) => l.contactEmail.trim().toLowerCase() === agent.email);

  return <AgentView agent={agent} listings={listings} locale="en" />;
}
