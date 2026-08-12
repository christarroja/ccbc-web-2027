import assert from "node:assert/strict";
import { embedSrc } from "./embed";

// Run with: npx payload run src/lib/embed.check.ts

const YT = "https://www.youtube.com/embed/dQw4w9WgXcQ";

// YouTube, in the shapes people actually paste
assert.equal(embedSrc("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), YT);
assert.equal(embedSrc("https://youtube.com/watch?v=dQw4w9WgXcQ&t=42"), YT);
assert.equal(embedSrc("https://youtu.be/dQw4w9WgXcQ"), YT);
assert.equal(embedSrc("https://youtu.be/dQw4w9WgXcQ?t=42"), YT);
assert.equal(embedSrc("https://www.youtube.com/live/dQw4w9WgXcQ"), YT);
assert.equal(embedSrc(YT), YT);

// Vimeo
assert.equal(embedSrc("https://vimeo.com/123456789"), "https://player.vimeo.com/video/123456789");
assert.equal(
  embedSrc("https://player.vimeo.com/video/123456789"),
  "https://player.vimeo.com/video/123456789",
);

// Google Maps
assert.match(embedSrc("https://www.google.com/maps/embed?pb=x") ?? "", /maps\/embed/);

// Rejected: not an allowlisted host — this is the point of the allowlist
assert.equal(embedSrc("https://evil.example.com/page"), null);
assert.equal(embedSrc("https://vimeo.com/notanid"), null);
assert.equal(embedSrc("https://www.youtube.com/"), null);

// Rejected: not https, or not a URL at all
assert.equal(embedSrc("http://www.youtube.com/watch?v=dQw4w9WgXcQ"), null);
assert.equal(embedSrc("javascript:alert(1)"), null);
assert.equal(embedSrc("not a url"), null);
assert.equal(embedSrc(""), null);

console.log("embed: all checks passed");
