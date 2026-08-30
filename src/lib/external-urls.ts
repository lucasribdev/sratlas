export const EXTERNAL_URLS = {
  wikiPage: "https://soulsremnant.wiki.gg/wiki/",
  wikiThumbnail: "https://soulsremnant.wiki.gg/images/thumb/",
} as const;

function encodePathSegment(value: string) {
  try {
    return encodeURIComponent(decodeURIComponent(value));
  } catch {
    return encodeURIComponent(value);
  }
}

function encodePath(value: string) {
  return value.split("/").map(encodePathSegment).join("/");
}

export function getWikiUrl(slug: string) {
  return new URL(encodePath(slug), EXTERNAL_URLS.wikiPage).toString();
}

export function getWikiThumbnailUrl(image: string) {
  return new URL(encodePath(image), EXTERNAL_URLS.wikiThumbnail).toString();
}
