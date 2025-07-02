import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarIcon, XIcon } from "lucide-react";
import Image from "next/image";

interface ServiceItem {
  name: string;
  slug: string;
  description: string;
  image: string | React.ReactNode;
  price: number;
  duration: string;
}

interface PricingModalProps {
  service: ServiceItem | null;
  onClose: () => void;
}

const PricingModal = ({ service, onClose }: PricingModalProps) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 rounded-2xl max-w-md w-full mx-4 relative border border-gold-400/10 shadow-gold">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-30"></div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-gold-400 transition-colors"
        >
          <XIcon className="text-xl" />
        </button>
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 flex items-center justify-center mr-4 text-gold-400">
            {typeof service.image === "string" ? (
              <Image
                src={service.image}
                alt={service.name}
                className="w-16 h-16 object-cover rounded-xl"
                width={64}
                height={64}
              />
            ) : (
              service.image
            )}
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
            {service.name}
          </h3>
        </div>
        <p className="text-zinc-400 mb-6">{service.description}</p>
        <div className="bg-zinc-900/50 p-6 rounded-xl border border-gold-400/5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-400">Prix du service</span>
            <span className="text-2xl font-bold bg-gradient-to-br from-gold-300 to-gold-500 bg-clip-text text-transparent">
              TND {service.price}
            </span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-zinc-400">Durée</span>
            <span className="text-white">{service.duration}</span>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <Link href="/booking">
            <Button className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white w-full !rounded-button shadow-gold">
              <CalendarIcon className="mr-2" />
              Réserver maintenant
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-zinc-400 hover:text-gold-400 w-full border-zinc-700 hover:border-gold-400"
            onClick={onClose}
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
