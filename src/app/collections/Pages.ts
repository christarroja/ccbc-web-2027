import type {
  CollectionConfig,
  RelationshipFieldSingleValidation,
  TextField,
  TextFieldSingleValidation,
} from "payload";
import { slugField, validations } from "payload";
import { MAX_SEGMENTS, RESERVED_SLUGS } from "@/lib/pages";
import {
  Accordion,
  Archive,
  CallToAction,
  Content,
  Embed,
  Gallery,
  Hero,
  MediaBlock,
  Spacer,
  Split,
} from "./blocks";

/**
 * Only the first URL segment can be shadowed, so /about/blog would in fact be
 * fine. Banning the name outright is simpler than inspecting `parent`, and
 * costs little: slugs are globally unique, so it's one name either way.
 */
const validateSlug: TextFieldSingleValidation = (value, options) => {
  // A custom validate replaces the built-in one, so run that first or `required`
  // and the length limits quietly stop being enforced.
  const builtIn = validations.text(value, options);
  if (builtIn !== true) return builtIn;

  if (typeof value === "string" && RESERVED_SLUGS.has(value))
    return `"${value}" is a reserved path on this site. Pick a different slug.`;

  return true;
};

/**
 * Rejects the two bad parents `filterOptions` can't see: an indirect loop
 * (A → B → A) and nesting deeper than a URL is allowed to go.
 */
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
      req, // same transaction as the save being validated
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
    // Anyone can read published pages; logged-in users also see drafts.
    read: ({ req }) => Boolean(req.user) || { _status: { equals: "published" } },
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: "title", type: "text", required: true },
    // Slugs are unique site-wide, which is what lets a URL be resolved in one
    // indexed query. Two pages can't both be "staff" under different parents.
    slugField({
      // slugField returns a row wrapping [generateSlug checkbox, slug text].
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
        description: "Nests this page — About → Our Team gives /about/our-team.",
      },
      // Stops the obvious self-reference in the UI; validate catches the rest.
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
                Spacer,
              ],
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
