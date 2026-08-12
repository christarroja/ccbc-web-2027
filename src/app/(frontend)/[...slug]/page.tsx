import { notFound, permanentRedirect } from "next/navigation";
import { HOME_SLUG } from "@/lib/pages";
import { getPageByPath, getPagesLayout, pageMetadata } from "../pageData";
import { RenderSections } from "../components/RenderBlocks";

export async function generateMetadata(props: PageProps<"/[...slug]">) {
  const { slug } = await props.params;
  return pageMetadata(await getPageByPath(slug));
}

export default async function CmsPage(props: PageProps<"/[...slug]">) {
  const { slug } = await props.params;

  if (slug.length === 1 && slug[0] === HOME_SLUG) permanentRedirect("/");

  const [page, layout] = await Promise.all([
    getPageByPath(slug),
    getPagesLayout(),
  ]);
  if (!page) notFound();

  return (
    <main>
      <RenderSections sections={page.layout} layout={layout} />
    </main>
  );
}
