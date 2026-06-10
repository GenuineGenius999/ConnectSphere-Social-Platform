import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToPostimages } from "@/lib/postimages";
import { saveLocalFile } from "@/lib/storage";
import {
  IMAGE_MIME_TYPES,
  VIDEO_MIME_TYPES,
  OTHER_FILE_MIME_TYPES,
  isImageMime,
} from "@/lib/media";

const MAX_IMAGE_SIZE = 32 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
  ...OTHER_FILE_MIME_TYPES,
];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.isBanned) {
    return NextResponse.json({ error: "Your account is banned" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const typeAllowed =
      ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number]) ||
      file.type.startsWith("video/") ||
      file.type.startsWith("audio/");

    if (!typeAllowed) {
      return NextResponse.json(
        { error: "File type not supported. Use images, videos, PDF, audio, or documents." },
        { status: 400 }
      );
    }

    const maxSize = isImageMime(file.type)
      ? MAX_IMAGE_SIZE
      : file.type.startsWith("video/")
        ? MAX_VIDEO_SIZE
        : MAX_FILE_SIZE;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large (max ${Math.round(maxSize / 1024 / 1024)}MB)` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Images → Postimages (fallback to local if API fails)
    if (isImageMime(file.type)) {
      try {
        const result = await uploadToPostimages(buffer, file.name, file.type);
        return NextResponse.json({
          url: result.directUrl,
          storage: "postimages",
          mimeType: file.type,
          kind: "image",
        });
      } catch (postimagesError) {
        console.warn("Postimages upload failed, saving locally:", postimagesError);
        const localUrl = await saveLocalFile(buffer, file.name, session.user.id);
        return NextResponse.json({
          url: localUrl,
          storage: "local",
          mimeType: file.type,
          kind: "image",
        });
      }
    }

    // Videos & other files → saved locally in this project
    const localUrl = await saveLocalFile(buffer, file.name, session.user.id);
    return NextResponse.json({
      url: localUrl,
      storage: "local",
      mimeType: file.type,
      kind: file.type.startsWith("video/") ? "video" : "file",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
