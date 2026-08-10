"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

export function DetailModal({
  onClose,
  children,
  width = "420px",
}: {
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="elevated-modal relative flex flex-col overflow-hidden rounded-[10px] bg-card"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close sits on the content surface — no separate title strip. */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
        >
          <X className="h-[15px] w-[15px]" strokeWidth={2} />
        </button>

        <div className="max-h-[420px] overflow-y-auto px-8 pt-10 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
