"use client";

import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * macOS "popup button" — the small pill with a chevron-up-down glyph used
 * throughout System Settings for closed option sets. Purely presentational
 * here (the mockup doesn't need a real menu), but it reads as native.
 */
export function PopupButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "hairline flex items-center gap-2 rounded-[6px] bg-white/[0.07] py-1 pr-1.5 pl-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-white/[0.11]",
        className
      )}
    >
      {value}
      <ChevronsUpDown
        className="h-3 w-3 shrink-0 text-muted-foreground"
        strokeWidth={2}
      />
    </button>
  );
}
