"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { useTRPC } from "@/trpc/client"; // <-  your typed client
import { bookingSchema, BookingInput } from "@/modules/Bookings/Schema";

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  CalendarIcon,
  InfoIcon,
  UploadCloudIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { uploadReference } from "@/lib/uploadRefrence";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  /* —— hooks —— */

  const { toast } = useToast();
  const router= useRouter();
  const [date, setDate] = useState<Date>();

  /* —— tRPC hooks —— */
  const trpc = useTRPC();
  const servicesQ = useSuspenseQuery(trpc.booking.getServices.queryOptions());
  const barbersQ = useSuspenseQuery(trpc.booking.getBarbers.queryOptions());

  /* —— form —— */
  const formMethods = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = formMethods;

  // Controlled values for selects
  const serviceId = watch("serviceId") || "";
  const barberId = watch("barberId") || "";
  const time = watch("time") || "";

  /* —— dynamic slot query —— */
  const slotsQ = useQuery(
    trpc.booking.getAvailableSlots.queryOptions(
      {
        barberId: watch("barberId") ?? "",
        date: date ? format(date, "yyyy-MM-dd") : "",
      },
      {
        enabled: !!watch("barberId") && !!watch("serviceId") && !!date,
        staleTime: 0, // Disable caching
        refetchOnWindowFocus: true, // Refetch when window is focused
      }
    )
  );

  /* —— mutation —— */
  const sendEmail = useMutation(
    trpc.booking.sendBookingConfirmation.mutationOptions()
  );
  const createM = useMutation(
    trpc.booking.createBooking.mutationOptions({
      onSuccess: async ({ id }) => {
        try {
          // Get customer email from form values
          const customerEmail = watch("customerEmail");
          if (!customerEmail) {
            throw new Error("Customer email is required");
          }

          // Call the sendBookingConfirmation mutation
          await sendEmail.mutateAsync({
            bookingId: String(id),
            to: customerEmail,
            from: "naimkchaobarbershop@gmail.com",
            subject: "Confirmation de votre réservation",
            text: `Votre réservation (ID: ${id}) a été confirmée ! Merci de choisir Naim Kchao Barbershop.`,
          });

          toast({
            title: "Réservé 🎉",
            description: "Confirmation envoyée par email !",
            
          });
          router.push(`/booking/confirmation/${id}`);
        } catch (error) {
          toast({
            title: "Échec de l'envoi de l'email",
            description:
              error instanceof Error
                ? error.message
                : "Une erreur s'est produite lors de l'envoi de l'email",
            variant: "destructive",
          });
        }
      },
      onError: err =>
        toast({
          title: "Échec de la réservation",
          description: err.message,
          variant: "destructive",
        }),
    })
  );
  /* —— submit —— */
  const onSubmit = handleSubmit(async values => {
    if (!date) {
      toast({ title: "Choisissez d'abord une date", variant: "destructive" });
      return;
    }
    let mediaId: number | undefined;
    const file = selectedFile;

    if (file) {
      mediaId = await uploadReference(file);
    }

    createM.mutate({
      ...values,
      date: format(date, "yyyy-MM-dd"),
      referencePhoto: mediaId !== undefined ? String(mediaId) : undefined,
    });
  });

  // File upload preview logic
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setValue("referencePhoto", e.target.files);
    }
  };

  // Date/time logic for new layout
  const selectedDate = date;
  const setSelectedDate = (d: Date | undefined) => {
    setDate(d);
    if (d) setValue("date", format(d, "yyyy-MM-dd"), { shouldValidate: true });
  };
  const selectedBarber = barbersQ.data?.find(b => String(b.id) === barberId);
  const selectedTime = time;
  const setSelectedTime = (t: string) => setValue("time", t);
  const availableTimeSlots = slotsQ.data || [];
  const checkingAvailability = slotsQ.isLoading;
  const loadingBarbers = barbersQ.isLoading;

  // Validation helpers
  const isSubmitting = createM.isPending;
  const isValid = serviceId && barberId && date && time;

  /* ————————————————————————  JSX  ———————————————————————— */
  return (
    <main className="flex-1">
      <section className="w-full py-24 md:py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mt-12 mb-12">
            <div className="w-12 h-1 bg-gold-400 mr-4"></div>
            <h1 className="text-3xl font-bold text-center tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
              RÉSERVEZ UN RENDEZ-VOUS
            </h1>
            <div className="w-12 h-1 bg-gold-400 ml-4"></div>
          </div>
          <FormProvider {...formMethods}>
            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
            >
              {/* Appointment Details */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-gold-400/10 shadow-gold p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-30"></div>
                <div className="flex items-center mb-6">
                  {/* You can add an icon here if you want */}
                  <CalendarIcon className="text-gold-400 mr-3" />
                  <h2 className="text-xl font-bold bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                    DÉTAILS DU RENDEZ-VOUS
                  </h2>
                </div>
                <div className="space-y-6">
                  {/* Service Select */}
                  <div>
                    <label
                      htmlFor="service-select"
                      className="block text-sm mb-2 text-zinc-400"
                    >
                      Service
                    </label>
                    <Select
                      value={serviceId}
                      onValueChange={val => setValue("serviceId", val)}
                    >
                      <SelectTrigger
                        id="service-select"
                        className="bg-zinc-800 border-none rounded-2keyboard_arrow_right rounded-2xl h-12 hover:border-gold-400/30 transition-colors text-gold-500"
                      >
                        <SelectValue
                          className="text-gold-500"
                          placeholder={
                            <span className="text-white">
                              Sélectionnez un service
                            </span>
                          }
                        >
                          {serviceId ? (
                            servicesQ.data?.find(
                              s => String(s.id) === serviceId
                            )?.name
                          ) : (
                            <span className="text-white">
                              Sélectionnez un service
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-none text-white rounded-2xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gold-400 scrollbar-track-zinc-800">
                        {servicesQ.data?.map(service => (
                          <SelectItem
                            className="text-gold-500"
                            key={service.id}
                            value={String(service.id)}
                          >
                            {service.name}, {service.price} TND,{" "}
                            {service.duration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.serviceId && (
                      <span className="text-red-500 text-sm">
                        {errors.serviceId.message}
                      </span>
                    )}
                  </div>
                  {/* Barber Select */}
                  <div>
                    <label
                      htmlFor="barber-select"
                      className="block text-sm mb-2 text-zinc-300"
                    >
                      Barbier
                    </label>
                    <Select
                      value={barberId}
                      onValueChange={val => setValue("barberId", val)}
                      disabled={loadingBarbers}
                    >
                      <SelectTrigger
                        id="barber-select"
                        className="bg-zinc-800 border-none rounded-2xl h-12 hover:border-gold-400/30 transition-colors text-gold-500"
                      >
                        <SelectValue
                          placeholder={
                            <span className="text-white">
                              Choisissez votre barbier
                            </span>
                          }
                        >
                          {barberId ? (
                            barbersQ.data?.find(b => String(b.id) === barberId)
                              ?.name
                          ) : loadingBarbers ? (
                            "Chargement des barbiers..."
                          ) : (
                            <span className="text-white">
                              Choisissez votre barbier
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-none text-white rounded-2xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gold-400 scrollbar-track-zinc-800">
                        {barbersQ.data?.length ? (
                          barbersQ.data.map(barber => (
                            <SelectItem
                              className="text-gold-500"
                              key={barber.id}
                              value={String(barber.id)}
                            >
                              {barber.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-barbers" disabled>
                            {loadingBarbers
                              ? "Chargement..."
                              : "Aucun barbier disponible"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.barberId && (
                      <span className="text-red-500 text-sm">
                        {errors.barberId.message}
                      </span>
                    )}
                  </div>
                  {/* Date Picker */}
                  <div>
                    <label
                      htmlFor="date-picker"
                      className="block text-sm mb-2 text-zinc-300 "
                    >
                      Sélectionnez la date
                    </label>
                    <div className="bg-zinc-800/70 border rounded-2xl border-zinc-700  p-4 focus-within:border-gold-400 focus-within:ring-1 focus-within:ring-gold-400 transition-colors hover:border-gold-400/30">
                      <style>{`
                          .rdp-root {
                            --rdp-cell-size: 40px ;
                            --rdp-accent-color: #d4af37;
                            --rdp-background-color: rgba(212, 175, 55, 0.2);
                            --rdp-accent-color-dark: #d4af37;
                            --rdp-background-color-dark: rgba(
                              212,
                              175,
                              55,
                              0.2
                            );
                            --rdp-outline: 2px solid var(--rdp-accent-color);
                            --rdp-outline-selected: 2px solid
                              var(--rdp-accent-color);
                            margin: 0;
                          }
                          .rdp-months {
                            justify-content: center;
                          }
                          .rdp-day_selected,
                          .rdp-day_selected:focus-visible,
                          .rdp-day_selected:hover {
                            background-color: var(--rdp-accent-color);
                            color: white;
                          }
                          .rdp-button:hover:not([disabled]):not(
                              .rdp-day_selected
                            ) {
                            background-color: rgba(212, 175, 55, 0.1);
                          }
                          .rdp-day {
                            color: #e4e4e7;
                          }
                          .rdp-head_cell {
                            color: #a1a1aa;
                            font-weight: 600;
                          }
                          .rdp-nav_button:hover {
                            background-color: rgba(212, 175, 55, 0.1);
                          }
                        `}</style>
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="text-gold-500"
                        fromMonth={new Date()}
                        disabled={{ before: new Date() }}
                        id="date-picker"
                      />
                    </div>
                    {!selectedDate && errors.date && (
                      <span className="text-red-500 text-sm">
                        La date est requise
                      </span>
                    )}
                  </div>
                  {/* Time Slots */}
                  {selectedDate && selectedBarber && (
                    <div>
                      <label
                        htmlFor="time-slots"
                        className="block text-sm mb-2 text-zinc-300"
                      >
                        <span>Créneaux horaires disponibles</span>
                      </label>
                      {checkingAvailability ? (
                        <div className="text-center py-8 px-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-gold-400 border-r-transparent"></div>
                          <p className="mt-2 text-sm text-zinc-400">
                            Vérification de la disponibilité...
                          </p>
                        </div>
                      ) : (
                        <div
                          id="time-slots"
                          className="grid grid-cols-2 gap-2 mt-2"
                        >
                          {availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map(slot => (
                              <Button
                                key={slot}
                                type="button"
                                variant="outline"
                                className={`border border-zinc-700 hover:border-gold-400/30 rounded-2xl ${
                                  selectedTime === slot
                                    ? "bg-gradient-to-br from-gold-400 to-gold-500 text-white"
                                    : "bg-zinc-800/70 text-white hover:bg-zinc-700/50"
                                }`}
                                onClick={() => setSelectedTime(slot)}
                              >
                                {slot}
                              </Button>
                            ))
                          ) : (
                            <div className="col-span-2 text-center py-4 px-3 text-zinc-400 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                              <p className="text-rose-400 mb-1">
                                Tous les créneaux sont réservés pour cette date
                              </p>
                              <p className="text-sm">
                                Veuillez sélectionner une autre date ou un autre
                                barbier
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      {errors.time &&
                        !selectedTime &&
                        !checkingAvailability && (
                          <span className="text-red-500 text-sm block mt-2">
                            Le créneau horaire est requis
                          </span>
                        )}
                    </div>
                  )}
                </div>
              </div>
              {/* Style Preference (Photo Upload) */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-gold-400/10 shadow-gold p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-30"></div>
                <div className="flex items-center mb-6">
                  <InfoIcon className="text-gold-400 mr-3" />
                  <h2 className="text-xl font-bold bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                    PRÉFÉRENCE DE STYLE
                  </h2>
                </div>
                <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 text-center h-[300px] flex flex-col items-center justify-center group hover:border-gold-400/30 transition-colors bg-zinc-900/30">
                  {previewUrl ? (
                    <div className="w-full h-full relative flex flex-col items-center">
                      <div className="relative w-full h-[200px] mb-4">
                        <Image
                          fill
                          src={previewUrl}
                          alt="Aperçu du style"
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="border border-zinc-700 hover:border-rose-400/30 text-rose-400 bg-zinc-800/70"
                        onClick={() => {
                          setPreviewUrl(null);
                          setSelectedFile(null);
                          setValue("referencePhoto", undefined);
                        }}
                      >
                        Supprimer l&apos;image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="text-5xl mb-4 text-zinc-600 group-hover:text-gold-400 transition-colors">
                        <UploadCloudIcon />
                      </div>
                      <p className="text-lg text-zinc-400 mb-2">
                        Glissez-déposez votre image ici
                      </p>
                      <p className="text-sm text-zinc-600 mb-4">OU</p>
                      <Input
                        type="file"
                        id="image"
                        accept=".jpg,.png,.gif"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white !rounded-button shadow-gold"
                        onClick={() =>
                          document.getElementById("image")?.click()
                        }
                      >
                        Parcourir les images
                      </Button>
                      <p className="text-xs text-zinc-600 mt-4">
                        Formats pris en charge : JPG, PNG et GIF
                      </p>
                      <p className="text-xs text-zinc-600">
                        Taille max : 10 Mo
                      </p>
                    </>
                  )}
                </div>
              </div>
              {/* Customer Information */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-gold-400/10 shadow-gold p-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-30"></div>
                <div className="flex items-center mb-6">
                  <UserIcon className="text-gold-400 mr-3" />
                  <h2 className="text-xl font-bold bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                    INFORMATIONS CLIENT
                  </h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm mb-2 text-zinc-400"
                    >
                      Nom complet
                    </label>
                    <Input
                      id="name"
                      {...register("customerName", {
                        required: "Le nom est requis",
                      })}
                      className="bg-zinc-800 border-none text-white h-12 hover:border-gold-400/30 transition-colors rounded-2xl focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                      placeholder="Votre nom et prénom"
                    />
                    {errors.customerName && (
                      <span className="text-red-500 text-sm">
                        {errors.customerName.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm mb-2 text-zinc-300"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      {...register("customerEmail", {
                        required: "L'email est requis",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Email invalide",
                        },
                      })}
                      className="bg-zinc-800 border-none text-white h-12 hover:border-gold-400/30  rounded-2xl focus:border-gold-400 focus:ring-1 focus:ring-gold-400  transition-colors"
                      placeholder="Votre adresse email"
                    />
                    {errors.customerEmail && (
                      <span className="text-red-500 text-sm">
                        {errors.customerEmail.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm mb-2 text-zinc-300"
                    >
                      Numéro de téléphone
                    </label>
                    <Input
                      id="phone"
                      {...register("phone", {
                        required: "Le numéro de téléphone est requis",
                        pattern: {
                          value: /^[0-9+\-\s]+$/,
                          message: "Numéro de téléphone invalide",
                        },
                      })}
                      className="bg-zinc-800 border-none text-white h-12 hover:border-gold-400/30 transition-colors rounded-2xl focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                      placeholder="Votre numéro de téléphone portable"
                    />
                    {errors.phone && (
                      <span className="text-red-500 text-sm">
                        {errors.phone.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="comments"
                      className="block text-sm mb-2 text-zinc-300"
                    >
                      Commentaires (optionnel)
                    </label>
                    <Textarea
                      id="comments"
                      {...register("comments")}
                      className="bg-zinc-800 border-none text-white h-32 hover:border-gold-400/30 transition-colors rounded-2xl focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                      placeholder="Des exigences particulières ?"
                    />
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="agreement"
                        {...register("agreement", {
                          required: "Vous devez accepter pour continuer",
                        })}
                        className="mr-2 w-5 h-5 rounded-2xl bg-zinc-800 border-zinc-700 focus:ring-gold-400 text-gold-400"
                      />
                      <label
                        htmlFor="agreement"
                        className="text-sm text-zinc-400"
                      >
                        J&apos;accepte le traitement des données personnelles
                      </label>
                    </div>
                    {errors.agreement && (
                      <span className="text-red-500 text-sm">
                        {errors.agreement.message}
                      </span>
                    )}
                    <Button
                      type="submit"
                      className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white w-full h-12 text-lg !rounded-button shadow-gold"
                      disabled={
                        isSubmitting ||
                        !isValid ||
                        !selectedDate ||
                        !selectedTime
                      }
                    >
                      {isSubmitting
                        ? "Réservation…"
                        : "Confirmer le rendez-vous"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </section>
      <section
        className="w-full py-12 md:py-24 bg-zinc-900/90 relative overflow-hidden "
        style={{
          backgroundImage: `
    linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)),
    url('/images/bg-pattern.png')
  `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="absolute inset-0 bg-gold-radial opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-br from-transparent via-gold-400 to-transparent opacity-30"></div>
        <div className="container relative px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center mb-8">
                <div className="w-12 h-1 bg-gold-400 mr-4"></div>
                <h2 className="text-3xl font-bold tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                  PRODUITS DE SOINS PREMIUM
                </h2>
                <div className="w-12 h-1 bg-gold-400 ml-4"></div>
              </div>
              <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Découvrez notre sélection de produits de soins de haute qualité
                pour entretenir votre style à la maison.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/shop">
                <Button
                  size="lg"
                  className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white !rounded-button shadow-gold px-8 py-6 text-lg"
                >
                  Acheter maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
