import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Media } from "@/payload-types";

// Input validation schemas
const createServiceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  duration: z.string().min(1, "Duration must be at least 1 minute"),
  image: z.string().optional(), // Media ID
});

const updateServiceSchema = createServiceSchema.partial().extend({
  id: z.string(),
});

export const servicesRouter = createTRPCRouter({
  // Procedure to fetch all services or filter by slug
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
      const limit = input?.limit ?? 100; // Default to 4 for home page
      const services = await ctx.db.find({
        collection: "services",
        depth: 1,
        pagination: true,
        limit,
        ...(where ? { where } : {}),
      });
      const formatedData = services.docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        description: doc.description ?? "",
        price: doc.price,
        duration: doc.duration,
        image:
          typeof doc.image === "object" &&
          doc.image !== null &&
          "url" in doc.image
            ? (doc.image.url as unknown as Media)
            : null,
        slug: doc.slug ?? "",
      }));
      return formatedData;
    }),

  // Procedure to fetch a single service by ID
  getOne: baseProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const service = await ctx.db.findByID({
      collection: "services",
      id: input,
      depth: 1,
    });

    if (!service) {
      throw new Error("Service not found");
    }

    return {
      id: service.id,
      name: service.name,
      description: service.description ?? "",
      price: service.price,
      duration: service.duration,
      image:
        typeof service.image === "object" &&
        service.image !== null &&
        "url" in service.image
          ? (service.image.url as unknown as Media)
          : null,
      slug: service.slug ?? "",
    };
  }),

  // Create a new service
  create: baseProcedure
    .input(createServiceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate slug if not provided
        const slug =
          input.slug ?? input.name.toLowerCase().replace(/\s+/g, "-");

        // Check if slug already exists
        const existingService = await ctx.db.find({
          collection: "services",
          where: { slug: { equals: slug } },
          limit: 1,
        });

        if (existingService.docs.length > 0) {
          throw new Error("A service with this slug already exists");
        }

        const newService = await ctx.db.create({
          collection: "services",
          data: {
            name: input.name,
            slug,
            description: input.description ?? "",
            price: input.price,
            duration: input.duration,
            image: input.image ? Number(input.image) : null,
          },
        });

        return {
          id: newService.id,
          name: newService.name,
          slug: newService.slug,
          message: "Service created successfully",
        };
      } catch (error) {
        console.error("Error creating service:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to create service"
        );
      }
    }),

  // Update an existing service
  update: baseProcedure
    .input(updateServiceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Check if service exists
        const existingService = await ctx.db.findByID({
          collection: "services",
          id,
        });

        if (!existingService) {
          throw new Error("Service not found");
        }

        // If slug is being updated, check for conflicts
        if (updateData.slug && updateData.slug !== existingService.slug) {
          const conflictingService = await ctx.db.find({
            collection: "services",
            where: {
              slug: { equals: updateData.slug },
              id: { not_equals: id },
            },
            limit: 1,
          });

          if (conflictingService.docs.length > 0) {
            throw new Error("A service with this slug already exists");
          }
        }

        // Remove undefined values from updateData
        const cleanUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([, value]) => value !== undefined)
        );
        let imageValue: number | null | undefined = undefined;
        if (input.image !== undefined) {
          imageValue = input.image !== null ? Number(input.image) : null;
        }

        const updatedService = await ctx.db.update({
          collection: "services",
          id,
          data: {
            ...cleanUpdateData,
            ...(imageValue !== undefined && { image: imageValue }),
          },
        });

        return {
          id: updatedService.id,
          name: updatedService.name,
          slug: updatedService.slug,
          message: "Service updated successfully",
        };
      } catch (error) {
        console.error("Error updating service:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to update service"
        );
      }
    }),

  // Delete a service
  delete: baseProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    try {
      // Check if service exists
      const existingService = await ctx.db.findByID({
        collection: "services",
        id: input,
      });

      if (!existingService) {
        throw new Error("Service not found");
      }

      await ctx.db.delete({
        collection: "services",
        id: input,
      });

      return {
        id: input,
        message: "Service deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting service:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to delete service"
      );
    }
  }),
});
