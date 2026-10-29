/**
 * staff_reff token helpers (see `setting.md`).
 *
 * A staff referral is shared as a Base64 token that encodes `staff_{staff_id}`:
 *
 *   staff id 93 -> "staff_93" -> "c3RhZmZfOTM"
 *
 * QR codes and storefront links always carry this token in the URL:
 *
 *   /{shop_code}?staff_reff=c3RhZmZfOTM
 *
 * The backend decodes the token and answers through the settings response
 * (`data.sharedBy`) with the shared staff record, which the client uses to
 * fill the order's sell-by (saleBy) field. The client only forwards the raw
 * token to the API — it never derives attribution from the token itself.
 */

const STAFF_TOKEN_PREFIX = "staff_";
const STAFF_TOKEN_PATTERN = /^staff_(\d+)$/;

/**
 * Base64-decodes a value with padding/url-safe tolerance.
 * Returns null for anything that is not decodable.
 */
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

/**
 * Builds the Base64 staff_reff token for a staff ID.
 *
 * Examples:
 * - 93 -> "c3RhZmZfOTM"
 * - 0 / null / "abc" -> ""
 *
 * @param {number|string} staffId
 * @returns {string} Token or empty string when the staff ID is invalid
 */
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

/**
 * Decodes a staff_reff token into its positive integer staff ID.
 *
 * Examples:
 * - "c3RhZmZfOTM" -> 93
 * - "93KimSan" (legacy format) -> null
 * - "" / null / non-string -> null
 *
 * @param {string|null|undefined} staffReff
 * @returns {number|null}
 */
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

/**
 * Checks whether a value is a well-formed staff_reff token.
 *
 * @param {string|null|undefined} staffReff
 * @returns {boolean}
 */
export function isStaffReffToken(staffReff) {
  return decodeStaffReff(staffReff) !== null;
}
