"use client";
export const dynamic = "force-dynamic";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/appSidebar";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (p: string) => pathname?.includes(p);

  return (
    <SidebarProvider>
      {/* Barre latérale pliable / coulissante */}
      <AppSidebar />

      {/* Colonne principale (pousse à droite sur ≥lg via padding) */}
      <div className="flex min-h-screen flex-col bg-zinc-900 text-white lg:pl-6 w-full">
        {/* Barre supérieure */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gold-400/20 bg-zinc-900/80 px-6 py-5 backdrop-blur-sm">
          {/* Règle d'un seul enfant respectée ↓↓↓ */}
          <SidebarTrigger asChild>
            <button
              className="mr-4 text-zinc-400 hover:text-white lg:hidden"
              aria-label="Ouvrir la barre latérale"
            >
              <Menu size={24} />
            </button>
          </SidebarTrigger>

          {/* Titre de page dynamique */}
          <h1 className="flex-1 truncate bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text text-xl font-semibold text-transparent">
            {pathname === "/dashboard" && "Tableau de bord"}
            {isActive("/appointments") && "Rendez-vous"}
            {isActive("/customers") && "Clients"}
            {isActive("/products") && "Produits"}
            {isActive("/orders") && "Commandes"}
            {isActive("/content") && "Gestion de contenu"}
            {isActive("/barbers") && "Équipe"}
            {isActive("/schedule") && "Planning"}
          </h1>

          <span className="text-sm text-zinc-400">Administrateur</span>
        </header>

        {/* Zone de contenu */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
