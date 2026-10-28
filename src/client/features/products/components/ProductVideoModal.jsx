import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Maximize2, Minimize2, GripVertical, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProductVideoModal({ video, onClose }) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Compute responsive default dimensions
  const getInitialDimensions = () => {
    if (typeof window === "undefined") {
      return { x: 20, y: 20, width: 720, height: 480 };
    }
    const width = Math.min(760, Math.max(320, window.innerWidth - 32));
    // 16:9 video frame plus 44px header and 36px footer
    const height = Math.min(
      Math.round(((width - 2) * 9) / 16) + 80,
      window.innerHeight - 40
    );
    const x = Math.max(12, Math.round((window.innerWidth - width) / 2));
    const y = Math.max(16, Math.round((window.innerHeight - height) / 2));
    return { x, y, width, height };
  };

  const [position, setPosition] = useState(() => {
    const { x, y } = getInitialDimensions();
    return { x, y };
  });

  const [size, setSize] = useState(() => {
    const { width, height } = getInitialDimensions();
    return { width, height };
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const isInteracting = isDragging || isResizing;

  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, initialWidth: 0, initialHeight: 0 });
  const modalContainerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, onClose]);

  // Adjust bounds when window is resized
  useEffect(() => {
    const handleWindowResize = () => {
      if (isFullscreen) return;

      setSize((prev) => {
        const maxWidth = Math.max(320, window.innerWidth - 20);
        const maxHeight = Math.max(220, window.innerHeight - 20);
        return {
          width: Math.min(prev.width, maxWidth),
          height: Math.min(prev.height, maxHeight),
        };
      });

      setPosition((prev) => {
        const maxX = Math.max(10, window.innerWidth - size.width - 10);
        const maxY = Math.max(10, window.innerHeight - size.height - 10);
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY),
        };
      });
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [isFullscreen, size.width, size.height]);

  // --- Smooth Dragging Handlers ---
  const handleDragStart = (e) => {
    if (e.button !== 0 || isFullscreen) return;
    if (e.target.closest("button") || e.target.closest("a")) return;

    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    const maxX = Math.max(10, window.innerWidth - size.width - 10);
    const maxY = Math.max(10, window.innerHeight - size.height - 10);

    setPosition({
      x: Math.max(10, Math.min(maxX, dragRef.current.initialX + deltaX)),
      y: Math.max(10, Math.min(maxY, dragRef.current.initialY + deltaY)),
    });
  };

  const handleDragEnd = (e) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // safe fallback
      }
    }
  };

  // --- Smooth Resizing Handlers ---
  const handleResizeStart = (e) => {
    if (e.button !== 0 || isFullscreen) return;
    e.stopPropagation();

    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: size.width,
      initialHeight: size.height,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;
    const deltaX = e.clientX - resizeRef.current.startX;
    const deltaY = e.clientY - resizeRef.current.startY;

    const minWidth = Math.min(320, window.innerWidth - 20);
    const maxWidth = Math.max(minWidth, window.innerWidth - position.x - 10);
    const minHeight = Math.min(200, window.innerHeight - 20);
    const maxHeight = Math.max(minHeight, window.innerHeight - position.y - 10);

    setSize({
      width: Math.max(minWidth, Math.min(maxWidth, resizeRef.current.initialWidth + deltaX)),
      height: Math.max(minHeight, Math.min(maxHeight, resizeRef.current.initialHeight + deltaY)),
    });
  };

  const handleResizeEnd = (e) => {
    if (isResizing) {
      setIsResizing(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // safe fallback
      }
    }
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => onClose()}
    >
      <div
        ref={modalContainerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Product video"
        style={
          isFullscreen
            ? {
                position: "fixed",
                left: 0,
                top: 0,
                width: "100vw",
                height: "100vh",
                transform: "none",
                willChange: "auto",
                transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)",
              }
            : {
                position: "fixed",
                left: 0,
                top: 0,
                width: `${size.width}px`,
                height: `${size.height}px`,
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                willChange: isInteracting ? "transform, width, height" : "auto",
                transition: isInteracting ? "none" : "box-shadow 200ms ease",
              }
        }
        className={`flex flex-col bg-slate-900 border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] select-none ${
          isFullscreen
            ? "rounded-none m-0 border-0"
            : "rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ring-white/10"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* --- Header Bar (Drag Handle) --- */}
        <div
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          onDoubleClick={() => setIsFullscreen((prev) => !prev)}
          className={`flex items-center justify-between border-b border-white/10 bg-slate-900/95 px-3.5 py-2.5 sm:px-4 shrink-0 ${
            isFullscreen ? "cursor-default" : "cursor-grab active:cursor-grabbing"
          }`}
          title={isFullscreen ? undefined : "Click and drag to move • Double-click to toggle fullscreen"}
        >
          {/* Left: Platform badge & title */}
          <div className="flex items-center gap-2 min-w-0 pointer-events-none">
            {!isFullscreen && (
              <GripVertical size={16} className="text-white/30 shrink-0 hidden sm:block" />
            )}
            {video.platform && (
              <span
                className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg shadow-xs"
                style={{
                  color: video.platform.color,
                  backgroundColor: `${video.platform.color}20`,
                }}
              >
                <video.platform.icon size={15} />
              </span>
            )}
            <h3 className="truncate text-xs sm:text-sm font-semibold text-white">
              {video.platform
                ? t(video.platform.labelKey)
                : t("product.mediaGuidesTitle")}
            </h3>
          </div>

          {/* Right: Actions (Open Link, Fullscreen, Close) */}
          <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
            {/* Open in platform link */}
            <a
              href={video.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20 active:scale-95"
              title={t("products.openMediaLink")}
            >
              <ExternalLink size={12} />
              <span className="hidden sm:inline">{t("products.openMediaLink")}</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              aria-label={isFullscreen ? "Restore window" : "Maximize fullscreen"}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white active:scale-95"
              title={isFullscreen ? "Restore window" : "Maximize fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => onClose()}
              aria-label="Close video"
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-300 transition-colors hover:bg-red-500 hover:text-white active:scale-95"
              title="Close (Esc)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* --- Video Frame Container --- */}
        <div className="relative flex-1 w-full bg-black overflow-hidden flex items-center justify-center min-h-[160px]">
          <iframe
            key={video.url}
            src={video.url}
            title="Product video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />

          {/* Iframe Shield: ensures mouse movements are never lost to the iframe during drag/resize */}
          {isInteracting && (
            <div className="absolute inset-0 z-30 bg-transparent cursor-grab active:cursor-grabbing" />
          )}
        </div>

        {/* --- Footer & Resize Grip --- */}
        <div className="relative flex items-center justify-between border-t border-white/10 bg-slate-950/80 px-3.5 py-1.5 sm:px-4 text-[11px] text-slate-400 shrink-0">
          <span className="truncate pr-4">
            {t("product.mediaGuideDetails")}
          </span>

          <div className="flex items-center gap-3">
            <a
              href={video.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 font-medium text-[#eab308] underline-offset-4 hover:underline"
            >
              <span>{t("products.openMediaLink")}</span>
              <ExternalLink size={11} />
            </a>

            {/* Smooth Corner Resize Handle */}
            {!isFullscreen && (
              <div
                onPointerDown={handleResizeStart}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeEnd}
                onPointerCancel={handleResizeEnd}
                className="relative -mr-1.5 -mb-0.5 flex h-6 w-6 cursor-se-resize items-end justify-end p-1 text-slate-500 transition-colors hover:text-white active:text-[#eab308]"
                title="Drag corner to resize"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className="fill-none stroke-current"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <line x1="8.5" y1="2" x2="2" y2="8.5" />
                  <line x1="8.5" y1="5.5" x2="5.5" y2="8.5" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
