import Image from "next/image";
import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type {
  AccordionBlock,
  ArchiveBlock,
  CallToActionBlock,
  ContentBlock,
  EmbedBlock,
  GalleryBlock,
  HeroBlock,
  MediaBlock,
  Page,
  SpacerBlock,
  SplitBlock,
} from "@/payload-types";
import { embedSrc } from "@/lib/embed";
import { getArchivePosts } from "../pageData";
import { ImageWithFallback } from "./ImageWithFallback";
import { converters } from "./richTextConverters";

// Tailwind only ships classes it can see as literal strings, so every variant
// has to be spelled out here rather than built with template literals.
const GALLERY_COLUMNS = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 md:grid-cols-3",
  "4": "sm:grid-cols-2 md:grid-cols-4",
} as const;

const SPACER_SIZE = { sm: "h-6", md: "h-12", lg: "h-24" } as const;
const RULE_SPACING = { sm: "my-6", md: "my-12", lg: "my-24" } as const;

function Hero({ heading, subheading, image }: HeroBlock) {
  const doc = typeof image === "object" ? image : null;

  return (
    <section className="py-8">
      <h1 className="text-4xl font-semibold tracking-tight">{heading}</h1>
      {subheading && (
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          {subheading}
        </p>
      )}
      {doc?.url && doc.width && doc.height && (
        <ImageWithFallback
          src={doc.url}
          alt={doc.alt}
          width={doc.width}
          height={doc.height}
          className="mt-8 h-auto w-full rounded-lg"
          priority
        />
      )}
    </section>
  );
}

function Content({ richText }: ContentBlock) {
  return (
    <div className="prose dark:prose-invert max-w-none py-8">
      <RichText data={richText} converters={converters} />
    </div>
  );
}

function Media({ image, caption }: MediaBlock) {
  const doc = typeof image === "object" ? image : null;
  if (!doc?.url || !doc.width || !doc.height) return null;

  return (
    <figure className="py-8">
      <ImageWithFallback
        src={doc.url}
        alt={doc.alt}
        width={doc.width}
        height={doc.height}
        className="h-auto w-full rounded-lg"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-zinc-500">{caption}</figcaption>
      )}
    </figure>
  );
}

function CallToAction({ heading, text, align, links }: CallToActionBlock) {
  const centered = align === "center";

  return (
    <section
      className={`my-8 rounded-lg bg-zinc-100 p-8 dark:bg-zinc-800 ${centered ? "text-center" : ""}`}
    >
      <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
      {text && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{text}</p>}
      {links && links.length > 0 && (
        <div
          className={`mt-4 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}
        >
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.url}
              className={
                link.style === "secondary"
                  ? "inline-block rounded-full border border-zinc-400 px-4 py-2 text-sm font-medium hover:bg-zinc-200 dark:border-zinc-500 dark:hover:bg-zinc-700"
                  : "inline-block rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/** Native <details>, so it works with no JavaScript and is keyboard accessible. */
function Accordion({ heading, items }: AccordionBlock) {
  return (
    <section className="py-8">
      {heading && (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">{heading}</h2>
      )}
      <div className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {items.map((item) => (
          <details key={item.id} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {item.title}
              <span
                aria-hidden="true"
                className="text-zinc-400 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="prose dark:prose-invert mt-3 max-w-none">
              <RichText data={item.content} converters={converters} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function Split({ verticalAlign, left, right }: SplitBlock) {
  return (
    <section
      className={`grid gap-8 py-8 md:grid-cols-2 ${verticalAlign === "middle" ? "md:items-center" : "md:items-start"}`}
    >
      <div>
        <RenderBlocks blocks={left} />
      </div>
      <div>
        <RenderBlocks blocks={right} />
      </div>
    </section>
  );
}

function Gallery({ heading, images, columns }: GalleryBlock) {
  const docs = images.filter((i) => typeof i === "object");
  if (docs.length === 0) return null;

  return (
    <section className="py-8">
      {heading && (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">{heading}</h2>
      )}
      <div className={`grid grid-cols-1 gap-4 ${GALLERY_COLUMNS[columns ?? "3"]}`}>
        {docs.map((doc) =>
          doc.url && doc.width && doc.height ? (
            <ImageWithFallback
              key={doc.id}
              src={doc.url}
              alt={doc.alt}
              width={doc.width}
              height={doc.height}
              className="aspect-square h-full w-full rounded-lg object-cover"
            />
          ) : null,
        )}
      </div>
    </section>
  );
}

function Embed({ url, title, caption }: EmbedBlock) {
  // Validated on save, re-checked here: the allowlist is what keeps an
  // arbitrary pasted URL out of the iframe src.
  const src = embedSrc(url);
  if (!src) return null;

  return (
    <figure className="py-8">
      <iframe
        src={src}
        title={title}
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className="aspect-video w-full rounded-lg border-0"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-zinc-500">{caption}</figcaption>
      )}
    </figure>
  );
}

async function Archive({ heading, limit, category }: ArchiveBlock) {
  const categoryId = typeof category === "object" ? category?.id : category;
  const posts = await getArchivePosts(limit ?? 3, categoryId);
  if (posts.length === 0) return null;

  return (
    <section className="py-8">
      {heading && (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">{heading}</h2>
      )}
      <ul className="flex flex-col gap-6">
        {posts.map((post) => {
          const thumb = typeof post.heroImage === "object" ? post.heroImage : null;

          return (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group flex gap-4">
                {thumb?.url ? (
                  <Image
                    src={thumb.url}
                    alt={thumb.alt}
                    width={120}
                    height={90}
                    className="h-17 w-24 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="h-17 w-24 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                  />
                )}
                <div>
                  <h3 className="font-medium group-hover:underline">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Spacer({ variant, size }: SpacerBlock) {
  const key = size ?? "md";

  if (variant === "line")
    return (
      <hr
        className={`border-zinc-200 dark:border-zinc-800 ${RULE_SPACING[key]}`}
      />
    );

  return <div aria-hidden="true" className={SPACER_SIZE[key]} />;
}

export function RenderBlocks({ blocks }: { blocks: Page["layout"] }) {
  return blocks.map((block) => {
    switch (block.blockType) {
      case "hero":
        return <Hero key={block.id} {...block} />;
      case "content":
        return <Content key={block.id} {...block} />;
      case "media":
        return <Media key={block.id} {...block} />;
      case "cta":
        return <CallToAction key={block.id} {...block} />;
      case "accordion":
        return <Accordion key={block.id} {...block} />;
      case "split":
        return <Split key={block.id} {...block} />;
      case "gallery":
        return <Gallery key={block.id} {...block} />;
      case "embed":
        return <Embed key={block.id} {...block} />;
      case "archive":
        return <Archive key={block.id} {...block} />;
      case "spacer":
        return <Spacer key={block.id} {...block} />;
    }
  });
}
