"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Users } from "lucide-react";

export default function AdminDashboardPage() {
  const trpc = useTRPC();
  const { data: stats, isLoading } = useQuery(
    trpc.stats.getStats.queryOptions()
  );

  // État de chargement
  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  // Extraire le maximum de réservations pour les barres de progression
  const maxServiceBookings = Math.max(
    ...stats.popularServices.map(s => s.bookings)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-1 bg-gold-400 mr-4" />
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text text-transparent">
            Aperçu du Tableau de Bord
          </h2>
        </div>

       <div className="flex space-x-2">
      {/* Appointments Button */}
      <Link href="/appointments">
        <Button
          className="rounded-2xl border border-gold-400/30 text-white bg-zinc-800 hover:bg-gold-400/10
                     sm:flex sm:items-center sm:justify-center
                     sm:w-10 sm:h-10 sm:p-0
                     md:w-auto md:h-auto md:px-4 md:py-2"
        >
          <Calendar className="w-5 h-5 sm:mr-0 md:mr-2" />
          <span className="hidden md:inline">Gérer les Rendez-vous</span>
        </Button>
      </Link>

      {/* Customers Button */}
      <Link href="/customers">
        <Button
          className="rounded-2xl border border-gold-400/30 text-white bg-zinc-800 hover:bg-gold-400/10
                     sm:flex sm:items-center sm:justify-center
                     sm:w-10 sm:h-10 sm:p-0
                     md:w-auto md:h-auto md:px-4 md:py-2"
        >
          <Users className="w-5 h-5 sm:mr-0 md:mr-2" />
          <span className="hidden md:inline">Voir les Clients</span>
        </Button>
      </Link>
    </div>
      </div>

      {/* Cartes de statistiques --------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenu Total"
          main={`TND ${stats.totalRevenue.toFixed(2)}`}
          sub={`Aujourd'hui : TND ${stats.todaysRevenue.toFixed(2)}`}
        />

        <StatCard
          label="Total des Rendez-vous"
          main={stats.totalAppointments}
          sub={`À venir : ${stats.upcomingAppointments}`}
        />

        <StatCard
          label="Aujourd'hui"
          main={stats.todaysAppointments}
          sub={`Revenu :TND ${stats.todaysRevenue.toFixed(2)}`}
        />

        <StatCard
          label="Équipe"
          main={stats.barberCount}
          sub={"Coiffeurs actifs : 2"}
        />
      </div>

      {/* Services Populaires ------------------------------------------- */}
      <div className="rounded-2xl border border-gold-400/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)]">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gold-200">
            Services Populaires
          </h3>

          <div className="mt-4 space-y-4">
            {stats.popularServices.map(service => (
              <div
                key={service.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 text-center font-bold text-lg text-gold-400">
                    {service.bookings}
                  </div>
                  <div>
                    <div className="font-medium text-white">{service.name}</div>
                    <div className="text-sm text-zinc-400">Réservations</div>
                  </div>
                </div>

                <div className="w-32 bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-gold-400 h-2 rounded-full"
                    style={{
                      width: `${(service.bookings / maxServiceBookings) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions Rapides & Gestion de Contenu ------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actions Rapides -------------------------------------------- */}
        <QuickActions />

        {/* Gestion de Contenu --------------------------------------- */}
        <ContentManagement />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Petits composants d'aide                                         */
/* ------------------------------------------------------------------ */
interface StatCardProps {
  label: string;
  main: string | number;
  sub: string;
}

function StatCard({ label, main, sub }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gold-400/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)] p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-gold-200">
          {label}
        </h3>
      </div>
      <div className="text-2xl font-bold text-gold-400">
        {typeof main === "number" ? main.toLocaleString() : main}
      </div>
      <div className="text-xs text-zinc-400 mt-1">{sub}</div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="rounded-2xl border border-gold-400/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)] p-6">
      <h3 className="text-lg font-semibold mb-4 text-gold-200">
        Actions Rapides
      </h3>
      <div className="space-y-2">
        <ActionLink href="/appointments" icon={CalendarIcon}>
          Gérer les Rendez-vous
        </ActionLink>
        <ActionLink href="/customers" icon={UserIcon}>
          Voir les Clients
        </ActionLink>
        <ActionLink href="/products" icon={PackageIcon}>
          Gérer les Produits
        </ActionLink>
        <ActionLink href="/barbers" icon={UsersIcon}>
          Gérer l&apos;Équipe
        </ActionLink>
        <ActionLink href="/schedule" icon={CalendarIcon}>
          Gérer le Planning
        </ActionLink>
      </div>
    </div>
  );
}

function ContentManagement() {
  return (
    <div className="rounded-2xl border border-gold-400/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)] p-6">
      <h3 className="text-lg font-semibold mb-4 text-gold-200">
        Gestion de Contenu
      </h3>
      <div className="space-y-4">
        <ContentBlock
          title="Services & Tarifs"
          subtitle={`Dernière mise à jour : ${new Date().toLocaleDateString("fr-TN")}`}
        />
        <ContentBlock title="Galerie" subtitle="6 images téléchargées" />
        <ContentBlock title="Témoignages" subtitle="3 témoignages actifs" />
      </div>
    </div>
  );
}

interface ContentBlockProps {
  title: string;
  subtitle: string;
}

function ContentBlock({ title, subtitle }: ContentBlockProps) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2 text-white">{title}</h4>
      <div className="text-sm text-zinc-400">{subtitle}</div>
      <Button className="mt-2 border rounded-2xl border-gold-400/30 text-white bg-zinc-800 hover:bg-gold-400/10">
        <Link href={"/content"}>
          {title.startsWith("Services")
            ? "Mettre à jour le contenu"
            : "Modifier"}
        </Link>
      </Button>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24

"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

interface ActionLinkProps {
  href: string;
  icon: () => React.JSX.Element;
  children: React.ReactNode;
}

function ActionLink({ href, icon: Icon, children }: ActionLinkProps) {
  return (
    <Link href={href}>
      <Button className="w-full justify-start border rounded-2xl my-3 border-gold-400/30 text-white bg-zinc-800 hover:bg-gold-400/10">
        <Icon />
        {children}
      </Button>
    </Link>
  );
}
