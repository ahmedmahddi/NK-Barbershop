"use client";

import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import SectionHeader from "@/components/SectionHeader";
import ServiceCard from "@/modules/services/ui/components/ServicesCard";
import FeatureCard from "@/modules/services/ui/components/FeaturesCard";
import TestimonialCard from "@/modules/services/ui/components/TestimonialsCard";
import PricingModal from "@/modules/services/ui/components/PricingModal";
import Cta from "@/components/cta";

interface ServiceItem {
  name: string;
  slug: string;
  description: string;
  image: string | React.ReactNode;
  price: number;
  duration: string;
}

interface ServicesPageProps {
  slug?: string;
}

export default function ServicesPage({ slug }: ServicesPageProps) {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.services.getMany.queryOptions({
      slug,
      limit: 100,
    })
  );

  const handleBookNow = (serviceSlug: string) => {
    console.log(`Booking service: ${serviceSlug}`);
  };

  const handleSeePricing = (service: ServiceItem) => {
    setSelectedService(service);
  };

  return (
    <div className="min-h-screen bg-zinc-900/90 text-white overflow-x-hidden">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <SectionHeader title="NOS SERVICES" className="pt-16" />
          <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-12">
            Nous proposons une gamme de services de barbier haut de gamme
            adaptés à vos besoins de soins. Des coupes classiques à la
            stylisation de la barbe, nos barbiers qualifiés sont prêts à
            sublimer votre look.
          </p>

          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {data.map(service => (
                <CarouselItem
                  key={service.slug}
                  className="flex basis-full sm:basis-1/2 lg:basis-1/3 justify-center"
                >
                  <ServiceCard
                    service={{
                      name: service.name ?? "",
                      slug: service.slug ?? "",
                      description: service.description ?? "",
                      price: service.price ?? 0,
                      duration: service.duration ?? "",
                      image:
                        typeof service.image === "string"
                          ? service.image
                          : React.isValidElement(service.image)
                            ? service.image
                            : null,
                    }}
                    onBookNow={handleBookNow}
                    onSeePricing={handleSeePricing}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="mt-24">
            <SectionHeader title="L'EXPÉRIENCE PREMIUM" className="mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              <FeatureCard
                number="01"
                title="Consultation"
                description="Chaque service commence par une consultation approfondie pour comprendre vos préférences et besoins en matière de style."
              />
              <FeatureCard
                number="02"
                title="Produits Premium"
                description="Nous utilisons uniquement des produits de soins de haute qualité pour garantir des résultats exceptionnels à chaque fois."
              />
              <FeatureCard
                number="03"
                title="Exécution experte"
                description="Nos maîtres barbiers mettent des années d'expérience et de précision dans chaque coupe et style."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-zinc-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(251,146,60,0.1),_transparent_70%)] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-30"></div>
        <div className="container mx-auto px-4 relative">
          <SectionHeader title="AVIS DE NOS CLIENTS" className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              name="James Wilson"
              text="Le souci du détail est incroyable. Ma coupe de cheveux et ma taille de barbe étaient exactement ce que je voulais. Le service de serviette chaude est révolutionnaire !"
              service="Cheveux & Barbe"
            />
            <TestimonialCard
              name="Michael Chen"
              text="Je n'ai jamais vécu un rasage comme celui-ci. La technique du rasoir droit était précise et le traitement à la serviette chaude était tellement relaxant."
              service="Rasage"
            />
            <TestimonialCard
              name="Robert Taylor"
              text="Le service Style & Soin vaut chaque centime. Je suis reparti en me sentant comme un nouvel homme avec des conseils d'expert pour entretenir mon look à la maison."
              service="Style & Soin"
            />
          </div>
        </div>
      </section>
      <Cta />

      <PricingModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
}
