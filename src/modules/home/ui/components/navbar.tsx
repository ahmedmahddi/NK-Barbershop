"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  ImagesIcon,
  MenuIcon,
  ShoppingBagIcon,
  UserIcon,
  X,
} from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const Navbar = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const trpc = useTRPC();
  const { data: session } = useQuery(trpc.auth.session.queryOptions());
  const { data: user } = useQuery(
    trpc.auth.getOne.queryOptions(undefined, { enabled: !!session?.user?.id })
  );

  useEffect(() => {
    if (pathname === "/") {
      setActiveTab("Accueil");
    } else if (pathname === "/gallery") {
      setActiveTab("Galerie");
    } else if (pathname === "/services") {
      setActiveTab("Services");
    } else if (pathname === "/shop") {
      setActiveTab("Boutique");
    } else if (pathname === "/team") {
      setActiveTab("Équipe");
    } else if (pathname === "/dashboard") {
      setActiveTab("Tableau de bord");
    }
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isSuperAdmin = user?.roles?.includes("super-admin");

  return (
    <div className="w-full py-4 px-6 fixed top-0 left-0 right-0 z-50">
      <header className="max-w-8xl mx-auto bg-zinc-900/10 backdrop-blur-lg rounded-full px-12 py-2 shadow-gold-lg border border-gold-400/10">
        {/* En-tête Desktop */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Navigation Gauche */}
          <nav className="flex items-center space-x-10">
            <Link
              href="/"
              className={`text-sm uppercase tracking-wider transition-colors duration-300 ${
                activeTab === "Accueil"
                  ? "text-gold-400"
                  : "text-white hover:text-gold-400"
              }`}
            >
              Accueil
            </Link>
            <Link
              href="/services"
              className={`text-sm uppercase tracking-wider transition-colors duration-300 ${
                activeTab === "Services"
                  ? "text-gold-400"
                  : "text-white hover:text-gold-400"
              }`}
            >
              Services
            </Link>
            <Link
              href="/team"
              className={`text-sm uppercase tracking-wider transition-colors duration-300 ${
                activeTab === "Équipe"
                  ? "text-gold-400"
                  : "text-white hover:text-gold-400"
              }`}
            >
              Équipe
            </Link>
          </nav>

          {/* Logo Central */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-b from-gold-400/20 to-gold-500/20 rounded-full blur-sm"></div>
              <div className="relative bg-zinc-900 rounded-full p-1">
                <Link href="/">
                  <Image
                    src={"/images/LogoNK.png"}
                    alt="logo"
                    width={48}
                    height={48}
                    className="h-16 w-16"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Droite */}
          <div className="flex items-center space-x-8">
            <nav className="flex items-center space-x-8">
              <Link
                href="/gallery"
                className={`text-sm uppercase tracking-wider transition-colors duration-300 ${
                  activeTab === "Galerie"
                    ? "text-gold-400"
                    : "text-white hover:text-gold-400"
                }`}
              >
                <ImagesIcon className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className={`text-sm uppercase tracking-wider transition-colors duration-300 ${
                  activeTab === "Boutique"
                    ? "text-gold-400"
                    : "text-white hover:text-gold-400"
                }`}
              >
                <ShoppingBagIcon className="w-4 h-4" />
              </Link>

              {isSuperAdmin ? (
                <Link
                  href="/dashboard"
                  className={`text-sm uppercase tracking-wider transition-colors duration-300 ${
                    activeTab === "Tableau de bord"
                      ? "text-gold-400"
                      : "text-white hover:text-gold-400"
                  }`}
                >
                  <UserIcon className="h-4 w-4" />
                </Link>
              ) : (
                <Link href="/login">
                  <button className="text-white hover:text-gold-400 transition-colors duration-300">
                    <UserIcon className="h-4 w-4" />
                  </button>
                </Link>
              )}
            </nav>
            <Button className="bg-gradient-to-b from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white text-sm uppercase tracking-wider !rounded-full shadow-gold px-6">
              <Link href="/booking">Réserver</Link>
            </Button>
          </div>
        </div>

        {/* En-tête Mobile */}
        <div className="flex lg:hidden items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src={"/images/LogoNK.png"}
                alt="logo"
                width={48}
                height={48}
                className="mr-3"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/booking">
              <button className="text-white hover:text-gold-400 transition-colors duration-300">
                <CalendarIcon className="h-4 w-4" />
              </button>
            </Link>
            {!isSuperAdmin && (
              <Link href="/login">
                <button className="text-white hover:text-gold-400 transition-colors duration-300">
                  <UserIcon className="h-4 w-4" />
                </button>
              </Link>
            )}
            <Button
              variant="ghost"
              className="text-white"
              onClick={toggleMobileMenu}
            >
              <MenuIcon className="text-xl" />
            </Button>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          ></div>
          <div className="absolute right-0 top-0 h-screen w-64 bg-zinc-900 p-6 shadow-gold-lg">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-b from-white via-gold-200 to-white bg-clip-text text-transparent">
                Menu
              </h2>
              <Button
                variant="ghost"
                className="text-white"
                onClick={toggleMobileMenu}
              >
                <X className="text-xl" />
              </Button>
            </div>
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`text-sm uppercase tracking-wider py-2 ${
                  activeTab === "Accueil"
                    ? "text-gold-400"
                    : "text-white hover:text-gold-400"
                }`}
                onClick={toggleMobileMenu}
              >
                Accueil
              </Link>
              <Link
                href="/services"
                className={`text-sm uppercase tracking-wider py-2 ${
                  activeTab === "Services"
                    ? "text-gold-400"
                    : "text-white hover:text-gold-400"
                }`}
                onClick={toggleMobileMenu}
              >
                Services
              </Link>
              <Link
                href="/team"
                className={`text-sm uppercase tracking-wider py-2 ${
                  activeTab === "Équipe"
                    ? "text-gold-400"
                    : "text-white hover:text-gold-400"
                }`}
                onClick={toggleMobileMenu}
              >
                Équipe
              </Link>
              <Link
                href="/shop"
                className={`text-sm uppercase tracking-wider py-2 ${
                  activeTab === "Boutique"
                    ? "text-gold-400"
                    : "text-white hover:text-gold-400"
                }`}
                onClick={toggleMobileMenu}
              >
                Boutique
              </Link>
              <Link
                href="/gallery"
                className={`text-sm uppercase tracking-wider py-2 ${
                  activeTab === "Galerie"
                    ? "text-gold-400"
                    : "text-white hover:text-gold-400"
                }`}
                onClick={toggleMobileMenu}
              >
                Galerie
              </Link>
              {isSuperAdmin && (
                <Link
                  href="/dashboard"
                  className={`text-sm uppercase tracking-wider py-2 ${
                    activeTab === "Tableau de bord"
                      ? "text-gold-400"
                      : "text-white hover:text-gold-400"
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Tableau de bort
                </Link>
              )}
              <div className="pt-4">
                <Button className="w-full bg-gradient-to-b from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white text-sm uppercase tracking-wider !rounded-full shadow-gold">
                  <Link href="/booking">Réserver un rendez-vous</Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
