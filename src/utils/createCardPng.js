import { toPng } from "html-to-image";
import khmerFontUrl from "@fontsource-variable/kantumruy-pro/files/kantumruy-pro-khmer-wght-normal.woff2";
import latinFontUrl from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2";

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Cannot read blob"));
    reader.readAsDataURL(blob);
  });
}

async function urlToDataUrl(src) {
  if (!src) return null;
  if (src.startsWith("data:")) return src;

  try {
    const url = new URL(src, window.location.href).href;
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;

    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

let cachedFontEmbedCSS = null;

async function getCustomFontEmbedCSS() {
  if (cachedFontEmbedCSS) return cachedFontEmbedCSS;

  try {
    const [khmerDataUrl, latinDataUrl] = await Promise.all([
      urlToDataUrl(khmerFontUrl),
      urlToDataUrl(latinFontUrl),
    ]);

    let css = "";
    if (khmerDataUrl) {
      css += `
@font-face {
  font-family: 'Kantumruy Pro';
  font-style: normal;
  font-weight: 100 900;
  src: url('${khmerDataUrl}') format('woff2');
  unicode-range: U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC;
}
@font-face {
  font-family: 'Kantumruy Pro Variable';
  font-style: normal;
  font-weight: 100 900;
  src: url('${khmerDataUrl}') format('woff2');
  unicode-range: U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC;
}
@font-face {
  font-family: 'Battambang';
  font-style: normal;
  font-weight: 100 900;
  src: url('${khmerDataUrl}') format('woff2');
}
@font-face {
  font-family: 'Siemreap';
  font-style: normal;
  font-weight: 100 900;
  src: url('${khmerDataUrl}') format('woff2');
}
@font-face {
  font-family: 'Noto Sans Khmer';
  font-style: normal;
  font-weight: 100 900;
  src: url('${khmerDataUrl}') format('woff2');
}
`;
    }

    if (latinDataUrl) {
      css += `
@font-face {
  font-family: 'Geist Variable';
  font-style: normal;
  font-weight: 100 900;
  src: url('${latinDataUrl}') format('woff2');
}
`;
    }

    cachedFontEmbedCSS = css.trim();
    return cachedFontEmbedCSS;
  } catch (err) {
    console.warn("Failed to generate embedded font CSS:", err);
    return "";
  }
}

export async function createCardPng(element, pixelRatio = 2) {
  if (!element) throw new Error("Card element not found");

  try {
    await document.fonts.ready;
  } catch {
    // Ignore font ready errors
  }

  // Target card directly if wrapped
  const cardElement =
    element.querySelector?.(
      "#admin-sticker-card, #product-sticker-card, #client-receipt-card, #admin-receipt-card"
    ) || element;

  const images = [...cardElement.querySelectorAll("img")];
  const dataUrls = await Promise.all(
    images.map((img) =>
      img.currentSrc || img.src
        ? urlToDataUrl(img.currentSrc || img.src)
        : Promise.resolve(null)
    )
  );

  const originals = images.map((img) => ({
    src: img.getAttribute("src"),
    srcset: img.getAttribute("srcset"),
    sizes: img.getAttribute("sizes"),
  }));

  try {
    images.forEach((img, index) => {
      if (!dataUrls[index]) return;

      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      img.src = dataUrls[index];
    });

    await Promise.all(
      images.map(async (img, index) => {
        if (!dataUrls[index]) return;
        try {
          await img.decode();
        } catch {
          // Ignore decode errors
        }
      })
    );

    const width = cardElement.offsetWidth || cardElement.clientWidth || undefined;
    const height = cardElement.offsetHeight || cardElement.clientHeight || undefined;

    const fontEmbedCSS = await getCustomFontEmbedCSS();

    const options = {
      pixelRatio: pixelRatio || 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
      width,
      height,
      ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
    };

    // First call to warm up SVG rendering
    await toPng(cardElement, options);

    // Final clean render with embedded fonts
    return await toPng(cardElement, options);
  } finally {
    images.forEach((img, index) => {
      const original = originals[index];

      if (original.src === null) img.removeAttribute("src");
      else img.setAttribute("src", original.src);

      if (original.srcset === null) img.removeAttribute("srcset");
      else img.setAttribute("srcset", original.srcset);

      if (original.sizes === null) img.removeAttribute("sizes");
      else img.setAttribute("sizes", original.sizes);
    });
  }
}