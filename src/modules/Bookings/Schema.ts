// src/schema/booking.ts
import { z } from "zod";

export const bookingSchema = z.object({
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  phone: z.string().min(4),
  comments: z.string().optional(),
  referencePhoto: z.any().optional(), // file object
  agreement: z.literal(true),
});

export type BookingInput = z.infer<typeof bookingSchema>;
