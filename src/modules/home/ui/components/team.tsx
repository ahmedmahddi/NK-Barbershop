"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import TeamCard, { TeamCardProps } from "./team-card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

interface BackendTeamMember {
  id: number;
  name: string;
  photo?: { url: string } | null;
  description?: string;
  position: string;
}

const Team = () => {
  const trpc = useTRPC();
  const {
    data: rawTeamMembers,
    isLoading,
    error,
  } = useSuspenseQuery(trpc.team.getMany.queryOptions());

  const teamMembers: TeamCardProps[] = (rawTeamMembers ?? []).map(
    (member: BackendTeamMember) => ({
      image: member.photo?.url ?? "/images/placeholder.png",
      alt: member.name,
      role: member.position,
      name: member.name,
      description: member.description ?? "No description available.",
    })
  );

  if (isLoading)
    return <div className="text-center p-4 text-white">Loading...</div>;
  if (error)
    return (
      <div className="text-center p-4 text-red-500">Error: {error.message}</div>
    );
  if (!teamMembers || teamMembers.length === 0)
    return (
      <div className="text-center p-4 text-white">No team members found.</div>
    );

  return (
    <section className="py-16 bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-12">
          <div className="w-12 h-1 bg-gold-400 mr-4"></div>
          <h2 className="text-4xl font-bold tracking-wider text-white">
            NOTRE ÉQUIPE TALENTUEUSE
          </h2>
          <Button
            variant="ghost"
            className="ml-auto text-gold-400 hover:text-gold-500"
          >
            <Link href="/team">
              <ArrowRightIcon className="text-2xl" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {teamMembers.map((member, idx) => (
            <TeamCard key={idx} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
