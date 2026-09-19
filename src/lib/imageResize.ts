"use client";

// Downscales a photo client-side before it's uploaded through the portal.
// The site's own display pipeline (getImageUrls -> images.weserv.nl) never
// serves anything wider than 1000px, so uploading a full-resolution phone
// photo would just waste bandwidth and Drive storage for no visual gain.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

export async function resizeImageToBase64(
  file: File
): Promise<{ base64: string; mimeType: string }> {
  const img = await loadImage(file);
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("No se pudo procesar la imagen.");

  return { base64, mimeType: "image/jpeg" };
}
