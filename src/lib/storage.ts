import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

/** Save a file under public/uploads/{userId}/ and return the public URL path. */
export async function saveLocalFile(
  buffer: Buffer,
  filename: string,
  userId: string
): Promise<string> {
  const ext = path.extname(filename).toLowerCase() || ".bin";
  const safeName = `${randomUUID()}${ext}`;
  const userDir = path.join(UPLOAD_ROOT, userId);

  await mkdir(userDir, { recursive: true });
  await writeFile(path.join(userDir, safeName), buffer);

  return `/uploads/${userId}/${safeName}`;
}

export function isLocalUploadUrl(url: string): boolean {
  return typeof url === "string" && url.startsWith("/uploads/");
}
