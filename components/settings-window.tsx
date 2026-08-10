"use client";

import { ReactNode } from "react";
import { ChevronLeft, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppIcon, type IconTone } from "@/components/app-icon";
import { cn } from "@/lib/utils";

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
  tabs: { key: string; label: string; icon: LucideIcon; tone: IconTone }[];
  active: string;
  onTabChange: (key: string) => void;
  onClose: () => void;
  /** When set, the pane is a sub-page: tabs are hidden and a back chevron shows. */
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="hairline flex w-[600px] flex-col overflow-hidden rounded-[10px] bg-card shadow-[0_50px_100px_-20px_rgb(0_0_0/0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hairline-b relative flex h-11 shrink-0 items-center justify-center bg-[oklch(0.22_0_0)] px-4">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              className="absolute left-3 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
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
            className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
          >
            <X className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>

        {!onBack && (
          <div className="hairline-b flex items-center justify-center gap-1.5 bg-[oklch(0.19_0_0)] px-5 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "flex w-[68px] flex-col items-center gap-1.5 rounded-[7px] py-1.5 text-[11px] font-medium transition-colors",
                  active === tab.key
                    ? "bg-white/[0.11] text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground/80"
                )}
              >
                <AppIcon icon={tab.icon} tone={tab.tone} size={24} />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div
          className={cn(
            "overflow-y-auto px-10 py-9",
            onBack ? "h-[527px]" : "h-[460px]"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
