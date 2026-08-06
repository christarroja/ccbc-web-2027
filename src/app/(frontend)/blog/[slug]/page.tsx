import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import config from "@payload-config";
import type { Media } from "@/payload-types";
import { ImageWithFallback } from "./ImageWithFallback";

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: (args) => {
    const { node } = args;

    if (node.relationTo !== "media") {
      const fallback = defaultConverters.upload;
      return typeof fallback === "function"
        ? fallback(args)
        : (fallback ?? null);
    }

    const doc = node.value as Media | number | null | undefined;

    if (typeof doc !== "object" || doc === null) {
      return (
        <div className="flex aspect-3/2 w-full items-center justify-center rounded-lg bg-zinc-100 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          Image unavailable
        </div>
      );
    }

    if (!doc.mimeType?.startsWith("image")) {
      return (
        <a href={doc.url ?? "#"} rel="noopener noreferrer">
          {doc.filename}
        </a>
      );
    }

    const alt = node.fields?.alt || doc.alt || "";
    if (!doc.url || !doc.width || !doc.height) {
      return (
        <div className="flex aspect-3/2 w-full items-center justify-center rounded-lg bg-zinc-100 p-6 text-center text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {alt || "Image unavailable"}
        </div>
      );
    }

    return (
      <ImageWithFallback
        src={doc.url}
        alt={alt}
        width={doc.width}
        height={doc.height}
        className="h-auto w-full rounded-lg"
      />
    );
  },
});

async function getPost(slug: string) {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "posts",
    overrideAccess: false, // enforce the collection's published-only read access
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return docs[0];
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">) {
  const post = await getPost((await props.params).slug);
  return { title: post?.title ?? "Not found", description: post?.excerpt };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const post = await getPost((await props.params).slug);
  if (!post) notFound();

  const hero = typeof post.heroImage === "object" ? post.heroImage : null;
  const author = typeof post.author === "object" ? post.author : null;
  const categories =
    post.categories?.filter((c) => typeof c === "object") ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link href="/blog" className="text-sm text-zinc-500 hover:underline">
        ← Blog
      </Link>
      {categories.length > 0 && (
        <nav className="mt-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog?category=${cat.slug}`}
              className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {cat.title}
            </Link>
          ))}
        </nav>
      )}
      <h1
        className={`${categories.length > 0 ? "mt-3" : "mt-6"} text-3xl font-semibold tracking-tight`}
      >
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {author?.name ?? "Staff"}
        {post.publishedAt && (
          <>
            {" · "}
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                dateStyle: "medium",
              })}
            </time>
          </>
        )}
      </p>
      {hero?.url && hero.width && hero.height && (
        <ImageWithFallback
          src={hero.url}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          className="mt-8 h-auto w-full rounded-lg"
          priority
        />
      )}
      <div className="prose dark:prose-invert mt-8 max-w-none">
        <RichText data={post.content} converters={converters} />
      </div>
    </main>
  );
}
