"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

/**
 * Image that falls back to a gray box when the file is missing (deleted from disk,
 * failed bucket migration). onError only fires in the browser, so a broken image
 * shows briefly before the fallback replaces it.
 */
export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className,
  priority,
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex aspect-3/2 w-full items-center justify-center rounded-lg bg-zinc-100 p-6 text-center text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 ${className ?? ""}`}
      >
        {alt}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
