import type { CSSProperties } from "react";
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
  PagesLayout,
  SectionBlock,
  SplitBlock,
} from "@/payload-types";
import { embedSrc } from "@/lib/embed";
import { cn } from "@/lib/utils";
import { doc, getArchivePosts } from "../pageData";
import { converters } from "./richTextConverters";
import { Button } from "@/components/ui/button";
import {
  Accordion as AccordionRoot,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const MAX_WIDTH = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
} as const;

const PADDING_X = {
  "4": "px-4",
  "6": "px-6",
  "8": "px-8",
} as const;

function Hero({ heading, subheading, image }: HeroBlock) {
  const img = doc(image);

  return (
    <section>
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
    <div className="prose dark:prose-invert max-w-none">
      <RichText data={richText} converters={converters} />
    </div>
  );
}

function Media({ image, caption }: MediaBlock) {
  const img = doc(image);
  if (!img?.url || !img.width || !img.height) return null;

  return (
    <figure>
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

function CallToAction({
  heading,
  text,
  align,
  background,
  customBackground,
  customHeading,
  customBody,
  links,
}: CallToActionBlock) {
  const centered = align === "center";
  const custom =
    background === "custom"
      ? customColors(customBackground, customHeading, customBody)
      : undefined;

  return (
    <section
      className={cn(
        "rounded-lg p-8",
        centered && "text-center",
        // Anything that is not an explicit choice keeps the old default.
        (background ?? "muted") === "muted" && "bg-muted",
        custom && "custom-colors",
      )}
      style={custom}
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
    <section>
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
      className={`grid gap-8 md:grid-cols-2 ${verticalAlign === "middle" ? "md:items-center" : "md:items-start"}`}
    >
      <div className="flex flex-col gap-8">
        <RenderBlocks blocks={left} />
      </div>
      <div className="flex flex-col gap-8">
        <RenderBlocks blocks={right} />
      </div>
    </section>
  );
}

function Gallery({ heading, images }: GalleryBlock) {
  const docs = images.filter((i) => typeof i === "object");
  if (docs.length === 0) return null;

  return (
    <section>
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
    <figure>
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
    <section>
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

/**
 * Used by both Section and CTA. Custom properties scope to the element, so a
 * custom CTA inside a custom section simply overrides it for its own subtree.
 */
function customColors(
  background?: string | null,
  heading?: string | null,
  body?: string | null,
): CSSProperties | undefined {
  if (!background || !body) return undefined;

  return {
    backgroundColor: background,
    color: body,
    "--custom-heading": heading || body,
    "--custom-body": body,
  } as CSSProperties;
}

function Section({
  section: { background, customBackground, customHeading, customBody, blocks },
  layout,
}: {
  section: SectionBlock;
  layout: PagesLayout;
}) {
  const custom =
    background === "custom"
      ? customColors(customBackground, customHeading, customBody)
      : undefined;

  return (
    <section
      className={cn(
        "w-full py-16",
        background === "muted" && "bg-muted",
        custom && "custom-colors",
      )}
      style={custom}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-8",
          MAX_WIDTH[layout.maxWidth ?? "3xl"],
          PADDING_X[layout.paddingX ?? "6"],
        )}
      >
        <RenderBlocks blocks={blocks} />
      </div>
    </section>
  );
}

export function RenderSections({
  sections,
  layout,
}: {
  sections: Page["layout"];
  layout: PagesLayout;
}) {
  return sections.map((section) => (
    <Section key={section.id} section={section} layout={layout} />
  ));
}

function RenderBlocks({
  blocks,
}: {
  blocks: SectionBlock["blocks"] | SplitBlock["left"];
}) {
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
