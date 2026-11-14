/**
 * Images attached to a ledger entry travel with it to Earth (store and forward). They are
 * never analysed here. Only a small preview is kept, in this browser, so a photo or scan
 * can be seen next to the entry without storing a full-size file.
 */
export interface Attachment {
  name: string;
  /** "camera" photo or "ultrasound" scan. */
  source: "camera" | "ultrasound";
  mime: string;
  sizeBytes: number;
  /** Small JPEG preview, or null for formats a browser cannot show (camera RAW). */
  preview: string | null;
}

export const MAX_ATTACHMENTS = 3;
export const MAX_BYTES = 15 * 1024 * 1024;
export const PREVIEW_PX = 320;

const SHOWABLE = ["jpg", "jpeg", "png", "webp"];
const RAW = ["raw", "dng", "cr2", "nef", "arw"];
export const ACCEPT = [...SHOWABLE, ...RAW].map((e) => `.${e}`).join(",");

export function extension(name: string): string {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i + 1).toLowerCase();
}

export function canPreview(name: string): boolean {
  return SHOWABLE.includes(extension(name));
}

export interface FileLike {
  name: string;
  size: number;
}

/** Returns an error message, or null if the file can be attached. */
export function validateImage(file: FileLike, existing: number): string | null {
  if (existing >= MAX_ATTACHMENTS) return `You can attach up to ${MAX_ATTACHMENTS} images.`;
  const ext = extension(file.name);
  if (![...SHOWABLE, ...RAW].includes(ext)) {
    return "Use a JPG, JPEG, PNG or WebP image, or a camera RAW file.";
  }
  if (file.size <= 0) return "That file is empty.";
  if (file.size > MAX_BYTES) return "That file is over 15 MB.";
  return null;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Shrink an image to a small JPEG preview in the browser. Resolves null if it cannot be decoded. */
export async function makePreview(file: Blob & { name: string }): Promise<string | null> {
  if (!canPreview(file.name)) return null;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, PREVIEW_PX / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return null;
  }
}

export async function toAttachment(
  file: File,
  source: Attachment["source"],
): Promise<Attachment> {
  return {
    name: file.name,
    source,
    mime: file.type || "application/octet-stream",
    sizeBytes: file.size,
    preview: await makePreview(file),
  };
}
