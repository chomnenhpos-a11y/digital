import {
  BATTAMBANG_REGULAR_BASE64,
  BATTAMBANG_BOLD_BASE64,
} from "../assets/fonts/battambangBase64.js";

let browserFontLoaded = false;

function base64ToArrayBuffer(base64) {
  if (typeof atob === "function") {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  // Node fallback
  return Buffer.from(base64, "base64").buffer;
}

export async function ensureBrowserBattambangFont() {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof FontFace === "undefined" ||
    !document.fonts
  ) {
    return false;
  }

  if (browserFontLoaded) {
    return true;
  }

  try {
    const regBuffer = base64ToArrayBuffer(BATTAMBANG_REGULAR_BASE64);
    const boldBuffer = base64ToArrayBuffer(BATTAMBANG_BOLD_BASE64);

    const fontRegular = new FontFace("Battambang", regBuffer, {
      weight: "normal",
      style: "normal",
    });
    const fontBold = new FontFace("Battambang", boldBuffer, {
      weight: "bold",
      style: "normal",
    });

    await Promise.all([fontRegular.load(), fontBold.load()]);

    document.fonts.add(fontRegular);
    document.fonts.add(fontBold);

    await Promise.allSettled([
      document.fonts.load("12px Battambang"),
      document.fonts.load("bold 12px Battambang"),
    ]);

    await document.fonts.ready;
    browserFontLoaded = true;
    return true;
  } catch (error) {
    console.warn("[pdfFontLoader] Could not register FontFace in DOM:", error);
    return false;
  }
}


export async function setupBattambangFont(doc) {
  if (!doc || typeof doc.addFileToVFS !== "function") {
    return false;
  }

  try {
    // 1. Register in jsPDF Virtual File System (VFS)
    if (!doc.getFontList || !doc.getFontList()["Battambang"]) {
      doc.addFileToVFS("Battambang-Regular.ttf", BATTAMBANG_REGULAR_BASE64);
      doc.addFont("Battambang-Regular.ttf", "Battambang", "normal");

      doc.addFileToVFS("Battambang-Bold.ttf", BATTAMBANG_BOLD_BASE64);
      doc.addFont("Battambang-Bold.ttf", "Battambang", "bold");
    }

    // 2. Ensure browser canvas engine has Battambang ready
    await ensureBrowserBattambangFont();

    return true;
  } catch (error) {
    console.warn("[pdfFontLoader] Error setting up Battambang font:", error);
    return false;
  }
}

export const setupKhmerFont = setupBattambangFont;
