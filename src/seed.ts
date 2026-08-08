import { getPayload } from "payload";
import config from "@payload-config";
import type { Post } from "@/payload-types";

/**
 * Dummy blog posts for local testing. Run with:
 *   pnpm seed         # replace samples with 25 posts
 *   pnpm seed 60      # replace samples with 60 posts
 *   pnpm seed clean   # delete every sample post
 *
 * Arguments are positional, not flags: `payload run` rebuilds process.argv from
 * minimist's positional array, so `--flags` never reach this script.
 *
 * Not a migration on purpose: migrations run on deploy, and this content must
 * never reach production. Every post is titled "Sample Post …" so cleanup can
 * find them without touching real content.
 */

const TITLE_PREFIX = "Sample Post";

const paragraph = (text: string): Post["content"] => ({
  root: {
    type: "root",
    format: "" as const,
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children: [
      {
        type: "paragraph",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        children: [
          {
            type: "text",
            text,
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      },
    ],
  },
});

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed: this script writes and deletes content.");
  process.exit(1);
}

const args = process.argv.slice(2);
const clean = args.includes("clean");
const count = Number(args.find((a) => /^\d+$/.test(a))) || 25;

const payload = await getPayload({ config });

// Always clear samples first, so re-seeding is idempotent instead of colliding
// with the unique slug index.
const { docs: removed } = await payload.delete({
  collection: "posts",
  where: { title: { like: TITLE_PREFIX } },
});

if (clean) {
  console.log(`Deleted ${removed.length} sample posts.`);
  process.exit(0);
}

// Reuse whatever categories and media already exist rather than inventing more.
const [{ docs: categories }, { docs: media }] = await Promise.all([
  payload.find({ collection: "categories", limit: 100, depth: 0 }),
  payload.find({ collection: "media", limit: 100, depth: 0 }),
]);

for (let i = 1; i <= count; i++) {
  const daysAgo = count - i;
  await payload.create({
    collection: "posts",
    data: {
      title: `${TITLE_PREFIX} ${String(i).padStart(3, "0")}`,
      // Explicit so seeded URLs are predictable; slugField would otherwise derive it.
      slug: `sample-post-${String(i).padStart(3, "0")}`,
      _status: "published",
      excerpt: `Placeholder excerpt for sample post ${i}.`,
      content: paragraph(`Body copy for sample post ${i}.`),
      publishedAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      // Every third post gets no hero, so the placeholder path stays exercised.
      ...(media.length && i % 3 !== 0
        ? { heroImage: media[i % media.length].id }
        : {}),
      ...(categories.length
        ? { categories: [categories[i % categories.length].id] }
        : {}),
    },
  });
}

console.log(
  `Removed ${removed.length}, created ${count} sample posts across ${categories.length} categories.`,
);
process.exit(0);
