import type { CollectionConfig } from "payload";

export const Team: CollectionConfig = {
  slug: "team",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", unique: true, required: true },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "description", type: "textarea" },
    { name: "position", type: "text", defaultValue: "Barber" },
    { name: "rank", type: "text", defaultValue: "Senior" },
    { name: "experience", type: "text", defaultValue: "5+ years" },
    {
      name: "specializations",
      type: "array",
      fields: [{ name: "skill", type: "text" }],
    },
    {
      name: "workingHours",
      type: "array",
      fields: [
        { name: "day", type: "text" },
        { name: "start", type: "text" },
        { name: "end", type: "text" },
      ],
    },
    {
      name: "availability",
      type: "json",
      defaultValue: {
        day: "N/A",
        date: "N/A",
        slots: [],
      },
    },
  ],
};
