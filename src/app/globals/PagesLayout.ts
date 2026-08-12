import type { GlobalConfig } from "payload";

/**
 * Site-wide measure for CMS pages. Sections are always full width; this is how
 * wide the content runs inside them. Kept as keys rather than class names so
 * the frontend maps them to literal Tailwind classes — a class assembled from a
 * database value would never be compiled.
 */
export const PagesLayout: GlobalConfig = {
  slug: "pages-layout",
  label: "Pages Layout",
  admin: { group: "Settings" },
  access: { read: () => true },
  fields: [
    {
      name: "maxWidth",
      type: "select",
      defaultValue: "3xl",
      options: [
        { label: "Narrow (768px)", value: "3xl" },
        { label: "Medium (896px)", value: "4xl" },
        { label: "Wide (1024px)", value: "5xl" },
      ],
      admin: {
        description:
          "How wide content runs inside a section. The section itself always spans the full window.",
      },
    },
    {
      name: "paddingX",
      type: "select",
      defaultValue: "6",
      options: [
        { label: "Compact", value: "4" },
        { label: "Default", value: "6" },
        { label: "Roomy", value: "8" },
      ],
      admin: { description: "Breathing room at the left and right edges." },
    },
  ],
};
