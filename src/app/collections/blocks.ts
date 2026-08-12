import type { Block, TextFieldSingleValidation } from "payload";
import { validations } from "payload";
import { embedSrc } from "@/lib/embed";

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
      name: "align",
      type: "select",
      defaultValue: "left",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ],
      admin: { description: "How the heading, text and buttons line up." },
    },
    {
      name: "links",
      type: "array",
      maxRows: 2,
      labels: { singular: "Button", plural: "Buttons" },
      admin: { description: "Up to two buttons. Leave empty for no button." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "label", type: "text", required: true, admin: { width: "50%" } },
            {
              name: "url",
              type: "text",
              required: true,
              admin: { width: "50%", description: "/about or https://example.com" },
            },
          ],
        },
        {
          name: "style",
          type: "select",
          defaultValue: "primary",
          options: [
            { label: "Primary (solid)", value: "primary" },
            { label: "Secondary (outline)", value: "secondary" },
          ],
        },
      ],
    },
  ],
};

export const Accordion: Block = {
  slug: "accordion",
  interfaceName: "AccordionBlock",
  labels: { singular: "Accordion / FAQ", plural: "Accordions / FAQs" },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "items",
      type: "array",
      minRows: 1,
      required: true,
      labels: { singular: "Item", plural: "Items" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "content", type: "richText", required: true },
      ],
    },
  ],
};

/**
 * Each column holds its own blocks, so a column can be text, an image, or
 * several of both stacked. Only Content and Media are allowed inside — nesting
 * Split within itself would let an editor build unbounded layouts.
 */
export const Split: Block = {
  slug: "split",
  interfaceName: "SplitBlock",
  labels: { singular: "Two Columns", plural: "Two Columns" },
  fields: [
    {
      name: "verticalAlign",
      type: "select",
      defaultValue: "top",
      options: [
        { label: "Top", value: "top" },
        { label: "Middle", value: "middle" },
      ],
    },
    {
      name: "left",
      type: "blocks",
      required: true,
      minRows: 1,
      blocks: [Content, MediaBlock],
      admin: { description: "Stacks above the right column on small screens." },
    },
    {
      name: "right",
      type: "blocks",
      required: true,
      minRows: 1,
      blocks: [Content, MediaBlock],
    },
  ],
};

export const Gallery: Block = {
  slug: "gallery",
  interfaceName: "GalleryBlock",
  fields: [
    { name: "heading", type: "text" },
    {
      name: "images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      required: true,
      filterOptions: { mimeType: { contains: "image" } },
    },
    // ponytail: plain responsive grid. Masonry/carousel are layout swaps in the
    // component — add a `layout` select here when one is actually needed.
    {
      name: "columns",
      type: "select",
      defaultValue: "3",
      options: [
        { label: "2 across", value: "2" },
        { label: "3 across", value: "3" },
        { label: "4 across", value: "4" },
      ],
    },
  ],
};

const validateEmbedUrl: TextFieldSingleValidation = (value, options) => {
  // A custom validate replaces the built-in one, so run that first or `required`
  // and the length limits quietly stop being enforced.
  const builtIn = validations.text(value, options);
  if (builtIn !== true) return builtIn;

  if (typeof value === "string" && !embedSrc(value))
    return "Not an embeddable link. Use an https YouTube, Vimeo or Google Maps embed URL.";

  return true;
};

export const Embed: Block = {
  slug: "embed",
  interfaceName: "EmbedBlock",
  fields: [
    {
      name: "url",
      type: "text",
      required: true,
      validate: validateEmbedUrl,
      admin: {
        description:
          "Paste the normal page link, e.g. https://www.youtube.com/watch?v=… — it is converted to an embed automatically.",
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description:
          "Describes the embed for screen readers, e.g. “Sunday service, 12 May”.",
      },
    },
    { name: "caption", type: "text" },
  ],
};

export const Archive: Block = {
  slug: "archive",
  interfaceName: "ArchiveBlock",
  labels: { singular: "Latest Posts", plural: "Latest Posts" },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "limit",
      type: "number",
      defaultValue: 3,
      min: 1,
      max: 12,
      admin: { description: "How many posts to show." },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      admin: { description: "Leave empty to show the latest posts from every category." },
    },
  ],
};

export const Spacer: Block = {
  slug: "spacer",
  interfaceName: "SpacerBlock",
  labels: { singular: "Spacer / Divider", plural: "Spacers / Dividers" },
  fields: [
    {
      name: "variant",
      type: "select",
      defaultValue: "space",
      options: [
        { label: "Blank space", value: "space" },
        { label: "Horizontal line", value: "line" },
      ],
    },
    {
      name: "size",
      type: "select",
      defaultValue: "md",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
      admin: { description: "How much space, or how much room around the line." },
    },
  ],
};
