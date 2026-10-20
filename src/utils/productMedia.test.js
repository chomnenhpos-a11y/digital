import assert from "node:assert/strict";
import { test } from "node:test";
import { productSchema } from "../admin/features/Products/schemas/productSchema.js";
import { getProductMediaUrl, normalizeProductMedia } from "./productMedia.js";

const product = {
  name: "Test product", categoryId: "1", stockQuantity: 5,
  price: 10, discountPrice: 0, salePrice: 10, description: "Product description",
};
const links = [
  { icon: "facebook", url: "https://www.facebook.com/watch/?v=123" },
  { icon: "youtube", url: "https://www.youtube.com/watch?v=456" },
];

test("keeps media icon/URL objects intact when loading a product", () => {
  const source = structuredClone(links);
  assert.deepEqual(normalizeProductMedia(source), links);
  assert.deepEqual(source, links);
  assert.deepEqual(normalizeProductMedia(JSON.stringify(source)), links);
});

test("handles products with missing or malformed media", () => {
  for (const value of [undefined, null, "", "not json", "{}", {}, 1]) {
    assert.deepEqual(normalizeProductMedia(value), []);
  }
  assert.deepEqual(normalizeProductMedia([null, "image.jpg", [], links[0]]), [links[0]]);
});

test("accepts optional media and an explicitly cleared media array", () => {
  assert.equal(productSchema.safeParse(product).success, true);
  assert.deepEqual(productSchema.parse({ ...product, media: [] }).media, []);
});

test("preserves multiple media entries through validation and JSON serialization", () => {
  const result = productSchema.parse({ ...product, media: links });
  const payload = new FormData();
  payload.append("media", JSON.stringify(result.media));
  assert.deepEqual(JSON.parse(payload.get("media")), links);
});

test("requires an icon and a URL for an added link", () => {
  const result = productSchema.safeParse({ ...product, media: [{ icon: "", url: "" }] });
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((issue) => issue.path.join(".") === "media.0.icon"));
  assert.ok(result.error.issues.some((issue) => issue.path.join(".") === "media.0.url"));
});

test("rejects unsafe protocols and incomplete URLs without enabling an open link", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,test", "ftp://example.com/video", "/watch/123", "facebook.com/watch"]) {
    assert.equal(getProductMediaUrl(url), "");
    assert.equal(productSchema.safeParse({ ...product, media: [{ icon: "website", url }] }).success, false);
  }
});

test("trims pasted values while preserving full post query strings", () => {
  const media = [{ icon: " facebook ", url: ` ${links[0].url}&ref=product ` }];
  const result = productSchema.parse({ ...product, media });
  assert.deepEqual(result.media, [{ icon: "facebook", url: `${links[0].url}&ref=product` }]);
});
