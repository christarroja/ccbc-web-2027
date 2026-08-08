import Link from "next/link";
import { HOME_SLUG } from "@/lib/pages";
import { getHomePage, pageMetadata } from "./pageData";
import { RenderBlocks } from "./components/RenderBlocks";

/**
 * Unlike every other page route here, / has no params or searchParams, so
 * Next would prerender it at build time and bake in whatever the database held
 * then — editors' changes would never appear. The Payload read is not a
 * fetch(), so Next can't detect this on its own.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata(await getHomePage());
}

export default async function Home() {
  const page = await getHomePage();

  // Deliberately not notFound(): a 404 at the site root reads as "the site is
  // broken" rather than "nobody has built the homepage yet".
  if (!page) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          No homepage yet
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Create a page with the slug{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
            {HOME_SLUG}
          </code>{" "}
          in the{" "}
          <Link href="/admin/collections/pages" className="underline">
            admin
          </Link>{" "}
          and publish it. It will render here.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <RenderBlocks blocks={page.layout} />
    </main>
  );
}
