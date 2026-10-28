import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  extractStaffId,
  isWellFormedStaffReff,
  getStaffReferralId,
  getStaffReferralRaw,
  clearStaffReferral,
  isShopRoute,
  buildPreservedShopPath,
  REFERRAL_STORAGE_KEY,
  REFERRAL_RAW_KEY,
  REFERRAL_SHOP_KEY,
} from "./staffReferral.js";

describe("Staff Referral Utility", () => {
  describe("isWellFormedStaffReff (full {id}{staff_code} format)", () => {
    it("accepts a well-formed referral (numeric ID + staff code)", () => {
      assert.equal(isWellFormedStaffReff("93KimSan"), true);
      assert.equal(isWellFormedStaffReff("78Dara"), true);
    });

    it("rejects the bare numeric ID without the staff code", () => {
      assert.equal(isWellFormedStaffReff("93"), false);
      assert.equal(isWellFormedStaffReff("12"), false);
    });

    it("rejects missing, empty, and malformed values", () => {
      assert.equal(isWellFormedStaffReff(null), false);
      assert.equal(isWellFormedStaffReff(undefined), false);
      assert.equal(isWellFormedStaffReff(""), false);
      assert.equal(isWellFormedStaffReff("abcKimSan"), false);
      assert.equal(isWellFormedStaffReff("0KimSan"), false);
    });
  });

  describe("extractStaffId", () => {
    it("extracts ID from '93KimSan' -> 93", () => {
      assert.equal(extractStaffId("93KimSan"), 93);
    });

    it("extracts ID from '78Dara' -> 78", () => {
      assert.equal(extractStaffId("78Dara"), 78);
    });

    it("extracts ID from '12' -> 12", () => {
      assert.equal(extractStaffId("12"), 12);
    });

    it("returns null for missing parameter (null, undefined, '')", () => {
      assert.equal(extractStaffId(null), null);
      assert.equal(extractStaffId(undefined), null);
      assert.equal(extractStaffId(""), null);
    });

    it("returns null for 'abcKimSan' (non-numeric prefix)", () => {
      assert.equal(extractStaffId("abcKimSan"), null);
    });

    it("returns null for non-positive or malformed IDs", () => {
      assert.equal(extractStaffId("0KimSan"), null);
      assert.equal(extractStaffId("-5KimSan"), null);
      assert.equal(extractStaffId("   "), null);
    });

    it("handles whitespace around valid parameter", () => {
      assert.equal(extractStaffId("  93KimSan  "), 93);
    });
  });

  describe("isShopRoute identification", () => {
    it("identifies customer shop routes correctly", () => {
      assert.equal(isShopRoute("/KAM-844749"), true);
      assert.equal(isShopRoute("/KAM-844749/products/69"), true);
      assert.equal(isShopRoute("/my-store"), true);
      assert.equal(isShopRoute("/my-store/products/123"), true);
    });

    it("rejects non-shop routes (admin, auth, print, root)", () => {
      assert.equal(isShopRoute("/"), false);
      assert.equal(isShopRoute("/login"), false);
      assert.equal(isShopRoute("/signin"), false);
      assert.equal(isShopRoute("/register"), false);
      assert.equal(isShopRoute("/forgot-password"), false);
      assert.equal(isShopRoute("/admin"), false);
      assert.equal(isShopRoute("/admin/orders"), false);
      assert.equal(isShopRoute("/admin/products"), false);
      assert.equal(isShopRoute("/print/receipt/1"), false);
      assert.equal(isShopRoute("/print-receipt/ORD-123"), false);
      assert.equal(isShopRoute("/dashboard"), false);
    });
  });

  describe("buildPreservedShopPath", () => {
    let mockStorage;

    beforeEach(() => {
      mockStorage = {};
      globalThis.window = {
        location: {
          search: "",
        },
      };
      globalThis.sessionStorage = {
        getItem: (key) => (key in mockStorage ? mockStorage[key] : null),
        setItem: (key, val) => {
          mockStorage[key] = String(val);
        },
        removeItem: (key) => {
          delete mockStorage[key];
        },
      };
    });

    it("preserves referral search when navigating to product detail", () => {
      const currentSearch = "?staff_reff=93KimSan";
      const target = buildPreservedShopPath("/KAM-844749/products/69", currentSearch);
      assert.equal(target, "/KAM-844749/products/69?staff_reff=93KimSan");
    });

    it("preserves referral from storage when navigating back to shop home", () => {
      mockStorage[REFERRAL_RAW_KEY] = "93KimSan";
      mockStorage[REFERRAL_STORAGE_KEY] = "93";

      const target = buildPreservedShopPath("/KAM-844749", "");
      assert.equal(target, "/KAM-844749?staff_reff=93KimSan");
    });

    it("does not append referral if no referral was ever captured", () => {
      const target = buildPreservedShopPath("/KAM-844749", "");
      assert.equal(target, "/KAM-844749");
    });

    it("avoids duplicate query parameters", () => {
      const currentSearch = "?staff_reff=93KimSan";
      const target = buildPreservedShopPath("/KAM-844749?staff_reff=93KimSan", currentSearch);
      assert.equal(target, "/KAM-844749?staff_reff=93KimSan");
    });
  });

  describe("getStaffReferralId and getStaffReferralRaw with storage preservation", () => {
    let mockStorage;

    beforeEach(() => {
      mockStorage = {};

      globalThis.window = {
        location: {
          search: "",
        },
      };

      globalThis.sessionStorage = {
        getItem: (key) => (key in mockStorage ? mockStorage[key] : null),
        setItem: (key, val) => {
          mockStorage[key] = String(val);
        },
        removeItem: (key) => {
          delete mockStorage[key];
        },
      };
    });

    it("captures staff_reff from URL and preserves raw and numeric ID in sessionStorage", () => {
      globalThis.window.location.search = "?staff_reff=93KimSan";

      const saleBy = getStaffReferralId();
      const rawCode = getStaffReferralRaw();

      assert.equal(saleBy, 93);
      assert.equal(rawCode, "93KimSan");
      assert.equal(mockStorage[REFERRAL_STORAGE_KEY], "93");
      assert.equal(mockStorage[REFERRAL_RAW_KEY], "93KimSan");
    });

    it("preserves referral when URL has no parameters (e.g. navigation to product)", () => {
      // First visit with referral
      globalThis.window.location.search = "?staff_reff=93KimSan";
      getStaffReferralId();

      // Navigation to product detail (no search params)
      globalThis.window.location.search = "";
      const preservedSaleBy = getStaffReferralId();
      const preservedRaw = getStaffReferralRaw();

      assert.equal(preservedSaleBy, 93);
      assert.equal(preservedRaw, "93KimSan");
    });

    it("overwrites preserved referral when a new valid referral is opened", () => {
      // First staff
      globalThis.window.location.search = "?staff_reff=93KimSan";
      getStaffReferralId();

      // New staff link
      globalThis.window.location.search = "?staff_reff=78Dara";
      const newSaleBy = getStaffReferralId();
      assert.equal(newSaleBy, 78);
      assert.equal(mockStorage[REFERRAL_STORAGE_KEY], "78");
      assert.equal(mockStorage[REFERRAL_RAW_KEY], "78Dara");
    });

    it("clears preserved referral when an invalid staff_reff is encountered", () => {
      mockStorage[REFERRAL_STORAGE_KEY] = "93";
      mockStorage[REFERRAL_RAW_KEY] = "93KimSan";

      globalThis.window.location.search = "?staff_reff=abcKimSan";
      const saleBy = getStaffReferralId();
      assert.equal(saleBy, null);
      assert.equal(mockStorage[REFERRAL_STORAGE_KEY], undefined);
      assert.equal(mockStorage[REFERRAL_RAW_KEY], undefined);
    });

    it("returns null if neither URL nor storage has referral", () => {
      globalThis.window.location.search = "";
      const saleBy = getStaffReferralId();
      assert.equal(saleBy, null);
    });

    it("clearStaffReferral removes stored referral", () => {
      mockStorage[REFERRAL_STORAGE_KEY] = "93";
      mockStorage[REFERRAL_RAW_KEY] = "93KimSan";
      mockStorage[REFERRAL_SHOP_KEY] = "KAM-844749";
      clearStaffReferral();
      assert.equal(mockStorage[REFERRAL_STORAGE_KEY], undefined);
      assert.equal(mockStorage[REFERRAL_RAW_KEY], undefined);
      assert.equal(mockStorage[REFERRAL_SHOP_KEY], undefined);
    });
  });

  describe("shop-scoped referral attribution (security)", () => {
    let mockStorage;

    beforeEach(() => {
      mockStorage = {};

      globalThis.window = {
        location: {
          search: "",
        },
      };

      globalThis.sessionStorage = {
        getItem: (key) => (key in mockStorage ? mockStorage[key] : null),
        setItem: (key, val) => {
          mockStorage[key] = String(val);
        },
        removeItem: (key) => {
          delete mockStorage[key];
        },
      };
    });

    it("captures a URL referral together with the shop it belongs to", () => {
      globalThis.window.location.search = "?staff_reff=93KimSan";

      const saleBy = getStaffReferralId("KAM-844749");

      assert.equal(saleBy, 93);
      assert.equal(mockStorage[REFERRAL_SHOP_KEY], "KAM-844749");
      assert.equal(mockStorage[REFERRAL_RAW_KEY], "93KimSan");
    });

    it("KEEPS the attribution when the user clears staff_reff and keeps shopping on the same shop", () => {
      // First visit through the staff referral link
      globalThis.window.location.search = "?staff_reff=93KimSan";
      getStaffReferralId("KAM-844749");

      // The user removes staff_reff from the URL and keeps shopping
      globalThis.window.location.search = "";

      // The referral is still preserved for this shop
      assert.equal(getStaffReferralId("KAM-844749"), 93);
      assert.equal(getStaffReferralRaw("KAM-844749"), "93KimSan");
    });

    it("NEVER applies a referral captured on another shop", () => {
      // Referral was originally captured on shop A
      globalThis.window.location.search = "?staff_reff=93KimSan";
      getStaffReferralId("KAM-844749");

      // Now the customer opens a different shop (shop B) without a referral
      globalThis.window.location.search = "";

      assert.equal(getStaffReferralId("OTHER-123456"), null);
      assert.equal(getStaffReferralRaw("OTHER-123456"), null);
    });

    it("does not capture the bare numeric ID without the staff code", () => {
      globalThis.window.location.search = "?staff_reff=93";

      const saleBy = getStaffReferralId("KAM-844749");

      assert.equal(saleBy, null);
      assert.equal(mockStorage[REFERRAL_STORAGE_KEY], undefined);
      assert.equal(mockStorage[REFERRAL_RAW_KEY], undefined);
    });

    it("replaces the stored referral when the URL carries a new well-formed one", () => {
      globalThis.window.location.search = "?staff_reff=93KimSan";
      getStaffReferralId("KAM-844749");

      // Capturing an exact-name-variant code is prevented by the route guard
      // (validated against backend staff records); storage-level capture only
      // accepts well-formed {id}{staff_code} values.
      globalThis.window.location.search = "?staff_reff=78Dara";
      assert.equal(getStaffReferralId("KAM-844749"), 78);
      assert.equal(mockStorage[REFERRAL_RAW_KEY], "78Dara");
    });

    it("clears legacy unscoped storage instead of trusting it for a shop", () => {
      mockStorage[REFERRAL_STORAGE_KEY] = "93";
      mockStorage[REFERRAL_RAW_KEY] = "93KimSan";
      // no REFERRAL_SHOP_KEY record (legacy entry)

      globalThis.window.location.search = "";
      assert.equal(getStaffReferralId("KAM-844749"), null);
      assert.equal(mockStorage[REFERRAL_STORAGE_KEY], undefined);
    });

    it("does not re-append a bare-numeric stored referral when building paths", () => {
      mockStorage[REFERRAL_RAW_KEY] = "93";
      mockStorage[REFERRAL_STORAGE_KEY] = "93";

      const target = buildPreservedShopPath("/KAM-844749", "");
      assert.equal(target, "/KAM-844749");
    });

    it("does not leak a referral of shop A into a link of shop B", () => {
      globalThis.window.location.search = "?staff_reff=93KimSan";
      getStaffReferralId("KAM-844749");

      globalThis.window.location.search = "";

      // Navigating towards a link of ANOTHER shop: no referral is appended
      const target = buildPreservedShopPath("/OTHER-123456/products/1", "");
      assert.equal(target, "/OTHER-123456/products/1");
    });
  });
});
