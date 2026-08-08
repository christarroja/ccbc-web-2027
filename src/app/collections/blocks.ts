import type { Block } from "payload";

// Generic layout blocks — nothing church-specific lives here.
// Each is small enough that separate files would cost more than they explain.

export const Hero: Block = {
  slug: "hero",
  interfaceName: "HeroBlock",
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "subheading", type: "textarea" },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      filterOptions: { mimeType: { contains: "image" } },
    },
  ],
};

export const Content: Block = {
  slug: "content",
  interfaceName: "ContentBlock",
  fields: [{ name: "richText", type: "richText", required: true }],
};

export const MediaBlock: Block = {
  slug: "media",
  interfaceName: "MediaBlock",
  labels: { singular: "Media", plural: "Media" },
  fields: [
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      filterOptions: { mimeType: { contains: "image" } },
    },
    { name: "caption", type: "text" },
  ],
};

export const CallToAction: Block = {
  slug: "cta",
  interfaceName: "CallToActionBlock",
  labels: { singular: "Call to Action", plural: "Calls to Action" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "text", type: "textarea" },
    {
      type: "row",
      fields: [
        { name: "linkLabel", type: "text", admin: { width: "50%" } },
        {
          name: "linkUrl",
          type: "text",
          admin: { width: "50%", description: "/about or https://example.com" },
        },
      ],
    },
  ],
};
