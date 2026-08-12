import type { CollectionConfig } from "payload";
import { slugField } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "title",
  },
  access: {
    read: () => true,
  },
  fields: [{ name: "title", type: "text", required: true }, slugField()],
};
