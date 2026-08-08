import assert from "node:assert/strict";
import {
  HOME_SLUG,
  matchesAncestry,
  MAX_SEGMENTS,
  RESERVED_SLUGS,
} from "./pages";

// Run with: npx payload run src/lib/pages.check.ts

const about = { slug: "about", parent: null };
const ourTeam = { slug: "our-team", parent: about };
const history = { slug: "history", parent: ourTeam };

// Happy paths
assert.equal(matchesAncestry(about, ["about"]), true);
assert.equal(matchesAncestry(ourTeam, ["about", "our-team"]), true);
assert.equal(matchesAncestry(history, ["about", "our-team", "history"]), true);

// A nested page must not be reachable at the root
assert.equal(matchesAncestry(ourTeam, ["our-team"]), false);

// Wrong ancestor
assert.equal(matchesAncestry(ourTeam, ["wrong", "our-team"]), false);

// URL shorter than the real chain
assert.equal(matchesAncestry(history, ["our-team", "history"]), false);

// URL longer than the real chain
assert.equal(matchesAncestry(ourTeam, ["x", "about", "our-team"]), false);

// depth ran out: parent came back as a bare id, so ancestry is unverifiable
assert.equal(matchesAncestry({ slug: "our-team", parent: 7 }, ["about", "our-team"]), false);

// Bounds
assert.equal(matchesAncestry(about, []), false);
assert.equal(
  matchesAncestry(about, Array(MAX_SEGMENTS + 1).fill("about")),
  false,
);

// The homepage must stay creatable — reserving it would make / unbuildable.
assert.equal(RESERVED_SLUGS.has(HOME_SLUG), false);

console.log("pages: all checks passed");
