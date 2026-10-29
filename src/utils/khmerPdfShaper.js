const KHMER_UNICODE_REGEX = /[\u1780-\u17FF]/;
const snippetCache = new Map();
export function isKhmerText(val) {
  if (!val || typeof val !== "string") return false;
  return KHMER_UNICODE_REGEX.test(val);
}

export function mmToCssPx(mm) {
  return (mm * 96) / 25.4;
}

export function cssPxToMm(px) {
  return (px * 25.4) / 96;
}
export function ptToCssPx(pt) {
  return (pt * 96) / 72;
}


export function renderKhmerSnippet({
  lines,
  text,
  widthMm,
  heightMm,
  padding = { left: 2, right: 2, top: 2, bottom: 2 },
  fontSizePt = 8.5,
  fontWeight = "normal",
  textColor = "#1e293b",
  halign = "center",
  valign = "middle",
  badge = null,
  scale = 4,
}) {
  if (typeof document === "undefined") {
    return null;
  }

  const textLines = Array.isArray(lines) && lines.length > 0
    ? lines.filter((l) => typeof l === "string" && l.length > 0)
    : text
      ? [String(text)]
      : [];

  if (textLines.length === 0) {
    return null;
  }

  const cacheKey = [
    textLines.join(" \n "),
    widthMm.toFixed(2),
    heightMm.toFixed(2),
    fontSizePt,
    fontWeight,
    textColor,
    halign,
    valign,
    badge ? `${badge.bg}_${badge.color}_${badge.border}` : "no-badge",
    scale,
  ].join("|");

  if (snippetCache.has(cacheKey)) {
    return snippetCache.get(cacheKey);
  }

  try {
    const cssWidth = Math.max(1, mmToCssPx(widthMm));
    const cssHeight = Math.max(1, mmToCssPx(heightMm));

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cssWidth * scale);
    canvas.height = Math.round(cssHeight * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.scale(scale, scale);

    const cssFontSize = ptToCssPx(fontSizePt);
    const weightStr =
      fontWeight === "bold" || fontWeight === 700 || fontWeight === "700"
        ? "bold"
        : "normal";

    ctx.font = `${weightStr} ${cssFontSize}px 'Battambang', 'Kantumruy Pro', sans-serif`;

    // Optional badge background/border
    if (badge) {
      const badgePaddingX = 8;
      const badgePaddingY = 3;
      const metrics = ctx.measureText(textLines[0]);
      const textWidth = metrics.width;
      const badgeWidth = Math.min(cssWidth - 4, textWidth + badgePaddingX * 2);
      const badgeHeight = Math.min(cssHeight - 4, cssFontSize + badgePaddingY * 2 + 2);
      const badgeX = (cssWidth - badgeWidth) / 2;
      const badgeY = (cssHeight - badgeHeight) / 2;
      const radius = badgeHeight / 2;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, radius);
      if (badge.bg) {
        ctx.fillStyle = badge.bg;
        ctx.fill();
      }
      if (badge.border) {
        ctx.strokeStyle = badge.border;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    ctx.fillStyle = badge ? badge.color : textColor;
    ctx.textAlign = halign;
    ctx.textBaseline = "middle";

    let posX = cssWidth / 2;
    if (halign === "left") {
      posX = mmToCssPx(padding.left ?? 2);
    } else if (halign === "right") {
      posX = cssWidth - mmToCssPx(padding.right ?? 2);
    }

    const lineHeight = cssFontSize * 1.35;
    const totalTextHeight = (textLines.length - 1) * lineHeight + cssFontSize;

    let startY = (cssHeight - totalTextHeight) / 2 + cssFontSize / 2;
    if (valign === "top") {
      startY = mmToCssPx(padding.top ?? 2) + cssFontSize / 2;
    } else if (valign === "bottom") {
      startY =
        cssHeight -
        mmToCssPx(padding.bottom ?? 2) -
        totalTextHeight +
        cssFontSize / 2;
    }

    for (let i = 0; i < textLines.length; i++) {
      const lineY = startY + i * lineHeight;
      ctx.fillText(textLines[i], posX, lineY);
    }

    const dataUrl = canvas.toDataURL("image/png");
    snippetCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (error) {
    console.warn("[khmerPdfShaper] Error rendering Khmer snippet:", error);
    return null;
  }
}

export function drawKhmerInAutoTableCell(doc, cellHookData, customOptions = {}) {
  const cell = cellHookData.cell;
  const isHead = cellHookData.section === "head";
  const styles = cell.styles || {};

  // Retrieve lines saved by willDrawCell before text was cleared
  const lines =
    cell._khmerLines ||
    (Array.isArray(cell.text) && cell.text.length > 0
      ? cell.text
      : [String(cell.raw || "")]);

  const rawText = String(cell.raw || lines.join(" "));
  if (!rawText || !isKhmerText(rawText)) {
    return;
  }

  // Preserve intended text color (white for header, dark for body)
  let textColor = isHead ? "#ffffff" : "#1e293b";
  if (Array.isArray(styles.textColor)) {
    textColor = `rgb(${styles.textColor[0]}, ${styles.textColor[1]}, ${styles.textColor[2]})`;
  } else if (typeof styles.textColor === "string") {
    textColor = styles.textColor;
  }

  const halign = styles.halign || (isHead ? "center" : "left");
  const fontSizePt = styles.fontSize || (isHead ? 8.5 : 8);
  const fontWeight =
    isHead || styles.fontStyle === "bold" ? "bold" : "normal";

  const paddingLeft =
    typeof cell.padding === "function"
      ? cell.padding("left")
      : (cell.padding?.left ?? 2);
  const paddingRight =
    typeof cell.padding === "function"
      ? cell.padding("right")
      : (cell.padding?.right ?? 2);
  const paddingTop =
    typeof cell.padding === "function"
      ? cell.padding("top")
      : (cell.padding?.top ?? 2);
  const paddingBottom =
    typeof cell.padding === "function"
      ? cell.padding("bottom")
      : (cell.padding?.bottom ?? 2);

  const dataUrl = renderKhmerSnippet({
    lines,
    text: rawText,
    widthMm: cell.width,
    heightMm: cell.height,
    padding: {
      left: paddingLeft,
      right: paddingRight,
      top: paddingTop,
      bottom: paddingBottom,
    },
    fontSizePt,
    fontWeight,
    textColor,
    halign,
    valign: styles.valign || "middle",
    badge: customOptions.badge || null,
  });

  if (dataUrl) {
    doc.addImage(dataUrl, "PNG", cell.x, cell.y, cell.width, cell.height);
  }
}


export function drawKhmerText(doc, text, x, y, options = {}) {
  if (!text) return;

  const fontSizePt = options.fontSize || doc.getFontSize() || 11;
  const fontWeight =
    options.bold || options.fontWeight === "bold" ? "bold" : "normal";
  const textColor = options.color || "#1e293b";
  const halign = options.align || options.halign || "left";

  if (!isKhmerText(text)) {
    doc.setFont("Battambang", fontWeight);
    doc.setFontSize(fontSizePt);
    doc.setTextColor(textColor);
    doc.text(text, x, y, { align: halign });
    return;
  }

  if (typeof document === "undefined") {
    doc.setFont("Battambang", fontWeight);
    doc.setFontSize(fontSizePt);
    doc.setTextColor(textColor);
    doc.text(text, x, y, { align: halign });
    return;
  }

  try {
    const cssFontSize = ptToCssPx(fontSizePt);
    const weightStr = fontWeight === "bold" ? "bold" : "normal";
    const scale = 4;

    const measureCanvas = document.createElement("canvas");
    const measureCtx = measureCanvas.getContext("2d");
    if (!measureCtx) return;

    measureCtx.font = `${weightStr} ${cssFontSize}px 'Battambang', 'Kantumruy Pro', sans-serif`;
    const metrics = measureCtx.measureText(text);

    const safetyPad = 12;
    const cssWidth = Math.ceil(metrics.width + safetyPad * 2);
    const cssHeight = Math.ceil(cssFontSize * 1.6 + 8);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cssWidth * scale);
    canvas.height = Math.round(cssHeight * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.font = `${weightStr} ${cssFontSize}px 'Battambang', 'Kantumruy Pro', sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    ctx.fillText(text, safetyPad, cssHeight / 2);

    const dataUrl = canvas.toDataURL("image/png");
    const widthMm = cssPxToMm(cssWidth);
    const heightMm = cssPxToMm(cssHeight);
    const padMm = cssPxToMm(safetyPad);

    let drawX = x - padMm;
    if (halign === "center") {
      drawX = x - widthMm / 2;
    } else if (halign === "right") {
      drawX = x - widthMm + padMm;
    }

    const drawY = y - heightMm / 2;
    doc.addImage(dataUrl, "PNG", drawX, drawY, widthMm, heightMm);
  } catch (error) {
    console.warn("[khmerPdfShaper] Error in drawKhmerText:", error);
    doc.setFont("Battambang", fontWeight);
    doc.setFontSize(fontSizePt);
    doc.setTextColor(textColor);
    doc.text(text, x, y, { align: halign });
  }
}
