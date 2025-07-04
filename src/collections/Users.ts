import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [
    {
      name: "username",
      required: true,
      unique: true,
      type: "text",
    },
    {
      name: "firstName",
      required: true,
      type: "text",
    },
    {
      name: "lastName",
      required: true,
      type: "text",
    },
    {
      name: "phone",
      required: true,
      type: "text",
    },
    {
      admin: {
        position: "sidebar",
      },
      name: "roles",
      type: "select",
      defaultValue: ["user"],
      hasMany: true,
      options: ["super-admin", "user"],
    },
  ],
  
  timestamps: true,
};
