import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface ServiceItem {
  name: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  duration: string;
}

interface ServiceCardProps {
  service: ServiceItem;
  onBookNow: (serviceId: string) => void;
  onSeePricing: (service: ServiceItem) => void;
}

const ServiceCard = ({
  service,
  onBookNow,
  onSeePricing,
}: ServiceCardProps) => {
  return (
    <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4 rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-gold-lg flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(251,146,60,0.1),_transparent_70%)] opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-50"></div>
      <div className="relative">
        <div className="relative mb-6 rounded-xl overflow-hidden group-hover:shadow-gold">
          <Image
            src={service.image}
            alt={service.name}
            className="w-full h-64 object-cover object-center rounded-xl transform transition-transform group-hover:scale-105"
            width={240}
            height={256}
          />
        </div>
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent text-center">
          {service.name}
        </h3>
        <div className="flex items-center justify-center mb-2">
          <span className="text-2xl font-bold bg-gradient-to-br from-gold-300 to-gold-500 bg-clip-text text-transparent">
            TND {service.price}
          </span>
          <span className="text-zinc-500 text-sm ml-2">
            / {service.duration}
          </span>
        </div>
        <p className="text-zinc-400 mb-4 text-center truncate">
          {service.description}
        </p>
        <div className="space-y-2 mt-auto">
          <Button
            variant="link"
            className="text-white hover:text-gold-400 w-full border border-zinc-700 hover:border-gold-400 transition-all mb-3"
            onClick={() => onSeePricing(service)}
          >
            Voir les détails
          </Button>
          <Link href="/booking">
            <Button
              className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white w-full !rounded-button shadow-gold"
              onClick={() => onBookNow(service.slug)}
            >
              Réserver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
