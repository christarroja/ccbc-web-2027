import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Page } from "@/payload-types";
import { MAX_SEGMENTS, matchesAncestry } from "@/lib/pages";

export const doc = <T>(v: T | number | null | undefined) =>
  typeof v === "object" ? v : null;

export async function getPageByPath(segments: string[]) {
  if (segments.length === 0 || segments.length > MAX_SEGMENTS) return null;

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "pages",
    overrideAccess: false,
    where: { slug: { equals: segments.at(-1) } },
    limit: 1,
    depth: segments.length,
  });

  const page = docs[0];
  return page && matchesAncestry(page, segments) ? page : null;
}

export async function getArchivePosts(
  limit: number,
  categoryId?: number | null,
) {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "posts",
    overrideAccess: false,
    sort: "-publishedAt",
    limit,
    depth: 1,
    ...(categoryId && { where: { categories: { equals: categoryId } } }),
  });
  return docs;
}

export function pageMetadata(page: Page | null): Metadata {
  if (!page) return { title: "Not found" };

  const image = doc(page.meta?.image);

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description,
    openGraph: image?.url ? { images: [{ url: image.url }] } : undefined,
  };
}
