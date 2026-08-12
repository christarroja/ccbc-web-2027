import type { Block, Field, TextFieldSingleValidation } from "payload";
import { validations } from "payload";
import { embedSrc } from "@/lib/embed";
import { isHex } from "@/lib/contrast";

const IMAGE_ONLY = { mimeType: { contains: "image" } };

const HEX_MESSAGE = "Enter a hex colour, e.g. #f4f1ea.";

const validateHexColor: TextFieldSingleValidation = (value, options) => {
  const builtIn = validations.text(value, options);
  if (builtIn !== true) return builtIn;

  if (!isHex(value)) return HEX_MESSAGE;

  return true;
};

const colorPicker = (
  name: string,
  label: string,
  description: string,
): Field => ({
  name,
  type: "text",
  validate: validateHexColor,
  label,
  admin: {
    width: "33%",
    description,
    components: { Field: "/components/admin/ColorPickerField#ColorPickerField" },
  },
});

/** Shared by Section and CTA. Shown only when `background` is "custom". */
const customColorRow: Field = {
  type: "row",
  admin: {
    condition: (_, siblingData) => siblingData?.background === "custom",
  },
  fields: [
    colorPicker("customBackground", "Background colour", "The surface itself."),
    colorPicker("customHeading", "Heading colour", "Headings inside it."),
    colorPicker(
      "customBody",
      "Body text colour",
      "Paragraphs, captions and lists.",
    ),
  ],
};

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
      filterOptions: IMAGE_ONLY,
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
      filterOptions: IMAGE_ONLY,
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
      name: "background",
      type: "select",
      defaultValue: "muted",
      options: [
        { label: "Muted (subtle grey)", value: "muted" },
        { label: "None — blend into the section", value: "none" },
        { label: "Custom colours", value: "custom" },
      ],
      admin: {
        description:
          "The card behind this block. Muted follows the site theme; custom colours are fixed values and will not adapt.",
      },
    },
    customColorRow,
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
            {
              name: "label",
              type: "text",
              required: true,
              admin: { width: "50%" },
            },
            {
              name: "url",
              type: "text",
              required: true,
              admin: {
                width: "50%",
                description: "/about or https://example.com",
              },
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
      filterOptions: IMAGE_ONLY,
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
      admin: {
        description:
          "Leave empty to show the latest posts from every category.",
      },
    },
  ],
};

/**
 * The band an editor lays a page out with. Full width by default; how wide the
 * content runs inside it comes from the Pages Layout global, not from here, so
 * that every page on the site keeps the same measure.
 *
 * Not listed in its own `blocks` array — sections do not nest, for the same
 * reason Split does not.
 */
export const Section: Block = {
  slug: "section",
  interfaceName: "SectionBlock",
  fields: [
    {
      name: "background",
      type: "select",
      defaultValue: "default",
      options: [
        { label: "Default (page background)", value: "default" },
        { label: "Muted (subtle grey)", value: "muted" },
        { label: "Custom colours", value: "custom" },
      ],
      admin: {
        description:
          "Default and Muted follow the site theme. Custom colours are fixed values and will not adapt.",
      },
    },
    customColorRow,
    {
      name: "blocks",
      type: "blocks",
      required: true,
      minRows: 1,
      labels: { singular: "Block", plural: "Blocks" },
      blocks: [
        Hero,
        Content,
        MediaBlock,
        CallToAction,
        Accordion,
        Split,
        Gallery,
        Embed,
        Archive,
      ],
    },
  ],
};
