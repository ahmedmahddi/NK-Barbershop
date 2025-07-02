import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { parseDuration } from "@/lib/utils";
import { computeFreeSlots } from "@/lib/computeFreeSlots";
import { Service, Team } from "@/payload-types";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const n = (id: string | number) => Number(id);
const TUNIS_TZ = "Africa/Tunis";

export const bookingRouter = createTRPCRouter({
  getServices: baseProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.find({ collection: "services", depth: 0 });
    return res.docs as Service[];
  }),

  getBarbers: baseProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.find({ collection: "team", depth: 0 });
    return res.docs as Team[];
  }),

  getAvailableSlots: baseProcedure
    .input(
      z.object({
        barberId: z.string(),
        date: z.string(), // YYYY-MM-DD
      })
    )
    .query(async ({ ctx, input }) => {
      return computeFreeSlots({
        db: ctx.db,
        barberId: n(input.barberId),
        date: input.date,
      });
    }),

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

      // Check if slot is still available
      const free = await computeFreeSlots({
        db: ctx.db,
        barberId: n(barberId),
        date,
      });
      if (!free.includes(time)) {
        throw new Error("Selected slot is no longer available");
      }

      // Calculate start and end times
      const service = await ctx.db.findByID({
        collection: "services",
        id: n(serviceId),
      });
      const minutes = parseDuration(service.duration ?? undefined);

      // Convert local date-time to UTC
      const localDateTime = `${date}T${time}:00.000+01:00`;
      const startDate = toZonedTime(new Date(localDateTime), TUNIS_TZ);
      const startISO = fromZonedTime(startDate, TUNIS_TZ).toISOString();
      const endISO = fromZonedTime(
        new Date(startDate.getTime() + minutes * 60_000),
        TUNIS_TZ
      ).toISOString();

      // Create booking with error handling for duplicates
      try {
        const booking = await ctx.db.create({
          collection: "bookings",
          data: {
            barber: n(barberId),
            service: n(serviceId),
            start: startISO,
            end: endISO,
            customerName,
            customerEmail,
            phone,
            comments,
            referencePhoto: referencePhoto ? n(referencePhoto) : undefined,
            agreement: true,
            status: "confirmed",
          },
        });
        return { id: booking.id };
      } catch (error) {
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
            throw new Error("Selected slot is no longer available");
          }
        }
        throw error;
      }
    }),
});
