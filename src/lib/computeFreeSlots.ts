import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { generateTimeSlots, parseDuration } from "@/lib/utils";
import { Service, Team } from "@/payload-types";
import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";

// Helper to convert a time in a specific timezone to UTC
function zonedTimeToUtc(dateString: string, timeZone: string): Date {
  // dateString: "YYYY-MM-DDTHH:mm:ss.sss"
  const zonedDate = toZonedTime(dateString, timeZone);
  // Get the offset in minutes and convert to milliseconds
  const offset = zonedDate.getTimezoneOffset() * 60 * 1000;
  return new Date(zonedDate.getTime() - offset);
}

import type { BasePayload } from "payload";

// Define the timezone constant
const TUNIS_TZ = "Africa/Tunis";

// Function to compute free slots for a barber on a specific date
export async function computeFreeSlots({
  db,
  barberId,
  date,
}: {
  db: BasePayload;
  barberId: number;
  date: string; // "YYYY-MM-DD"
}): Promise<string[]> {
  console.log("[computeFreeSlots] called with", { barberId, date });
  // Compute UTC start and end of day in Africa/Tunis timezone
  const dayStartUTC = zonedTimeToUtc(
    `${date}T00:00:00.000`,
    TUNIS_TZ
  ).toISOString();
  const dayEndUTC = zonedTimeToUtc(
    `${date}T23:59:59.999`,
    TUNIS_TZ
  ).toISOString();
  console.log(
    "[computeFreeSlots] dayStartUTC:",
    dayStartUTC,
    "dayEndUTC:",
    dayEndUTC
  );

  // Fetch bookings for the barber within the day
  const bookings = await db.find({
    collection: "bookings",
    where: {
      and: [
        { barber: { equals: barberId } },
        { start: { greater_than_equal: dayStartUTC } },
        { start: { less_than_equal: dayEndUTC } },
        { status: { in: ["pending", "confirmed"] } },
      ],
    },
    depth: 0,
  });
  console.log("[computeFreeSlots] bookings found:", bookings.docs.length);

  // Generate all possible slots for the day
  const allSlots = generateTimeSlots();
  console.log("[computeFreeSlots] allSlots count:", allSlots.length);

  // Helper function to convert "HH:mm" time to minutes
  function timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  // Determine occupied slots based on booking durations
  const occupiedSlots = new Set<string>();
  for (const b of bookings.docs) {
    const bookingStartLocal = formatInTimeZone(
      new Date(b.start),
      TUNIS_TZ,
      "HH:mm"
    );
    const bookingEndLocal = formatInTimeZone(
      new Date(b.end),
      TUNIS_TZ,
      "HH:mm"
    );
    const startMinutes = timeToMinutes(bookingStartLocal);
    const endMinutes = timeToMinutes(bookingEndLocal);
    console.log("[computeFreeSlots] booking:", {
      start: b.start,
      end: b.end,
      bookingStartLocal,
      bookingEndLocal,
      startMinutes,
      endMinutes,
    });
    for (const slot of allSlots) {
      const slotMinutes = timeToMinutes(slot);
      if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
        occupiedSlots.add(slot);
      }
    }
  }
  console.log("[computeFreeSlots] occupiedSlots count:", occupiedSlots.size);

  // Filter out occupied slots to get free slots
  const freeSlots = allSlots.filter(slot => !occupiedSlots.has(slot));
  console.log("[computeFreeSlots] freeSlots count:", freeSlots.length);
  return freeSlots;
}

// Define the booking router with all procedures
export const bookingRouter = createTRPCRouter({
  // Fetch all services
  getServices: baseProcedure.query(async ({ ctx }) => {
    console.log("[bookingRouter.getServices] called");
    const res = await ctx.db.find({ collection: "services", depth: 0 });
    console.log("[bookingRouter.getServices] found services:", res.docs.length);
    return res.docs as Service[];
  }),

  // Fetch all barbers
  getBarbers: baseProcedure.query(async ({ ctx }) => {
    console.log("[bookingRouter.getBarbers] called");
    const res = await ctx.db.find({ collection: "team", depth: 0 });
    console.log("[bookingRouter.getBarbers] found barbers:", res.docs.length);
    return res.docs as Team[];
  }),

  // Get available slots for a barber on a specific date
  getAvailableSlots: baseProcedure
    .input(
      z.object({
        barberId: z.string(),
        date: z.string(), // YYYY-MM-DD
      })
    )
    .query(async ({ ctx, input }) => {
      console.log("[bookingRouter.getAvailableSlots] called with", input);
      return computeFreeSlots({
        db: ctx.db,
        barberId: Number(input.barberId),
        date: input.date,
      });
    }),

  // Create a new booking
  createBooking: baseProcedure
    .input(
      z.object({
        barberId: z.string(),
        serviceId: z.string(),
        date: z.string(), // YYYY-MM-DD
        time: z.string(), // HH:MM
        customerName: z.string(),
        customerEmail: z.string().email(),
        phone: z.string(),
        comments: z.string().optional(),
        referencePhoto: z.string().optional(),
        agreement: z.literal(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        barberId,
        serviceId,
        date,
        time,
        customerName,
        customerEmail,
        phone,
        comments,
        referencePhoto,
      } = input;
      console.log("[bookingRouter.createBooking] called with", input);
      // Check if the selected slot is still available
      const free = await computeFreeSlots({
        db: ctx.db,
        barberId: Number(barberId),
        date,
      });
      if (!free.includes(time)) {
        console.log("[bookingRouter.createBooking] slot not available", time);
        throw new Error("Selected slot is no longer available");
      }

      // Fetch service duration and calculate start/end times
      const service = await ctx.db.findByID({
        collection: "services",
        id: Number(serviceId),
      });
      const minutes = parseDuration(service.duration ?? undefined);
      console.log(
        "[bookingRouter.createBooking] service duration (minutes):",
        minutes
      );

      // Construct local date-time string and convert to UTC
      const localDateTime = `${date}T${time}:00.000+01:00`;
      const startDate = toZonedTime(new Date(localDateTime), TUNIS_TZ);
      const startISO = fromZonedTime(startDate, TUNIS_TZ).toISOString();
      const endISO = fromZonedTime(
        new Date(startDate.getTime() + minutes * 60_000),
        TUNIS_TZ
      ).toISOString();
      console.log(
        "[bookingRouter.createBooking] startISO:",
        startISO,
        "endISO:",
        endISO
      );

      // Create the booking
      try {
        const booking = await ctx.db.create({
          collection: "bookings",
          data: {
            barber: Number(barberId),
            service: Number(serviceId),
            start: startISO,
            end: endISO,
            customerName,
            customerEmail,
            phone,
            comments,
            referencePhoto: referencePhoto ? Number(referencePhoto) : undefined,
            agreement: true,
            status: "confirmed",
          },
        });
        console.log(
          "[bookingRouter.createBooking] booking created with id:",
          booking.id
        );
        return { id: booking.id };
      } catch (error) {
        // Handle duplicate booking errors
        if (
          typeof error === "object" &&
          error !== null &&
          ("code" in error || "message" in error)
        ) {
          const err = error as { code?: string; message?: string };
          if (
            err.code === "DUPLICATE_KEY" ||
            (err.message && err.message.includes("duplicate"))
          ) {
            console.log(
              "[bookingRouter.createBooking] duplicate booking error"
            );
            throw new Error("Selected slot is no longer available");
          }
        }
        console.error("[bookingRouter.createBooking] error:", error);
        throw error;
      }
    }),
});
