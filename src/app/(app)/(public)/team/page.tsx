"use client";

import Link from "next/link";
import Image from "next/image"; // Ajouté pour la gestion optimisée des images
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Cta from "@/components/cta";

// Définir le type Availability
interface Availability {
  day: string;
  date: string;
  slots: string[];
}

// Définir le type Barber
interface Barber {
  id: number; // Changé de string à number pour correspondre au backend
  name: string;
  photo?: { url: string } | null;
  description?: string;
  position: string;
  rank: string;
  experience: string;
  availability?: Availability;
}

export default function TeamPage() {
  const trpc = useTRPC();
  const {
    data: rawBarbers,
    isLoading,
    error,
  } = useSuspenseQuery(trpc.team.getMany.queryOptions());

  // Transformer les données du backend pour correspondre à l'interface Barber
  const barbers: Barber[] = (rawBarbers ?? []).map((barber: unknown) => {
    const b = barber as Barber;
    return {
      ...b,
    };
  });

  if (isLoading) return <div className="text-center p-4">Chargement...</div>;
  if (error)
    return (
      <div className="text-center p-4 text-red-500">
        Erreur : {error.message}
      </div>
    );
  if (!barbers || barbers.length === 0)
    return <div className="text-center p-4">Aucun barbier trouvé.</div>;

  return (
    <div className="min-h-screen  text-white overflow-x-hidden">
      <main className="flex-1">
        <section className="w-full py-24 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-1 bg-gold-400 mr-4"></div>
              <h1 className="text-3xl font-bold tracking-wider bg-gradient-to-r from-white via-gold-200 to-white bg-clip-text text-transparent">
                NOTRE ÉQUIPE
              </h1>
              <div className="w-12 h-1 bg-gold-400 ml-4"></div>
            </div>

            <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-12">
              Découvrez notre équipe de barbiers et stylistes expérimentés,
              dévoués à vous offrir l&apos;expérience de soins haut de gamme que
              vous méritez.
            </p>

            <div className="space-y-8">
              {barbers.map(barber => (
                <div
                  key={barber.id}
                  className="flex flex-col md:flex-row bg-zinc-800 rounded-xl overflow-hidden"
                >
                  <div className="w-full md:w-2/4 h-80 md:h-auto relative">
                    <Image
                      src={barber.photo?.url ?? "/images/placeholder.png"}
                      alt={barber.name}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>

                  <div className="w-full md:w-3/3 p-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-zinc-800">
                    <h2 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-white via-gold-200 to-white bg-clip-text text-transparent mb-3">
                      {barber.name}
                    </h2>

                    <p className="text-zinc-400 mb-6">{barber.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="text-zinc-400 w-24">Poste</span>
                        <div className="flex-1 h-1 bg-gold-400/30 mx-3"></div>
                        <span>{barber.position}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="text-zinc-400 w-24">Rang</span>
                        <div className="flex-1 h-1 bg-gold-400/30 mx-3"></div>
                        <span>{barber.rank}</span>
                      </div>

                      <div className="flex items-center">
                        <span className="text-zinc-400 w-24">Expérience</span>
                        <div className="flex-1 h-1 bg-gold-400/30 mx-3"></div>
                        <span>{barber.experience}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link
                        href={`/team/${barber.id}`}
                        className="text-gold-400 hover:text-gold-300 transition-colors"
                      >
                        Voir le profil
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Cta />
      </main>
    </div>
  );
}
