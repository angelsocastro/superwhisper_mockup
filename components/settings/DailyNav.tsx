"use client";

import {
  Sparkles,
  PanelLeft,
  Settings as SettingsIcon,
} from "lucide-react";
import { TrafficLights } from "@/components/mac-window";
import { cn } from "@/lib/utils";
import { DAILY_USE, ACCOUNT_FIXTURES } from "@/app/settings/data";
import type { DailyKey, WhatsNewItem } from "@/app/settings/types";
import { HoverTip, formatDaysAgo } from "@/components/settings/shared";

/**
 * Mockup-only chrome that sits outside the app window: swaps the signed-in
 * account so all three sign-in shapes can be reviewed. Not part of the design.
 */
export function AccountFixtureSwitcher({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/70 px-2 py-1.5 backdrop-blur-md">
      <span className="pl-1.5 text-[11px] font-medium tracking-wide text-white/40 uppercase">
        Signed in as
      </span>
      {ACCOUNT_FIXTURES.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors",
            value === f.key
              ? "bg-white text-black"
              : "text-white/60 hover:bg-white/10 hover:text-white",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function WhatsNewStack({
  items,
  onOpen,
}: {
  items: WhatsNewItem[];
  onOpen: (item: WhatsNewItem) => void;
}) {
  if (items.length === 0) return null;
  const visible = items.slice(0, 3);
  const OFFSET = 7;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 px-1.5 text-[12px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
        <Sparkles className="h-3 w-3" strokeWidth={2} />
        What&rsquo;s new
      </span>
      <div
        className="relative"
        style={{ height: `${48 + (visible.length - 1) * OFFSET}px` }}
      >
        {visible.map((item, i) => (
          <button
            key={item.id}
            onClick={() => i === 0 && onOpen(item)}
            aria-hidden={i !== 0}
            tabIndex={i === 0 ? 0 : -1}
            className={cn(
              "hairline absolute flex flex-col gap-0.5 rounded-[8px] bg-raised px-2.5 py-2 text-left shadow-[0_8px_18px_-6px_rgb(0_0_0/0.55)] transition-all duration-300 ease-out",
              i === 0 ? "hover:bg-raised-hover" : "pointer-events-none",
            )}
            style={{
              top: `${i * OFFSET}px`,
              left: `${i * 5}px`,
              right: `${i * 5}px`,
              zIndex: visible.length - i,
              opacity: 1 - i * 0.3,
              transform: `scale(${1 - i * 0.035})`,
            }}
          >
            <span className="text-[11px] font-medium text-muted-foreground">
              {formatDaysAgo(item.daysAgo)}
            </span>
            <span className="text-[13px] leading-snug font-medium text-foreground/90">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function DailyNav({
  active,
  onSelect,
  onOpenSettings,
  onOpenAccount,
  whatsNew,
  onOpenWhatsNew,
  collapsed,
  onToggleCollapsed,
}: {
  active: DailyKey;
  onSelect: (key: DailyKey) => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  whatsNew: WhatsNewItem[];
  onOpenWhatsNew: (item: WhatsNewItem) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const collapseButton = (
    <button
      onClick={onToggleCollapsed}
      aria-label="Toggle sidebar"
      className="group relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
    >
      <PanelLeft className="h-[16px] w-[16px]" strokeWidth={2} />
      {collapsed && <HoverTip label="Show sidebar" />}
    </button>
  );

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col pb-1 transition-[width] duration-200 ease-out",
        collapsed ? "w-[68px] items-center px-2" : "w-[230px] px-2",
      )}
    >
      {/* The traffic lights are pinned to the window's top-left by macOS, so
          this column has to absorb them — which is what frees the content
          pane to run flush to the top on the right. */}
      <div
        className={cn(
          "flex h-11 shrink-0 items-center",
          collapsed ? "w-full justify-center" : "w-full gap-3 px-1.5",
        )}
      >
        <TrafficLights />
        {!collapsed && collapseButton}
      </div>

      {collapsed && <div className="mb-1">{collapseButton}</div>}

      <div className="flex w-full flex-col gap-1">
        {DAILY_USE.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={cn(
              "group relative flex items-center rounded-[7px] py-1.5 text-left text-[14px] font-medium transition-colors",
              collapsed ? "justify-center px-0" : "gap-2.5 px-2",
              active === item.key
                ? "bg-fill-strong text-foreground"
                : "text-foreground/80 hover:bg-fill-hover",
            )}
          >
            <item.icon className="h-[17px] w-[17px] shrink-0" strokeWidth={2} />
            {collapsed ? <HoverTip label={item.label} /> : item.label}
          </button>
        ))}
      </div>

      <div className="mt-auto flex w-full flex-col gap-4">
        {!collapsed && (
          <WhatsNewStack items={whatsNew} onOpen={onOpenWhatsNew} />
        )}

        <div
          className={cn(
            "flex items-center border-t border-line pt-4",
            collapsed ? "flex-col gap-2" : "gap-2",
          )}
        >
          <button
            onClick={onOpenAccount}
            aria-label={collapsed ? "Account" : undefined}
            className={cn(
              "group relative flex items-center rounded-[6px] py-1 text-left transition-colors hover:bg-fill-hover",
              collapsed ? "justify-center px-1" : "min-w-0 flex-1 gap-2 px-1",
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fill-hover text-[12px] font-semibold">
              A
            </div>
            {collapsed ? (
              <HoverTip label="Superwhisper PRO" />
            ) : (
              <span className="truncate text-[13px] font-medium text-foreground/80">
                Superwhisper <span className="text-muted-foreground">PRO</span>
              </span>
            )}
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="group relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <SettingsIcon className="h-[15px] w-[15px]" strokeWidth={2} />
            {collapsed && <HoverTip label="Settings" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
