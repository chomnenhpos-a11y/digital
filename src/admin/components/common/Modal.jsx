import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  const [mounted, setMounted] = useState(isOpen);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer;

    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = "hidden";

      timer = setTimeout(() => {
        setActive(true);
      }, 30);
    } else {
      setActive(false);

      timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = "unset";
      }, 500);
    }

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className={`
        fixed inset-0 z-[9999]
        flex items-center justify-center
        p-4 overflow-y-auto
        bg-slate-900/60 backdrop-blur-md
        transition-all duration-500 ease-out
        ${active ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-white
          rounded-2xl
          shadow-2xl
          w-full
          max-w-2xl
          max-h-[88vh]
          overflow-hidden
          flex flex-col
          transition-all
          duration-500
          [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]
          ${
            active
              ? "opacity-100 translate-y-0 scale-100 blur-0"
              : "opacity-0 -translate-y-24 scale-95 blur-[2px]"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <h3 className="font-bold text-slate-800 text-lg">
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="
              text-slate-400
              hover:text-slate-700
              hover:bg-slate-100
              transition-all
              duration-200
              p-2
              rounded-xl
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}