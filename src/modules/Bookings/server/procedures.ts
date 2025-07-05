import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { parseDuration } from "@/lib/utils";
import { computeFreeSlots } from "@/lib/computeFreeSlots";
import { Media, Service } from "@/payload-types";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { emailService } from "@/lib/emailService";

const n = (id: string | number) => Number(id);
const TUNIS_TZ = "Africa/Tunis";
const updateStatusInput = z.object({
  id: z.string(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed", "no_show"]),
});

export const bookingRouter = createTRPCRouter({
  getServices: baseProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.find({ collection: "services", depth: 0 });
    return res.docs;
  }),

  getBarbers: baseProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.find({ collection: "team", depth: 0 });
    return res.docs;
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
            err.message?.includes("duplicate")
          ) {
            throw new Error("Selected slot is no longer available");
          }
        }
        throw error;
      }
    }),
  getBookingById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const booking = await ctx.db.findByID({
          collection: "bookings",
          id: input.id,
          depth: 3,
        });

        if (!booking) {
          throw new Error("Booking not found");
        }

        return {
          id: booking.id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          phone: booking.phone,
          service: booking.service,
          price: (booking.service as Service).price ?? null,
          barber: booking.barber,
          start: booking.start,
          end: booking.end,
          comments: booking.comments ?? "",
          referencePhoto: booking.referencePhoto
            ? (booking.referencePhoto as Media).url
            : "",
          status: booking.status as
            | "pending"
            | "confirmed"
            | "cancelled"
            | "completed"
            | "no_show",
          agreement: booking.agreement,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch booking: ${message}`);
      }
    }),

  getAll: baseProcedure.query(async ({ ctx }) => {
    const bookings = await ctx.db.find({
      collection: "bookings",
      depth: 3,
      sort: "-start",
    });

    return bookings.docs.map(booking => ({
      id: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      phone: booking.phone,
      service: booking.service,
      price: (booking.service as Service).price ?? null,

      barber: booking.barber,
      start: booking.start,
      end: booking.end,
      comments: booking.comments ?? "",
      referencePhoto: booking.referencePhoto
        ? (booking.referencePhoto as Media).url
        : "",
      status: booking.status as
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show",
      agreement: booking.agreement,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }));
  }),
  updateStatus: baseProcedure
    .input(updateStatusInput)
    .mutation(async ({ ctx, input }) => {
      const { id, status } = input;
      try {
        const updatedBooking = await ctx.db.update({
          collection: "bookings",
          id,
          data: { status },
          depth: 3,
        });
        return {
          id: updatedBooking.id,
          customerName: updatedBooking.customerName,
          customerEmail: updatedBooking.customerEmail,
          phone: updatedBooking.phone,
          service: updatedBooking.service,
          barber: updatedBooking.barber,
          start: updatedBooking.start,
          end: updatedBooking.end,
          comments: updatedBooking.comments ?? "",
          referencePhoto: updatedBooking.referencePhoto
            ? (updatedBooking.referencePhoto as Media).url
            : "",
          status: updatedBooking.status as
            | "pending"
            | "confirmed"
            | "cancelled"
            | "completed"
            | "no_show",
          agreement: updatedBooking.agreement,
          createdAt: updatedBooking.createdAt,
          updatedAt: updatedBooking.updatedAt,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to update booking status: ${message}`);
      }
    }),
  sendBookingConfirmation: baseProcedure
    .input(
      z.object({
        bookingId: z.string(),
        to: z.string().email(),
        from: z.string().email(),
        subject: z.string(),
        text: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("Attempting to send email to:", input.to);

        const result = await emailService.sendBookingConfirmation(
          input.bookingId,
          input.to
        );

        console.log("Email sent successfully:", result);
        return result;
      } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error(
          `Email sending failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),
});
