"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModeItem, MicDevice } from "@/app/settings/types";

/**
 * Auto and "no mode" only coincide when you're in an app nothing is mapped
 * to — which is most of the time, and why they read as the same thing. Auto
 * carries what it currently resolves to so the difference is visible.
 */
export function ModePopover({
  modes,
  override,
  autoMode,
  onPick,
  onOpenSettings,
  onClose,
}: {
  modes: ModeItem[];
  override: string | null;
  autoMode?: ModeItem;
  onPick: (value: string | null) => void;
  onOpenSettings: () => void;
  onClose: () => void;
}) {
  const row = (
    label: string,
    checked: boolean,
    onClick: () => void,
    trailing?: string,
    disabled?: boolean
  ) => (
    <button
      key={label}
      disabled={disabled}
      onClick={() => {
        onClick();
        onClose();
      }}
      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-fill-hover disabled:pointer-events-none disabled:opacity-40"
    >
      <Check
        className={cn(
          "h-3.5 w-3.5 shrink-0 text-foreground",
          !checked && "opacity-0"
        )}
        strokeWidth={2.5}
      />
      <span className="flex-1 truncate text-[14px] text-foreground">
        {label}
      </span>
      {trailing && (
        <span className="shrink-0 text-[12px] text-muted-foreground">
          {trailing}
        </span>
      )}
    </button>
  );

  return (
    <>
      <div className="absolute inset-0 z-50 bg-black/25" onClick={onClose} />
      <div className="elevated-popover absolute right-3 bottom-10 z-50 w-[276px] overflow-hidden rounded-[10px] bg-popover/85 py-1 backdrop-blur-xl backdrop-saturate-150">
        {row(
          "Auto",
          override === null,
          () => onPick(null),
          autoMode ? autoMode.name : "Super"
        )}

        <div className="my-1 h-px bg-line" />

        {/* Super is one more row here too — same list as the custom modes,
            just first, the way it's pinned first in the Modes settings list. */}
        {row("Super", override === "super", () => onPick("super"), "Base")}
        {modes.map((mode) =>
          row(
            mode.name,
            override === mode.id,
            () => onPick(mode.id),
            mode.enabled ? undefined : "Off",
            !mode.enabled
          )
        )}

        <div className="my-1 h-px bg-line" />

        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="flex w-full items-center px-2.5 py-1.5 text-left transition-colors hover:bg-fill-hover"
        >
          <span className="pl-[22px] text-[14px] text-foreground">
            Mode settings…
          </span>
        </button>
      </div>
    </>
  );
}

/**
 * Quick switcher for the device to record with right now. The ranked list in
 * Sound decides what gets picked automatically; this is the "not that one,
 * this one" case, so it stays a menu rather than a settings trip.
 */
export function MicPopover({
  mics,
  activeId,
  onPick,
  onOpenSettings,
  onClose,
}: {
  mics: MicDevice[];
  activeId?: string;
  onPick: (id: string) => void;
  onOpenSettings: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="absolute inset-0 z-50 bg-black/25" onClick={onClose} />
      <div className="elevated-popover absolute right-3 bottom-10 z-50 w-[248px] overflow-hidden rounded-[10px] bg-popover/85 py-1 backdrop-blur-xl backdrop-saturate-150">
        {mics.map((mic) => (
          <button
            key={mic.id}
            disabled={!mic.connected}
            onClick={() => {
              onPick(mic.id);
              onClose();
            }}
            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-fill-hover disabled:pointer-events-none disabled:opacity-40"
          >
            <Check
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-foreground",
                mic.id !== activeId && "opacity-0"
              )}
              strokeWidth={2.5}
            />
            <span className="flex-1 truncate text-[14px] text-foreground">
              {mic.name}
            </span>
            {!mic.connected && (
              <span className="shrink-0 text-[12px] text-muted-foreground">
                Not connected
              </span>
            )}
          </button>
        ))}

        <div className="my-1 h-px bg-line" />

        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="flex w-full items-center px-2.5 py-1.5 text-left transition-colors hover:bg-fill-hover"
        >
          <span className="pl-[22px] text-[14px] text-foreground">
            Microphone settings…
          </span>
        </button>
      </div>
    </>
  );
}
