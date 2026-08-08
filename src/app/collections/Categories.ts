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
  // No versions: a category has no draft/published lifecycle, it either exists or it doesn't.
  fields: [{ name: "title", type: "text", required: true }, slugField()],
};
