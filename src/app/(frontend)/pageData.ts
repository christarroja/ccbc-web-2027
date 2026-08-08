import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Page } from "@/payload-types";
import { HOME_SLUG, MAX_SEGMENTS, matchesAncestry } from "@/lib/pages";

// `overrideAccess: false` on every read below enforces the collection's
// published-only access rule. Never drop it — drafts would go public.

/** The page at `/`: the root-level page whose slug is HOME_SLUG. */
export async function getHomePage() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "pages",
    overrideAccess: false,
    where: { slug: { equals: HOME_SLUG } },
    limit: 1,
    depth: 1,
  });

  const page = docs[0];
  // A nested page named "home" is an ordinary page, not the homepage.
  return page && !page.parent ? page : null;
}

/** The page at an arbitrary nested path, e.g. ["about", "our-team"]. */
export async function getPageByPath(segments: string[]) {
  // Reject absurd URLs before touching the database.
  if (segments.length === 0 || segments.length > MAX_SEGMENTS) return null;

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "pages",
    overrideAccess: false,
    where: { slug: { equals: segments.at(-1) } },
    limit: 1,
    // Populates the whole parent chain (and block uploads) in this one query.
    depth: segments.length,
  });

  const page = docs[0];
  // The slug alone matched; the rest of the URL still has to be the real path.
  return page && matchesAncestry(page, segments) ? page : null;
}

export function pageMetadata(page: Page | null): Metadata {
  if (!page) return { title: "Not found" };

  const image = typeof page.meta?.image === "object" ? page.meta.image : null;

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description,
    openGraph: image?.url ? { images: [{ url: image.url }] } : undefined,
  };
}
