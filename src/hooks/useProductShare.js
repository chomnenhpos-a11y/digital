import { useState, useCallback } from "react";
import Swal from "sweetalert2";

export default function useProductShare() {
  const [isSharing, setIsSharing] = useState(false);

  const shareProducts = useCallback(async (products) => {
    if (!products?.length) return false;

    setIsSharing(true);

    try {
      const productsWithImages = products
        .map((product) => ({
          id: product.productId || product.id,
          name: product.name || "Product",
          imageUrl:
            product.imageUrl ||
            product.images?.[0] ||
            product.image,
        }))
        .filter((product) => product.imageUrl);

      if (!productsWithImages.length) {
        throw new Error("No product images found.");
      }

      const files = await Promise.all(
        productsWithImages.map(async (product, index) => {
          const response = await fetch(product.imageUrl);

          if (!response.ok) {
            throw new Error(
              `Failed to load image: ${response.status}`
            );
          }

          const blob = await response.blob();

          const extension =
            blob.type === "image/png"
              ? "png"
              : blob.type === "image/webp"
              ? "webp"
              : "jpg";

          return new File(
            [blob],
            `product-${product.id || index + 1}.${extension}`,
            {
              type: blob.type || "image/jpeg",
            }
          );
        })
      );

      console.log("Fetched files:", files);

      if (!navigator.share) {
        throw new Error(
          "Web Share API is not supported in this browser."
        );
      }

      if (!navigator.canShare?.({ files })) {
        throw new Error(
          "This browser does not support sharing image files."
        );
      }

      await navigator.share({
        files,
      });



      return true;
    } catch (error) {
      if (error?.name === "AbortError") {
        return false;
      }

      console.error("Share error:", error);

      Swal.fire({
        icon: "error",
        title: "Share failed",
        text: error.message,
      });

      return false;
    } finally {
      setIsSharing(false);
    }
  }, []);

  return {
    isSharing,
    shareProducts,
  };
}