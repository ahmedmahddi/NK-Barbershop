import Image from "next/image";
import React from "react";

interface GalleryImageProps {
  src: string;
  alt: string;
  className?: string;
}

const GalleryImage: React.FC<GalleryImageProps> = ({ src, alt, className }) => {
  return (
    <div className="relative group overflow-hidden rounded-xl hover:shadow-gold">
      <div className="absolute inset-0 bg-gold-radial opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <Image
        width={1024}
        height={1024}
        src={src}
        alt={alt}
        className={
          className ??
          "w-full h-auto object-cover object-top transform transition-transform group-hover:scale-105"
        }
      />
    </div>
  );
};

export default GalleryImage;
