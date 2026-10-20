export function normalizeProductMedia(value) {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  return value.filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry)).map((entry) => ({
    icon: typeof entry.icon === "string" ? entry.icon.trim() : "",
    url: typeof entry.url === "string" ? entry.url.trim() : "",
  }));
}

export function getProductMediaUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
