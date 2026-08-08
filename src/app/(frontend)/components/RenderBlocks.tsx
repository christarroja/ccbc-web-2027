import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type {
  CallToActionBlock,
  ContentBlock,
  HeroBlock,
  MediaBlock,
  Page,
} from "@/payload-types";
import { ImageWithFallback } from "./ImageWithFallback";
import { converters } from "./richTextConverters";

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
        <figcaption className="mt-2 text-sm text-zinc-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function CallToAction({ heading, text, linkLabel, linkUrl }: CallToActionBlock) {
  return (
    <section className="my-8 rounded-lg bg-zinc-100 p-8 dark:bg-zinc-800">
      <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
      {text && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{text}</p>}
      {linkUrl && (
        <Link
          href={linkUrl}
          className="mt-4 inline-block rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {linkLabel || "Learn more"}
        </Link>
      )}
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
    }
  });
}
