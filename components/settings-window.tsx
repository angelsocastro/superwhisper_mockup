"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsWindow({
  title = "Settings",
  tabs,
  active,
  onTabChange,
  onClose,
  children,
}: {
  title?: string;
  tabs: { key: string; label: string; icon: LucideIcon }[];
  active: string;
  onTabChange: (key: string) => void;
  onClose: () => void;
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

        <div className="hairline-b flex items-center justify-center gap-1.5 bg-[oklch(0.19_0_0)] px-5 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex w-[68px] flex-col items-center gap-1 rounded-[7px] py-1.5 text-[11px] font-medium transition-colors",
                active === tab.key
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground/80"
              )}
            >
              <tab.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="h-[460px] overflow-y-auto px-10 py-9">
          {children}
        </div>
      </div>
    </div>
  );
}
