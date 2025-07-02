import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CopyrightIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  MapIcon,
  PhoneIcon,
  SendIcon,
} from "lucide-react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-zinc-900 py-8 sm:py-12 border-t border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h1 className="text-gold-400 font-bold text-xl mb-4">
              Naim Kchao<span className="text-white"> Barbershop</span>
            </h1>
            <p className="text-zinc-400 mb-1">
              Your premium destination for stylish grooming
            </p>
            <div className="py-4">
              <div className="flex flex-row text-zinc-400 text-sm items-center">
                <MapIcon className="mr-2 text-gold-400 size-4" />
                <span>123 Style Street, Downtown, NY 10001</span>
              </div>
              <div className="flex flex-row text-zinc-400 text-sm items-center mt-1">
                <PhoneIcon className="mr-2 text-gold-400 size-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex flex-row text-zinc-400 text-sm items-center mt-1">
                <MailIcon className="mr-2 text-gold-400 size-4" />
                <span>info@barberino.com</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
              HOURS
            </h3>
            <p className="text-zinc-400 mb-2">Monday - Friday: 9AM - 8PM</p>
            <p className="text-zinc-400 mb-2">Saturday: 10AM - 6PM</p>
            <p className="text-zinc-400 mb-2">Sunday: 10AM - 4PM</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
              LINKS
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-zinc-400 hover:text-gold-400 cursor-pointer transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-zinc-400 hover:text-gold-400 cursor-pointer transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-zinc-400 hover:text-gold-400 cursor-pointer transition-colors"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-zinc-400 hover:text-gold-400 cursor-pointer transition-colors"
                >
                  Our Team
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-zinc-400 hover:text-gold-400 cursor-pointer transition-colors"
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
              NEWSLETTER
            </h3>
            <p className="text-zinc-400 mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="relative w-full">
              <Input
                className="bg-zinc-800 border-none text-white rounded-2xl h-10 pr-12"
                placeholder="Enter your email "
              />
              <Button
                variant="ghost"
                className="absolute top-1/2 right-1 -translate-y-1/2 bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white rounded-2xl cursor-pointer whitespace-nowrap shadow-gold px-3 py-2 h-8 min-w-0"
                style={{ minWidth: 0 }}
                type="submit"
              >
                <SendIcon className="size-4" />
              </Button>
            </div>
            <div className="flex space-x-4 mt-4">
              <Link
                href="/"
                className="text-zinc-400 hover:text-gold-400 cursor-pointer transition-colors"
              >
                <FacebookIcon />
              </Link>
              <Link
                href="/"
                className="text-zinc-400 hover:text-gold-400 cursor-pointer transition-colors"
              >
                <InstagramIcon />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-800 mt-8 pt-8 text-center">
          <div className="flex flex-row text-zinc-500 text-sm px-2 items-center justify-center">
            <CopyrightIcon className="size-4" />
            <p className="ml-2">
              2025 Naim Kchao Barbershop. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
