const STAFF_TOKEN_PREFIX = "staff_";
const STAFF_TOKEN_PATTERN = /^staff_(\d+)$/;

function decodeBase64(value) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");

    if (typeof atob === "function") {
      return atob(normalized);
    }

    if (typeof Buffer !== "undefined") {
      return Buffer.from(normalized, "base64").toString("utf-8");
    }

    return null;
  } catch {
    return null;
  }
}

export function encodeStaffReff(staffId) {
  const id = Number(staffId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return "";
  }

  const payload = `${STAFF_TOKEN_PREFIX}${id}`;

  if (typeof btoa === "function") {
    return btoa(payload).replace(/=+$/, "");
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(payload, "utf-8").toString("base64").replace(/=+$/, "");
  }

  return "";
}


export function decodeStaffReff(staffReff) {
  if (typeof staffReff !== "string") {
    return null;
  }

  const decoded = decodeBase64(staffReff.trim());
  if (!decoded) {
    return null;
  }

  const match = STAFF_TOKEN_PATTERN.exec(decoded.trim());
  if (!match) {
    return null;
  }

  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function isStaffReffToken(staffReff) {
  return decodeStaffReff(staffReff) !== null;
}
