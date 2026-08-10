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
  title = "Settings",
  tabs,
  active,
  onTabChange,
  onClose,
  onBack,
  children,
}: {
  title?: string;
  tabs: SettingsTab[];
  active: string;
  onTabChange: (key: string) => void;
  onClose: () => void;
  /** When set, the content pane is a sub-page and a back chevron shows. */
  onBack?: () => void;
  children: ReactNode;
}) {
  const groups = [...new Set(tabs.map((t) => t.group))].sort();

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="hairline flex w-[760px] flex-col overflow-hidden rounded-[10px] bg-card shadow-[0_50px_100px_-20px_rgb(0_0_0/0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hairline-b relative flex h-11 shrink-0 items-center justify-center bg-titlebar px-4">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              className="absolute left-3 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
            >
              <ChevronLeft className="h-[17px] w-[17px]" strokeWidth={2} />
            </button>
          )}
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

        <div className="flex h-[500px]">
          <nav className="vibrancy flex w-[196px] shrink-0 flex-col gap-5 overflow-y-auto px-2.5 py-4">
            {groups.map((group) => (
              <div key={group} className="flex flex-col gap-0.5">
                {tabs
                  .filter((t) => t.group === group)
                  .map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => onTabChange(tab.key)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-left text-[13px] font-medium transition-colors",
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

          <div className="min-w-0 flex-1 overflow-y-auto bg-background px-9 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
