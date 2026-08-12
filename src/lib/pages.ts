/**
 * Shared URL rules for the Pages collection.
 *
 * Kept free of any Payload imports on purpose: the Pages collection config
 * imports this, so pulling in `@payload-config` here would be circular.
 */

/** Deepest nesting a URL may claim. Also caps the ancestor walk in Pages' `parent` validator. */
export const MAX_SEGMENTS = 5;

/**
 * The root-level page that renders at `/` instead of `/home`. Not reserved —
 * an editor is meant to create it.
 */
export const HOME_SLUG = "home";

/**
 * Real routes beat the /[...slug] catch-all, so a page using one of these
 * names would save fine and then never be reachable. Rejected at the source
 * so nobody publishes invisible content.
 *
 * Keep in sync with the top-level route segments under src/app.
 */
export const RESERVED_SLUGS = new Set(["admin", "api", "blog", "_next"]);

/** Structural stand-in for the generated `Page` type, so this stays testable with plain objects. */
type Node = {
  slug?: null | string;
  parent?: Node | null | number | string;
};

/**
 * Page slugs are globally unique (slugField() sets `unique: true`), so the last
 * URL segment alone identifies a page. The earlier segments still have to be
 * verified against the real parent chain, otherwise /anything/our-team would
 * serve the same page as /about/our-team.
 *
 * True when `page` sits at exactly the path `segments` describes: each segment
 * matches an ancestor slug in reverse order, and the topmost one is a root page.
 */
export function matchesAncestry(page: Node, segments: string[]): boolean {
  if (segments.length === 0 || segments.length > MAX_SEGMENTS) return false;

  let node: Node = page;
  for (let i = segments.length - 1; i > 0; i--) {
    if (node.slug !== segments[i]) return false;
    // An unpopulated id here means `depth` ran out before the chain did — we
    // can't verify the rest, so refuse rather than guess.
    if (typeof node.parent !== "object" || node.parent === null) return false;
    node = node.parent;
  }

  // The first segment must be a root page. A truthy `parent` (populated doc or
  // bare id) means the real path is longer than the URL claimed.
  return node.slug === segments[0] && !node.parent;
}
