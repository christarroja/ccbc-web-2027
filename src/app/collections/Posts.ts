import type { CollectionConfig } from "payload";
import { slugField } from "payload";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "author", "publishedAt", "_status"],
  },
  access: {
    // Anyone can read published posts; logged-in users also see drafts.
    read: ({ req }) => Boolean(req.user) || { _status: { equals: "published" } },
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    {
      name: "excerpt",
      type: "textarea",
      admin: { description: "Shown on the blog index." },
    },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "content", type: "richText", required: true },
    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      admin: { position: "sidebar" },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      defaultValue: ({ user }) => user?.id,
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      defaultValue: () => new Date(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } },
    },
  ],
};
