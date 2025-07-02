import type { CollectionConfig } from "payload";

const Schedule: CollectionConfig = {
  slug: "schedule",
  admin: {
    useAsTitle: "barber",
  },
  fields: [
    {
      name: "barber",
      type: "relationship",
      relationTo: "team",
      required: true,
    },
    {
      name: "date",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayOnly",
        },
      },
    },
    {
      name: "slots",
      type: "array",
      fields: [
        {
          name: "time",
          type: "text",
          required: true,
        },
        {
          name: "isAvailable",
          type: "checkbox",
          defaultValue: true,
        },
      ],
    },
  ],
};

export default Schedule;
