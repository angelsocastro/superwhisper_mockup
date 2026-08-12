"use client";

import { SettingsSection, SettingsRow } from "@/components/settings-parts";
import { Switch } from "@/components/ui/switch";
import { PopupButton } from "@/components/popup-button";
import { PanelIntro, GhostButton, InfoDot } from "@/components/settings/shared";

/**
 * Save audio / Save to history / Copy result to clipboard used to live
 * here too, duplicating rows Super and every mode already own. Trimmed to
 * the settings that are genuinely app-level — nothing here is overridable
 * per mode, so this is the one place they can live.
 */
export function PrivacyPanel() {
  return (
    <div className="flex flex-col gap-8">
      <PanelIntro
        title="Privacy"
        description="Data handling no mode can override."
      />

      <SettingsSection
        title="History"
        description="How long the local record sticks around."
      >
        <SettingsRow
          label={
            <span>
              Keep history for
              <InfoDot />
            </span>
          }
          last
          control={<PopupButton value="Forever" />}
        />
      </SettingsSection>

      <SettingsSection
        title="Files"
        description="Where recordings and transcripts live on disk."
      >
        <SettingsRow
          label={
            <span className="font-mono text-[13px] text-muted-foreground">
              /Users/angelsocastro/superwhisper
            </span>
          }
          control={<GhostButton>Change folder…</GhostButton>}
        />
        <SettingsRow
          label={
            <span>
              Error logging
              <InfoDot />
            </span>
          }
          description="Send anonymous crash reports to help fix bugs."
          last
          control={<Switch size="sm" defaultChecked={false} />}
        />
      </SettingsSection>

      <div className="hairline overflow-hidden rounded-[10px] bg-card">
        <SettingsRow
          label="Delete all history"
          description="Removes every transcript and recording from this Mac."
          last
          control={
            <button className="hairline rounded-[6px] bg-destructive/12 px-2.5 py-1 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/20">
              Delete…
            </button>
          }
        />
      </div>
    </div>
  );
}
