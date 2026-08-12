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
  SplitBlock,
} from "@/payload-types";
import { embedSrc } from "@/lib/embed";
import { doc, getArchivePosts } from "../pageData";
import { converters } from "./richTextConverters";
import { Button } from "@/components/ui/button";
import {
  Accordion as AccordionRoot,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function Hero({ heading, subheading, image }: HeroBlock) {
  const img = doc(image);

  return (
    <section className="py-8">
      <h1 className="text-4xl font-semibold tracking-tight">{heading}</h1>
      {subheading && (
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          {subheading}
        </p>
      )}
      {img?.url && img.width && img.height && (
        <Image
          src={img.url}
          alt={img.alt}
          width={img.width}
          height={img.height}
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
  const img = doc(image);
  if (!img?.url || !img.width || !img.height) return null;

  return (
    <figure className="py-8">
      <Image
        src={img.url}
        alt={img.alt}
        width={img.width}
        height={img.height}
        className="h-auto w-full rounded-lg"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-zinc-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function CallToAction({ heading, text, align, links }: CallToActionBlock) {
  const centered = align === "center";

  return (
    <section
      className={`my-8 rounded-lg bg-muted p-8 ${centered ? "text-center" : ""}`}
    >
      <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
      {text && <p className="mt-2 text-muted-foreground">{text}</p>}
      {links && links.length > 0 && (
        <div
          className={`mt-4 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}
        >
          {links.map((link) => (
            <Button
              key={link.id}
              variant={link.style === "secondary" ? "outline" : "default"}
              size="lg"
              nativeButton={false}
              render={<Link href={link.url} />}
            >
              {link.label}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}

function Accordion({ heading, items }: AccordionBlock) {
  return (
    <section className="py-8">
      {heading && (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      <AccordionRoot multiple>
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>
              <div className="prose dark:prose-invert max-w-none">
                <RichText data={item.content} converters={converters} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </AccordionRoot>
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

function Gallery({ heading, images }: GalleryBlock) {
  const docs = images.filter((i) => typeof i === "object");
  if (docs.length === 0) return null;

  return (
    <section className="py-8">
      {heading && (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {docs.map((doc) =>
          doc.url && doc.width && doc.height ? (
            <Image
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
        <figcaption className="mt-2 text-sm text-zinc-500">
          {caption}
        </figcaption>
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
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
      )}
      <ul className="flex flex-col gap-6">
        {posts.map((post) => {
          const thumb = doc(post.heroImage);

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
    }
  });
}
