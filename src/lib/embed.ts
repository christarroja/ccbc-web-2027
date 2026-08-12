/**
 * Turns a pasted page URL into the provider's embeddable URL.
 *
 * Deliberately an allowlist: an <iframe> whose src is any string an editor
 * pasted is a way to put someone else's page inside yours. Unknown hosts return
 * null and the block refuses to save. Add a host here to support it.
 */
export function embedSrc(url: string): null | string {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }

  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    // Already an embed link, or a premiere/stream link.
    for (const prefix of ["/embed/", "/live/", "/shorts/"]) {
      if (u.pathname.startsWith(prefix)) {
        const id = u.pathname.slice(prefix.length).split("/")[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }
    return null;
  }

  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    return /^\d+$/.test(id ?? "") ? `https://player.vimeo.com/video/${id}` : null;
  }

  // Already-embeddable players and Google Maps embeds pass through unchanged.
  if (host === "player.vimeo.com" && u.pathname.startsWith("/video/"))
    return u.toString();
  if (host === "google.com" && u.pathname.startsWith("/maps/embed"))
    return u.toString();

  return null;
}
