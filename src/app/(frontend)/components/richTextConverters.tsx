import Image from "next/image";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { Media } from "@/payload-types";

const imagePlaceholder = (text: string) => (
  <div className="flex aspect-3/2 w-full items-center justify-center rounded-lg bg-zinc-100 p-6 text-center text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
    {text}
  </div>
);

export const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const doc = node.value as Media | number | null | undefined;
    if (typeof doc !== "object" || doc === null)
      return imagePlaceholder("Image unavailable");

    if (!doc.mimeType?.startsWith("image")) {
      return (
        <a href={doc.url ?? "#"} rel="noopener noreferrer">
          {doc.filename}
        </a>
      );
    }

    const alt = node.fields?.alt || doc.alt || "";
    if (!doc.url || !doc.width || !doc.height)
      return imagePlaceholder(alt || "Image unavailable");

    return (
      <Image
        src={doc.url}
        alt={alt}
        width={doc.width}
        height={doc.height}
        className="h-auto w-full rounded-lg"
      />
    );
  },
});
