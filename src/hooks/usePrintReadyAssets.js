import { useState, useEffect } from "react";

/**
 * Hook to verify all assets (data, fonts, images) are fully loaded and decoded
 * before enabling the print action.
 *
 * @param {React.RefObject} containerRef - Reference to the DOM node containing print elements
 * @param {boolean} isDataReady - Flag indicating primary data (order, product, settings) is ready
 * @returns {{ isReady: boolean, statusMessage: string, isFontsReady: boolean, isImagesReady: boolean }}
 */
export function usePrintReadyAssets(containerRef, isDataReady = false) {
  const [isReady, setIsReady] = useState(false);
  const [isFontsReady, setIsFontsReady] = useState(false);
  const [isImagesReady, setIsImagesReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Loading data...");

  useEffect(() => {
    let isMounted = true;

    if (!isDataReady) {
      setIsReady(false);
      setIsFontsReady(false);
      setIsImagesReady(false);
      setStatusMessage("Loading data...");
      return;
    }

    setIsReady(false);
    setStatusMessage("Preparing print assets...");

    let timeoutId;

    const prepareAssets = async () => {
      try {
        // 1. Wait for web fonts to load
        if (document.fonts && typeof document.fonts.ready?.then === "function") {
          try {
            await document.fonts.ready;
            if (isMounted) setIsFontsReady(true);
          } catch (fontErr) {
            console.warn("Font loading check encountered an issue:", fontErr);
            if (isMounted) setIsFontsReady(true);
          }
        } else {
          if (isMounted) setIsFontsReady(true);
        }

        // 2. Wait for images inside the print container
        const element = containerRef?.current;
        if (element) {
          const images = Array.from(element.querySelectorAll("img"));

          if (images.length > 0) {
            await Promise.all(
              images.map((img) => {
                // If already complete, decode it if available
                if (img.complete) {
                  return typeof img.decode === "function"
                    ? img.decode().catch(() => {})
                    : Promise.resolve();
                }

                // Otherwise, wait for load or error event with a fallback timeout
                return new Promise((resolve) => {
                  let timer;
                  const cleanup = () => {
                    img.removeEventListener("load", onImgLoad);
                    img.removeEventListener("error", onImgError);
                    clearTimeout(timer);
                  };

                  const onImgLoad = () => {
                    cleanup();
                    if (typeof img.decode === "function") {
                      img.decode().catch(() => {}).then(resolve);
                    } else {
                      resolve();
                    }
                  };

                  const onImgError = () => {
                    cleanup();
                    resolve(); // Resolve on error so a missing image does not block printing indefinitely
                  };

                  img.addEventListener("load", onImgLoad, { once: true });
                  img.addEventListener("error", onImgError, { once: true });

                  // 3 second safety timeout per image
                  timer = setTimeout(() => {
                    cleanup();
                    resolve();
                  }, 3000);
                });
              })
            );
          }
        }

        if (isMounted) {
          setIsImagesReady(true);
          setIsReady(true);
          setStatusMessage("Ready to print");
        }
      } catch (err) {
        console.warn("Print assets preparation warning:", err);
        if (isMounted) {
          setIsReady(true);
          setStatusMessage("Ready to print");
        }
      }
    };

    // Small delay to ensure React has rendered the DOM elements into containerRef
    timeoutId = setTimeout(() => {
      prepareAssets();
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [containerRef, isDataReady]);

  return { isReady, statusMessage, isFontsReady, isImagesReady };
}
