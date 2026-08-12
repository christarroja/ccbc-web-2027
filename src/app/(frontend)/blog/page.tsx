import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { doc } from "../pageData";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const metadata = { title: "Blog" };

const PER_PAGE = 10;

export default async function BlogIndex(props: PageProps<"/blog">) {
  const { category, page } = await props.searchParams;
  const activeCategory = typeof category === "string" ? category : undefined;
  const currentPage = Math.max(1, Math.floor(Number(page)) || 1);

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  const payload = await getPayload({ config });
  const [{ docs, totalPages, hasNextPage, hasPrevPage }, { docs: categories }] =
    await Promise.all([
      payload.find({
        collection: "posts",
        overrideAccess: false,
        sort: "-publishedAt",
        limit: PER_PAGE,
        page: currentPage,
        depth: 1,
        ...(activeCategory && {
          where: { "categories.slug": { equals: activeCategory } },
        }),
      }),
      payload.find({
        collection: "categories",
        overrideAccess: false,
        sort: "title",
        limit: 50,
        depth: 0,
      }),
    ]);

  if (currentPage > 1 && docs.length === 0) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>

      {categories.length > 0 && (
        <nav className="mt-6 flex flex-wrap gap-2">
          {[{ slug: undefined, title: "All" }, ...categories].map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <Badge
                key={cat.slug ?? "all"}
                variant={isActive ? "default" : "outline"}
                render={
                  <Link
                    href={cat.slug ? `/blog?category=${cat.slug}` : "/blog"}
                    aria-current={isActive ? "page" : undefined}
                  />
                }
              >
                {cat.title}
              </Badge>
            );
          })}
        </nav>
      )}

      {docs.length === 0 && (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">
          {activeCategory
            ? "No posts in this category yet."
            : "No posts published yet."}
        </p>
      )}
      <ul className="mt-10 flex flex-col gap-10">
        {docs.map((post) => {
          const thumb = doc(post.heroImage);

          return (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group flex gap-5">
                {thumb?.url ? (
                  <Image
                    src={thumb.url}
                    alt={thumb.alt}
                    width={160}
                    height={120}
                    className="h-30 w-40 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-30 w-40 shrink-0 items-center justify-center rounded-lg bg-zinc-100 p-3 text-center text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {post.title}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-medium group-hover:underline">
                    {post.title}
                  </h2>
                  {post.publishedAt && (
                    <time
                      dateTime={post.publishedAt}
                      className="mt-1 block text-sm text-zinc-500"
                    >
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        dateStyle: "medium",
                      })}
                    </time>
                  )}
                  {post.excerpt && (
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {totalPages > 1 && (
        <Pagination className="mt-12 justify-between border-t border-border pt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={hasPrevPage ? hrefFor(currentPage - 1) : undefined}
                rel="prev"
                aria-disabled={!hasPrevPage}
                className={!hasPrevPage ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext
                href={hasNextPage ? hrefFor(currentPage + 1) : undefined}
                rel="next"
                aria-disabled={!hasNextPage}
                className={!hasNextPage ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </main>
  );
}
