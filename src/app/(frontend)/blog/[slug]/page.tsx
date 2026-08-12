import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { RichText } from "@payloadcms/richtext-lexical/react";
import config from "@payload-config";
import { doc } from "../../pageData";
import { converters } from "../../components/richTextConverters";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

async function getPost(slug: string) {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "posts",
    overrideAccess: false,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return docs[0];
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">) {
  const post = await getPost((await props.params).slug);
  return { title: post?.title ?? "Not found", description: post?.excerpt };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const post = await getPost((await props.params).slug);
  if (!post) notFound();

  const hero = doc(post.heroImage);
  const author = doc(post.author);
  const categories =
    post.categories?.filter((c) => typeof c === "object") ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/blog" />}>
              Blog
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{post.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {categories.length > 0 && (
        <nav className="mt-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant="secondary"
              render={<Link href={`/blog?category=${cat.slug}`} />}
            >
              {cat.title}
            </Badge>
          ))}
        </nav>
      )}
      <h1
        className={`${categories.length > 0 ? "mt-3" : "mt-6"} text-3xl font-semibold tracking-tight`}
      >
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {author?.name ?? "Staff"}
        {post.publishedAt && (
          <>
            {" · "}
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                dateStyle: "medium",
              })}
            </time>
          </>
        )}
      </p>
      {hero?.url && hero.width && hero.height && (
        <Image
          src={hero.url}
          alt={hero.alt}
          width={hero.width}
          height={hero.height}
          className="mt-8 h-auto w-full rounded-lg"
          priority
        />
      )}
      <div className="prose dark:prose-invert mt-8 max-w-none">
        <RichText data={post.content} converters={converters} />
      </div>
    </main>
  );
}
