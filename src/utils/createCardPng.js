import { toPng } from "html-to-image";

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Cannot read image file"));

    reader.readAsDataURL(blob);
  });
}

async function fetchImageAsDataUrl(src) {
  if (src.startsWith("data:")) return src;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const url = new URL(src, window.location.href).href;

    const response = await fetch(url, {
      mode: "cors",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Image request failed (${response.status}): ${url}`);
    }

    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) {
      throw new Error(`URL did not return an image: ${url}`);
    }

    return await blobToDataUrl(blob);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function inlineImages(element) {
  const images = [...element.querySelectorAll("img")];

  await Promise.all(
    images.map(async (img) => {
      const src = img.currentSrc || img.src;
      if (!src) return;

      const dataUrl = await fetchImageAsDataUrl(src);
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      img.src = dataUrl;

      if (typeof img.decode === "function") {
        await img.decode();
      }

      if (img.naturalWidth === 0) {
        throw new Error(`Image could not be decoded: ${src}`);
      }
    })
  );
}

export async function createCardPng(element, pixelRatio = 2) {
  if (!element) {
    throw new Error("Receipt or sticker element was not found");
  }

  await document.fonts.ready;

  // កែរូបលើ clone ដើម្បីកុំឱ្យប៉ះ card ដែល React កំពុងបង្ហាញ
  const clone = element.cloneNode(true);
  const width = element.offsetWidth;
  const height = element.offsetHeight;

  Object.assign(clone.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${width}px`,
    backgroundColor: "#ffffff",
    transform: "none",
  });

  document.body.appendChild(clone);

  try {
    await inlineImages(clone);

    return await toPng(clone, {
      width,
      height,
      pixelRatio: Math.min(pixelRatio, 2),
      backgroundColor: "#ffffff",
      cacheBust: false,
    });
  } finally {
    clone.remove();
  }
}