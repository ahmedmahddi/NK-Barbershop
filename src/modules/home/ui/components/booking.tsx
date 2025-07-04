import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { useTRPC } from "@/trpc/client";
import { bookingSchema, BookingInput } from "@/modules/Bookings/Schema";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { UploadCloudIcon } from "lucide-react";
import { uploadReference } from "@/lib/uploadRefrence";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const Booking = () => {
  // —— hooks ——
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();

  // —— tRPC hooks ——
  const trpc = useTRPC();
  const servicesQ = useSuspenseQuery(trpc.booking.getServices.queryOptions());
  const barbersQ = useSuspenseQuery(trpc.booking.getBarbers.queryOptions());

  // —— formulaire ——
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

  // Valeurs contrôlées pour les sélections
  const serviceId = watch("serviceId") || "";
  const barberId = watch("barberId") || "";
  const time = watch("time") || "";

  // —— requête dynamique des créneaux ——
  const slotsQ = useQuery(
    trpc.booking.getAvailableSlots.queryOptions(
      {
        barberId: watch("barberId") ?? "",
        date: date ? format(date, "yyyy-MM-dd") : "",
      },
      {
        enabled: !!watch("barberId") && !!watch("serviceId") && !!date,
        staleTime: 0, // Désactiver la mise en cache
        refetchOnWindowFocus: true, // Rafraîchir lorsque la fenêtre est active
      }
    )
  );

  // —— mutation ——
  const createM = useMutation(
    trpc.booking.createBooking.mutationOptions({
      onSuccess: ({ id }) => {
        toast({ title: "Réservé 🎉", description: "Confirmation envoyée !" });
        router.push(`/booking/confirm/${id}`);
      },
      onError: err =>
        toast({
          title: "Échec de la réservation",
          description: err.message,
          variant: "destructive",
        }),
    })
  );

  // —— soumission ——
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

  // Logique de prévisualisation du fichier téléchargé
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

  // Logique de date/heure pour la nouvelle mise en page
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

  // Aides à la validation
  const isSubmitting = createM.isPending;
  const isValid = serviceId && barberId && date && time;

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onSubmit} className="py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-12">
            <div className="w-12 h-1 bg-gold-400 mr-4"></div>
            <h2 className="text-4xl font-bold tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
              RÉSERVER UN RENDEZ-VOUS
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Détails du rendez-vous */}
            <div>
              <h3 className="text-2xl font-bold mb-8 tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                DÉTAILS DU RENDEZ-VOUS
              </h3>
              <div className="space-y-6">
                {/* Sélection du service */}
                <div>
                  <label className="block text-sm mb-2 text-zinc-400">
                    Service
                  </label>
                  <Select
                    value={serviceId}
                    onValueChange={val => setValue("serviceId", val)}
                  >
                    <SelectTrigger className="bg-zinc-800 border-none rounded-2xl text-white h-12 hover:border-gold-400/30 transition-colors">
                      <SelectValue placeholder="Sélectionner un service">
                        {serviceId
                          ? servicesQ.data?.find(
                              s => String(s.id) === serviceId
                            )?.name
                          : "Sélectionner un service"}
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
                  Achilles
                  {errors.serviceId && (
                    <span className="text-red-500 text-sm">
                      {errors.serviceId.message}
                    </span>
                  )}
                </div>
                {/* Sélection du barbier */}
                <div>
                  <label className="block text-sm mb-2 text-zinc-400">
                    Barbier
                  </label>
                  <Select
                    value={barberId}
                    onValueChange={val => setValue("barberId", val)}
                    disabled={loadingBarbers}
                  >
                    <SelectTrigger className="bg-zinc-800 border-none text-white h-12 hover:border-gold-400/30 transition-colors rounded-2xl">
                      <SelectValue placeholder="Choisir votre barbier">
                        {barberId
                          ? barbersQ.data?.find(b => String(b.id) === barberId)
                              ?.name
                          : loadingBarbers
                            ? "Chargement..."
                            : "Choisir votre barbier"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-none text-white rounded-2xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gold-400 scrollbar-track-zinc-800">
                      {barbersQ.data?.length ? (
                        barbersQ.data.map(barber => (
                          <SelectItem key={barber.id} value={String(barber.id)}>
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
                {/* Sélecteur de date */}
                <div>
                  <label className="block text-sm mb-2 text-zinc-400">
                    Date
                  </label>
                  <div className="bg-zinc-800/70 border rounded-2xl border-zinc-700 p-4 focus-within:border-gold-400 focus-within:ring-1 focus-within:ring-gold-400 transition-colors hover:border-gold-400/30">
                    <style>{`
                          .rdp-root {
                            --rdp-cell-size: 40px;
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
                              .rdp-day selected
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
                    />
                  </div>
                  {!selectedDate && errors.date && (
                    <span className="text-red-500 text-sm">
                      La date est requise
                    </span>
                  )}
                </div>
                {/* Créneaux horaires */}
                {selectedDate && selectedBarber && (
                  <div>
                    <label className="block text-sm mb-2 text-zinc-400">
                      Heure
                    </label>
                    {checkingAvailability ? (
                      <div className="text-center py-8 px-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-gold-400 border-r-transparent"></div>
                        <p className="mt-2 text-sm text-zinc-400">
                          Vérification de la disponibilité...
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-2">
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
                    {errors.time && !selectedTime && !checkingAvailability && (
                      <span className="text-red-500 text-sm block mt-2">
                        Le créneau horaire est requis
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Préférence de style (téléchargement de photo) */}
            <div>
              <h3 className="text-2xl font-bold mb-8 tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                PRÉFÉRENCE DE STYLE (FACULTATIF)
              </h3>
              <div className="border-2 border-dashed border-zinc-700 p-8 text-center h-[300px] flex flex-col items-center justify-center group hover:border-gold-400/30 transition-colors rounded-2xl">
                {previewUrl ? (
                  <div className="w-full h-full relative flex flex-col items-center">
                    <div className="relative w-full h-[200px] mb-4">
                      <img
                        src={previewUrl}
                        alt="Aperçu"
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
                    <div className="text-5xl mb-4 text-zinc-600 group-hover:text-gold-500 transition-colors">
                      <UploadCloudIcon />
                    </div>
                    <p className="text-lg text-zinc-400 mb-2">
                      Glissez et déposez votre image ici
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
                      onClick={() => document.getElementById("image")?.click()}
                    >
                      Parcourir les images
                    </Button>
                    <p className="text-xs text-zinc-600 mt-4">
                      Formats pris en charge : JPG, PNG et GIF
                    </p>
                    <p className="text-xs text-zinc-600">
                      Taille maximale : 10 Mo
                    </p>
                  </>
                )}
              </div>
            </div>
            {/* Informations du client */}
            <div>
              <h3 className="text-2xl font-bold mb-8 tracking-wider bg-gradient-to-br from-white via-gold-200 to-white bg-clip-text text-transparent">
                INFORMATIONS DU CLIENT
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-zinc-400">
                    Nom complet
                  </label>
                  <Input
                    {...register("customerName", {
                      required: "Le nom est requis",
                    })}
                    className="bg-zinc-800 border-none text-white h-12 hover:border-gold-400/30 transition-colors rounded-2xl"
                    placeholder="Votre nom et prénom"
                  />
                  {errors.customerName && (
                    <span className="text-red-500 text-sm">
                      {errors.customerName.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-2 text-zinc-400">
                    Email
                  </label>
                  <Input
                    type="email"
                    {...register("customerEmail", {
                      required: "L'email est requis",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Email invalide",
                      },
                    })}
                    className="bg-zinc-800 border-none text-white h-12 hover:border-gold-400/30 transition-colors rounded-2xl"
                    placeholder="Votre adresse email"
                  />
                  {errors.customerEmail && (
                    <span className="text-red-500 text-sm">
                      {errors.customerEmail.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-2 text-zinc-400">
                    Numéro de téléphone
                  </label>
                  <Input
                    {...register("phone", {
                      required: "Le numéro de téléphone est requis",
                      pattern: {
                        value: /^[0-9+\-\s]+$/,
                        message: "Numéro de téléphone invalide",
                      },
                    })}
                    className="bg-zinc-800 border-none text-white h-12 hover:border-gold-400/30 transition-colors rounded-2xl"
                    placeholder="Votre numéro de téléphone mobile"
                  />
                  {errors.phone && (
                    <span className="text-red-500 text-sm">
                      {errors.phone.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-2 text-zinc-400">
                    Commentaires (facultatif)
                  </label>
                  <Textarea
                    {...register("comments")}
                    className="bg-zinc-800 border-none text-white min-h-[120px] hover:border-gold-400/30 transition-colors rounded-2xl"
                    placeholder="Des exigences supplémentaires ?"
                  />
                </div>
                <div className="mt-8">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      className="mr-2 bg-zinc-900 border-zinc-700 hover:border-gold-400/30 transition-colors"
                      id="agreement"
                      {...register("agreement", {
                        required: "Vous devez accepter pour continuer",
                      })}
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
                      isSubmitting || !isValid || !selectedDate || !selectedTime
                    }
                  >
                    {isSubmitting
                      ? "Réservation en cours…"
                      : "Confirmer le rendez-vous"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default Booking;
