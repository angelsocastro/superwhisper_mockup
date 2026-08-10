"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

export function DetailModal({
  title,
  onClose,
  children,
  width = "420px",
}: {
  title: string;
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
        className="hairline flex flex-col overflow-hidden rounded-[10px] bg-card shadow-[0_50px_100px_-20px_rgb(0_0_0/0.8)]"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hairline-b relative flex h-11 shrink-0 items-center justify-center bg-titlebar px-4">
          <span className="text-[13px] font-medium text-foreground/70">
            {title}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <X className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
