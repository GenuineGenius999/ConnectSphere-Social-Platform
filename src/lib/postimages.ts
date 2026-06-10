/**
 * Upload images to Postimages.org and return the direct hotlink URL.
 * Get your free API key at https://postimages.org/ (Premium/Free API access).
 * @see https://postimages.org/
 */

const POSTIMAGES_UPLOAD_URL = "https://postimages.org/json?q=a";
const POSTIMAGES_API_URL = "https://api.postimage.org/1/upload";

export type PostimagesUploadResult = {
  directUrl: string;
  pageUrl: string;
  deleteUrl?: string;
};

function randomSession(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function parseUploadResponse(data: unknown): PostimagesUploadResult | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  const directUrl =
    (record.direct as string) ||
    (record.url as string) ||
    (record.image as string) ||
    (record.thumb as string);

  if (!directUrl || typeof directUrl !== "string") return null;

  return {
    directUrl: directUrl.startsWith("http") ? directUrl : `https://${directUrl}`,
    pageUrl: (record.page as string) || directUrl,
    deleteUrl: record.delete as string | undefined,
  };
}

function parseXmlResponse(xml: string): PostimagesUploadResult | null {
  const directMatch = xml.match(/<direct_link>([^<]+)<\/direct_link>/);
  const urlMatch = xml.match(/<url>([^<]+)<\/url>/);
  const directUrl = directMatch?.[1] || urlMatch?.[1];
  if (!directUrl) return null;

  const pageMatch = xml.match(/<page_link>([^<]+)<\/page_link>/);
  const deleteMatch = xml.match(/<delete_link>([^<]+)<\/delete_link>/);

  return {
    directUrl,
    pageUrl: pageMatch?.[1] || directUrl,
    deleteUrl: deleteMatch?.[1],
  };
}

/** Upload a file buffer to Postimages.org */
export async function uploadToPostimages(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<PostimagesUploadResult> {
  const apiKey = process.env.POSTIMAGES_API_KEY;

  if (apiKey) {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    form.append("file", blob, filename);
    form.append("key", apiKey);
    form.append("numfiles", "1");
    form.append("optsize", "0");
    form.append("expire", "0");

    const res = await fetch(POSTIMAGES_API_URL, { method: "POST", body: form });
    const text = await res.text();

    if (text.trim().startsWith("{")) {
      const parsed = parseUploadResponse(JSON.parse(text));
      if (parsed) return parsed;
    }

    const xmlParsed = parseXmlResponse(text);
    if (xmlParsed) return xmlParsed;
  }

  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  form.append("file", blob, filename);
  form.append("upload_session", randomSession());
  form.append("numfiles", "1");
  form.append("optsize", "0");
  form.append("expire", "0");
  if (apiKey) form.append("token", apiKey);

  const res = await fetch(POSTIMAGES_UPLOAD_URL, { method: "POST", body: form });
  const json = await res.json().catch(() => null);
  const parsed = parseUploadResponse(json);

  if (parsed) return parsed;

  throw new Error(
    "Failed to upload to Postimages. Add POSTIMAGES_API_KEY to .env (get it from postimages.org account settings)."
  );
}

export function isPostimagesUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return (
      host === "i.postimg.cc" ||
      host === "postimg.cc" ||
      host.endsWith(".postimg.cc") ||
      host === "i.postimages.org" ||
      host === "postimages.org" ||
      host.endsWith(".postimages.org")
    );
  } catch {
    return false;
  }
}

/** Profile avatars/covers may use Postimages, local uploads, pravatar, or stock imagery. */
export function isAllowedProfileImageUrl(url: string): boolean {
  if (url.startsWith("/uploads/")) return true;
  if (isPostimagesUrl(url)) return true;
  try {
    const host = new URL(url).hostname;
    return (
      host === "i.pravatar.cc" ||
      host === "images.unsplash.com" ||
      host === "picsum.photos" ||
      host === "fastly.picsum.photos"
    );
  } catch {
    return false;
  }
}

export function getAvatarFallback(username: string): string {
  return `https://i.postimg.cc/placeholder-avatar/${encodeURIComponent(username)}.png`;
}
