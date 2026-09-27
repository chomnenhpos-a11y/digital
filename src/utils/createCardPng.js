import { toPng } from "html-to-image";

async function waitForImage(img) {
  if (!img.complete) {
    await new Promise((resolve, reject) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", reject, { once: true });
    });
  }

  if (img.naturalWidth === 0) {
    throw new Error(`Image failed to load: ${img.src}`);
  }

  await img.decode();
}

export async function createCardPng(element, pixelRatio = 2) {
  await document.fonts.ready;
  await Promise.all(
    [...element.querySelectorAll("img")].map(waitForImage)
  );

  return toPng(element, {
    cacheBust: true,
    pixelRatio,
    backgroundColor: "#ffffff",
  });
}