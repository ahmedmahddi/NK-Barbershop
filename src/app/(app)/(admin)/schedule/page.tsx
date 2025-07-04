"use client";

import { FC, useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";

import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

// Barber type definition
type Barber = {
  id: number;
  name: string;
  color: string;
};

// Color palette for barbers
const COLOR_PALETTE = ["emerald-400", "blue-400", "rose-400", "gold-400"];

const SchedulePage: FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Initialize with today's date
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);

  // Fetch data
  const trpc = useTRPC();
  const { data: barbersData = [] } = useSuspenseQuery(
    trpc.booking.getBarbers.queryOptions()
  );
  const { data: bookingsData = [] } = useSuspenseQuery(
    trpc.booking.getAll.queryOptions()
  );

  // Process barbers with colors
  const barbers: Barber[] = useMemo(
    () =>
      barbersData.map((b, index) => ({
        id: b.id,
        name: b.name,
        color: COLOR_PALETTE[index % COLOR_PALETTE.length] || "gold-400",
      })),
    [barbersData]
  );

  // Calculate month days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create booking color map
  const bookedColour = useMemo(() => {
    const map = new Map<string, string[]>();
    const barberColorMap = new Map<number, string>(
      barbers.map(b => [b.id, b.color])
    );

    bookingsData.forEach(booking => {
      const dateKey = format(new Date(booking.start), "yyyy-MM-dd");
      const barberId =
        typeof booking.barber === "number" ? booking.barber : booking.barber.id;
      const color = barberColorMap.get(barberId);
      if (color) {
        const existing = map.get(dateKey) || [];
        map.set(dateKey, [...existing, color]);
      }
    });

    return map;
  }, [bookingsData, barbers]);

  // Filter bookings for selected date and barber
  const filteredBookings = useMemo(() => {
    if (!selectedDate) return [];
    return bookingsData
      .filter(booking => {
        const bookingDate = new Date(booking.start);
        const isSameDate = isSameDay(bookingDate, selectedDate);
        const barberId =
          typeof booking.barber === "number"
            ? booking.barber
            : booking.barber.id;
        return isSameDate && (!selectedBarber || barberId === selectedBarber);
      })
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );
  }, [bookingsData, selectedDate, selectedBarber]);

  // Month navigation
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="space-y-6 p-6 text-white">
      {/* Header */}
      <div className="flex items-center">
        <div className="w-8 h-1 bg-gold-400 mr-4" />
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text text-transparent">
          Planning
        </h2>
      </div>

      {/* Month & legend */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-zinc-700">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-zinc-400">
            <CalendarIcon size={18} />
            {format(monthStart, "MMMM yyyy")}
          </div>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-zinc-700">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => setSelectedBarber(null)}
            className={`px-2 py-1 rounded ${!selectedBarber ? "bg-gold-400/20" : "hover:bg-zinc-700 "}`}
          >
            Tous les coiffeurs
          </button>
          {barbers.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBarber(b.id)}
              className={[
                "px-2 py-1 rounded flex items-center gap-1",
                selectedBarber === b.id
                  ? `bg-gold-400/20`
                  : "hover:bg-zinc-700 ",
              ].join(" ")}
            >
              <span
                className={`inline-block w-3 h-3 rounded-full bg-${b.color}`}
              />
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(d => (
          <div key={d} className="font-semibold text-zinc-400 py-2">
            {d}
          </div>
        ))}

        {days.map(day => {
          const dateKey = format(day, "yyyy-MM-dd");
          const colours = bookedColour.get(dateKey) || [];
          const isToday = dateKey === format(new Date(), "yyyy-MM-dd");
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(day)}
              className={`
                relative h-12 rounded-md flex items-center justify-center
                ${isToday ? "border border-gold-400/60" : "border border-transparent"}
                ${isSelected ? "bg-gold-400/20" : colours.length > 0 ? `bg-zinc-800/50` : "bg-zinc-800"}
                hover:bg-gold-400/10 transition-colors
              `}
            >
              {format(day, "d")}
              {colours.length > 0 && (
                <div className="absolute bottom-1 right-1 flex gap-0.5">
                  {colours.map((colour, i) => (
                    <span
                      key={i}
                      className={`inline-block w-1.5 h-1.5 rounded-full bg-${colour}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bookings list */}
      {selectedDate && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4 text-gold-400">
            Réservations pour {format(selectedDate, "d MMMM yyyy")}
            {selectedBarber &&
              ` - ${barbers.find(b => b.id === selectedBarber)?.name}`}
          </h3>
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map(booking => {
                const barberId =
                  typeof booking.barber === "number"
                    ? booking.barber
                    : booking.barber.id;
                const barber = barbers.find(b => b.id === barberId);
                return (
                  <div
                    key={booking.id}
                    className="border border-gold-400/20 rounded-xl p-4 bg-zinc-900 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-zinc-300">
                        {format(new Date(booking.start), "HH:mm")} {" - "}
                        {format(new Date(booking.end), "HH:mm")}
                      </p>
                      <p className="text-sm text-zinc-400">
                        Client : {booking.customerName}
                      </p>
                      <p className="text-sm text-zinc-400">
                        Coiffeur : {barber?.name}
                      </p>
                    </div>
                    <span
                      className={`inline-block w-3 h-3 rounded-full bg-${barber?.color}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-zinc-400">
              Aucune réservation pour cette date
              {selectedBarber ? " et ce coiffeur" : ""}.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
