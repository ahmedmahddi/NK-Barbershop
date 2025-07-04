import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";
import React from "react";
import Link from "next/link"; // Added for client-side navigation

export interface TeamCardProps {
  image: string;
  alt: string;
  role: string;
  name: string;
  description: string;
  onProfileClick?: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  image,
  alt,
  role,
  name,
  description,

  onProfileClick,
}) => {
  return (
    <div className="group relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-gold-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(251,146,60,0.1),_transparent_70%)]"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient from-transparent via-gold-400 to-transparent opacity-50"></div>
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-zinc-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gold-400/30 flex items-center">
            <StarIcon className="text-gold-400 mr-2" />
            <span className="text-white">4.9</span>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={alt}
            className="w-full h-[500px] object-cover object-center transform transition-transform group-hover:scale-105"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="relative">
            <p className="inline-block bg-gold-400 text-white text-sm px-3 py-1 rounded-full mb-2">
              {role}
            </p>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-b from-white via-gold-200 to-white bg-clip-text text-transparent">
              {name}
            </h3>
            <p className="text-zinc-300 text-sm mb-2">{description}</p>
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                className="text-white hover:text-gold-400 p-0 justify-start group"
                onClick={onProfileClick}
              >
                <Link href="/team">Voir Plus</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
