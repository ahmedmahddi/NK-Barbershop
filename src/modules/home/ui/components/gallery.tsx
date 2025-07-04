import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import React from "react";
import GalleryImage from "./gallery-image";

const Gallery = () => {
  return (
    <section className="py-16  bg-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-8 sm:mb-12">
          <div className="w-8 sm:w-12 h-1 bg-gold-400 mr-2 sm:mr-4"></div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider uppercase">
            Galerie pour inspiration
          </h2>
          <Button
            variant="ghost"
            className="ml-auto text-gold-400 hover:text-gold-500"
          >
            <ArrowRightIcon className="text-2xl" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="grid gap-4">
            <GalleryImage
              src="https://readdy.ai/api/search-image?query=Professional%20barber%20cutting%20hair%20of%20male%20client%20in%20modern%20barbershop%2C%20moody%20lighting%2C%20dark%20background%2C%20high-end%20atmosphere%2C%20barber%20wearing%20stylish%20outfit%2C%20focused%20on%20precision%20cutting%2C%20premium%20barbershop%20experience%2C%20cinematic%20style&width=400&height=300&seq=2&orientation=landscape"
              alt="Barber cutting hair"
            />
            <GalleryImage
              src="https://readdy.ai/api/search-image?query=Close-up%20of%20barber%20trimming%20beard%20with%20scissors%2C%20professional%20grooming%2C%20dark%20moody%20lighting%2C%20premium%20barbershop%20setting%2C%20focus%20on%20hands%20and%20tools%2C%20masculine%20atmosphere%2C%20high-end%20service%2C%20cinematic%20style&width=400&height=500&seq=3&orientation=portrait"
              alt="Beard trimming"
            />
          </div>
          <GalleryImage
            src="https://readdy.ai/api/search-image?query=Stylish%20barber%20with%20tattoos%20giving%20haircut%20to%20client%2C%20full%20body%20shot%2C%20modern%20barbershop%20interior%2C%20dark%20moody%20lighting%2C%20professional%20equipment%2C%20premium%20atmosphere%2C%20black%20and%20orange%20color%20scheme%2C%20cinematic%20style&width=400&height=600&seq=4&orientation=portrait"
            alt="Stylish barber"
            className="w-full h-full object-cover object-top transform transition-transform group-hover:scale-105"
          />
          <div className="grid gap-4">
            <GalleryImage
              src="https://readdy.ai/api/search-image?query=Client%20getting%20hot%20towel%20treatment%20in%20premium%20barbershop%20chair%2C%20dark%20moody%20atmosphere%2C%20professional%20barber%20service%2C%20luxury%20experience%2C%20high-end%20barbershop%20interior%2C%20cinematic%20lighting%2C%20masculine%20setting&width=400&height=300&seq=5&orientation=landscape"
              alt="Hot towel treatment"
            />
            <GalleryImage
              src="https://readdy.ai/api/search-image?query=Barber%20applying%20hair%20product%20to%20client%2C%20professional%20styling%20technique%2C%20premium%20barbershop%20interior%2C%20dark%20moody%20lighting%2C%20focus%20on%20technique%20and%20precision%2C%20high-end%20grooming%20experience%2C%20cinematic%20style&width=400&height=500&seq=6&orientation=portrait"
              alt="Hair styling"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
