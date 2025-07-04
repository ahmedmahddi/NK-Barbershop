import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { Media } from "@/payload-types";

// Input validation schemas
const specializationSchema = z.object({
  skill: z.string().min(1, "Skill is required"),
});

const availabilitySchema = z.object({
  day: z.string(),
  date: z.string(),
  slots: z.array(z.string()),
});

const createBarberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  photo: z.string().optional(), // Media ID
  description: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  rank: z.string().min(1, "Rank is required"),
  experience: z.string().min(1, "Experience is required"),
  availability: availabilitySchema.optional(),
  specializations: z.array(specializationSchema).optional(),
});

const updateBarberSchema = createBarberSchema.partial().extend({
  id: z.string(),
});

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
          ? { url: (barber.photo as Media).url ?? "/images/placeholder.png" }
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

  // Create a new barber
  create: baseProcedure
    .input(createBarberSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate slug if not provided
        const slug =
          input.slug ?? input.name.toLowerCase().replace(/\s+/g, "-");

        // Check if slug already exists
        const existingBarber = await ctx.db.find({
          collection: "team",
          where: { slug: { equals: slug } },
          limit: 1,
        });

        if (existingBarber.docs.length > 0) {
          throw new Error("A barber with this slug already exists");
        }

        const newBarber = await ctx.db.create({
          collection: "team",
          data: {
            name: input.name,
            slug,
            photo: input.photo ? Number(input.photo) : null,
            description: input.description ?? "",
            position: input.position,
            rank: input.rank,
            experience: input.experience,
            availability: input.availability ?? {
              day: "N/A",
              date: "N/A",
              slots: [],
            },
            specializations: input.specializations ?? [],
          },
        });

        return {
          id: newBarber.id,
          name: newBarber.name,
          slug: newBarber.slug,
          message: "Barber created successfully",
        };
      } catch (error) {
        console.error("Error creating barber:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to create barber"
        );
      }
    }),

  // Update an existing barber
  update: baseProcedure
    .input(updateBarberSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Check if barber exists
        const existingBarber = await ctx.db.findByID({
          collection: "team",
          id,
        });

        if (!existingBarber) {
          throw new Error("Barber not found");
        }

        // If slug is being updated, check for conflicts
        if (updateData.slug && updateData.slug !== existingBarber.slug) {
          const conflictingBarber = await ctx.db.find({
            collection: "team",
            where: {
              slug: { equals: updateData.slug },
              id: { not_equals: id },
            },
            limit: 1,
          });

          if (conflictingBarber.docs.length > 0) {
            throw new Error("A barber with this slug already exists");
          }
        }

        // Remove undefined values from updateData
        const cleanUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([, value]) => value !== undefined)
        );
        let photoValue: number | null | undefined = undefined;
        if (input.photo !== undefined) {
          photoValue = input.photo !== null ? Number(input.photo) : null;
        }

        const updatedBarber = await ctx.db.update({
          collection: "team",
          id,
          data: {
            ...cleanUpdateData,
            ...(photoValue !== undefined && { photo: photoValue }),
          },
        });

        return {
          id: updatedBarber.id,
          name: updatedBarber.name,
          slug: updatedBarber.slug,
          message: "Barber updated successfully",
        };
      } catch (error) {
        console.error("Error updating barber:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to update barber"
        );
      }
    }),

  // Delete a barber
  delete: baseProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    try {
      // Check if barber exists
      const existingBarber = await ctx.db.findByID({
        collection: "team",
        id: input,
      });

      if (!existingBarber) {
        throw new Error("Barber not found");
      }

      await ctx.db.delete({
        collection: "team",
        id: input,
      });

      return {
        id: input,
        message: "Barber deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting barber:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to delete barber"
      );
    }
  }),
});
