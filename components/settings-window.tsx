"use client";

import { ReactNode } from "react";
import { ChevronLeft, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsTab = {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Items sharing a group number sit together, separated by a gap. */
  group: number;
};

export function SettingsWindow({
  tabs,
  active,
  onTabChange,
  onClose,
  onBack,
  paneKey,
  children,
}: {
  tabs: SettingsTab[];
  active: string;
  onTabChange: (key: string) => void;
  onClose: () => void;
  /** When set, the content pane is a sub-page and a back link shows. */
  onBack?: () => void;
  /** Identifies the visible pane; changing it remounts the scroller so a new
   *  pane starts at the top instead of inheriting the last one's offset. */
  paneKey: string;
  children: ReactNode;
}) {
  const groups = [...new Set(tabs.map((t) => t.group))].sort();

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="elevated-modal relative flex w-[760px] overflow-hidden rounded-[10px] bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* No title bar: the sidebar already says where you are, so close sits
            on the same surface rather than on a strip of its own. */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
        >
          <X className="h-[15px] w-[15px]" strokeWidth={2} />
        </button>

        <nav className="vibrancy flex h-[540px] w-[196px] shrink-0 flex-col gap-5 overflow-y-auto px-2.5 pt-11 pb-4">
          {groups.map((group) => (
            <div key={group} className="flex flex-col gap-0.5">
              {tabs
                .filter((t) => t.group === group)
                .map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-left text-[14px] font-medium transition-colors",
                      active === tab.key
                        ? "bg-fill-strong text-foreground"
                        : "text-foreground/80 hover:bg-fill-hover"
                    )}
                  >
                    <tab.icon
                      className="h-[17px] w-[17px] shrink-0"
                      strokeWidth={2}
                    />
                    {tab.label}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        <div
          key={paneKey}
          className="h-[540px] min-w-0 flex-1 overflow-y-auto bg-background px-9 pt-11 pb-8"
        >
          {onBack && (
            <button
              onClick={onBack}
              className="mb-5 -ml-1 flex items-center gap-0.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Back
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
