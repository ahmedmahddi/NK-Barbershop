"use client";

import Booking from "@/modules/home/ui/components/booking";

import Gallery from "@/modules/home/ui/components/gallery";
import Hero from "@/modules/home/ui/components/hero";

import Products from "@/modules/home/ui/components/products";
import Services from "@/modules/home/ui/components/services";
import Team from "@/modules/home/ui/components/team";

const page = () => {
  return (
    <div className="min-h-screen bg-zinc-900/90 text-white overflow-x-hidden">
      <div style={{ width: "100%", height: "800px", position: "relative" }}>
        <Hero
          imageSrc="/images/brbr.jpg"
          grid={10}
          mouse={0.1}
          strength={0.15}
          relaxation={0.9}
          className="w-full h-[100vh] "
        />
      </div>
      <Services />
      <Products />
      <Team />
      <Gallery />
      <Booking />
    </div>
  );
};

export default page;
