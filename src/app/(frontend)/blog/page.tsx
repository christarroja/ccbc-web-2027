import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";

export const metadata = { title: "Blog" };

export default async function BlogIndex() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "posts",
    overrideAccess: false, // enforce the collection's published-only read access
    sort: "-publishedAt",
    limit: 20,
    depth: 1, // populate heroImage for the thumbnail
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      {docs.length === 0 && (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">
          No posts published yet.
        </p>
      )}
      <ul className="mt-10 flex flex-col gap-10">
        {docs.map((post) => {
          const thumb =
            typeof post.heroImage === "object" ? post.heroImage : null;

          return (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group flex gap-5">
                {thumb?.url && (
                  <Image
                    src={thumb.url}
                    alt={thumb.alt}
                    width={160}
                    height={120}
                    className="h-30 w-40 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-medium group-hover:underline">
                    {post.title}
                  </h2>
                  {post.publishedAt && (
                    <time
                      dateTime={post.publishedAt}
                      className="mt-1 block text-sm text-zinc-500"
                    >
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        dateStyle: "medium",
                      })}
                    </time>
                  )}
                  {post.excerpt && (
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
