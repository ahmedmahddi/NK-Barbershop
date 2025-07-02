"use client";

import React from "react";

interface TestimonialCardProps {
  name: string;
  text: string;
  service: string;
}

const TestimonialCard = ({ name, text, service }: TestimonialCardProps) => {
  return (
    <div className="relative bg-zinc-800/50 p-6 rounded-xl border border-gold-400/10">
      <div className="text-gold-400 text-4xl opacity-20 absolute top-4 right-4">
        &quot;
      </div>
      <p className="text-zinc-300 mb-4 relative z-10">{text}</p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-400">
          {name.charAt(0)}
        </div>
        <div className="ml-3">
          <p className="font-medium text-white">{name}</p>
          <p className="text-sm text-gold-400">{service}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
