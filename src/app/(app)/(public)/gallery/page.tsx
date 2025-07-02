"use client";
import Cta from "@/components/cta";
import GalleryImage from "@/modules/home/ui/components/gallery-image";
import Image from "next/image";

// Gallery images data

// Before & After data
const beforeAfterPairs = [
  { before: 11, after: 15 },
  { before: 12, after: 16 },
  { before: 13, after: 17 },
  { before: 14, after: 18 },
];

export default function GalleryPage() {
  return (
    <main className="flex-1">
      <section
        className="w-full py-24 md:py-24 lg:py-32 relative overflow-hidden 
"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-1 bg-gold-400 mr-4"></div>
            <h1 className="text-3xl font-bold tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
              NOTRE GALERIE
            </h1>
            <div className="w-12 h-1 bg-gold-400 ml-4"></div>
          </div>

          <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-12">
            Découvrez notre portfolio de coupes de cheveux premium, tailles de
            barbe et coiffures. Inspirez-vous pour votre prochaine visite et
            voyez la qualité de notre travail.
          </p>

          {/* Dynamic Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="grid gap-4">
              <GalleryImage
                src="https://readdy.ai/api/search-image?query=Professional%20barber%20cutting%20hair%20of%20male%20client%20in%20modern%20barbershop%2C%20moody%20lighting%2C%20dark%20background%2C%20high-end%20atmosphere%2C%20barber%20wearing%20stylish%20outfit%2C%20focused%20on%20precision%20cutting%2C%20premium%20barbershop%20experience%2C%20cinematic%20style&width=400&height=300&seq=2&orientation=landscape"
                alt="Coiffeur coupant les cheveux"
              />
              <GalleryImage
                src="https://readdy.ai/api/search-image?query=Close-up%20of%20barber%20trimming%20beard%20with%20scissors%2C%20professional%20grooming%2C%20dark%20moody%20lighting%2C%20premium%20barbershop%20setting%2C%20focus%20on%20hands%20and%20tools%2C%20masculine%20atmosphere%2C%20high-end%20service%2C%20cinematic%20style&width=400&height=500&seq=3&orientation=portrait"
                alt="Taille de barbe"
              />
            </div>
            <GalleryImage
              src="https://readdy.ai/api/search-image?query=Stylish%20barber%20with%20tattoos%20giving%20haircut%20to%20client%2C%20full%20body%20shot%2C%20modern%20barbershop%20interior%2C%20dark%20moody%20lighting%2C%20professional%20equipment%2C%20premium%20atmosphere%2C%20black%20and%20orange%20color%20scheme%2C%20cinematic%20style&width=400&height=600&seq=4&orientation=portrait"
              alt="Coiffeur stylé"
              className="w-full h-full object-cover object-top transform transition-transform group-hover:scale-105"
            />
            <div className="grid gap-4">
              <GalleryImage
                src="https://readdy.ai/api/search-image?query=Client%20getting%20hot%20towel%20treatment%20in%20premium%20barbershop%20chair%2C%20dark%20moody%20atmosphere%2C%20professional%20barber%20service%2C%20luxury%20experience%2C%20high-end%20barbershop%20interior%2C%20cinematic%20lighting%2C%20masculine%20setting&width=400&height=300&seq=5&orientation=landscape"
                alt="Soin serviette chaude"
              />
              <GalleryImage
                src="https://readdy.ai/api/search-image?query=Barber%20applying%20hair%20product%20to%20client%2C%20professional%20styling%20technique%2C%20premium%20barbershop%20interior%2C%20dark%20moody%20lighting%2C%20focus%20on%20technique%20and%20precision%2C%20high-end%20grooming%20experience%2C%20cinematic%20style&width=400&height=500&seq=6&orientation=portrait"
                alt="Coiffage professionnel"
              />
            </div>
          </div>

          {/* Additional Gallery Section */}
          <div className="mt-16">
            <div className="flex items-center mb-8">
              <div className="w-8 h-1 bg-gold-400 mr-4"></div>
              <h2 className="text-2xl font-bold tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                AVANT & APRÈS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {beforeAfterPairs.map((pair, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 relative group overflow-hidden rounded-xl hover:shadow-gold bg-zinc-900 p-1"
                >
                  <div className="relative flex-1 overflow-hidden rounded-l-lg">
                    <Image
                      src={`https://readdy.ai/api/search-image?query=Professional%20barber%20cutting%20hair%20of%20male%20client%20in%20modern%20barbershop%2C%20moody%20lighting%2C%20dark%20background%2C%20high-end%20atmosphere%2C%20barber%20wearing%20stylish%20outfit%2C%20focused%20on%20precision%20cutting%2C%20premium%20barbershop%20experience%2C%20cinematic%20style&width=400&height=300&seq=2&orientation=landscape${pair.before}`}
                      alt={`Avant ${idx + 1}`}
                      width={500}
                      height={300}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 left-2 bg-zinc-900/80 text-gold-400 text-xs py-1 px-2 rounded">
                      AVANT
                    </div>
                  </div>
                  <div className="relative flex-1 overflow-hidden rounded-r-lg">
                    <Image
                      src={`https://readdy.ai/api/search-image?query=Professional%20barber%20cutting%20hair%20of%20male%20client%20in%20modern%20barbershop%2C%20moody%20lighting%2C%20dark%20background%2C%20high-end%20atmosphere%2C%20barber%20wearing%20stylish%20outfit%2C%20focused%20on%20precision%20cutting%2C%20premium%20barbershop%20experience%2C%20cinematic%20style&width=400&height=300&seq=2&orientation=landscape${pair.after}`}
                      alt={`Après ${idx + 1}`}
                      width={500}
                      height={300}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 right-2 bg-zinc-900/80 text-gold-400 text-xs py-1 px-2 rounded">
                      APRÈS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <Cta />
    </main>
  );
}
