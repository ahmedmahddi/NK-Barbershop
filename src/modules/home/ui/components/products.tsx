import ProductCard from "./product-card";
import React from "react";

const Products = () => {
  return (
    <section className="py-16 bg-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-12">
          <div className="w-12 h-1 bg-gold-400 mr-4"></div>
          <h2 className="text-4xl font-bold tracking-wider">
            PRODUITS PREMIUM
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <ProductCard
            image="https://readdy.ai/api/search-image?query=Premium%20beard%20oil%20bottle%20with%20wooden%20background%2C%20professional%20grooming%20product%20photography%2C%20luxury%20packaging%2C%20dark%20moody%20lighting%2C%20high-end%20product%20shot%2C%20cinematic%20style%2C%20minimalist%20composition&width=300&height=300&seq=12&orientation=squarish"
            alt="Huile à barbe"
            title="Huile à Barbe Premium"
            description="Mélange nourrissant d'huiles naturelles pour une barbe brillante."
            price="29,99 TND"
          />
          <ProductCard
            image="https://readdy.ai/api/search-image?query=Professional%20hair%20pomade%20in%20premium%20metal%20container%2C%20luxury%20hair%20styling%20product%2C%20dark%20moody%20product%20photography%2C%20high-end%20packaging%2C%20cinematic%20lighting%2C%20minimalist%20composition&width=300&height=300&seq=13&orientation=squarish"
            alt="Pommade capillaire"
            title="Pommade de Coiffage"
            description="Pommade à fixation forte avec finition mate pour un coiffage parfait."
            price="24,99 TND"
          />
          <ProductCard
            image="https://readdy.ai/api/search-image?query=Premium%20shaving%20cream%20in%20luxury%20glass%20jar%2C%20professional%20grooming%20product%2C%20dark%20moody%20product%20photography%2C%20high-end%20packaging%2C%20cinematic%20lighting%2C%20minimalist%20composition&width=300&height=300&seq=14&orientation=squarish"
            alt="Crème de rasage"
            title="Crème de Rasage de Luxe"
            description="Crème à mousse riche pour une expérience de rasage ultra-douce."
            price="34,99 TND"
          />
          <ProductCard
            image="https://readdy.ai/api/search-image?query=Professional%20hair%20care%20kit%20with%20premium%20brushes%20and%20scissors%2C%20luxury%20grooming%20tools%2C%20dark%20moody%20product%20photography%2C%20high-end%20equipment%2C%20cinematic%20lighting%2C%20minimalist%20composition&width=300&height=300&seq=15&orientation=squarish"
            alt="Kit de toilettage"
            title="Kit Professionnel"
            description="Kit de toilettage complet avec des outils et produits premium."
            price="89,99 TND"
          />
        </div>
      </div>
    </section>
  );
};

export default Products;
