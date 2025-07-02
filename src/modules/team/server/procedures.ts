import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { Media } from "@/payload-types";

export const teamRouter = createTRPCRouter({
  // Procedure to fetch all team or filter by slug
  getMany: baseProcedure
    .input(
      z
        .object({
          slug: z.string().optional(),
          limit: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where = input?.slug ? { slug: { equals: input.slug } } : undefined;
      const limit = input?.limit ?? 10; 
      const team = await ctx.db.find({
        collection: "team",
        depth: 3,
        pagination: true,
        limit,
        ...(where ? { where } : {}),
        sort: "-createdAt", 
      });

      const formattedData = team.docs.map(doc => ({
        id: doc.id,
        name: doc.name ?? "",
        slug: doc.slug,
        photo:
          typeof doc.photo === "object" &&
          doc.photo !== null &&
          "url" in doc.photo
            ? { url: (doc.photo as Media).url ?? "/images/placeholder.png" }
            : null,
        description: doc.description ?? "",
        position: doc.position ?? "Barber",
        rank: doc.rank ?? "Senior",
        experience: doc.experience ?? "5+ years",
        availability: doc.availability ?? {
          day: "N/A",
          date: "N/A",
          slots: [],
        },
        specializations: doc.specializations ?? [],
      }));

      return formattedData;
    }),

  // Procedure to fetch a single barber by ID
  getOne: baseProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const barber = await ctx.db.findByID({
      collection: "team",
      id: input,
      depth: 3,
    });

    if (!barber) {
      throw new Error("Barber not found");
    }

    return {
      id: barber.id,
      name: barber.name ?? "",
      slug: barber.slug,
      photo:
        typeof barber.photo === "object" &&
        barber.photo !== null &&
        "url" in barber.photo
          ? (barber.photo.url as unknown as Media)
          : null,
      description: barber.description ?? "",
      position: barber.position ?? "Barber",
      rank: barber.rank ?? "Senior",
      experience: barber.experience ?? "5+ years",
      availability: barber.availability ?? {
        day: "N/A",
        date: "N/A",
        slots: [],
      },
      specializations: barber.specializations ?? [],
    };
  }),
});
