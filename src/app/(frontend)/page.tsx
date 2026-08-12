import { notFound } from "next/navigation";
import { HOME_SLUG } from "@/lib/pages";
import { getPageByPath, pageMetadata } from "./pageData";
import { RenderBlocks } from "./components/RenderBlocks";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata(await getPageByPath([HOME_SLUG]));
}

export default async function Home() {
  const page = await getPageByPath([HOME_SLUG]);
  if (!page) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <RenderBlocks blocks={page.layout} />
    </main>
  );
}
