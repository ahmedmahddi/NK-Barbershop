import z from "zod";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Media } from "@/payload-types";

export const servicesRouter = createTRPCRouter({
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
      const limit = input?.limit ?? 4; // Default to 4 for home page
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
});
