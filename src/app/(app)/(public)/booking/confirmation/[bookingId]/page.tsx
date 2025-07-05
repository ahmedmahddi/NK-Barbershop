"use client";

import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface BookingConfirmationPageProps {
  params: Promise<{ bookingId: string }>;
}

export default function BookingConfirmationPage({
  params,
}: BookingConfirmationPageProps) {
  const { bookingId } = use(params); // Unwrap params with React.use()
  const trpc = useTRPC();
  const router = useRouter();

  // Fetch booking details using tRPC
  const {
    data: booking,
    isLoading,
    error,
  } = useSuspenseQuery(
    trpc.booking.getBookingById.queryOptions({ id: bookingId })
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-gold-400 border-r-transparent"></div>
          <p className="mt-4 text-zinc-400">Chargement de la confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="text-center">
          <p className="text-rose-400 text-xl">
            Erreur : Réservation non trouvée
          </p>
          <Button
            className="mt-4 bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white !rounded-button shadow-gold"
            onClick={() => router.push("/booking")}
          >
            Retourner à la réservation
          </Button>
        </div>
      </div>
    );
  }

  const startDate = new Date(booking.start);
  const formattedDate = startDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = startDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="flex-1 bg-zinc-900">
      <section className="w-full py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-12">
            <div className="w-12 h-1 bg-gold-400 mr-4"></div>
            <h1 className="text-3xl font-bold text-center tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
              CONFIRMATION DE RÉSERVATION
            </h1>
            <div className="w-12 h-1 bg-gold-400 ml-4"></div>
          </div>

          <div
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zin
c-900 border border-gold-400/10 shadow-gold p-8 max-w-2xl mx-auto"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-30"></div>

            <div className="space-y-6">
              <div className="flex items-center">
                <CalendarIcon className="text-gold-400 mr-3" />
                <h2 className="text-xl font-bold bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                  DÉTAILS DE VOTRE RENDEZ-VOUS
                </h2>
              </div>

              <div className="space-y-4 text-zinc-300">
                <div>
                  <span className="font-semibold text-gold-400">
                    Numéro de réservation :
                  </span>{" "}
                  {booking.id}
                </div>
                <div>
                  <span className="font-semibold text-gold-400">Client :</span>{" "}
                  {booking.customerName}
                </div>
                <div>
                  <span className="font-semibold text-gold-400">Service :</span>{" "}
                  {typeof booking.service === "object" && booking.service?.name
                    ? booking.service.name
                    : "Service non spécifié"}
                </div>
                <div>
                  <span className="font-semibold text-gold-400">Barbier :</span>{" "}
                  {typeof booking.barber === "object" && booking.barber?.name
                    ? booking.barber.name
                    : "Barbier non spécifié"}
                </div>
                <div>
                  <span className="font-semibold text-gold-400">Date :</span>{" "}
                  {`${formattedDate} – ${formattedTime}`}
                </div>
                {booking.comments && (
                  <div>
                    <span className="font-semibold text-gold-400">
                      Commentaires :
                    </span>{" "}
                    {booking.comments}
                  </div>
                )}
              </div>

              <div className="flex justify-center mt-8">
                <Link href="/booking">
                  <Button className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white !rounded-button shadow-gold px-8 py-3 text-lg">
                    Réserver un autre rendez-vous
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 text-zinc-400">
            <p>
              Un email de confirmation a été envoyé à {booking.customerEmail}.
            </p>
            <p className="mt-2">
              Besoin d&apos;annuler ou de modifier ?{" "}
              <Link href="/contact" className="text-gold-400 hover:underline">
                Contactez-nous
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
