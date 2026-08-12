import { notFound } from "next/navigation";
import { HOME_SLUG } from "@/lib/pages";
import { getPageByPath, getPagesLayout, pageMetadata } from "./pageData";
import { RenderSections } from "./components/RenderBlocks";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata(await getPageByPath([HOME_SLUG]));
}

export default async function Home() {
  const [page, layout] = await Promise.all([
    getPageByPath([HOME_SLUG]),
    getPagesLayout(),
  ]);
  if (!page) notFound();

  return (
    <main>
      <RenderSections sections={page.layout} layout={layout} />
    </main>
  );
}
