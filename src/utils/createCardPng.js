import { toPng } from "html-to-image";

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Cannot read image"));
    reader.readAsDataURL(blob);
  });
}

async function imageToDataUrl(src) {
  if (src.startsWith("data:")) return src;

  const url = new URL(src, window.location.href).href;
  const response = await fetch(url, { mode: "cors" });

  if (!response.ok) {
    throw new Error(`Cannot load image (${response.status}): ${url}`);
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error(`URL is not an image: ${url}`);
  }

  return blobToDataUrl(blob);
}

export async function createCardPng(element, pixelRatio = 2) {
  if (!element) throw new Error("Card element not found");

  await document.fonts.ready;

  const images = [...element.querySelectorAll("img")];

  // ទាញរូបទាំងអស់ឱ្យរួចសិន មុនកែ DOM
  const dataUrls = await Promise.all(
    images.map((img) =>
      img.currentSrc || img.src
        ? imageToDataUrl(img.currentSrc || img.src)
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
        await img.decode();
      })
    );

    const options = {
      pixelRatio: pixelRatio || 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
    };

    // Workaround for iOS/Safari bug where images are missing on first render
    // We call toPng multiple times to ensure images are fully rendered inside the <foreignObject>
    await toPng(element, options);
    await toPng(element, options);

    return await toPng(element, options);
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