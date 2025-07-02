// payload/collections/Bookings.ts
import type { CollectionConfig } from "payload";

export const Bookings: CollectionConfig = {
  slug: "bookings",
  admin: { useAsTitle: "id" },
  timestamps: true,

  fields: [
    // —––––– relations ––––––
    {
      name: "barber",
      type: "relationship",
      relationTo: "team",
      required: true,
    },
    {
      name: "service",
      type: "relationship",
      relationTo: "services",
      required: true,
    },

    // —––––– timing ––––––
    { name: "start", type: "date", required: true }, // ISO
    { name: "end", type: "date", required: true }, // ISO

    // —––––– customer info ––––––
    { name: "customerName", type: "text", required: true },
    { name: "customerEmail", type: "email", required: true },
    { name: "phone", type: "text", required: true },
    { name: "comments", type: "textarea" },

    // —––––– optional photo upload ––––––
    { name: "referencePhoto", type: "upload", relationTo: "media" },

    // —––––– status ––––––
    {
      name: "status",
      type: "select",
      options: ["pending", "confirmed", "cancelled", "completed", "no_show"],
      defaultValue: "pending", // <— stays pending by default
      required: true,
    },

    // —––––– GDPR / T&C checkbox ––––––
    { name: "agreement", type: "checkbox", required: true },
  ],

  indexes: [
    { fields: ["barber", "start"], unique: true },
    // speeds up overlap checks
  ],
};
