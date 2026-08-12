import type {
  CollectionConfig,
  RelationshipFieldSingleValidation,
  TextField,
  TextFieldSingleValidation,
} from "payload";
import { slugField, validations } from "payload";
import { MAX_SEGMENTS, RESERVED_SLUGS } from "@/lib/pages";
import { Section } from "./blocks";

const validateSlug: TextFieldSingleValidation = (value, options) => {
  const builtIn = validations.text(value, options);
  if (builtIn !== true) return builtIn;

  if (typeof value === "string" && RESERVED_SLUGS.has(value))
    return `"${value}" is a reserved path on this site. Pick a different slug.`;

  return true;
};

const validateParent: RelationshipFieldSingleValidation = async (
  value,
  { id, req },
) => {
  if (!value) return true;
  if (id && String(value) === String(id))
    return "A page cannot be its own parent.";

  let current: unknown = value;
  for (let depth = 1; current; depth++) {
    if (depth >= MAX_SEGMENTS)
      return `Pages can only nest ${MAX_SEGMENTS} levels deep.`;

    const ancestor = await req.payload.findByID({
      collection: "pages",
      id: current as number,
      depth: 0,
      req,
      disableErrors: true,
    });
    if (!ancestor) break;
    if (id && String(ancestor.id) === String(id))
      return "That parent is a descendant of this page, which would create a loop.";
    current = ancestor.parent;
  }

  return true;
};

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "parent", "_status"],
  },
  access: {
    read: ({ req }) =>
      Boolean(req.user) || { _status: { equals: "published" } },
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField({
      overrides: (field) => {
        const slug = field.fields.find(
          (f) => "name" in f && f.name === "slug",
        ) as TextField;
        slug.validate = validateSlug;
        return field;
      },
    }),
    {
      name: "parent",
      type: "relationship",
      relationTo: "pages",
      admin: {
        position: "sidebar",
        description:
          "Nests this page — About → Our Team gives /about/our-team.",
      },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      validate: validateParent,
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "layout",
              type: "blocks",
              required: true,
              minRows: 1,
              blocks: [Section],
              admin: {
                description:
                  "A page is a stack of sections. Blocks go inside a section.",
              },
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "meta",
              type: "group",
              fields: [
                {
                  name: "title",
                  type: "text",
                  admin: { description: "Defaults to the page title." },
                },
                { name: "description", type: "textarea" },
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  admin: { description: "Used for social share previews." },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
