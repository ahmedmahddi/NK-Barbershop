"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FC } from "react";

// ────────────────── composant ──────────────────
const CustomersPage: FC = () => {
  const trpc = useTRPC();
  const {
    data: customers = [],
    isLoading,
    error,
  } = useSuspenseQuery(trpc.booking.getAll.queryOptions());

  // Grouper les clients par email et téléphone
  const customerMap = new Map();
  for (const c of customers) {
    const key = `${c.customerEmail}|${c.phone}`;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        ...c,
        appointments: 1,
        totalSpent: Number(c.price) || 0,
      });
    } else {
      const existing = customerMap.get(key);
      existing.appointments += 1;
      existing.totalSpent += Number(c.price) || 0;
      customerMap.set(key, existing);
    }
  }
  const groupedCustomers = Array.from(customerMap.values());

  if (isLoading) {
    return <div className="text-white">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-400">Erreur : {error.message}</div>;
  }

  if (customers.length === 0) {
    return <div className="text-white">Aucun client trouvé.</div>;
  }

  return (
    <div className="space-y-6">
      {/* en-tête */}
      <div className="flex items-center">
        <div className="w-8 h-1 bg-gold-400 mr-4" />
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text text-transparent">
          Base de données des clients
        </h2>
      </div>

      {/* tableau */}
      <div className="rounded-xl border border-gold-400/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)] overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-400/20">
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Nom
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Contact
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Téléphone
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Nombre de rendez-vous
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Total dépensé
                </th>
              </tr>
            </thead>
            <tbody>
              {groupedCustomers.map(c => (
                <tr
                  key={c.customerEmail + c.phone}
                  className="border-b border-zinc-700/50 hover:bg-zinc-800/50"
                >
                  <td className="p-4 font-medium">{c.customerName}</td>
                  <td className="p-4">
                    <div>{c.customerEmail}</div>
                  </td>
                  <td className="p-4">
                    <div>{c.phone}</div>
                  </td>
                  <td className="p-4">{c.appointments}</td>
                  <td className="p-4 text-gold-400">TND {c.totalSpent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
