"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, XIcon } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import Image from "next/image";
import Link from "next/link";

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  slug?: string;
}

const PricingModal: React.FC<{
  service: ServiceItem | null;
  onClose: () => void;
}> = ({ service, onClose }) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-8 rounded-2xl max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-gold-400 transition-colors"
        >
          <XIcon className="text-xl" />
        </button>
        <div className="flex items-center mb-6">
          <Image
            src={service.image}
            alt={service.name}
            className=" rounded-sm mr-4"
            width={72}
            height={72}
          />
          <h3 className="text-2xl font-bold bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
            {service.name}
          </h3>
        </div>
        <p className="text-zinc-400 mb-6">{service.description}</p>
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-400">Service Price</span>
            <span className="text-2xl font-bold text-gold-400">
              TND {service.price}
            </span>
          </div>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>✓ Professional consultation</p>
            <p>✓ Premium products used</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <Button
            className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white w-full !rounded-button shadow-gold"
            onClick={() => {
              onClose();
              // You can add booking logic here if needed
            }}
          >
            Book Now
          </Button>
          <Button
            variant="link"
            className="text-zinc-400 hover:text-gold-400 w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const ServiceCard: React.FC<{
  service: ServiceItem;
  onBookNow: (serviceId: string) => void;
  onSeePricing: (service: ServiceItem) => void;
}> = ({ service, onBookNow, onSeePricing }) => {
  return (
    <div className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-800/80 to-zinc-900 p-8 rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-gold-lg flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(251,146,60,0.1),_transparent_70%)] "></div>

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
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent text-center">
          {service.name}
        </h3>
        <p className="text-zinc-400 mb-6 text-center min-h-[48px]">
          {service.description}
        </p>
        <div className="space-y-3 mt-auto">
          <Button
            variant="default"
            className="text-white hover:text-gold-400 w-full border border-zinc-700 backdrop-blur-sm hover:border-gold-400 transition-all !rounded-button"
            onClick={() => onSeePricing(service)}
          >
            See pricing
          </Button>
          <Button
            className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white w-full !rounded-button shadow-gold"
            onClick={() => onBookNow(service.id)}
          >
            Book now
          </Button>
        </div>
      </div>
    </div>
  );
};

const Services = () => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const trpc = useTRPC();
  const { data: services = [] } = useSuspenseQuery(
    trpc.services.getMany.queryOptions({
      limit: 6,
    })
  );

  const handleBookNow = (serviceId: string) => {
    // Handle booking logic here
    console.log(`Booking service: ${serviceId}`);
  };

  const handleSeePricing = (service: ServiceItem) => {
    setSelectedService(service);
  };

  return (
    <section className="py-16 bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-8 sm:mb-12">
          <div className="w-8 sm:w-12 h-1 bg-gold-400 mr-2 sm:mr-4"></div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider">
            SERVICES WE PROVIDE
          </h2>
          <Link href="/services" className="ml-auto">
            <Button
              variant="ghost"
              className="text-gold-400 hover:text-gold-500"
            >
              <ArrowRightIcon className="text-2xl" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {services.map(rawService => {
            const service: ServiceItem = {
              id: String(rawService.id),
              name: rawService.name ?? "",
              description: rawService.description ?? "",
              image:
                typeof rawService.image === "string"
                  ? rawService.image
                  : (rawService.image?.url ?? ""),
              price: rawService.price ?? 0,
              duration: rawService.duration ?? "",
              slug: rawService.slug,
            };
            return (
              <ServiceCard
                key={service.id}
                service={service}
                onBookNow={handleBookNow}
                onSeePricing={handleSeePricing}
              />
            );
          })}
        </div>
      </div>
      <PricingModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </section>
  );
};

export default Services;
