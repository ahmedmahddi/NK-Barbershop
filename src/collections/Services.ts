import type { CollectionConfig } from "payload";

export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "slug",
      type: "text",
    },
    {
      name: "description",
      type: "text",
    },
    {
      name: "price",
      type: "number",
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "duration",
      type: "text",
      admin: {
        description:
          "Duration of the service in minutes, e.g., '30 minutes', '1 hour'",
      },
    },
  ],
};
