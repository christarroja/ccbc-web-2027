import { notFound, permanentRedirect } from "next/navigation";
import { HOME_SLUG } from "@/lib/pages";
import { getPageByPath, pageMetadata } from "../pageData";
import { RenderBlocks } from "../components/RenderBlocks";

export async function generateMetadata(props: PageProps<"/[...slug]">) {
  const { slug } = await props.params;
  return pageMetadata(await getPageByPath(slug));
}

export default async function CmsPage(props: PageProps<"/[...slug]">) {
  const { slug } = await props.params;

  if (slug.length === 1 && slug[0] === HOME_SLUG) permanentRedirect("/");

  const page = await getPageByPath(slug);
  if (!page) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <RenderBlocks blocks={page.layout} />
    </main>
  );
}
