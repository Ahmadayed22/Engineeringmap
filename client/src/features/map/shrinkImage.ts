/** Largest card picture we keep; the home page shows cards at most ~600px wide. */
export const MAX_IMAGE_WIDTH = 1600;
export const MAX_IMAGE_HEIGHT = 1200;
/** The server refuses anything larger. */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

/** Size that fits inside max width/height, keeping the aspect ratio and never enlarging. */
export function fitSize(
  width: number,
  height: number,
  maxWidth = MAX_IMAGE_WIDTH,
  maxHeight = MAX_IMAGE_HEIGHT
) {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('not an image'));
    };
    img.src = url;
  });

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Re-encodes a picture the admin picked as a WebP (JPEG where WebP isn't supported) of at most
 * 1600x1200, so uploads stay small. Rejects files the browser can't read as an image.
 */
export async function shrinkImage(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const { width, height } = fitSize(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  ctx.drawImage(img, 0, 0, width, height);

  for (const quality of [0.85, 0.7, 0.5]) {
    const webp = await toBlob(canvas, 'image/webp', quality);
    const blob =
      webp && webp.type === 'image/webp'
        ? webp
        : await toBlob(canvas, 'image/jpeg', quality);
    if (blob && blob.size <= MAX_UPLOAD_BYTES) return blob;
  }
  throw new Error('too large');
}
