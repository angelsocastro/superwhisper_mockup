"use client";

import { RotateCcw, X } from "lucide-react";
import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import { Kbd } from "@/components/settings/shared";

function ShortcutRow({
  label,
  description,
  combo,
  clearable = false,
  last = false,
}: {
  label: string;
  description: string;
  combo?: string;
  clearable?: boolean;
  last?: boolean;
}) {
  return (
    <SettingsRow
      label={label}
      description={description}
      last={last}
      control={
        <div className="flex items-center gap-2">
          <button
            aria-label={`Reset ${label}`}
            title="Reset to default"
            className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-fill-hover hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2} />
          </button>
          {combo ? (
            <div className="flex items-center gap-1.5">
              {clearable && (
                <button
                  aria-label={`Clear ${label}`}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-fill-hover hover:text-foreground"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              )}
              <Kbd>{combo}</Kbd>
            </div>
          ) : (
            <span className="text-[13px] text-muted-foreground/60">
              Record shortcut
            </span>
          )}
        </div>
      }
    />
  );
}

/** One flat list: the rows are homogeneous, so headings over them would only
 *  add chrome — two of the old groups held a single shortcut each. */
export function ShortcutsPanel() {
  return (
    <SettingsSection
      title="Shortcuts"
      description="Global shortcuts that work anywhere on your Mac."
    >
      <ShortcutRow
        label="Toggle Recording"
        description="Starts and stops recordings"
        combo="⌥ Space"
      />
      <ShortcutRow
        label="Cancel Recording"
        description="Discards the active recording"
        combo="esc"
      />
      <ShortcutRow
        label="Push to talk"
        description="Hold to record, release when done"
        combo="Fn"
        clearable
      />
      <ShortcutRow
        label="Mouse shortcut"
        description="Tap to toggle, or hold and release when done"
      />
      <ShortcutRow
        label="Change mode"
        description="Activates the mode switcher"
        combo="⌥ ⇧ K"
        last
      />
    </SettingsSection>
  );
}
