import { isPostimagesUrl, isAllowedProfileImageUrl } from "@/lib/postimages";
import { isLocalUploadUrl } from "@/lib/storage";

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
] as const;

export const OTHER_FILE_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
] as const;

export function isImageMime(mime: string): boolean {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(mime);
}

export function isVideoMime(mime: string): boolean {
  return mime.startsWith("video/") || (VIDEO_MIME_TYPES as readonly string[]).includes(mime);
}

export function isValidMediaUrl(url: string): boolean {
  if (isLocalUploadUrl(url)) return true;
  if (isPostimagesUrl(url)) return true;
  return isAllowedProfileImageUrl(url);
}

export function isValidPostImageUrl(url: string): boolean {
  return isPostimagesUrl(url) || isLocalUploadUrl(url);
}

export function isValidPostVideoUrl(url: string): boolean {
  return isLocalUploadUrl(url);
}

export function isValidProfileImageUrl(url: string): boolean {
  return isValidMediaUrl(url);
}
