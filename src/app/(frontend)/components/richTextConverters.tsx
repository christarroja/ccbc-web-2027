import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { Media } from "@/payload-types";
import { ImageWithFallback } from "./ImageWithFallback";

/**
 * Shared by blog posts and the `content` page block so rich text renders
 * identically wherever it appears.
 */
export const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
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
