import { Button } from "@/components/ui/button";
import { ShoppingBagIcon } from "lucide-react";
import React from "react";

interface ProductCardProps {
  image: string;
  alt: string;
  title: string;
  description: string;
  price: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  alt,
  title,
  description,
  price,
}) => {
  return (
    <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-gold-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_rgba(251,146,60,0.1),_transparent_70%)] "></div>
      <div className="p-6">
        <div className="relative mb-6 rounded-xl overflow-hidden group-hover:shadow-gold">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <img
            src={image}
            alt={alt}
            className="w-full h-64 object-cover object-center rounded-xl transform transition-transform group-hover:scale-105"
          />
        </div>
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-zinc-400 text-sm mb-6">{description}</p>
        <div className="flex justify-between items-center backdrop-blur-sm rounded-xl bg-zinc-800/30">
          <span className="text-2xl font-bold bg-gradient-to-br from-gold-300 to-gold-500 bg-clip-text text-transparent">
            {price}
          </span>
          <Button
            onClick={() => {}}
            className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white !rounded-button shadow-gold"
          >
            <ShoppingBagIcon className="mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
